// ============================================================
// Check Duplicates DTO
// ============================================================

import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckDuplicatesDto {
  @ApiProperty({ example: 'Ahmed Al-Rashid', description: 'Lead name to check' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'ahmed@example.com', description: 'Email to check' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+966501234567', description: 'Phone to check' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
