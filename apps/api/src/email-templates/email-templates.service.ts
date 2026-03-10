// ============================================================
// Email Templates Service — Template CRUD, preview, send
// ============================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CommunicationsService } from '../communications/communications.service';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  QueryEmailTemplateDto,
  PreviewEmailTemplateDto,
  SendEmailTemplateDto,
} from './dto';

@Injectable()
export class EmailTemplatesService {
  private readonly logger = new Logger(EmailTemplatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
    private readonly communicationsService: CommunicationsService,
  ) {}

  /**
   * Interpolate {{variable}} placeholders in a string
   */
  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  /**
   * Create a new email template
   */
  async create(tenantId: string, dto: CreateEmailTemplateDto, userId: string) {
    // Check for duplicate name within tenant
    const existing = await this.prisma.emailTemplate.findUnique({
      where: { tenantId_name: { tenantId, name: dto.name } },
    });
    if (existing) {
      throw new ConflictException(
        `Email template with name "${dto.name}" already exists`,
      );
    }

    const template = await this.prisma.emailTemplate.create({
      data: {
        tenantId,
        name: dto.name,
        subject: dto.subject,
        bodyHtml: dto.bodyHtml,
        bodyText: dto.bodyText || null,
        category: dto.category || 'CUSTOM',
        variables: (dto.variables || []) as Prisma.InputJsonValue,
        isDefault: dto.isDefault || false,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'email_template',
      entityId: template.id,
      action: 'created',
      description: `Email template "${dto.name}" created (${dto.category || 'CUSTOM'})`,
      performedBy: userId,
    });

    this.logger.log(`Email template created: ${template.id}`);
    return template;
  }

  /**
   * List email templates with filters
   */
  async findAll(tenantId: string, query: QueryEmailTemplateDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EmailTemplateWhereInput = {
      tenantId,
      ...(query.category && { category: query.category }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        name: { contains: query.search, mode: 'insensitive' as const },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emailTemplate.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single email template
   */
  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.emailTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException(`Email template with ID "${id}" not found`);
    }

    return template;
  }

  /**
   * Update an email template
   */
  async update(tenantId: string, id: string, dto: UpdateEmailTemplateDto, userId: string) {
    await this.findOne(tenantId, id);

    // Check for duplicate name if name is being changed
    if (dto.name) {
      const existing = await this.prisma.emailTemplate.findFirst({
        where: { tenantId, name: dto.name, id: { not: id } },
      });
      if (existing) {
        throw new ConflictException(
          `Email template with name "${dto.name}" already exists`,
        );
      }
    }

    const updated = await this.prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.bodyHtml !== undefined && { bodyHtml: dto.bodyHtml }),
        ...(dto.bodyText !== undefined && { bodyText: dto.bodyText }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.variables !== undefined && {
          variables: dto.variables as Prisma.InputJsonValue,
        }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'email_template',
      entityId: id,
      action: 'updated',
      description: `Email template updated`,
      performedBy: userId,
    });

    return updated;
  }

  /**
   * Delete an email template
   */
  async remove(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.emailTemplate.delete({ where: { id } });

    await this.activity.log({
      tenantId,
      entityType: 'email_template',
      entityId: id,
      action: 'deleted',
      description: `Email template deleted`,
      performedBy: userId,
    });

    this.logger.log(`Email template deleted: ${id}`);
    return { deleted: true };
  }

  /**
   * Preview a template with sample variables
   */
  async preview(tenantId: string, id: string, dto: PreviewEmailTemplateDto) {
    const template = await this.findOne(tenantId, id);

    return {
      subject: this.interpolate(template.subject, dto.variables),
      bodyHtml: this.interpolate(template.bodyHtml, dto.variables),
      bodyText: template.bodyText
        ? this.interpolate(template.bodyText, dto.variables)
        : null,
    };
  }

  /**
   * Send a template — creates a Communication record (no actual email)
   */
  async send(tenantId: string, id: string, dto: SendEmailTemplateDto, userId: string) {
    const template = await this.findOne(tenantId, id);

    const renderedSubject = this.interpolate(template.subject, dto.variables);
    const renderedBody = this.interpolate(template.bodyHtml, dto.variables);

    // Create a communication record via the communications service
    const communication = await this.communicationsService.create(
      tenantId,
      {
        type: 'EMAIL',
        direction: 'OUTBOUND',
        subject: renderedSubject,
        body: renderedBody,
        from: dto.from || undefined,
        to: dto.to,
        status: 'SENT',
        sentAt: new Date().toISOString(),
        leadId: dto.leadId,
        bookingId: dto.bookingId,
        metadata: { templateId: id, templateName: template.name },
      },
      userId,
    );

    this.logger.log(`Email sent via template ${id} → Communication ${communication.id}`);
    return {
      communicationId: communication.id,
      subject: renderedSubject,
      to: dto.to,
      status: 'SENT',
    };
  }
}
