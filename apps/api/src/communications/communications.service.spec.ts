// ============================================================
// Communications Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CommunicationType, CommunicationDirection, CommunicationStatus } from '@prisma/client';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  communication: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('CommunicationsService', () => {
  let service: CommunicationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunicationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<CommunicationsService>(CommunicationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a communication record', async () => {
      const created = {
        id: 'comm1',
        tenantId: 't1',
        type: CommunicationType.EMAIL,
        direction: CommunicationDirection.OUTBOUND,
        subject: 'Test',
        status: CommunicationStatus.PENDING,
      };
      mockPrisma.communication.create.mockResolvedValue(created);

      const result = await service.create(
        't1',
        {
          type: CommunicationType.EMAIL,
          direction: CommunicationDirection.OUTBOUND,
          subject: 'Test',
        },
        'user1',
      );

      expect(result.id).toBe('comm1');
      expect(mockPrisma.communication.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 't1',
            type: CommunicationType.EMAIL,
            direction: CommunicationDirection.OUTBOUND,
          }),
        }),
      );
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'communication',
          action: 'created',
        }),
      );
    });

    it('should create a communication with optional fields', async () => {
      const created = {
        id: 'comm2',
        tenantId: 't1',
        type: CommunicationType.WHATSAPP,
        direction: CommunicationDirection.INBOUND,
        leadId: 'lead1',
        bookingId: 'booking1',
      };
      mockPrisma.communication.create.mockResolvedValue(created);

      const result = await service.create(
        't1',
        {
          type: CommunicationType.WHATSAPP,
          direction: CommunicationDirection.INBOUND,
          leadId: 'lead1',
          bookingId: 'booking1',
          body: 'Hello',
          from: '+966500000000',
          to: '+966511111111',
        },
        'user1',
      );

      expect(result.id).toBe('comm2');
    });
  });

  describe('findAll', () => {
    it('should return paginated communications', async () => {
      const comms = [{ id: 'c1' }, { id: 'c2' }];
      mockPrisma.communication.findMany.mockResolvedValue(comms);
      mockPrisma.communication.count.mockResolvedValue(2);

      const result = await service.findAll('t1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by type', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(0);

      await service.findAll('t1', { type: CommunicationType.EMAIL });

      const where = mockPrisma.communication.findMany.mock.calls[0][0].where;
      expect(where.type).toBe(CommunicationType.EMAIL);
    });

    it('should filter by direction', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(0);

      await service.findAll('t1', { direction: CommunicationDirection.OUTBOUND });

      const where = mockPrisma.communication.findMany.mock.calls[0][0].where;
      expect(where.direction).toBe(CommunicationDirection.OUTBOUND);
    });

    it('should filter by date range', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(0);

      await service.findAll('t1', {
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      });

      const where = mockPrisma.communication.findMany.mock.calls[0][0].where;
      expect(where.createdAt).toBeDefined();
      expect(where.createdAt.gte).toEqual(new Date('2026-01-01'));
    });

    it('should filter by leadId', async () => {
      mockPrisma.communication.findMany.mockResolvedValue([]);
      mockPrisma.communication.count.mockResolvedValue(0);

      await service.findAll('t1', { leadId: 'lead1' });

      const where = mockPrisma.communication.findMany.mock.calls[0][0].where;
      expect(where.leadId).toBe('lead1');
    });
  });

  describe('findOne', () => {
    it('should return a communication by ID', async () => {
      const comm = { id: 'c1', tenantId: 't1', type: CommunicationType.CALL };
      mockPrisma.communication.findFirst.mockResolvedValue(comm);

      const result = await service.findOne('t1', 'c1');
      expect(result.id).toBe('c1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.communication.findFirst.mockResolvedValue(null);

      await expect(service.findOne('t1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a communication', async () => {
      mockPrisma.communication.findFirst.mockResolvedValue({ id: 'c1', tenantId: 't1' });
      mockPrisma.communication.update.mockResolvedValue({
        id: 'c1',
        status: CommunicationStatus.SENT,
      });

      const result = await service.update(
        't1',
        'c1',
        { status: CommunicationStatus.SENT },
        'user1',
      );

      expect(result.status).toBe(CommunicationStatus.SENT);
    });

    it('should throw NotFoundException when updating non-existent', async () => {
      mockPrisma.communication.findFirst.mockResolvedValue(null);

      await expect(
        service.update('t1', 'nonexistent', { subject: 'x' }, 'user1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a communication', async () => {
      mockPrisma.communication.findFirst.mockResolvedValue({ id: 'c1', tenantId: 't1' });
      mockPrisma.communication.delete.mockResolvedValue({ id: 'c1' });

      const result = await service.remove('t1', 'c1', 'user1');
      expect(result.deleted).toBe(true);
    });

    it('should throw NotFoundException when deleting non-existent', async () => {
      mockPrisma.communication.findFirst.mockResolvedValue(null);

      await expect(service.remove('t1', 'nonexistent', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
