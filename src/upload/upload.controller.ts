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

@ApiTags('Image Upload')
@Controller('image')
export class UploadController {
  
  // --------------------- Upload Image ---------------------
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
    const imageUrl = `http://localhost:3000/uploads/${file.filename}`;
    return {
      message: 'Image uploaded successfully',
      filename: file.filename,
      url: imageUrl,
    };
  }

  // --------------------- Update Image ---------------------
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

    const newImageUrl = `http://localhost:3000/uploads/${file.filename}`;

    return {
      message: 'Image updated',
      newFile: file.filename,
      url: newImageUrl,
    };
  }

  // --------------------- List All Images ---------------------
  @Get('all')
  @ApiOperation({ summary: 'Get all uploaded images list with full URLs' })
  getAllImages() {
    const folder = './uploads';
    const baseUrl = 'http://localhost:3000/uploads/';

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
