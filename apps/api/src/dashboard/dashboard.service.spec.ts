import { Test, TestingModule } from '@nestjs/testing';
import { UnitStatus } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  property: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  unit: {
    count: jest.fn(),
    aggregate: jest.fn(),
  },
  activityLog: {
    findMany: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return aggregated stats', async () => {
      mockPrisma.property.count.mockResolvedValue(5);
      // Unit counts for each status call in order
      mockPrisma.unit.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(60)  // available
        .mockResolvedValueOnce(15)  // reserved
        .mockResolvedValueOnce(20)  // sold
        .mockResolvedValueOnce(3)   // blocked
        .mockResolvedValueOnce(2);  // maintenance
      mockPrisma.unit.aggregate.mockResolvedValue({ _sum: { basePrice: 2500000 } });

      const result = await service.getStats('t1');

      expect(result.totalProperties).toBe(5);
      expect(result.totalUnits).toBe(100);
      expect(result.unitsByStatus.available).toBe(60);
      expect(result.unitsByStatus.sold).toBe(20);
      expect(result.occupancyRate).toBe(35); // (20+15)/100 = 35%
      expect(result.revenueMTD).toBe(2500000);
      expect(result.activeLeads).toBe(15);
    });

    it('should handle zero units gracefully', async () => {
      mockPrisma.property.count.mockResolvedValue(0);
      mockPrisma.unit.count.mockResolvedValue(0);
      mockPrisma.unit.aggregate.mockResolvedValue({ _sum: { basePrice: null } });

      const result = await service.getStats('t1');

      expect(result.totalUnits).toBe(0);
      expect(result.occupancyRate).toBe(0);
      expect(result.revenueMTD).toBe(0);
    });
  });

  describe('getActivity', () => {
    it('should return recent activity', async () => {
      const logs = [
        { id: 'a1', action: 'created', entityType: 'property' },
        { id: 'a2', action: 'updated', entityType: 'unit' },
      ];
      mockPrisma.activityLog.findMany.mockResolvedValue(logs);

      const result = await service.getActivity('t1', 20);

      expect(result).toHaveLength(2);
      expect(mockPrisma.activityLog.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });
  });

  describe('getTopProperties', () => {
    it('should return top properties sorted by occupancy', async () => {
      mockPrisma.property.findMany.mockResolvedValue([
        {
          id: 'p1',
          name: 'Property 1',
          nameAr: null,
          type: 'RESIDENTIAL',
          status: 'ACTIVE',
          buildings: [
            {
              _count: { units: 4 },
              units: [
                { status: UnitStatus.SOLD },
                { status: UnitStatus.SOLD },
                { status: UnitStatus.AVAILABLE },
                { status: UnitStatus.AVAILABLE },
              ],
            },
          ],
        },
        {
          id: 'p2',
          name: 'Property 2',
          nameAr: null,
          type: 'COMMERCIAL',
          status: 'ACTIVE',
          buildings: [
            {
              _count: { units: 2 },
              units: [
                { status: UnitStatus.SOLD },
                { status: UnitStatus.RESERVED },
              ],
            },
          ],
        },
      ]);

      const result = await service.getTopProperties('t1');

      // Property 2 has 100% occupancy, Property 1 has 50%
      expect(result[0].id).toBe('p2');
      expect(result[0].occupancyRate).toBe(100);
      expect(result[1].id).toBe('p1');
      expect(result[1].occupancyRate).toBe(50);
    });
  });
});
