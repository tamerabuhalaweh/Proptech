// ============================================================
// Documents Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DocumentCategory, DocumentEntityType } from '@prisma/client';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  document: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  subscription: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
};

const mockActivity = { log: jest.fn() };

describe('DocumentsService', () => {
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
    mockPrisma.subscription.findUnique.mockResolvedValue(null);
    mockPrisma.document.aggregate.mockResolvedValue({ _sum: { sizeBytes: 0 } });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a document', async () => {
      const created = {
        id: 'doc1',
        tenantId: 't1',
        name: 'Contract',
        fileName: 'contract.pdf',
        entityType: DocumentEntityType.BOOKING,
      };
      mockPrisma.document.create.mockResolvedValue(created);

      const result = await service.create(
        't1',
        {
          name: 'Contract',
          fileName: 'contract.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1024,
          entityType: DocumentEntityType.BOOKING,
          entityId: 'booking1',
          url: 'https://storage.example.com/contract.pdf',
        },
        'user1',
      );

      expect(result.id).toBe('doc1');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'document', action: 'created' }),
      );
    });

    it('should reject when storage limit is exceeded', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        tenantId: 't1',
        storageGB: 1,
      });
      mockPrisma.document.aggregate.mockResolvedValue({
        _sum: { sizeBytes: 1024 * 1024 * 1024 }, // 1GB used
      });

      await expect(
        service.create(
          't1',
          {
            name: 'Large File',
            fileName: 'large.zip',
            mimeType: 'application/zip',
            sizeBytes: 1024 * 1024, // 1MB more
            entityType: DocumentEntityType.PROPERTY,
            entityId: 'prop1',
            url: 'https://storage.example.com/large.zip',
          },
          'user1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow creation when no subscription exists', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      mockPrisma.document.create.mockResolvedValue({ id: 'doc1' });

      const result = await service.create(
        't1',
        {
          name: 'Doc',
          fileName: 'doc.pdf',
          mimeType: 'application/pdf',
          entityType: DocumentEntityType.UNIT,
          entityId: 'unit1',
          url: 'https://storage.example.com/doc.pdf',
        },
        'user1',
      );

      expect(result.id).toBe('doc1');
    });
  });

  describe('bulkUpload', () => {
    it('should bulk upload multiple documents', async () => {
      const docs = [
        { id: 'doc1', name: 'Doc 1' },
        { id: 'doc2', name: 'Doc 2' },
      ];
      mockPrisma.$transaction.mockResolvedValue(docs);

      const result = await service.bulkUpload(
        't1',
        {
          documents: [
            {
              name: 'Doc 1',
              fileName: 'doc1.pdf',
              mimeType: 'application/pdf',
              entityType: DocumentEntityType.BOOKING,
              entityId: 'booking1',
              url: 'https://storage.example.com/doc1.pdf',
            },
            {
              name: 'Doc 2',
              fileName: 'doc2.pdf',
              mimeType: 'application/pdf',
              entityType: DocumentEntityType.BOOKING,
              entityId: 'booking1',
              url: 'https://storage.example.com/doc2.pdf',
            },
          ],
        },
        'user1',
      );

      expect(result.uploaded).toBe(2);
      expect(result.documents).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should return paginated documents', async () => {
      const docs = [{ id: 'doc1' }, { id: 'doc2' }];
      mockPrisma.document.findMany.mockResolvedValue(docs);
      mockPrisma.document.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });

    it('should filter by category', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);

      await service.findAll('t1', { category: DocumentCategory.CONTRACT });

      const where = mockPrisma.document.findMany.mock.calls[0][0].where;
      expect(where.category).toBe(DocumentCategory.CONTRACT);
    });

    it('should filter by entityType and entityId', async () => {
      mockPrisma.document.findMany.mockResolvedValue([]);
      mockPrisma.document.count.mockResolvedValue(0);

      await service.findAll('t1', {
        entityType: DocumentEntityType.BOOKING,
        entityId: 'booking1',
      });

      const where = mockPrisma.document.findMany.mock.calls[0][0].where;
      expect(where.entityType).toBe(DocumentEntityType.BOOKING);
      expect(where.entityId).toBe('booking1');
    });
  });

  describe('findOne', () => {
    it('should return a document by ID', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'doc1', tenantId: 't1' });

      const result = await service.findOne('t1', 'doc1');
      expect(result.id).toBe('doc1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'doc1', tenantId: 't1' });
      mockPrisma.document.update.mockResolvedValue({ id: 'doc1', name: 'Updated' });

      const result = await service.update('t1', 'doc1', { name: 'Updated' }, 'user1');
      expect(result.name).toBe('Updated');
    });

    it('should archive a document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'doc1', tenantId: 't1' });
      mockPrisma.document.update.mockResolvedValue({ id: 'doc1', isArchived: true });

      const result = await service.update('t1', 'doc1', { isArchived: true }, 'user1');
      expect(result.isArchived).toBe(true);
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'archived' }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'doc1', tenantId: 't1' });
      mockPrisma.document.delete.mockResolvedValue({ id: 'doc1' });

      const result = await service.remove('t1', 'doc1', 'user1');
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'nonexistent', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
