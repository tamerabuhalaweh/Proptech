// ============================================================
// Locale Service — Unit Tests
// ============================================================

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { LocaleService } from './locale.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from '../activity/activity.service';

const mockPrisma = {
  localeSettings: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockActivity = { log: jest.fn() };

describe('LocaleService', () => {
  let service: LocaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocaleService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ActivityService, useValue: mockActivity },
      ],
    }).compile();

    service = module.get<LocaleService>(LocaleService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      const settings = {
        id: 'ls1',
        tenantId: 't1',
        language: 'ar',
        calendarType: 'hijri',
        currency: 'SAR',
      };
      mockPrisma.localeSettings.findUnique.mockResolvedValue(settings);

      const result = await service.getSettings('t1');

      expect(result.language).toBe('ar');
      expect(result.calendarType).toBe('hijri');
    });

    it('should create defaults if none exist', async () => {
      mockPrisma.localeSettings.findUnique.mockResolvedValue(null);
      const defaults = {
        id: 'ls1',
        tenantId: 't1',
        language: 'en',
        calendarType: 'gregorian',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
        firstDayOfWeek: 0,
        numberFormat: 'en-SA',
      };
      mockPrisma.localeSettings.create.mockResolvedValue(defaults);

      const result = await service.getSettings('t1');

      expect(result.language).toBe('en');
      expect(mockPrisma.localeSettings.create).toHaveBeenCalled();
    });
  });

  describe('updateSettings', () => {
    it('should update locale settings', async () => {
      const existing = { id: 'ls1', tenantId: 't1', language: 'en' };
      mockPrisma.localeSettings.findUnique.mockResolvedValue(existing);
      mockPrisma.localeSettings.update.mockResolvedValue({
        ...existing,
        language: 'ar',
        calendarType: 'hijri',
      });

      const result = await service.updateSettings(
        't1',
        { language: 'ar', calendarType: 'hijri' },
        'user1',
      );

      expect(result.language).toBe('ar');
      expect(mockActivity.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'updated' }),
      );
    });
  });

  describe('convertToHijri', () => {
    it('should convert a valid Gregorian date to Hijri', () => {
      const result = service.convertToHijri('2026-03-11');

      expect(result.hijri).toBeDefined();
      expect(result.hijri.year).toBeGreaterThan(1400);
      expect(result.hijri.month).toBeGreaterThanOrEqual(1);
      expect(result.hijri.month).toBeLessThanOrEqual(12);
      expect(result.hijri.day).toBeGreaterThanOrEqual(1);
      expect(result.gregorian).toBe('2026-03-11');
      expect(result.monthName).toBeTruthy();
      expect(result.monthNameAr).toBeTruthy();
    });

    it('should throw for invalid date', () => {
      expect(() => service.convertToHijri('not-a-date')).toThrow(BadRequestException);
    });

    it('should handle ISO date string', () => {
      const result = service.convertToHijri('2026-01-01T00:00:00Z');

      expect(result.hijri.year).toBeGreaterThan(1400);
    });
  });

  describe('formatCurrency', () => {
    it('should format SAR currency', () => {
      const result = service.formatCurrency(750000, {
        currency: 'SAR',
        numberFormat: 'en-SA',
      });

      expect(result).toContain('750');
      expect(result).toContain('SAR');
    });

    it('should format with Arabic locale', () => {
      const result = service.formatCurrency(1000.50, {
        currency: 'SAR',
        numberFormat: 'ar-SA',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('formatNumber', () => {
    it('should format number with decimals', () => {
      const result = service.formatNumber(1234567.89, { numberFormat: 'en-SA' });

      expect(result).toContain('1,234,567.89');
    });

    it('should respect custom decimal places', () => {
      const result = service.formatNumber(1234.5, { numberFormat: 'en-SA' }, 0);

      expect(result).toContain('1,235'); // rounded
    });
  });

  describe('formatDate', () => {
    it('should format date with DD/MM/YYYY format', () => {
      const date = new Date('2026-03-11T12:00:00Z');
      const result = service.formatDate(date, {
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Riyadh',
        calendarType: 'gregorian',
      });

      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });
});
