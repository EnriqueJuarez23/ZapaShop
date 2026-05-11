// 1. CONFIGURACIÓN Y ESTADO GLOBAL
const API_URL = '/api/zapatos';
let carrito = JSON.parse(localStorage.getItem('zapa_carrito')) || [];
const TIENDAS_FISICAS = [
    { id: 1, nombre: "ZapaShop Centro", direccion: "Av. Principal #123, Col. Centro" },
    { id: 2, nombre: "ZapaShop Norte", direccion: "Plaza Las Torres, Local 45" },
    { id: 3, nombre: "ZapaShop Poniente", direccion: "Calzada de los Héroes #890" }
];

// --- SECCIÓN: CATÁLOGO (VISTA CLIENTE) ---

async function cargarZapatos() {
    const grid = document.getElementById('productsGrid');
    const filtro = document.getElementById('filtroCategoria');
    if (!grid) return;

    try {
        const respuesta = await fetch(API_URL);
        const todosLosZapatos = await respuesta.json();
        const categoriaSeleccionada = filtro ? filtro.value : 'Todos';

        // 1. Filtrar productos activos y por categoría
        const zapatosFiltrados = todosLosZapatos.filter(z => {
            const pasaActivo = z.activo !== false;
            const pasaCategoria = (categoriaSeleccionada === 'Todos' || z.categoria === categoriaSeleccionada);
            return pasaActivo && pasaCategoria;
        });

        grid.innerHTML = ''; 

        // 2. Renderizar cada zapato
        zapatosFiltrados.forEach(zapato => { 
            // Validamos que el stock sea un número. Si no existe, es 0.
            const stockReal = Number(zapato.stock);
            const tallasDisponibles = zapato.tallas || [25, 26, 27, 28, 29];
            const imagenZapato = zapato.img || zapato.imagen || 'https://placehold.co/600x600?text=Sneaker';

            grid.innerHTML += `
            <div class="bg-white rounded-[2.5rem] p-3 shadow-sm border border-slate-100 group transition-all duration-500 ${stockReal <= 0 ? 'opacity-60 grayscale' : ''}">
                <div class="relative overflow-hidden rounded-[2rem] bg-slate-50">
                    <img src="${imagenZapato}" class="w-full h-80 md:h-64 object-cover">
<div class="absolute bottom-4 right-4">
            ${stockReal > 0 
                ? `<span class="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg">EN STOCK: ${stockReal}</span>`
                : `<span class="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg">AGOTADO</span>`
            }
        </div>                    
                </div>

                <div class="p-6">
                    <h3 class="text-xl font-black text-slate-800 mb-4">${zapato.nombre}</h3>
                    
                    <div class="flex justify-between items-end gap-4">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-2">Talla</label>
                            <select id="talla-${zapato.id}" class="bg-slate-50 border-none rounded-xl py-2 px-3 text-sm font-bold">
                                ${tallasDisponibles.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="text-right">
                            <span class="text-2xl font-black text-slate-900">$${Number(zapato.precio).toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="mt-6">
                        ${stockReal > 0
                            ? `<button onclick="prepararAgregado(${zapato.id}, '${zapato.nombre}', ${zapato.precio}, ${stockReal})" 
                                       class="w-full bg-blue-600 hover:bg-black text-white font-black py-4 rounded-2xl transition-all uppercase text-xs tracking-widest active:scale-95 shadow-md shadow-blue-100">
                                    Agregar al Carrito
                               </button>`
                            : `<button disabled class="w-full bg-slate-100 text-slate-400 font-black py-4 rounded-2xl cursor-not-allowed uppercase text-xs tracking-widest">
                                    Agotado
                               </button>`
                        }
                    </div>
                </div>
            </div>`;
        });

        if (window.lucide) lucide.createIcons();
    } catch (error) { 
        console.error("Error al cargar zapatos:", error);
    }
}

// --- SECCIÓN: CARRITO ---

function prepararAgregado(id, nombre, precio, stock) {
    const talla = document.getElementById(`talla-${id}`).value;
    agregarAlCarrito(id, nombre, precio, talla, stock);
}

// Agregamos 'stockDisponible' como parámetro
function agregarAlCarrito(id, nombre, precio, talla, stockDisponible) {
    // 1. Contar cuántos de este mismo ID ya hay en el carrito
    const cantidadEnCarrito = carrito.filter(item => item.id === id).length;

    // 2. Validar si aún hay stock para agregar otro
    if (cantidadEnCarrito >= stockDisponible) {
        Swal.fire({
            title: '¡Sin stock!',
            text: `Lo sentimos, solo hay ${stockDisponible} unidades disponibles.`,
            icon: 'error',
            confirmButtonColor: '#2563eb'
        });
        return; // Detenemos la función aquí
    }

    // 3. Si hay stock, lo agregamos normal
    carrito.push({ 
        id, 
        nombre, 
        precio, 
        talla, 
        metodo: 'envio', 
        tiendaId: null 
    });
    
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    // Alerta de éxito
    Swal.fire({
        title: '¡Añadido!',
        text: `${nombre} ya está en tu carrito`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        timerProgressBar: true,
        background: '#ffffff',
        iconColor: '#2563eb'
    });

    if (document.getElementById('listaCarrito')) {
        actualizarVistaCarrito();
    }
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('listaCarrito');
    const cantItemsElement = document.getElementById('cantItems'); 
    if (!lista) return;

    if (cantItemsElement) cantItemsElement.innerText = carrito.length;

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm shadow-blue-50/50">
                <div class="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i data-lucide="shopping-bag" class="w-12 h-12"></i>
                </div>
                <h3 class="text-2xl font-black text-slate-900 mb-2">¡Tu carrito espera!</h3>
                <p class="text-slate-500 font-medium mb-8 max-w-sm mx-auto">
                    Parece que aún no has añadido nada. Explora nuestra colección y encuentra tus sneakers perfectos.
                </p>
                <a href="/catalogo" class="inline-flex items-center gap-3 bg-blue-600 hover:bg-black text-white font-black px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-200 uppercase text-xs tracking-widest">
                    <i data-lucide="arrow-left" class="w-5 h-5"></i>
                    Ver Catálogo Completo
                </a>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        calcularTotales();
        return;
    }

    // 1. Generamos el HTML de los productos
    let htmlProductos = carrito.map((item, index) => `
        <div class="bg-white rounded-[2.5rem] p-6 mb-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center group">
            <div class="w-32 h-32 bg-slate-50 rounded-[2rem] flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                <img src="${item.img || 'https://placehold.co/400x400?text=Zapato'}" 
                     onerror="this.src='https://placehold.co/400x400?text=Zapato';" 
                     class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            </div>

            <div class="flex-grow w-full">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-black text-slate-800 leading-tight">${item.nombre}</h3>
                        <div class="flex flex-wrap gap-3 mt-2">
                            <span class="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">Talla: ${item.talla}</span>
                            <span class="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase">ID: #${item.id.toString().slice(-4)}</span>
                        </div>
                    </div>
                    <button onclick="eliminarDelCarrito(${index})" class="text-rose-300 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-full transition-all">
                        <i data-lucide="trash-2" class="w-6 h-6"></i>
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Entrega</label>
                        <select onchange="cambiarMetodoEntrega(${index}, this.value)" 
                                class="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                            <option value="envio" ${item.metodo === 'envio' ? 'selected' : ''}>🚚 Envío</option>
                            <option value="fisica" ${item.metodo === 'fisica' ? 'selected' : ''}>🏢 Sucursal</option>
                        </select>
                    </div>

                    <div id="tienda-select-${index}" class="${item.metodo === 'fisica' ? 'block' : 'hidden'}">
                        <label class="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">¿Cuál tienda?</label>
                        <select onchange="cambiarTienda(${index}, this.value)" 
                                class="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-sm font-bold text-slate-700 outline-none">
                            <option value="">Selecciona sucursal</option>
                            ${typeof TIENDAS_FISICAS !== 'undefined' ? TIENDAS_FISICAS.map(t => `
                                <option value="${t.id}" ${item.tiendaId == t.id ? 'selected' : ''}>📍 ${t.nombre}</option>
                            `).join('') : ''}
                        </select>
                    </div>
                </div>
            </div>

            <div class="text-right flex-shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</span>
                <span class="text-2xl font-black text-slate-900">$${Number(item.precio).toLocaleString()}</span>
            </div>
        </div>
    `).join('');

    // 2. Verificamos si hay algún item que necesite envío
    const necesitaEnvio = carrito.some(item => item.metodo === 'envio');

    // 3. Agregamos el campo de dirección al final del HTML
    const htmlDireccion = `
        <div id="contenedorDireccion" class="mt-8 p-8 bg-blue-50 rounded-[2.5rem] border-2 border-dashed border-blue-200 ${necesitaEnvio ? '' : 'hidden'}">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <i data-lucide="map-pin" class="w-5 h-5"></i>
                </div>
                <div>
                    <h4 class="text-lg font-black text-slate-800">Dirección de Envío</h4>
                    <p class="text-xs font-bold text-blue-400 uppercase tracking-wider">Obligatorio para entrega a domicilio</p>
                </div>
            </div>
            <textarea id="direccionEnvio" rows="3" 
                placeholder="Escribe tu calle, número, colonia, código postal y referencias..." 
                class="w-full p-5 rounded-2xl border-none focus:ring-4 focus:ring-blue-200 outline-none text-slate-700 font-medium transition-all shadow-inner"
            ></textarea>
        </div>
    `;

    // Unimos todo y lo inyectamos
    lista.innerHTML = htmlProductos + htmlDireccion;

    if (window.lucide) lucide.createIcons();
    calcularTotales();
}

async function finalizarPedido() {
    if (carrito.length === 0) return;

    // --- CAPTURA DE DATOS DE ENVÍO ---
    const direccionElement = document.getElementById('direccionEnvio');
    const direccion = direccionElement ? direccionElement.value.trim() : "";
    const necesitaEnvio = carrito.some(item => item.metodo === 'envio');

    // Validación: Si alguien quiere envío pero no escribió dirección
    if (necesitaEnvio && direccion.length < 10) {
        alert("⚠️ Por favor, ingresa una dirección completa para el envío (calle, número, colonia).");
        direccionElement?.focus();
        return;
    }

    try {
        // 1. AVISAR AL SERVIDOR PARA RESTAR STOCK (Backend)
        const respuesta = await fetch('/api/zapatos/vender', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: carrito })
        });

        if (!respuesta.ok) throw new Error('Error al actualizar stock');

        // 2. PREPARAR EL MENSAJE DE WHATSAPP
        const numeroWhatsApp = "525540304692";
        let mensaje = "¡Hola ZapaShop! 👋 Quiero realizar el siguiente pedido:\n\n";

        carrito.forEach((item) => {
            mensaje += `👟 *${item.nombre}*\n`;
            mensaje += `   - Talla: ${item.talla}\n`;
            
            if (item.metodo === 'fisica') {
                // Si es sucursal, buscamos el nombre de la tienda
                const tienda = typeof TIENDAS_FISICAS !== 'undefined' 
                    ? TIENDAS_FISICAS.find(t => t.id == item.tiendaId)?.nombre 
                    : "Sucursal seleccionada";
                mensaje += `   - Entrega: 📍 Recoger en ${tienda}\n`;
            } else {
                mensaje += `   - Entrega: 🚚 Envío a domicilio\n`;
            }
            
            mensaje += `   - Precio: $${Number(item.precio).toLocaleString()}\n\n`;
        });

        // 3. AGREGAR LA DIRECCIÓN AL FINAL DEL MENSAJE SI EXISTE
        if (necesitaEnvio) {
            mensaje += `🏠 *DIRECCIÓN DE ENVÍO:*\n${direccion}\n\n`;
        }

        const total = document.getElementById('totalCarrito').innerText;
        mensaje += `💰 *TOTAL A PAGAR: $${total}*`;

        // 4. ABRIR WHATSAPP
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');

        // 5. LIMPIAR Y RECARGAR
        alert("¡Pedido enviado con éxito!");
        carrito = [];
        localStorage.removeItem('carrito');
        actualizarVistaCarrito();
        cargarZapatos(); 

    } catch (error) {
        console.error("Error al finalizar:", error);
        alert("Hubo un problema. Verifica que el servidor esté encendido.");
    }
}


function calcularTotales() {
    // Sumamos asegurando que el precio sea un número
    let total = carrito.reduce((acc, item) => acc + Number(item.precio), 0);
    
    // Buscamos los elementos en el HTML
    const subE = document.getElementById('subtotalCarrito');
    const totE = document.getElementById('totalCarrito');
    
    // Si los encuentra, pone el precio con dos decimales
    if (subE) subE.innerText = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    if (totE) totE.innerText = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}


function eliminarDelCarrito(index) {
    // 1. Lo eliminamos del arreglo usando su posición (index)
    carrito.splice(index, 1);
    
    // 2. Guardamos la nueva lista en el almacenamiento local
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    
    // 3. Actualizamos el número del circulito azul en el menú
    actualizarContadorCarrito();
    
    // 4. IMPORTANTE: Volvemos a dibujar el carrito y recalculamos el total
    actualizarVistaCarrito();
    calcularTotales(); 

    // Opcional: Si el carrito queda vacío, puedes dar un aviso o recargar
    if (carrito.length === 0) {
        console.log("Carrito vacío");
    }
}

function cambiarMetodoEntrega(index, valor) {
    carrito[index].metodo = valor;
    
    // Si vuelve a envío, reseteamos la tienda
    if (valor === 'envio') {
        carrito[index].tiendaId = null;
    }
    
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    actualizarVistaCarrito(); // Re-renderizamos para mostrar/ocultar el selector de tiendas
}

function cambiarTienda(index, valor) {
    carrito[index].tiendaId = valor;
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    // No es necesario re-renderizar aquí, solo guardamos el dato
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) contador.innerText = carrito.length;
}

// --- SECCIÓN: ADMIN (CRUD) ---
async function cargarTablaAdmin() {
    const tabla = document.getElementById('tablaZapatos');
    if (!tabla) return;

    try {
        const res = await fetch(`${API_URL}?admin=true`);
        const zapatos = await res.json();

        if (zapatos.length === 0) {
            tabla.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-gray-400">Inventario vacío.</td></tr>';
            return;
        }

        tabla.innerHTML = zapatos.map(z => `
            <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                <td class="px-6 py-4 font-bold text-slate-700">${z.nombre}</td>
                <td class="px-6 py-4 text-blue-600 font-black">$${z.precio}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold ${z.activo ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}">
                        ${z.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td class="px-6 py-4 flex gap-2 justify-end">
                    <button onclick="cambiarEstado(${z.id}, ${z.activo})" class="p-2 hover:bg-slate-200 rounded-lg transition">
                        <i data-lucide="${z.activo ? 'eye-off' : 'eye'}" class="w-5 h-5 text-slate-500"></i>
                    </button>
                    <button onclick="eliminarPermanente(${z.id})" class="p-2 hover:bg-rose-100 rounded-lg transition">
                        <i data-lucide="trash-2" class="w-5 h-5 text-rose-500"></i>
                    </button>
<button onclick="prepararEdicion('${z.id}', '${z.nombre}', ${z.precio}, '${z.categoria}', '${z.img}')" 
        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
    <i data-lucide="pencil" class="w-4 h-4"></i>
</button>
                </td>
            </tr>
        `).join('');
        if (window.lucide) lucide.createIcons();
    } catch (e) { console.error("Error tabla admin:", e); }
}

async function cambiarEstado(id, estadoActual) {
    const nuevoEstado = !estadoActual;
    try {
        // Cambiamos la ruta a /update/ y el método a POST
        const res = await fetch(`${API_URL}/update/${id}`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: nuevoEstado })
        });
        if (res.ok) {
            cargarTablaAdmin(); // Refresca la tabla para ver el cambio
        }
    } catch (e) { console.error("Error al actualizar estado:", e); }
}


async function eliminarPermanente(id) {
    if (confirm('¿Eliminar producto permanentemente?')) {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (res.ok) cargarTablaAdmin();
    }
}

let editandoID = null; // Variable global para saber qué estamos editando

function prepararEdicion(id, nombre, precio, categoria, img, stock) {
    editandoID = id; // Guardamos el ID que vamos a actualizar
    
    // Llenamos los inputs del formulario
    document.getElementById('adminNombre').value = nombre;
    document.getElementById('adminPrecio').value = precio;
    document.getElementById('adminStock').value = stock;
    document.getElementById('adminCategoria').value = categoria;
    document.getElementById('adminImg').value = img;

    // Cambiamos el texto del botón para que el usuario sepa que está editando
    const btnGuardar = document.querySelector('#adminForm button[type="submit"]');
    btnGuardar.innerHTML = '<i data-lucide="refresh-cw" class="w-5 h-5"></i> ACTUALIZAR PRODUCTO';
    btnGuardar.classList.replace('bg-blue-600', 'bg-green-600');
    
    // Hacemos scroll hacia arriba para que el usuario vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (window.lucide) lucide.createIcons();
}

// --- SECCIÓN: SESIÓN ---
const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const userEmail = document.getElementById('loginUser').value;
        
        if (userEmail) {
            // Extraemos el nombre antes del @ y lo ponemos bonito
            const nombreLimpio = userEmail.split('@')[0];
            const nombreFormateado = nombreLimpio.charAt(0).toUpperCase() + nombreLimpio.slice(1);

            const objetoUsuario = { 
                nombre: nombreFormateado, 
                email: userEmail.toLowerCase() 
            };

            // Guardamos en LocalStorage
            localStorage.setItem('usuario_logueado', JSON.stringify(objetoUsuario));
            
            // Ejecutamos actualizaciones visuales
            verificarEstadoSesion();
            gestionarPermisosUI();
            
            // Redirección lógica
            if (objetoUsuario.email.endsWith('@zapashop.com')) {
                window.location.href = "/admin";
            } else {
                window.location.href = "/perfil"; // O "/" según prefieras
            }
        }
    });
}

// --- INTERCAMBIO DE PESTAÑAS (TABS) ---
const btnTabLogin = document.getElementById('btnTabLogin');
const btnTabRegistro = document.getElementById('btnTabRegistro');

if (btnTabLogin && btnTabRegistro) {
    btnTabLogin.addEventListener('click', () => {
        formLogin.classList.remove('hidden');
        formRegistro.classList.add('hidden');
        // Cambiar estilos de botones
        btnTabLogin.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        btnTabRegistro.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    });

    btnTabRegistro.addEventListener('click', () => {
        formRegistro.classList.remove('hidden');
        formLogin.classList.add('hidden');
        // Cambiar estilos de botones
        btnTabRegistro.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
        btnTabLogin.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    });
}

function verificarEstadoSesion() {
    const raw = localStorage.getItem('usuario_logueado');
    if (!raw) return;

    const user = JSON.parse(raw);

    // 1. Nombre limpio en el botón (evita el [object Object])
    const linkPerfil = document.querySelector('a[href="/perfil"]');
    if (linkPerfil) {
        linkPerfil.innerHTML = `<i data-lucide="user" class="w-5 h-5"></i> Hola, ${user.nombre}`;
    }

    // 2. OCULTAR TODOS LOS BOTONES DE REGISTRO
    // Buscamos cualquier enlace que lleve a /registro y lo borramos de la vista
    const btnsRegistro = document.querySelectorAll('a[href="/registro"], .btn-registro');
    btnsRegistro.forEach(b => b.style.display = 'none');

    // 3. Limpiar la vista de la página perfil
    const seccionLogueado = document.getElementById('seccionUsuarioLogueado');
    const tabsContainer = document.querySelector('.flex.bg-gray-100.p-1'); // El contenedor de las pestañas
    
    if (seccionLogueado) {
        seccionLogueado.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
        if (formRegistro) formRegistro.classList.add('hidden');
        if (tabsContainer) tabsContainer.style.display = 'none';
        
        const spanNombre = document.getElementById('nombreUsuarioPerfil');
        if (spanNombre) spanNombre.innerText = user.nombre;
    }
}

function gestionarPermisosUI() {
    const user = JSON.parse(localStorage.getItem('usuario_logueado'));
    const btnAdmin = document.getElementById('btnIrAdmin');
    
    // Si el usuario es admin, mostramos el botón del panel
    if (user && user.email.endsWith('@zapashop.com')) {
        if (btnAdmin) btnAdmin.classList.remove('hidden');
    } else {
        if (btnAdmin) btnAdmin.classList.add('hidden');
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    window.location.href = '/';
}

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoSesion();
    gestionarPermisosUI(); // <--- IMPORTANTE: Agrega esta línea aquí
    
    if (document.getElementById('productsGrid')) cargarZapatos();
    if (document.getElementById('tablaZapatos')) cargarTablaAdmin();
    actualizarContadorCarrito();
    // Manejo del Formulario de Guardado
const adminForm = document.getElementById('adminForm');
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            nombre: document.getElementById('adminNombre').value,
            precio: Number(document.getElementById('adminPrecio').value),
            stock: Number(document.getElementById('adminStock').value), 
            categoria: document.getElementById('adminCategoria').value,
            img: document.getElementById('adminImg').value,
            activo: true
        };

        // Si editandoID tiene algo, usamos la ruta de UPDATE, si no, la de POST normal
        const url = editandoID ? `${API_URL}/update/${editandoID}` : API_URL;
        const metodo = 'POST'; // Tu controlador usa POST para ambos casos

        try {
            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (res.ok) {
                alert(editandoID ? '¡Producto actualizado!' : '¡Producto agregado!');
                
                // Limpiamos todo
                adminForm.reset();
                editandoID = null; 
                
                // Regresamos el botón a su estado original
                const btnGuardar = adminForm.querySelector('button[type="submit"]');
                btnGuardar.innerHTML = '<i data-lucide="plus" class="w-5 h-5"></i> GUARDAR PRODUCTO';
                btnGuardar.classList.replace('bg-green-600', 'bg-blue-600');
                
                cargarTablaAdmin(); // Refresca la tabla
            }
        } catch (error) {
            console.error("Error al procesar:", error);
        }
    });
}
    if (window.lucide) lucide.createIcons();
});
