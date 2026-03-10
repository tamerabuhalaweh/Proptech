// ============================================================
// Login DTO
// ============================================================

import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@proptech.sa', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @ApiProperty({ example: 'Admin@123', description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}
