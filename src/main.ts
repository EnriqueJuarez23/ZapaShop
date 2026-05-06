import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Le decimos dónde estarán tus estilos y fotos (carpeta public)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  // Le decimos dónde estarán tus archivos HTML (carpeta views)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs'); // Usaremos HBS que permite inyectar datos

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
