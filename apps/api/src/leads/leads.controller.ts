// ============================================================
// Leads Controller — Lead management, pipeline, scoring, assignment
// ============================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { LeadsService } from './leads.service';
import {
  CreateLeadDto,
  UpdateLeadDto,
  QueryLeadDto,
  ChangeStageDto,
  AssignLeadDto,
  OverrideScoreDto,
  AssignmentRuleDto,
  CheckDuplicatesDto,
} from './dto';
import { CurrentUser, JwtUser, Roles } from '../common/decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DuplicateDetectionService } from './duplicate-detection.service';
import { LeadExpiryService } from './lead-expiry.service';

@ApiTags('Leads')
@ApiBearerAuth('access-token')
@Controller('leads')
@UseGuards(RolesGuard)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly duplicateDetection: DuplicateDetectionService,
    private readonly leadExpiry: LeadExpiryService,
  ) {}

  // ============================================================
  // Static routes MUST come before :id param routes
  // ============================================================

  // --- Pipeline Stats (PROP-88) ---

  @Get('pipeline/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get pipeline statistics' })
  @ApiResponse({ status: 200, description: 'Pipeline stats with counts and conversion rates' })
  async getPipelineStats(@CurrentUser() user: JwtUser) {
    return this.leadsService.getPipelineStats(user.tenantId);
  }

  // --- Scoring Breakdown (PROP-87) ---

  @Get('scoring/breakdown/:id')
  @ApiOperation({ summary: 'Get lead score breakdown' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Score breakdown with factors' })
  async getScoreBreakdown(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.leadsService.getScoreBreakdown(user.tenantId, id);
  }

  // --- Duplicate Detection (PROP-99) ---

  @Post('check-duplicates')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check for potential duplicate leads' })
  @ApiResponse({ status: 200, description: 'Potential duplicate matches with confidence scores' })
  async checkDuplicates(
    @CurrentUser() user: JwtUser,
    @Body() dto: CheckDuplicatesDto,
  ) {
    return this.duplicateDetection.checkDuplicates(user.tenantId, dto);
  }

  // --- Lead Auto-Expiry (PROP-100) ---

  @Post('process-expiry')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Expire inactive leads (no activity for N days)' })
  @ApiResponse({ status: 200, description: 'Expired leads processed' })
  async processExpiry(@CurrentUser() user: JwtUser) {
    return this.leadExpiry.processExpiry(user.tenantId, user.sub);
  }

  // --- Assignment Rules (PROP-89) ---

  @Post('assignment/rules')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Configure lead assignment rules' })
  @ApiResponse({ status: 201, description: 'Assignment rules configured' })
  async configureAssignmentRules(
    @CurrentUser() user: JwtUser,
    @Body() dto: AssignmentRuleDto,
  ) {
    return this.leadsService.configureAssignmentRules(user.tenantId, dto);
  }

  @Get('assignment/rules')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Get current assignment rules' })
  @ApiResponse({ status: 200, description: 'Current assignment rules' })
  async getAssignmentRules(@CurrentUser() user: JwtUser) {
    return this.leadsService.getAssignmentRules(user.tenantId);
  }

  // ============================================================
  // CRUD
  // ============================================================

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created' })
  async create(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(user.tenantId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List leads (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of leads' })
  async findAll(
    @CurrentUser() user: JwtUser,
    @Query() query: QueryLeadDto,
  ) {
    return this.leadsService.findAll(user.tenantId, query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead details' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Lead details' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.leadsService.findOne(user.tenantId, id, user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @ApiOperation({ summary: 'Update lead details' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Lead updated' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async update(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(user.tenantId, id, dto, user.sub);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a lead' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Lead deleted' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async remove(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
  ) {
    return this.leadsService.remove(user.tenantId, id, user.sub);
  }

  // ============================================================
  // Parameterized sub-routes
  // ============================================================

  // --- Stage Change (PROP-88) ---

  @Patch(':id/stage')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.BROKER)
  @ApiOperation({ summary: 'Change lead pipeline stage' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Stage changed' })
  @ApiResponse({ status: 400, description: 'Invalid stage transition' })
  async changeStage(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: ChangeStageDto,
  ) {
    return this.leadsService.changeStage(user.tenantId, id, dto, user.sub);
  }

  // --- Score Override (PROP-87) ---

  @Patch(':id/score')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Override lead score manually' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Score overridden' })
  async overrideScore(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: OverrideScoreDto,
  ) {
    return this.leadsService.overrideScore(user.tenantId, id, dto, user.sub);
  }

  // --- Manual Assignment (PROP-89) ---

  @Post(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Manually assign a lead to a user' })
  @ApiParam({ name: 'id', description: 'Lead ID' })
  @ApiResponse({ status: 200, description: 'Lead assigned' })
  async assignLead(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() dto: AssignLeadDto,
  ) {
    return this.leadsService.assignLead(user.tenantId, id, dto, user.sub);
  }

  // --- Lead Merge (PROP-99) ---

  @Post(':targetId/merge/:sourceId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Merge source lead into target lead' })
  @ApiParam({ name: 'targetId', description: 'Target lead ID (kept)' })
  @ApiParam({ name: 'sourceId', description: 'Source lead ID (soft-deleted)' })
  @ApiResponse({ status: 200, description: 'Leads merged successfully' })
  async mergeLeads(
    @CurrentUser() user: JwtUser,
    @Param('targetId') targetId: string,
    @Param('sourceId') sourceId: string,
  ) {
    return this.duplicateDetection.mergeLeads(user.tenantId, targetId, sourceId, user.sub);
  }
}
