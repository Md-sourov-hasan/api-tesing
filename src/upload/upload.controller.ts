import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Put,
  Param,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import * as fs from 'fs';

const BASE_URL = 'https://api-tesing.onrender.com'; // <---- YOUR CURRENT BASE URL

@ApiTags('Image Upload')
@Controller('image')
export class UploadController {

  // ------------ UPLOAD IMAGE ------------
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a single image',
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + file.originalname;
          cb(null, unique);
        },
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = `${BASE_URL}/uploads/${file.filename}`;
    return {
      message: 'Image uploaded successfully',
      filename: file.filename,
      url: imageUrl,
    };
  }

  // ------------ UPDATE IMAGE ------------
  @Put('update/:oldFile')
  @ApiParam({ name: 'oldFile', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update (replace) an image',
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const newName = Date.now() + '-' + file.originalname;
          cb(null, newName);
        },
      }),
    }),
  )
  updateImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('oldFile') oldFile: string,
  ) {
    const oldPath = `./uploads/${oldFile}`;

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    const newImageUrl = `${BASE_URL}/uploads/${file.filename}`;

    return {
      message: 'Image updated',
      newFile: file.filename,
      url: newImageUrl,
    };
  }

  // ------------ GET ALL IMAGE LIST ------------
  @Get('all')
  @ApiOperation({ summary: 'Get all uploaded images list with full URLs' })
  getAllImages() {
    const folder = './uploads';
    const baseUrl = `${BASE_URL}/uploads/`;

    if (!fs.existsSync(folder)) {
      return { total: 0, images: [] };
    }

    const files = fs.readdirSync(folder);

    const imageUrls = files.map((file) => ({
      filename: file,
      url: baseUrl + file,
    }));

    return {
      total: files.length,
      images: imageUrls,
    };
  }
}
