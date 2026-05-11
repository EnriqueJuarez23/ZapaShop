import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as hbs from 'hbs'; // Asegúrate de que tenga el * as
import { join } from 'path';
import { AppModule } from './app.module';
const hbs = require('hbs'); // <--- CAMBIA EL IMPORT POR ESTA LÍNEA EXACTA
async function bootstrap() {
  // Asegúrate de usar <NestExpressApplication> para que Nest reconozca los métodos de Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración de archivos estáticos (CSS, JS de la carpeta public)
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Configuración de las vistas
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  // Registrar los partials (esto es lo que te daba error)
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  await app.listen(3000);
  console.log('🚀 ZapaShop corriendo en: http://localhost:3000');
}
bootstrap();
