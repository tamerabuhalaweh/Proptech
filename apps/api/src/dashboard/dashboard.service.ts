// ============================================================
// Dashboard Service — Aggregated stats, activity, top properties
// ============================================================

import { Injectable } from '@nestjs/common';
import { UnitStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/dashboard/stats — Aggregated dashboard statistics
   */
  async getStats(tenantId: string) {
    const [
      totalProperties,
      totalUnits,
      availableUnits,
      reservedUnits,
      soldUnits,
      blockedUnits,
      maintenanceUnits,
    ] = await Promise.all([
      this.prisma.property.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.unit.count({ where: { tenantId } }),
      this.prisma.unit.count({ where: { tenantId, status: UnitStatus.AVAILABLE } }),
      this.prisma.unit.count({ where: { tenantId, status: UnitStatus.RESERVED } }),
      this.prisma.unit.count({ where: { tenantId, status: UnitStatus.SOLD } }),
      this.prisma.unit.count({ where: { tenantId, status: UnitStatus.BLOCKED } }),
      this.prisma.unit.count({ where: { tenantId, status: UnitStatus.UNDER_MAINTENANCE } }),
    ]);

    const occupiedUnits = soldUnits + reservedUnits;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 10000) / 100 : 0;

    // Revenue MTD — sum of basePrice for units sold this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const soldThisMonth = await this.prisma.unit.aggregate({
      where: {
        tenantId,
        status: UnitStatus.SOLD,
        updatedAt: { gte: startOfMonth },
      },
      _sum: { basePrice: true },
    });

    // Active leads (reserved units count as active leads)
    const activeLeads = reservedUnits;

    return {
      totalProperties,
      totalUnits,
      unitsByStatus: {
        available: availableUnits,
        reserved: reservedUnits,
        sold: soldUnits,
        blocked: blockedUnits,
        underMaintenance: maintenanceUnits,
      },
      occupancyRate,
      revenueMTD: soldThisMonth._sum.basePrice || 0,
      activeLeads,
    };
  }

  /**
   * GET /api/dashboard/activity — Recent activity feed
   */
  async getActivity(tenantId: string, limit = 20) {
    return this.prisma.activityLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * GET /api/dashboard/top-properties — Top 5 properties by occupancy
   */
  async getTopProperties(tenantId: string) {
    const properties = await this.prisma.property.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        buildings: {
          include: {
            _count: { select: { units: true } },
            units: {
              select: { status: true },
            },
          },
        },
      },
    });

    const ranked = properties.map((property) => {
      let totalUnits = 0;
      let occupiedUnits = 0;

      for (const building of property.buildings) {
        for (const unit of building.units) {
          totalUnits++;
          if (unit.status === UnitStatus.SOLD || unit.status === UnitStatus.RESERVED) {
            occupiedUnits++;
          }
        }
      }

      const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 10000) / 100 : 0;

      return {
        id: property.id,
        name: property.name,
        nameAr: property.nameAr,
        type: property.type,
        status: property.status,
        totalUnits,
        occupiedUnits,
        occupancyRate,
      };
    });

    // Sort by occupancy rate descending, return top 5
    return ranked
      .sort((a, b) => b.occupancyRate - a.occupancyRate)
      .slice(0, 5);
  }
}
