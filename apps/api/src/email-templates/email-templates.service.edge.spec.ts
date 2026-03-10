// ============================================================
// Email Templates Service — Edge Case Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CommunicationsService } from '../communications/communications.service';

const mockPrisma = {
  emailTemplate: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };
const mockCommunications = { create: jest.fn() };

describe('EmailTemplatesService (Edge Cases)', () => {
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

  describe('create', () => {
    it('should throw ConflictException for duplicate template name', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('t1', {
          name: 'Duplicate Name',
          subject: 'Test',
          bodyHtml: '<p>Test</p>',
        } as any, 'user1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should create template with default category CUSTOM', async () => {
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);
      const created = { id: 'et1', name: 'New Template', category: 'CUSTOM' };
      mockPrisma.emailTemplate.create.mockResolvedValue(created);

      const result = await service.create('t1', {
        name: 'New Template',
        subject: 'Subject',
        bodyHtml: '<p>Body</p>',
      } as any, 'user1');

      expect(result.category).toBe('CUSTOM');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException for nonexistent template', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(null);

      await expect(
        service.update('t1', 'nonexistent', { name: 'Updated' } as any, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException for duplicate name on update', async () => {
      mockPrisma.emailTemplate.findFirst
        .mockResolvedValueOnce({ id: 'et1' }) // findOne succeeds
        .mockResolvedValueOnce({ id: 'et2', name: 'Taken' }); // duplicate check

      await expect(
        service.update('t1', 'et1', { name: 'Taken' } as any, 'user1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('preview', () => {
    it('should interpolate variables in subject and body', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        id: 'et1',
        subject: 'Welcome {{clientName}}!',
        bodyHtml: '<p>Dear {{clientName}}, your booking {{bookingId}} is confirmed.</p>',
        bodyText: 'Dear {{clientName}}, your booking {{bookingId}} is confirmed.',
      });

      const result = await service.preview('t1', 'et1', {
        variables: { clientName: 'Ahmed', bookingId: 'BK-001' },
      });

      expect(result.subject).toBe('Welcome Ahmed!');
      expect(result.bodyHtml).toBe('<p>Dear Ahmed, your booking BK-001 is confirmed.</p>');
      expect(result.bodyText).toBe('Dear Ahmed, your booking BK-001 is confirmed.');
    });

    it('should leave unmatched variables as-is', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        id: 'et1',
        subject: 'Hello {{name}}',
        bodyHtml: '<p>{{unknown}} placeholder</p>',
        bodyText: null,
      });

      const result = await service.preview('t1', 'et1', {
        variables: { name: 'Ahmed' },
      });

      expect(result.subject).toBe('Hello Ahmed');
      expect(result.bodyHtml).toBe('<p>{{unknown}} placeholder</p>');
      expect(result.bodyText).toBeNull();
    });
  });

  describe('send', () => {
    it('should create a communication record with rendered content', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({
        id: 'et1',
        name: 'Welcome',
        subject: 'Welcome {{name}}',
        bodyHtml: '<p>Welcome, {{name}}</p>',
      });
      mockCommunications.create.mockResolvedValue({ id: 'comm1' });

      const result = await service.send('t1', 'et1', {
        to: 'ahmed@example.com',
        variables: { name: 'Ahmed' },
      } as any, 'user1');

      expect(result.communicationId).toBe('comm1');
      expect(result.subject).toBe('Welcome Ahmed');
      expect(result.to).toBe('ahmed@example.com');
      expect(mockCommunications.create).toHaveBeenCalledWith(
        't1',
        expect.objectContaining({
          type: 'EMAIL',
          direction: 'OUTBOUND',
          subject: 'Welcome Ahmed',
          body: '<p>Welcome, Ahmed</p>',
          to: 'ahmed@example.com',
          status: 'SENT',
        }),
        'user1',
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for nonexistent template', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('t1', 'nonexistent', 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete and return { deleted: true }', async () => {
      mockPrisma.emailTemplate.findFirst.mockResolvedValue({ id: 'et1' });
      mockPrisma.emailTemplate.delete.mockResolvedValue({ id: 'et1' });

      const result = await service.remove('t1', 'et1', 'user1');

      expect(result.deleted).toBe(true);
      expect(mockPrisma.emailTemplate.delete).toHaveBeenCalledWith({ where: { id: 'et1' } });
    });
  });

  describe('findAll', () => {
    it('should handle search filter', async () => {
      mockPrisma.emailTemplate.findMany.mockResolvedValue([]);
      mockPrisma.emailTemplate.count.mockResolvedValue(0);

      await service.findAll('t1', { search: 'welcome' } as any);

      expect(mockPrisma.emailTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 't1',
            name: { contains: 'welcome', mode: 'insensitive' },
          }),
        }),
      );
    });
  });
});
