// ============================================================
// Documents Service — Edge Case Tests (storage limits, bulk upload)
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  subscription: { findUnique: jest.fn() },
  document: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockActivity = { log: jest.fn() };

describe('DocumentsService (Edge Cases)', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException when storage limit exceeded', async () => {
      // 1GB plan, 900MB used, trying to upload 200MB
      mockPrisma.subscription.findUnique.mockResolvedValue({
        storageGB: 1,
      });
      mockPrisma.document.aggregate.mockResolvedValue({
        _sum: { sizeBytes: 900 * 1024 * 1024 },
      });

      await expect(
        service.create('t1', {
          name: 'large-file.pdf',
          fileName: 'large-file.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 200 * 1024 * 1024,
          entityType: 'PROPERTY',
          entityId: 'p1',
          url: 'https://example.com/file.pdf',
        } as any, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow upload when within storage limit', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        storageGB: 10,
      });
      mockPrisma.document.aggregate.mockResolvedValue({
        _sum: { sizeBytes: 100 * 1024 * 1024 },
      });
      const doc = { id: 'd1', name: 'test.pdf' };
      mockPrisma.document.create.mockResolvedValue(doc);

      const result = await service.create('t1', {
        name: 'test.pdf',
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        entityType: 'PROPERTY',
        entityId: 'p1',
        url: 'https://example.com/test.pdf',
      } as any, 'user1');

      expect(result.id).toBe('d1');
    });

    it('should skip storage check when no subscription exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      const doc = { id: 'd1', name: 'test.pdf' };
      mockPrisma.document.create.mockResolvedValue(doc);

      const result = await service.create('t1', {
        name: 'test.pdf',
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        entityType: 'PROPERTY',
        entityId: 'p1',
        url: 'https://example.com/test.pdf',
      } as any, 'user1');

      expect(result.id).toBe('d1');
      expect(mockPrisma.document.aggregate).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when document not found', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('t1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException for nonexistent document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(
        service.update('t1', 'nonexistent', { name: 'New Name' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should log "archived" when isArchived is set to true', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'd1' });
      mockPrisma.document.update.mockResolvedValue({ id: 'd1', isArchived: true });

      await service.update('t1', 'd1', { isArchived: true } as any, 'user1');

      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'archived' }),
      );
    });
  });

  describe('remove', () => {
    it('should delete and log activity', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'd1' });
      mockPrisma.document.delete.mockResolvedValue({ id: 'd1' });

      const result = await service.remove('t1', 'd1', 'user1');

      expect(result.deleted).toBe(true);
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'deleted' }),
      );
    });
  });

  describe('findAll', () => {
    it('should use default pagination values', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);

      const result = await service.findAll('t1', {});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should filter by category and entityType', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);

      await service.findAll('t1', {
        category: 'CONTRACT',
        entityType: 'BOOKING',
      } as any);

      expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 't1',
            category: 'CONTRACT',
            entityType: 'BOOKING',
            isArchived: false,
          }),
        }),
      );
    });

    it('should correctly calculate totalPages', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(45);

      const result = await service.findAll('t1', { page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(5);
    });
  });
});
