import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ------------------- Serve static files -------------------
  // This will make files in the 'uploads' folder accessible at /uploads/<filename>
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL prefix
  });

  // ------------------- Enable CORS -------------------
  app.enableCors(); // Allows requests from mobile or other devices

  // ------------------- Swagger Setup -------------------
  const config = new DocumentBuilder()
    .setTitle('Image Upload API')
    .setDescription('API for uploading and managing images')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log(`Server running on http://localhost:3000`);
  console.log(`Swagger docs available on http://localhost:3000/api-docs`);
}

bootstrap();
