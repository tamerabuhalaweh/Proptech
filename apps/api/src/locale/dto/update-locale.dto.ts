// ============================================================
// Update Locale Settings DTO
// ============================================================

import { IsString, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocaleDto {
  @ApiPropertyOptional({ example: 'ar', description: 'Language code (en, ar)' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ example: 'hijri', description: 'Calendar type', enum: ['gregorian', 'hijri'] })
  @IsOptional()
  @IsString()
  @IsIn(['gregorian', 'hijri'])
  calendarType?: string;

  @ApiPropertyOptional({ example: 'DD/MM/YYYY', description: 'Date format' })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @ApiPropertyOptional({ example: '12h', description: 'Time format', enum: ['12h', '24h'] })
  @IsOptional()
  @IsString()
  @IsIn(['12h', '24h'])
  timeFormat?: string;

  @ApiPropertyOptional({ example: 'SAR', description: 'Currency code' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Asia/Riyadh', description: 'Timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 0, description: 'First day of week (0=Sunday, 6=Saturday)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  firstDayOfWeek?: number;

  @ApiPropertyOptional({ example: 'ar-SA', description: 'Number format locale' })
  @IsOptional()
  @IsString()
  numberFormat?: string;
}
