import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express'; // ใช้ express static
import * as cors from 'cors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cors());
  app.useGlobalFilters(new AllExceptionsFilter());
  const configService = app.get(ConfigService);

  // Swagger Configuration
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'api/docs');
  if (configService.get<boolean>('ENABLE_SWAGGER', true)) {
    const config = new DocumentBuilder()
      .setTitle('User & Patient Management API') // ชื่อ API
      .setDescription('API documentation for managing users and patients') // คำอธิบาย
      .setVersion('1.0') // เวอร์ชัน
      .addTag('users') // หมวดหมู่ Users
      .addTag('patients') // หมวดหมู่ Patients
      .addBearerAuth() // เพิ่ม Authentication แบบ Bearer Token
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document); // เรียก Swagger ที่ path ที่กำหนด
  }

  // เปิดใช้งาน CORS
  const corsOrigins = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:9000',
  );
  const allowedOrigins = corsOrigins.split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowed origins list ('*' = any, used
      // by compose.demo.yml where the app is reached through a proxy whose
      // public URL is not known in advance, e.g. GitHub Codespaces)
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // For development, allow localhost origins
      if (
        configService.get<string>('NODE_ENV') === 'development' &&
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: configService.get<string>(
      'CORS_METHODS',
      'GET,HEAD,PUT,PATCH,POST,DELETE',
    ),
    allowedHeaders: configService.get<string>(
      'CORS_ALLOWED_HEADERS',
      'Content-Type, Authorization',
    ),
    credentials: true, // Allow credentials (cookies, authorization headers)
  });

  // เสิร์ฟ static files จากโฟลเดอร์ uploads
  const uploadPath = configService.get<string>('UPLOAD_PATH', 'uploads');
  app.use('/uploads', express.static(uploadPath));

  // ฟังบนพอร์ตที่กำหนด
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`);
  logger.log(`Swagger docs available at: ${url}/${swaggerPath}`);
}
bootstrap().catch((err) => {
  logger.error(
    'Failed to bootstrap application',
    err instanceof Error ? err.stack : err,
  );
  process.exit(1);
});
