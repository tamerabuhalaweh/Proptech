// ============================================================
// Bulk Upload Documents DTO
// ============================================================

import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateDocumentDto } from './create-document.dto';

export class BulkUploadDocumentDto {
  @ApiProperty({
    type: [CreateDocumentDto],
    description: 'Array of documents to upload',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentDto)
  documents!: CreateDocumentDto[];
}
