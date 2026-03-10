// ============================================================
// Locale Service — Tenant locale settings, formatting utilities, Hijri conversion
// ============================================================

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { UpdateLocaleDto } from './dto';

/** Default locale settings */
const DEFAULTS = {
  language: 'en',
  calendarType: 'gregorian',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  firstDayOfWeek: 0,
  numberFormat: 'en-SA',
};

@Injectable()
export class LocaleService {
  private readonly logger = new Logger(LocaleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityService,
  ) {}

  /**
   * Get locale settings for a tenant (create defaults if none exist)
   */
  async getSettings(tenantId: string) {
    let settings = await this.prisma.localeSettings.findUnique({
      where: { tenantId },
    });

    if (!settings) {
      // Auto-create defaults
      settings = await this.prisma.localeSettings.create({
        data: {
          tenantId,
          ...DEFAULTS,
        },
      });
    }

    return settings;
  }

  /**
   * Update locale settings
   */
  async updateSettings(tenantId: string, dto: UpdateLocaleDto, userId: string) {
    // Ensure settings exist
    await this.getSettings(tenantId);

    const settings = await this.prisma.localeSettings.update({
      where: { tenantId },
      data: {
        ...(dto.language !== undefined && { language: dto.language }),
        ...(dto.calendarType !== undefined && { calendarType: dto.calendarType }),
        ...(dto.dateFormat !== undefined && { dateFormat: dto.dateFormat }),
        ...(dto.timeFormat !== undefined && { timeFormat: dto.timeFormat }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.firstDayOfWeek !== undefined && { firstDayOfWeek: dto.firstDayOfWeek }),
        ...(dto.numberFormat !== undefined && { numberFormat: dto.numberFormat }),
      },
    });

    await this.activity.log({
      tenantId,
      entityType: 'locale_settings',
      entityId: settings.id,
      action: 'updated',
      description: 'Locale settings updated',
      performedBy: userId,
      metadata: { changes: dto },
    });

    this.logger.log(`Locale settings updated for tenant ${tenantId}`);
    return settings;
  }

  /**
   * Convert Gregorian date to Hijri (Islamic) calendar
   * Uses the Umm al-Qura algorithm approximation
   */
  convertToHijri(dateStr: string): {
    hijri: { year: number; month: number; day: number; formatted: string };
    gregorian: string;
    monthName: string;
    monthNameAr: string;
  } {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: "${dateStr}"`);
    }

    // Use Intl.DateTimeFormat with Islamic calendar
    const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    const hijriArFormatter = new Intl.DateTimeFormat('ar-u-ca-islamic-umalqura', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const parts = hijriFormatter.formatToParts(date);
    const arParts = hijriArFormatter.formatToParts(date);

    const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0');
    const month = parseInt(parts.find((p) => p.type === 'month')?.value || '0');
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '0');
    const monthNameAr = arParts.find((p) => p.type === 'month')?.value || '';

    const hijriMonthNames = [
      '', 'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
      'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah',
    ];

    return {
      hijri: {
        year,
        month,
        day,
        formatted: `${day}/${month}/${year}`,
      },
      gregorian: dateStr,
      monthName: hijriMonthNames[month] || '',
      monthNameAr,
    };
  }

  // ============================================================
  // Utility formatting methods
  // ============================================================

  /**
   * Format date according to tenant settings
   */
  formatDate(date: Date, settings: { dateFormat: string; timezone: string; calendarType: string }): string {
    const calendar = settings.calendarType === 'hijri' ? 'islamic-umalqura' : 'gregory';
    const locale = `en-u-ca-${calendar}`;

    const options: Intl.DateTimeFormatOptions = {
      timeZone: settings.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    const formatter = new Intl.DateTimeFormat(locale, options);
    const parts = formatter.formatToParts(date);

    const day = parts.find((p) => p.type === 'day')?.value || '';
    const month = parts.find((p) => p.type === 'month')?.value || '';
    const year = parts.find((p) => p.type === 'year')?.value || '';

    return settings.dateFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  }

  /**
   * Format currency according to tenant settings
   */
  formatCurrency(amount: number, settings: { currency: string; numberFormat: string }): string {
    return new Intl.NumberFormat(settings.numberFormat, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Format number according to tenant settings
   */
  formatNumber(value: number, settings: { numberFormat: string }, decimals = 2): string {
    return new Intl.NumberFormat(settings.numberFormat, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
