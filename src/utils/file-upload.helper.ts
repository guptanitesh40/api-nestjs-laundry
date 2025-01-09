import { HttpException, HttpStatus } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { FilePath } from 'src/constants/FilePath';
import { fileUpload } from 'src/multer/image-upload';
import { pdfUpload } from 'src/multer/pdf-upload';

export function createFileInterceptorConfig(
  fields: { name: string; path: string; mimeTypes: string[] }[],
  maxFileSize: number,
) {
  return {
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const fieldConfig = fields.find((f) => f.name === file.fieldname);
        if (fieldConfig) {
          cb(null, fieldConfig.path);
        } else {
          cb(
            new HttpException('Invalid file field!', HttpStatus.BAD_REQUEST),
            null,
          );
        }
      },
    }),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      const fieldConfig = fields.find((f) => f.name === file.fieldname);
      if (
        fieldConfig &&
        fieldConfig.mimeTypes.some((mimeType) =>
          file.mimetype.match(new RegExp(`\/(${mimeType})$`)),
        )
      ) {
        cb(null, true);
      } else {
        cb(
          new HttpException(
            `Invalid file type for ${file.fieldname}! Allowed types: ${fieldConfig?.mimeTypes.join(', ')}`,
            HttpStatus.BAD_REQUEST,
          ),
          false,
        );
      }
    },
  };
}

export function fileFieldsInterceptor() {
  return FileFieldsInterceptor(
    [
      { name: 'logo', maxCount: 1 },
      { name: 'contract_document', maxCount: 1 },
    ],
    createFileInterceptorConfig(
      [
        {
          name: 'logo',
          path: FilePath.COMPANY_LOGO,
          mimeTypes: ['jpg', 'jpeg', 'png'],
        },
        {
          name: 'contract_document',
          path: FilePath.CONTRACT_DOCUMENT,
          mimeTypes: ['pdf'],
        },
      ],
      Math.max(
        fileUpload(FilePath.COMPANY_LOGO).limits.fileSize,
        pdfUpload(FilePath.CONTRACT_DOCUMENT).limits.fileSize,
      ),
    ),
  );
}
