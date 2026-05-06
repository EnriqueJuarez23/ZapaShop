import { Controller, Get, Render, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {
  // Lista extendida con más categorías y modelos
  private zapatos = [
    // SNEAKERS
    { id: 1, nombre: 'Nike Air Max 270', precio: 3200, categoria: 'Sneakers', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600' },
    { id: 2, nombre: 'Adidas Ultraboost', precio: 3800, categoria: 'Sneakers', img: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=600' },
    { id: 3, nombre: 'Jordan Retro 4', precio: 4500, categoria: 'Sneakers', img: 'https://leplugmx.com/cdn/shop/files/FullSizeRender_4f4d87e1-8638-478d-a798-29570c188147_1200x1200.jpg?v=1725241733' },
    
    // BOTAS
    { id: 4, nombre: 'Timberland Classic', precio: 3500, categoria: 'Botas', img: 'https://assets.timberland.com/images/t_img/f_auto,h_650,e_sharpen:60,w_650/dpr_2.0/v1719369337/TB118094231-HERO/Mens-Timberland-Classic-6Inch-Waterproof-Boot-TBL-HERO.png' },
    { id: 5, nombre: 'Dr. Martens 1460', precio: 4200, categoria: 'Botas', img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600' },
    
    // DEPORTIVOS
    { id: 6, nombre: 'Puma Velocity Nitro', precio: 2800, categoria: 'Deportivos', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600' },
    { id: 7, nombre: 'Asics Gel-Kayano', precio: 3100, categoria: 'Deportivos', img: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600' },
    
    // FORMAL
    { id: 8, nombre: 'Oxford Cuero Café', precio: 2200, categoria: 'Formal', img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600' },
    { id: 9, nombre: 'Loafers Elegance', precio: 1950, categoria: 'Formal', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600' }
  ];

  @Get() @Render('index') getHome() { return {}; }
  
  @Get('api/zapatos')
  getZapatos() { return this.zapatos; }

  @Post('api/zapatos')
  agregarZapato(@Body() nuevo: any) {
    this.zapatos.push({ id: this.zapatos.length + 1, ...nuevo });
    return { message: 'ok' };
  }

  // NUEVA RUTA PARA LA VISTA DEL CATÁLOGO
  @Get('catalogo')
  @Render('catalogo')
  getCatalogo() { return {}; }

  @Get('carrito') @Render('carrito') getCarrito() { return {}; }
  @Get('admin') @Render('admin') getAdmin() { return {}; }
  @Get('perfil') @Render('perfil') getPerfil() { return {}; }

}
