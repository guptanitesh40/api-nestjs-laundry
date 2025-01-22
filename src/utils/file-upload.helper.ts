import { HttpException, HttpStatus } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import path from 'path';
import { FilePath } from 'src/constants/FilePath';
import { fileUpload } from 'src/multer/image-upload';
import { pdfUpload } from 'src/multer/pdf-upload';

export function fileFieldsInterceptor() {
  return FileFieldsInterceptor(
    [
      { name: 'logo', maxCount: 1 },
      { name: 'contract_document', maxCount: 1 },
      { name: 'image', maxCount: 1 },
      { name: 'id_proof', maxCount: 1 },
    ],
    {
      storage: diskStorage({
        destination: (req, file, cb) => {
          let uploadPath;
          if (file.fieldname === 'logo') {
            uploadPath = path.join(process.cwd(), FilePath.COMPANY_LOGO);
          } else if (file.fieldname === 'contract_document') {
            uploadPath = path.join(process.cwd(), FilePath.CONTRACT_DOCUMENT);
          } else if (file.fieldname === 'image') {
            uploadPath = path.join(process.cwd(), FilePath.USER_IMAGES);
          } else if (file.fieldname === 'id_proof') {
            uploadPath = path.join(process.cwd(), FilePath.USER_ID_PROOF);
          }
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const originalExtension = path.extname(file.originalname);
          const filename = `${Date.now()}${originalExtension}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: Math.max(
          fileUpload(FilePath.COMPANY_LOGO).limits.fileSize,
          pdfUpload(FilePath.CONTRACT_DOCUMENT).limits.fileSize,
          fileUpload(FilePath.USER_IMAGES).limits.fileSize,
          pdfUpload(FilePath.USER_ID_PROOF).limits.fileSize,
        ),
      },
      fileFilter: (req, file, cb) => {
        let allowedMimeTypes;
        if (file.fieldname === 'logo') {
          allowedMimeTypes = ['image/jpeg', 'image/png'];
        } else if (file.fieldname === 'contract_document') {
          allowedMimeTypes = ['application/pdf'];
        } else if (file.fieldname === 'image') {
          allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        } else if (file.fieldname === 'id_proof') {
          allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/jpeg',
            'image/png',
          ];
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
          cb(
            new HttpException(
              `Invalid file type for ${file.fieldname}! Allowed types: ${allowedMimeTypes.join(', ')}`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    },
  );
}
