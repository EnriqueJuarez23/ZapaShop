import { Controller, Get, Render, Post, Body, Query, Param, Delete } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  // 1. Definimos la ruta del archivo donde se guardará todo
  private readonly filePath = path.join(__dirname, '..', 'zapatos.json');

  // 2. Función interna para LEER los datos del archivo JSON
  private leerBaseDeDatos() {
    try {
      if (!fs.existsSync(this.filePath)) {
        // Si el archivo no existe, creamos uno con tus zapatos iniciales
        const iniciales = [
          { id: 1, nombre: 'Nike Air Max 270', precio: 3200, categoria: 'Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', activo: true, stock: 15 },
          { id: 2, nombre: 'Adidas Ultraboost', precio: 3800, categoria: 'Sneakers', img: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600', activo: true, stock: 11 },
          { id: 3, nombre: 'Jordan Retro 4', precio: 4500, categoria: 'Sneakers', img: 'https://leplugmx.com/cdn/shop/files/FullSizeRender_4f4d87e1-8638-478d-a798-29570c188147_1200x1200.jpg?v=1725241733', activo: true, stock: 10 },
          { id: 4, nombre: 'Timberland Classic', precio: 3500, categoria: 'Botas', img: 'https://assets.timberland.com/images/t_img/f_auto,h_650,e_sharpen:60,w_650/dpr_2.0/v1719369337/TB118094231-HERO/Mens-Timberland-Classic-6Inch-Waterproof-Boot-TBL-HERO.png', activo: true, stock: 10 },
          { id: 5, nombre: 'Dr. Martens 1460', precio: 4200, categoria: 'Botas', img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600', activo: true, stock: 13 },
          { id: 6, nombre: 'Puma Velocity Nitro', precio: 2800, categoria: 'Deportivos', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', activo: true, stock: 20 },
          { id: 7, nombre: 'Asics Gel-Kayano', precio: 3100, categoria: 'Deportivos', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600', activo: true, stock: 33 },
          { id: 8, nombre: 'Oxford Cuero Café', precio: 2200, categoria: 'Formal', img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600', activo: true, stock: 140 },
          { id: 9, nombre: 'Loafers Elegance', precio: 1950, categoria: 'Formal', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600', activo: true, stock: 50 }
        ];
        this.guardarBaseDeDatos(iniciales);
        return iniciales;
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error leyendo JSON:", error);
      return [];
    }
  }

  // 3. Función interna para ESCRIBIR los datos en el archivo JSON
  private guardarBaseDeDatos(zapatos: any[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(zapatos, null, 2));
  }

  @Get()
  @Render('index')
  getHome() { return {}; }

  @Get('api/zapatos')
  getZapatos(@Query('admin') admin: string) {
    const zapatos = this.leerBaseDeDatos(); // Leemos del archivo
    if (admin === 'true') return zapatos;
    return zapatos.filter(z => z.activo);
  }

  @Post('api/zapatos')
  agregarZapato(@Body() nuevo: any) {
    const zapatos = this.leerBaseDeDatos();
    zapatos.push({
      id: Date.now(),
      ...nuevo,
      stock: Number(nuevo.stock) || 0, // Agregamos el stock aquí
      activo: true
    });
    this.guardarBaseDeDatos(zapatos); // Guardamos en el archivo
    return { message: 'ok' };
  }

@Post('api/zapatos/vender')
  venderZapatos(@Body() body: { items: any[] }) {
    const zapatos = this.leerBaseDeDatos();
    const itemsVendidos = body.items;

    itemsVendidos.forEach(itemComprado => {
      // Buscamos el zapato en nuestra "base de datos" (el JSON)
      const index = zapatos.findIndex(z => z.id === Number(itemComprado.id));
      
      if (index !== -1) {
        // Restamos 1 al stock (o la cantidad que gustes)
        const stockActual = Number(zapatos[index].stock) || 0;
        if (stockActual > 0) {
          zapatos[index].stock = stockActual - 1;
        }
      }
    });

    this.guardarBaseDeDatos(zapatos); // Guardamos el nuevo stock en el archivo
    return { message: 'Stock actualizado correctamente' };
  }

  @Get('admin')
  @Render('admin')
  getAdmin(@Query('email') email: string) {
    if (!email || !email.endsWith('@zapashop.com')) {
      return { url: '/' };
    }
    return { autorizado: true };
  }

  @Post('api/zapatos/update/:id')
  updateZapato(@Param('id') id: string, @Body() datos: any) {
    const zapatos = this.leerBaseDeDatos();
    const index = zapatos.findIndex(z => z.id === Number(id));
    if (index !== -1) {
      zapatos[index] = { ...zapatos[index], ...datos };
      this.guardarBaseDeDatos(zapatos); // Guardamos el cambio
      return { message: 'Actualizado' };
    }
  }

  @Delete('api/zapatos/:id')
  deleteZapato(@Param('id') id: string) {
    let zapatos = this.leerBaseDeDatos();
    zapatos = zapatos.filter(z => z.id !== Number(id));
    this.guardarBaseDeDatos(zapatos); // Guardamos después de borrar
    return { message: 'Borrado' };
  }

  @Get('catalogo') @Render('catalogo') getCatalogo() { return {}; }
  @Get('carrito') @Render('carrito') getCarrito() { return {}; }
  @Get('perfil') @Render('perfil') getPerfil() { return {}; }
}
