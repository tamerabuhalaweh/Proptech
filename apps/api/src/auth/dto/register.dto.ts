// ============================================================
// Register DTO
// ============================================================

import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({
    example: 'SecureP@ss1',
    description: 'Password (min 8 chars, must include uppercase, lowercase, and digit)',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit',
  })
  password!: string;

  @ApiProperty({ example: 'John Doe', description: 'Display name' })
  @IsString()
  @MinLength(2, { message: 'Display name must be at least 2 characters' })
  @MaxLength(100, { message: 'Display name must not exceed 100 characters' })
  displayName!: string;

  @ApiProperty({ example: 'clxyz123abc', description: 'Tenant ID to register under' })
  @IsString()
  tenantId!: string;

  // SECURITY: Role is NOT accepted from registration requests.
  // New users always get VIEWER role. Admins can upgrade via tenant management.
}
