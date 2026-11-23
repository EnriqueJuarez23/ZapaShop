import { Controller, Get, Render, Post, Body, Query, Param, Delete } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

let halloweenGlobal = false;

interface UsuarioRecord {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'cliente';
  verificado: boolean;
  codigoVerificacion?: string | null;
  mfaHabilitado: boolean;
  codigoMFA?: string | null;
  mfaExpiraEn?: number | null;
  intentosFallidos: number;
  bloqueadoHasta: number | null;
}

@Controller()
export class AppController {
  private readonly filePath = path.join(__dirname, '..', 'zapatos.json');
  private readonly userFilePath = path.join(__dirname, '..', 'usuarios.json');

  private readonly MAX_INTENTOS = 3;
  private readonly DURACION_BLOQUEO_MS = 60 * 1000; // 1 minuto para pruebas ágiles
  private readonly DURACION_MFA_MS = 3 * 60 * 1000; // 3 minutos de validez del código MFA

  private leerBaseDeDatos() {
    try {
      if (!fs.existsSync(this.filePath)) {
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

  private guardarBaseDeDatos(zapatos: any[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(zapatos, null, 2));
  }

  private leerUsuarios(): UsuarioRecord[] {
    try {
      if (!fs.existsSync(this.userFilePath)) {
        this.guardarUsuarios([]);
        return [];
      }
      const data = fs.readFileSync(this.userFilePath, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error leyendo usuarios:", error);
      return [];
    }
  }

  private guardarUsuarios(usuarios: UsuarioRecord[]) {
    fs.writeFileSync(this.userFilePath, JSON.stringify(usuarios, null, 2));
  }

  private generarCodigo6Digitos(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private sanitizarUsuario(u: UsuarioRecord) {
    return {
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      verificado: u.verificado,
      mfaHabilitado: u.mfaHabilitado
    };
  }

  @Post('api/register')
  registrarUsuario(@Body() nuevoUsuario: any) {
    const usuarios = this.leerUsuarios();
    const emailNormalizado = String(nuevoUsuario.email || '').trim().toLowerCase();
    const nombreLimpio = String(nuevoUsuario.nombre || '').trim();
    const passwordLimpio = String(nuevoUsuario.password || '');

    if (!nombreLimpio || !emailNormalizado || !passwordLimpio) {
      return { success: false, message: 'Completa nombre, correo y contraseña.' };
    }

    const existe = usuarios.find(u => u.email.toLowerCase() === emailNormalizado);
    if (existe) {
      return { success: false, message: 'El correo ya está registrado.' };
    }

    const codigoVerificacion = this.generarCodigo6Digitos();
    const rol: 'admin' | 'cliente' = emailNormalizado.endsWith('@zapashop.com') ? 'admin' : 'cliente';

    const registro: UsuarioRecord = {
      id: Date.now(),
      nombre: nombreLimpio,
      email: emailNormalizado,
      password: passwordLimpio,
      rol,
      verificado: false,
      codigoVerificacion,
      mfaHabilitado: true,
      codigoMFA: null,
      mfaExpiraEn: null,
      intentosFallidos: 0,
      bloqueadoHasta: null
    };

    usuarios.push(registro);
    this.guardarUsuarios(usuarios);

    return {
      success: true,
      requiereVerificacion: true,
      email: emailNormalizado,
      codigoDemo: codigoVerificacion,
      message: `Cuenta creada. Ingresa el código de verificación (${codigoVerificacion}) para activarla.`
    };
  }

  @Post('api/verify-account')
  verificarCuenta(@Body() body: { email: string; codigo: string }) {
    const usuarios = this.leerUsuarios();
    const emailNormalizado = String(body.email || '').trim().toLowerCase();
    const codigoIngresado = String(body.codigo || '').trim();

    const idx = usuarios.findIndex(u => u.email.toLowerCase() === emailNormalizado);
    if (idx === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const usuario = usuarios[idx];
    if (usuario.verificado) {
      return { success: true, message: 'Tu cuenta ya está verificada.' };
    }

    if (!usuario.codigoVerificacion || usuario.codigoVerificacion !== codigoIngresado) {
      return { success: false, message: 'Código de verificación incorrecto.' };
    }

    usuarios[idx] = {
      ...usuario,
      verificado: true,
      codigoVerificacion: null
    };
    this.guardarUsuarios(usuarios);

    return { success: true, message: '¡Cuenta verificada correctamente! Ya puedes iniciar sesión.' };
  }

  @Post('api/login')
  loginUsuario(@Body() credenciales: any) {
    const usuarios = this.leerUsuarios();
    const emailNormalizado = String(credenciales.email || '').trim().toLowerCase();
    const passwordIngresado = String(credenciales.password || '');
    const ahora = Date.now();

    const idx = usuarios.findIndex(u => u.email.toLowerCase() === emailNormalizado);
    if (idx === -1) {
      return { success: false, message: 'Credenciales incorrectas o usuario no registrado.' };
    }

    const usuario = usuarios[idx];

    // 1. Verificar bloqueo por intentos fallidos (Account Lockout)
    if (usuario.bloqueadoHasta && ahora < usuario.bloqueadoHasta) {
      const segundosRestantes = Math.ceil((usuario.bloqueadoHasta - ahora) / 1000);
      return {
        success: false,
        bloqueado: true,
        segundosRestantes,
        message: `Cuenta bloqueada temporalmente por seguridad. Intenta de nuevo en ${segundosRestantes} segundos.`
      };
    }

    // Si ya pasó el tiempo de bloqueo, limpiamos el bloqueo vencido
    if (usuario.bloqueadoHasta && ahora >= usuario.bloqueadoHasta) {
      usuario.bloqueadoHasta = null;
      usuario.intentosFallidos = 0;
    }

    // 2. Validar contraseña
    if (usuario.password !== passwordIngresado) {
      const nuevosIntentos = (usuario.intentosFallidos || 0) + 1;
      usuario.intentosFallidos = nuevosIntentos;

      if (nuevosIntentos >= this.MAX_INTENTOS) {
        usuario.bloqueadoHasta = ahora + this.DURACION_BLOQUEO_MS;
        usuario.intentosFallidos = 0;
        usuarios[idx] = usuario;
        this.guardarUsuarios(usuarios);

        return {
          success: false,
          bloqueado: true,
          segundosRestantes: Math.ceil(this.DURACION_BLOQUEO_MS / 1000),
          message: `Has alcanzado el límite de ${this.MAX_INTENTOS} intentos fallidos. Cuenta bloqueada por 1 minuto.`
        };
      }

      usuarios[idx] = usuario;
      this.guardarUsuarios(usuarios);
      const restantes = this.MAX_INTENTOS - nuevosIntentos;

      return {
        success: false,
        intentosRestantes: restantes,
        message: `Contraseña incorrecta. Te quedan ${restantes} intento(s) antes del bloqueo temporal.`
      };
    }

    // Credenciales correctas: reiniciamos contador de fallos
    usuario.intentosFallidos = 0;
    usuario.bloqueadoHasta = null;

    // 3. Verificar si la cuenta está verificada
    if (usuario.verificado === false) {
      const codigoVerificacion = usuario.codigoVerificacion || this.generarCodigo6Digitos();
      usuario.codigoVerificacion = codigoVerificacion;
      usuarios[idx] = usuario;
      this.guardarUsuarios(usuarios);

      return {
        success: false,
        requiereVerificacion: true,
        email: usuario.email,
        codigoDemo: codigoVerificacion,
        message: `Tu cuenta aún no está verificada. Usa el código ${codigoVerificacion} para activarla.`
      };
    }

    // 4. Autenticación Multifactor (MFA)
    if (usuario.mfaHabilitado !== false) {
      const codigoMFA = this.generarCodigo6Digitos();
      usuario.codigoMFA = codigoMFA;
      usuario.mfaExpiraEn = ahora + this.DURACION_MFA_MS;
      usuarios[idx] = usuario;
      this.guardarUsuarios(usuarios);

      return {
        success: false,
        requiereMFA: true,
        email: usuario.email,
        codigoMFADemo: codigoMFA,
        message: `Segundo paso de seguridad (MFA): ingresa el código de 6 dígitos ${codigoMFA}.`
      };
    }

    usuarios[idx] = usuario;
    this.guardarUsuarios(usuarios);

    return {
      success: true,
      message: 'Bienvenido',
      usuario: this.sanitizarUsuario(usuario)
    };
  }

  @Post('api/verify-mfa')
  verificarMFA(@Body() body: { email: string; codigo: string }) {
    const usuarios = this.leerUsuarios();
    const emailNormalizado = String(body.email || '').trim().toLowerCase();
    const codigoIngresado = String(body.codigo || '').trim();
    const ahora = Date.now();

    const idx = usuarios.findIndex(u => u.email.toLowerCase() === emailNormalizado);
    if (idx === -1) {
      return { success: false, message: 'Usuario no encontrado.' };
    }

    const usuario = usuarios[idx];

    if (!usuario.codigoMFA || !usuario.mfaExpiraEn || ahora > usuario.mfaExpiraEn) {
      usuario.codigoMFA = null;
      usuario.mfaExpiraEn = null;
      usuarios[idx] = usuario;
      this.guardarUsuarios(usuarios);
      return { success: false, message: 'El código MFA ha expirado. Inicia sesión nuevamente.' };
    }

    if (usuario.codigoMFA !== codigoIngresado) {
      return { success: false, message: 'Código MFA incorrecto.' };
    }

    usuario.codigoMFA = null;
    usuario.mfaExpiraEn = null;
    usuarios[idx] = usuario;
    this.guardarUsuarios(usuarios);

    return {
      success: true,
      message: 'Verificación multifactor exitosa',
      usuario: this.sanitizarUsuario(usuario)
    };
  }

  @Get()
  @Render('index')
  getHome() { return {}; }

  @Get('api/zapatos')
  getZapatos(@Query('admin') admin: string) {
    const zapatos = this.leerBaseDeDatos();
    if (admin === 'true') return zapatos;
    return zapatos.filter(z => z.activo);
  }

  @Post('api/zapatos')
  agregarZapato(@Body() nuevo: any) {
    const zapatos = this.leerBaseDeDatos();
    zapatos.push({
      id: Date.now(),
      ...nuevo,
      stock: Number(nuevo.stock) || 0,
      activo: true
    });
    this.guardarBaseDeDatos(zapatos);
    return { message: 'ok' };
  }

  @Post('api/zapatos/vender')
  venderZapatos(@Body() body: { items: any[] }) {
    const zapatos = this.leerBaseDeDatos();
    const itemsVendidos = body.items;

    itemsVendidos.forEach(itemComprado => {
      const index = zapatos.findIndex(z => z.id === Number(itemComprado.id));
      if (index !== -1) {
        const stockActual = Number(zapatos[index].stock) || 0;
        if (stockActual > 0) {
          zapatos[index].stock = stockActual - 1;
        }
      }
    });

    this.guardarBaseDeDatos(zapatos);
    return { message: 'Stock actualizado correctamente' };
  }

  @Get('admin')
  @Render('admin')
  getAdmin(@Query('email') email: string) {
    const emailNormalizado = String(email || '').trim().toLowerCase();
    const usuarios = this.leerUsuarios();
    const usuarioAdmin = usuarios.find(
      u => u.email.toLowerCase() === emailNormalizado &&
           u.email.endsWith('@zapashop.com') &&
           u.verificado
    );

    if (!usuarioAdmin) {
      return { autorizado: false, url: '/' };
    }
    return { autorizado: true };
  }

  @Post('api/zapatos/update/:id')
  updateZapato(@Param('id') id: string, @Body() datos: any) {
    const zapatos = this.leerBaseDeDatos();
    const index = zapatos.findIndex(z => z.id === Number(id));
    if (index !== -1) {
      zapatos[index] = { ...zapatos[index], ...datos };
      this.guardarBaseDeDatos(zapatos);
      return { message: 'Actualizado' };
    }
  }

  @Delete('api/zapatos/:id')
  deleteZapato(@Param('id') id: string) {
    let zapatos = this.leerBaseDeDatos();
    zapatos = zapatos.filter(z => z.id !== Number(id));
    this.guardarBaseDeDatos(zapatos);
    return { message: 'Borrado' };
  }

  @Get('api/config/halloween')
  getHalloweenStatus() {
    return { halloween: halloweenGlobal };
  }

  @Post('api/config/halloween')
  setHalloweenStatus(@Body() body: { activo: boolean }) {
    halloweenGlobal = body.activo;
    return { success: true, halloween: halloweenGlobal };
  }

  @Get('catalogo') @Render('catalogo') getCatalogo() { return {}; }
  @Get('carrito') @Render('carrito') getCarrito() { return {}; }
  @Get('perfil') @Render('perfil') getPerfil() { return {}; }
}
