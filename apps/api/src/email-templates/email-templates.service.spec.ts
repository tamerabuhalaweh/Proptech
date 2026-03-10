// ============================================================
// Email Templates Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EmailTemplateCategory } from '@prisma/client';
import { EmailTemplatesService } from './email-templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CommunicationsService } from '../communications/communications.service';

const mockPrisma = {
  emailTemplate: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

const mockCommunications = {
  create: jest.fn(),
};

describe('EmailTemplatesService', () => {
  let service: EmailTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplatesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
        { provide: CommunicationsService, useValue: mockCommunications },
      ],
    }).compile();

    service = module.get<EmailTemplatesService>(EmailTemplatesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an email template', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);
      const created = {
        id: 'tpl1',
        tenantId: 't1',
        name: 'Welcome',
        subject: 'Welcome {{name}}',
        bodyHtml: '<h1>Hello {{name}}</h1>',
        category: EmailTemplateCategory.WELCOME,
      };
      mockPrisma.emailTemplate.create.mockResolvedValue(created);

      const result = await service.create(
        't1',
        {
          name: 'Welcome',
          subject: 'Welcome {{name}}',
          bodyHtml: '<h1>Hello {{name}}</h1>',
          category: EmailTemplateCategory.WELCOME,
          variables: ['name'],
        },
        'user1',
      );

      expect(result.id).toBe('tpl1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'email_template', action: 'created' }),
      );
    });

    it('should reject duplicate template names', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create(
          't1',
          { name: 'Welcome', subject: 'Hi', bodyHtml: '<p>Hi</p>' },
          'user1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated templates', async () => {
      const templates = [{ id: 'tpl1' }, { id: 'tpl2' }];
      mockPrisma.emailTemplate.findMany.mockResolvedValue(templates);
      mockPrisma.emailTemplate.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by category', async () => {
      mockPrisma.emailTemplate.findMany.mockResolvedValue([]);
      mockPrisma.emailTemplate.count.mockResolvedValue(0);

      await service.findAll('t1', { category: EmailTemplateCategory.WELCOME });

      const where = mockPrisma.emailTemplate.findMany.mock.calls[0][0].where;
      expect(where.category).toBe(EmailTemplateCategory.WELCOME);
    });

    it('should filter by search term', async () => {
      mockPrisma.emailTemplate.findMany.mockResolvedValue([]);
      mockPrisma.emailTemplate.count.mockResolvedValue(0);

      await service.findAll('t1', { search: 'welcome' });

      const where = mockPrisma.emailTemplate.findMany.mock.calls[0][0].where;
      expect(where.name).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a template by ID', async () => {
      const template = { id: 'tpl1', tenantId: 't1', name: 'Welcome' };
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(template);

      const result = await service.findOne('t1', 'tpl1');
      expect(result.id).toBe('tpl1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a template', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({ id: 'tpl1', tenantId: 't1' });
      mockPrisma.emailTemplate.update.mockResolvedValue({
        id: 'tpl1',
        subject: 'Updated Subject',
      });

      const result = await service.update(
        't1',
        'tpl1',
        { subject: 'Updated Subject' },
        'user1',
      );

      expect(result.subject).toBe('Updated Subject');
    });

    it('should reject update with duplicate name', async () => {
      mockPrisma.emailTemplate.findFirst
        .mockResolvedValueOnce({ id: 'tpl1', tenantId: 't1' }) // findOne
        .mockResolvedValueOnce({ id: 'tpl2', tenantId: 't1', name: 'Existing' }); // dup check

      await expect(
        service.update('t1', 'tpl1', { name: 'Existing' }, 'user1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete a template', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({ id: 'tpl1', tenantId: 't1' });
      mockPrisma.emailTemplate.delete.mockResolvedValue({ id: 'tpl1' });

      const result = await service.remove('t1', 'tpl1', 'user1');
      expect(result.deleted).toBe(true);
    });
  });

  describe('preview', () => {
    it('should render template with variables', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        id: 'tpl1',
        tenantId: 't1',
        subject: 'Hello {{name}}',
        bodyHtml: '<h1>Welcome {{name}}, unit {{unit}}</h1>',
        bodyText: 'Welcome {{name}}',
      });

      const result = await service.preview('t1', 'tpl1', {
        variables: { name: 'John', unit: 'A-101' },
      });

      expect(result.subject).toBe('Hello John');
      expect(result.bodyHtml).toBe('<h1>Welcome John, unit A-101</h1>');
      expect(result.bodyText).toBe('Welcome John');
    });

    it('should keep unmatched variables as-is', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        id: 'tpl1',
        tenantId: 't1',
        subject: 'Hello {{name}} {{missing}}',
        bodyHtml: '<p>{{name}}</p>',
        bodyText: null,
      });

      const result = await service.preview('t1', 'tpl1', {
        variables: { name: 'John' },
      });

      expect(result.subject).toBe('Hello John {{missing}}');
      expect(result.bodyText).toBeNull();
    });
  });

  describe('send', () => {
    it('should create a communication record when sending', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        id: 'tpl1',
        tenantId: 't1',
        name: 'Welcome',
        subject: 'Hello {{name}}',
        bodyHtml: '<h1>Welcome {{name}}</h1>',
      });
      mockCommunications.create.mockResolvedValue({
        id: 'comm1',
        type: 'EMAIL',
        status: 'SENT',
      });

      const result = await service.send(
        't1',
        'tpl1',
        {
          to: 'client@email.com',
          variables: { name: 'John' },
        },
        'user1',
      );

      expect(result.communicationId).toBe('comm1');
      expect(result.subject).toBe('Hello John');
      expect(result.to).toBe('client@email.com');
      expect(mockCommunications.create).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({
          type: 'EMAIL',
          direction: 'OUTBOUND',
          to: 'client@email.com',
          status: 'SENT',
        }),
        'user1',
      );
    });
  });
});
