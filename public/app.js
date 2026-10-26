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
    const buscador = document.getElementById('searchInput'); 
    
    if (!grid) return;

    try {
        const respuesta = await fetch(API_URL);
        const todosLosZapatos = await respuesta.json();
        
        const categoriaSeleccionada = filtro ? filtro.value : 'Todos';
        const textoBusqueda = (buscador && buscador.value) ? buscador.value.toLowerCase() : '';

        const zapatosFiltrados = todosLosZapatos.filter(z => {
            const pasaActivo = z.activo !== false;
            const pasaCategoria = (categoriaSeleccionada === 'Todos' || z.categoria === categoriaSeleccionada);
            const pasaBusqueda = z.nombre.toLowerCase().includes(textoBusqueda);
            
            return pasaActivo && pasaCategoria && pasaBusqueda;
        });

        grid.innerHTML = ''; 

        if (zapatosFiltrados.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400 font-medium">
                                No se encontraron modelos que coincidan con "${textoBusqueda}"
                              </div>`;
            return;
        }

        zapatosFiltrados.forEach(zapato => { 
            const stockReal = Number(zapato.stock);
            const tallasDisponibles = zapato.tallas || [25, 26, 27, 28, 29];
            const imagenZapato = zapato.img || zapato.imagen || 'https://placehold.co/600x600?text=Sneaker';

            grid.innerHTML += `
            <div class="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${stockReal <= 0 ? 'opacity-60 grayscale' : ''}">
                <div class="relative overflow-hidden rounded-[2rem] bg-slate-50">
                    <img src="${imagenZapato}" class="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500">
                    <div class="absolute bottom-4 right-4">
                        ${stockReal > 0 
                            ? `<span class="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">STOCK: ${stockReal}</span>`
                            : `<span class="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md">AGOTADO</span>`
                        }
                    </div>
                </div>

                <div class="p-4">
                    <h3 class="text-lg font-black text-slate-900 mb-2 truncate">${zapato.nombre}</h3>

                    <div class="flex justify-between items-end gap-2 mb-4">
                        <div>
                            <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Talla</label>
                            <select id="talla-${zapato.id}" class="bg-slate-100 border-none rounded-xl py-1.5 px-3 text-xs font-bold text-slate-700 outline-none">
                                ${tallasDisponibles.map(t => `<option value="${t}">${t}</option>`).join('')}
                            </select>
                        </div>
                        <div class="text-right">
                            <span class="text-xl font-black text-blue-600">$${Number(zapato.precio).toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        ${stockReal > 0
                            ? `<button onclick="prepararAgregado(${zapato.id}, '${zapato.nombre}',${zapato.precio}, ${stockReal}, '${imagenZapato}')" 
                                       class="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-3.5 rounded-2xl transition-all uppercase text-xs tracking-widest shadow-lg shadow-slate-200 cursor-pointer">
                                    Agregar al Carrito
                               </button>`
                            : `<button disabled class="w-full bg-slate-100 text-slate-400 font-black py-3.5 rounded-2xl cursor-not-allowed uppercase text-xs tracking-widest">
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

function prepararAgregado(id, nombre, precio, stock, img) {
    const tallaElement = document.getElementById(`talla-${id}`);
    const talla = tallaElement ? tallaElement.value : 26;
    agregarAlCarrito(id, nombre, precio, talla, stock, img);
}

function agregarAlCarrito(id, nombre, precio, talla, stockDisponible, img) {
    const cantidadEnCarrito = carrito.filter(item => item.id === id).length;

    if (cantidadEnCarrito >= stockDisponible) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({ title: '¡Sin stock!', text: `Solo hay ${stockDisponible} unidades disponibles.`, icon: 'warning', confirmButtonColor: '#0f172a' });
        } else {
            alert(`Solo hay ${stockDisponible} unidades disponibles.`);
        }
        return;
    }

    carrito.push({ id, nombre, precio, talla, img, metodo: 'envio', tiendaId: null });
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();

    if (typeof Swal !== 'undefined') {
        Swal.fire({ title: '¡Añadido al carrito!', text: `${nombre} (Talla ${talla})`, icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
    }

    if (document.getElementById('listaCarrito')) actualizarVistaCarrito();
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('listaCarrito');
    const cantItemsElement = document.getElementById('cantItems'); 
    if (!lista) return;

    if (cantItemsElement) cantItemsElement.innerText = carrito.length;

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div class="w-20 h-20 bg-slate-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="shopping-bag" class="w-10 h-10"></i>
                </div>
                <h3 class="text-2xl font-black text-slate-900 mb-2">Tu carrito está vacío</h3>
                <p class="text-slate-500 font-medium mb-6 text-sm">Explora el catálogo y encuentra tus tenis ideales.</p>
                <a href="/catalogo" class="inline-flex items-center gap-2 bg-slate-900 text-white font-black px-6 py-3 rounded-xl uppercase text-xs tracking-widest hover:bg-blue-600 transition">
                    Ver Catálogo
                </a>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        calcularTotales();
        return;
    }

    let htmlProductos = carrito.map((item, index) => `
        <div class="bg-white rounded-[2rem] p-5 mb-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5 items-center">
            <img src="${item.img}" class="w-24 h-24 object-cover rounded-2xl bg-slate-50 flex-shrink-0">
            <div class="flex-grow w-full">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-black text-slate-800 text-base">${item.nombre}</h4>
                        <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md mt-1 inline-block">Talla: ${item.talla}</span>
                    </div>
                    <button onclick="eliminarDelCarrito(${index})" class="text-slate-300 hover:text-rose-500 p-1 cursor-pointer">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-50">
                    <select onchange="cambiarMetodoEntrega(${index}, this.value)" class="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none">
                        <option value="envio" ${item.metodo === 'envio' ? 'selected' : ''}>🚚 Envío a Domicilio</option>
                        <option value="fisica" ${item.metodo === 'fisica' ? 'selected' : ''}>🏢 Recoger en Tienda</option>
                    </select>
                    <div class="${item.metodo === 'fisica' ? 'block' : 'hidden'}">
                        <select onchange="cambiarTienda(${index}, this.value)" class="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs font-bold text-slate-700 outline-none w-full">
                            <option value="">Selecciona sucursal</option>
                            ${TIENDAS_FISICAS.map(t => `<option value="${t.id}" ${item.tiendaId == t.id ? 'selected' : ''}>${t.nombre}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="text-right flex-shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                <span class="text-xl font-black text-slate-900">$${Number(item.precio).toLocaleString()}</span>
            </div>
        </div>
    `).join('');

    const necesitaEnvio = carrito.some(item => item.metodo === 'envio');

    const htmlCheckoutForm = `
        <div id="contenedorFormularioEnvio" class="mt-6 p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl ${necesitaEnvio ? '' : 'hidden'} space-y-4">
            <h4 class="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <i data-lucide="truck" class="w-4 h-4 text-blue-400"></i> Datos de Envío y Pago
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Calle y Número</label>
                    <input type="text" id="envioCalle" placeholder="Ej. Av. Juárez #45" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-600">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Colonia / Municipio</label>
                    <input type="text" id="envioColonia" placeholder="Ej. Centro Histórico" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-600">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Código Postal</label>
                    <input type="text" id="envioCP" placeholder="Ej. 06000" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 font-medium text-white placeholder:text-slate-600">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase mb-1">Método de Pago</label>
                    <select id="metodoPagoSelect" class="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white outline-none cursor-pointer">
                        <option value="WhatsApp / Transferencia" class="bg-slate-900">💳 Transferencia o Depósito</option>
                        <option value="Efectivo en Sucursal" class="bg-slate-900">💵 Pago en Tienda Física</option>
                        <option value="Tarjeta de Crédito/Débito" class="bg-slate-900">🛍️ Tarjeta en Línea (Simulado)</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    lista.innerHTML = htmlProductos + htmlCheckoutForm;
    if (window.lucide) lucide.createIcons();
    calcularTotales();
}

function guardarPedidoEnHistorial(usuario, items, total, direccion, metodoPago) {
    let historial = JSON.parse(localStorage.getItem('zapa_historial')) || [];
    const estatusInicial = direccion.includes("tienda física") ? 'Listo en Sucursal' : 'En Preparación';

    const nuevoPedido = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        emailUsuario: usuario.email,
        nombreCliente: usuario.nombre,
        fecha: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: items,
        total: total,
        direccion: direccion,
        metodoPago: metodoPago,
        estado: estatusInicial
    };

    historial.unshift(nuevoPedido);
    localStorage.setItem('zapa_historial', JSON.stringify(historial));
}

function cargarHistorialPedidos() {
    const contenedor = document.getElementById('contenedorHistorialPedidos');
    if (!contenedor) return;

    const rawUser = localStorage.getItem('usuario_logueado');
    if (!rawUser) return;
    const user = JSON.parse(rawUser);

    let historial = JSON.parse(localStorage.getItem('zapa_historial')) || [];
    const misPedidos = historial.filter(p => p.emailUsuario === user.email);

    if (misPedidos.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <i data-lucide="shopping-bag" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
                <p class="text-slate-500 font-bold text-sm">Aún no has realizado ninguna compra.</p>
                <a href="/catalogo" class="text-blue-600 text-xs font-black hover:underline mt-2 inline-block">Explorar modelos en tienda &rarr;</a>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    contenedor.innerHTML = misPedidos.map(pedido => `
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all">
            <div class="flex flex-wrap justify-between items-center pb-3 mb-3 border-b border-slate-200 gap-2">
                <div>
                    <span class="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">${pedido.id}</span>
                    <span class="text-xs font-bold text-slate-400 ml-2">${pedido.fecha}</span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase">${pedido.estado}</span>
                    <span class="text-base font-black text-slate-900">${pedido.total}</span>
                </div>
            </div>

            <div class="space-y-2 mb-3">
                ${pedido.items.map(item => `
                    <div class="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span>👟 <b>${item.nombre}</b> (Talla: ${item.talla})</span> <span class="font-bold text-slate-900">$${Number(item.precio).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>

            <div class="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-500">
                <span><b>Entrega:</b> ${pedido.direccion}</span>
                <span><b>Pago:</b> ${pedido.metodoPago}</span>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

async function finalizarPedido() {
    if (carrito.length === 0) return;

    const usuarioLogueado = localStorage.getItem('usuario_logueado');
    if (!usuarioLogueado) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Inicio de sesión requerido',
                text: 'Debes iniciar sesión para procesar tu compra.',
                icon: 'info',
                confirmButtonColor: '#0f172a',
                confirmButtonText: 'Ir a Iniciar Sesión'
            }).then(res => { if (res.isConfirmed) window.location.href = '/perfil'; });
        } else {
            alert('Debes iniciar sesión para realizar tu compra.');
            window.location.href = '/perfil';
        }
        return;
    }

    const usuario = JSON.parse(usuarioLogueado);
    const necesitaEnvio = carrito.some(item => item.metodo === 'envio');
    
    let direccionCompleta = "Recoge en tienda física";
    let metodoPago = document.getElementById('metodoPagoSelect')?.value || "Transferencia";

    if (necesitaEnvio) {
        const calle = document.getElementById('envioCalle')?.value.trim() || '';
        const colonia = document.getElementById('envioColonia')?.value.trim() || '';
        const cp = document.getElementById('envioCP')?.value.trim() || '';

        if (!calle || !colonia || !cp) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Campos incompletos', text: 'Por favor llena todos los datos de dirección de envío.', icon: 'warning', confirmButtonColor: '#0f172a' });
            } else {
                alert('Por favor llena todos los datos de dirección de envío.');
            }
            return;
        }
        direccionCompleta = `${calle}, Col. ${colonia}, C.P. ${cp}`;
    }

    try {
        const respuesta = await fetch('/api/zapatos/vender', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: carrito })
        });

        if (!respuesta.ok) throw new Error('Error al actualizar stock');

        const total = document.getElementById('totalCarrito').innerText;
        guardarPedidoEnHistorial(usuario, [...carrito], total, direccionCompleta, metodoPago);

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: '¡Pedido Confirmado con Éxito!',
                html: `<p class="text-sm text-slate-600 mb-2">Gracias <b>${usuario.nombre}</b>. Tu pedido ha sido guardado en tu historial.</p>
                       <p class="text-xs font-bold text-slate-500">Total a pagar: <span class="text-blue-600">${total}</span></p>`,
                icon: 'success',
                confirmButtonColor: '#2563eb',
                confirmButtonText: '📲 Enviar Ticket a WhatsApp',
                showCancelButton: true,
                cancelButtonText: 'Ver mi Historial'
            }).then((result) => {
                if (result.isConfirmed) {
                    let mensaje = `¡Hola ZapaShop! 👋 Soy *${usuario.nombre}* y mi pago es por *${metodoPago}*:\n\n`;
                    carrito.forEach(item => {
                        mensaje += `👟 ${item.nombre} (Talla: ${item.talla}) - $${item.precio}\n`;
                    });
                    mensaje += `\n📍 *Dirección:* ${direccionCompleta}\n`;
                    mensaje += `💰 *TOTAL:* ${total}`;
                    window.open(`https://wa.me/525540304692?text=${encodeURIComponent(mensaje)}`, '_blank');
                }
                carrito = [];
                localStorage.removeItem('zapa_carrito');
                window.location.href = '/perfil';
            });
        } else {
            carrito = [];
            localStorage.removeItem('zapa_carrito');
            window.location.href = '/perfil';
        }

    } catch (error) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({ title: 'Error', text: 'No se pudo procesar la compra.', icon: 'error', confirmButtonColor: '#0f172a' });
        } else {
            alert('No se pudo procesar la compra.');
        }
    }
}

function calcularTotales() {
    let total = carrito.reduce((acc, item) => acc + Number(item.precio), 0);
    const subE = document.getElementById('subtotalCarrito');
    const totE = document.getElementById('totalCarrito');
    if (subE) subE.innerText = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    if (totE) totE.innerText = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarVistaCarrito();
    calcularTotales(); 
}

function cambiarMetodoEntrega(index, valor) {
    carrito[index].metodo = valor;
    if (valor === 'envio') carrito[index].tiendaId = null;
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    actualizarVistaCarrito();
}

function cambiarTienda(index, valor) {
    carrito[index].tiendaId = valor;
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
    const contadores = document.querySelectorAll('.cart-count, #cart-count');
    contadores.forEach(c => c.innerText = carrito.length);
}

// --- SECCIÓN: ADMIN Y AUTENTICACIÓN ---

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
                    <button onclick="cambiarEstado(${z.id}, ${z.activo})" class="p-2 hover:bg-slate-200 rounded-lg transition cursor-pointer"><i data-lucide="${z.activo ? 'eye-off' : 'eye'}" class="w-5 h-5 text-slate-500"></i></button>
                    <button onclick="eliminarPermanente(${z.id})" class="p-2 hover:bg-rose-100 rounded-lg transition cursor-pointer"><i data-lucide="trash-2" class="w-5 h-5 text-rose-500"></i></button>
                    <button onclick="prepararEdicion('${z.id}', '${z.nombre}', ${z.precio}, '${z.categoria}', '${z.img}', ${z.stock})" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"><i data-lucide="pencil" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `).join('');
        if (window.lucide) lucide.createIcons();
    } catch (e) { console.error(e); }
}

async function cambiarEstado(id, estadoActual) {
    try {
        const res = await fetch(`${API_URL}/update/${id}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: !estadoActual })
        });
        if (res.ok) cargarTablaAdmin();
    } catch (e) { console.error(e); }
}

function cargarPedidosAdmin() {
    const contenedorAdmin = document.getElementById('tablaPedidosAdmin');
    if (!contenedorAdmin) return;

    let historial = JSON.parse(localStorage.getItem('zapa_historial')) || [];

    if (historial.length === 0) {
        contenedorAdmin.innerHTML = `
            <div class="p-8 text-center text-slate-400 font-medium">
                No hay pedidos registrados en el sistema.
            </div>`;
        return;
    }

    contenedorAdmin.innerHTML = historial.map((pedido, index) => `
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
            <div class="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-slate-100 gap-2">
                <div>
                    <span class="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">${pedido.id}</span>
                    <span class="text-xs font-bold text-slate-800 ml-2">👤 ${pedido.nombreCliente || 'Cliente'} (${pedido.emailUsuario})</span>
                    <span class="text-xs text-slate-400 ml-2">🗓️ ${pedido.fecha}</span>
                </div>
                
                <div class="flex items-center gap-3">
                    <label class="text-xs font-black text-slate-400 uppercase">Estado:</label>
                    <select onchange="actualizarEstatusPedido('${pedido.id}', this.value)" 
                            class="bg-slate-100 border-none rounded-xl py-1.5 px-3 text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                        <option value="En Preparación" ${pedido.estado === 'En Preparación' ? 'selected' : ''}>🟡 En Preparación</option>
                        <option value="En Ruta" ${pedido.estado === 'En Ruta' ? 'selected' : ''}>🚚 En Ruta</option>
                        <option value="Listo en Sucursal" ${pedido.estado === 'Listo en Sucursal' ? 'selected' : ''}>🏢 Listo en Sucursal</option>
                        <option value="Completado" ${pedido.estado === 'Completado' ? 'selected' : ''}>🟢 Completado</option>
                        <option value="Cancelado" ${pedido.estado === 'Cancelado' ? 'selected' : ''}>🔴 Cancelado</option>
                    </select>
                    <span class="text-base font-black text-slate-900 ml-2">${pedido.total}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                    <p class="font-bold text-slate-800 mb-1">Artículos Comprados:</p>
                    <ul class="list-disc list-inside space-y-1">
                        ${pedido.items.map(i => `<li>👟 <b>${i.nombre}</b> (Talla: ${i.talla}) -$${i.precio}</li>`).join('')}
                    </ul>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p><b>📍 Entrega:</b> ${pedido.direccion}</p>
                    <p class="mt-1"><b>💳 Pago:</b> ${pedido.metodoPago}</p>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function actualizarEstatusPedido(idPedido, nuevoEstatus) {
    let historial = JSON.parse(localStorage.getItem('zapa_historial')) || [];
    const index = historial.findIndex(p => p.id === idPedido);

    if (index !== -1) {
        historial[index].estado = nuevoEstatus;
        localStorage.setItem('zapa_historial', JSON.stringify(historial));

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Estatus Actualizado',
                text: `El pedido ${idPedido} cambió a "${nuevoEstatus}".`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    }
}

async function eliminarPermanente(id) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¿Eliminar producto?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar'
        }).then(async (res) => {
            if (res.isConfirmed) {
                const r = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
                if (r.ok) cargarTablaAdmin();
            }
        });
    } else {
        if (confirm('¿Eliminar producto permanentemente?')) {
            const r = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (r.ok) cargarTablaAdmin();
        }
    }
}

let editandoID = null;

function prepararEdicion(id, nombre, precio, categoria, img, stock) {
    editandoID = id;
    document.getElementById('adminNombre').value = nombre;
    document.getElementById('adminPrecio').value = precio;
    document.getElementById('adminStock').value = stock || 0;
    document.getElementById('adminCategoria').value = categoria;
    document.getElementById('adminImg').value = img;
    const btnGuardar = document.querySelector('#adminForm button[type="submit"]');
    if (btnGuardar) {
        btnGuardar.innerHTML = '<i data-lucide="refresh-cw" class="w-5 h-5"></i> ACTUALIZAR PRODUCTO';
        btnGuardar.classList.replace('bg-slate-900', 'bg-emerald-600');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) lucide.createIcons();
}

// Registro y Login
const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
    formRegistro.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('regNombre').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const pass = document.getElementById('regPass').value;

        let usuarios = JSON.parse(localStorage.getItem('zapa_usuarios')) || [];
        if (usuarios.some(u => u.email === email)) {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Correo ya registrado', text: 'Inicia sesión con tus credenciales.', icon: 'info', confirmButtonColor: '#0f172a' });
            } else {
                alert('Este correo ya está registrado.');
            }
            return;
        }
        usuarios.push({ nombre, email, pass });
        localStorage.setItem('zapa_usuarios', JSON.stringify(usuarios));
        if (typeof Swal !== 'undefined') {
            Swal.fire({ title: '¡Cuenta creada!', text: 'Ya puedes iniciar sesión.', icon: 'success', confirmButtonColor: '#0f172a' }).then(() => window.location.reload());
        } else {
            alert('¡Cuenta creada! Ya puedes iniciar sesión.');
            window.location.reload();
        }
    });
}

const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const identificador = document.getElementById('loginUser').value.trim().toLowerCase();
        const pass = document.getElementById('loginPass').value;

        if (identificador.endsWith('@zapashop.com')) {
            localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: 'Administrador', email: identificador }));
            // Limpiar historial de chat al iniciar sesión de admin para asegurar privacidad
            localStorage.removeItem('zapa_chat_historial_mensajes');
            localStorage.removeItem('zapa_chat_estado');
            window.location.href = "/admin";
            return;
        }

        let usuarios = JSON.parse(localStorage.getItem('zapa_usuarios')) || [];
        const userFound = usuarios.find(u => (u.email === identificador || u.nombre.toLowerCase() === identificador) && u.pass === pass);

        if (userFound) {
            localStorage.setItem('usuario_logueado', JSON.stringify({ nombre: userFound.nombre, email: userFound.email }));
            // Limpiar historial de chat al cambiar de cuenta exitosamente
            localStorage.removeItem('zapa_chat_historial_mensajes');
            localStorage.removeItem('zapa_chat_estado');
            window.location.href = '/perfil';
        } else {
            if (typeof Swal !== 'undefined') {
                Swal.fire({ title: 'Datos incorrectos', text: 'Verifica tu usuario o contraseña.', icon: 'error', confirmButtonColor: '#0f172a' });
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        }
    });
}

const btnTabLogin = document.getElementById('btnTabLogin');
const btnTabRegistro = document.getElementById('btnTabRegistro');
if (btnTabLogin && btnTabRegistro) {
    btnTabLogin.addEventListener('click', () => {
        if (formLogin) formLogin.classList.remove('hidden');
        if (formRegistro) formRegistro.classList.add('hidden');
        btnTabLogin.classList.add('bg-white', 'shadow-sm', 'text-blue-600');
        btnTabRegistro.classList.remove('bg-white', 'shadow-sm', 'text-blue-600');
        btnTabRegistro.classList.add('text-gray-500');
    });
    btnTabRegistro.addEventListener('click', () => {
        if (formRegistro) formRegistro.classList.remove('hidden');
        if (formLogin) formLogin.classList.add('hidden');
        btnTabRegistro.classList.add('bg-white', 'shadow-sm', 'text-blue-600');
        btnTabLogin.classList.remove('bg-white', 'shadow-sm', 'text-blue-600');
        btnTabLogin.classList.add('text-gray-500');
    });
}

function verificarEstadoSesion() {
    const raw = localStorage.getItem('usuario_logueado');
    if (!raw) return;
    const user = JSON.parse(raw);
    const linkPerfil = document.querySelector('a[href="/perfil"]');
    if (linkPerfil) linkPerfil.innerHTML = `<i data-lucide="user" class="w-4 h-4"></i> ${user.nombre}`;
    
    document.querySelectorAll('a[href="/registro"], .btn-registro').forEach(b => b.style.display = 'none');
    
    const seccionLogueado = document.getElementById('seccionUsuarioLogueado');
    const seccionAuth = document.getElementById('seccionAuth');

    if (seccionLogueado) {
        seccionLogueado.classList.remove('hidden');
        if (seccionAuth) seccionAuth.classList.add('hidden');
        if (formLogin) formLogin.classList.add('hidden');
        if (formRegistro) formRegistro.classList.add('hidden');
        const spanNombre = document.getElementById('nombreUsuarioPerfil');
        if (spanNombre) spanNombre.innerText = user.nombre;
        cargarHistorialPedidos();
    }
}

function gestionarPermisosUI() {
    const user = JSON.parse(localStorage.getItem('usuario_logueado'));
    const btnAdmin = document.getElementById('btnIrAdmin');
    if (user && user.email.endsWith('@zapashop.com') && btnAdmin) btnAdmin.classList.remove('hidden');
}

function cerrarSesion() {
    localStorage.removeItem('usuario_logueado');
    localStorage.removeItem('zapa_chat_historial_mensajes');
    localStorage.removeItem('zapa_chat_estado');
    window.location.href = '/';
}

// =======================================================
// --- CHATBOT AVANZADO CON INACTIVIDAD Y AGENTE ALEATORIO ---
// =======================================================

let timerInactividad = null;
const LISTA_ASESORES = [
    { nombre: "Emanuel de la Cruz", rol: "Soporte Técnico y Calzado" },
    { nombre: "Carlos Vázquez", rol: "Especialista en Logística y Envíos" },
    { nombre: "Regina Díaz", rol: "Atención al Cliente y Garantías" },
    { nombre: "Jonathan Cruz", rol: "Gestión de Cambios y Devoluciones" },
    { nombre: "Enrique Juárez", rol: "Supervisor de Operaciones ZapaShop" }
];

let estadoChat = JSON.parse(localStorage.getItem('zapa_chat_estado')) || {
    flujoActual: null,
    ultimoPedidoConsultado: null,
    datosTemp: {}
};

function guardarEstadoChat() {
    localStorage.setItem('zapa_chat_estado', JSON.stringify(estadoChat));
}

function obtenerClaveHistorialChat() {
    const rawUser = localStorage.getItem('usuario_logueado');
    if (!rawUser) return 'zapa_chat_historial_invitado';
    const userObj = JSON.parse(rawUser);
    const identificador = (userObj.email || userObj.nombre || 'usuario').replace(/[^a-zA-Z0-9]/g, '_');
    return `zapa_chat_historial_${identificador}`;
}

// Reiniciar temporizador de inactividad (2 minutos = 120,000 ms)
function reiniciarTimerInactividad() {
    if (timerInactividad) clearTimeout(timerInactividad);

    timerInactividad = setTimeout(() => {
        const chatWindow = document.getElementById('chat-window');
        if (chatWindow && !chatWindow.classList.contains('hidden')) {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const div = document.createElement('div');
                div.className = 'p-3 max-w-[85%] text-xs bg-rose-950/80 text-rose-200 border border-rose-800/80 rounded-2xl self-start my-2';
                div.innerHTML = '<b>ZapaShop Bot:</b> ⏱️ <i>Sesión finalizada por inactividad. Limpiando conversación...</i>';
                chatMessages.appendChild(div);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }

            setTimeout(() => {
                limpiarConversacionChatSilencioso();
            }, 2500);
        }
    }, 120000); // 2 minutos
}

// REINICIO COMPLETO Y RECTIFICACIÓN DEL CHAT (EN TIEMPO REAL)
window.limpiarConversacionChat = function() {
    // 1. Borrar registros de almacenamiento local
    const claveStorage = obtenerClaveHistorialChat();
    localStorage.removeItem(claveStorage);
    localStorage.removeItem('zapa_chat_estado');
    estadoChat = { flujoActual: null, ultimoPedidoConsultado: null, datosTemp: {} };

    // 2. Limpiar el contenedor de mensajes del DOM
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';

        // 3. Volver a renderizar el mensaje de bienvenida unificado
        const rawUser = localStorage.getItem('usuario_logueado');
        const userObj = rawUser ? JSON.parse(rawUser) : null;

        const saludoInicial = userObj 
            ? `¡Hola <b>${userObj.nombre}</b>! 👟 Soy tu asistente virtual ZapaShop. ¿En qué puedo ayudarte hoy con tus pedidos o catálogo?`
            : `¡Hola! 👟 Bienvenido a <b>ZapaShop</b>. Soy tu asistente virtual. Puedes preguntarme sobre tus pedidos, tallas o hablar con un asesor.`;

        const div = document.createElement('div');
        div.className = 'p-3.5 max-w-[85%] text-xs bg-slate-800 text-slate-200 self-start border border-slate-700/60 rounded-2xl rounded-tl-none shadow-sm leading-relaxed';
        div.innerHTML = `<b>ZapaShop Bot:</b> ${saludoInicial}`;
        chatMessages.appendChild(div);

        // Guardar el saludo en el nuevo historial
        const nuevoHistorial = [{
            remitente: 'ZapaShop Bot',
            mensaje: saludoInicial,
            clasesCSS: 'bg-slate-800 text-slate-200 self-start border border-slate-700/60 rounded-2xl rounded-tl-none shadow-sm leading-relaxed'
        }];
        localStorage.setItem(claveStorage, JSON.stringify(nuevoHistorial));
    }

    // 4. Reiniciar el temporizador de inactividad
    reiniciarTimerInactividad();
};

function limpiarConversacionChatSilencioso() {
    window.limpiarConversacionChat();

    // Cerrar la ventana flotante suavemente
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
        chatWindow.classList.remove('scale-100', 'opacity-100');
        chatWindow.classList.add('scale-95', 'opacity-0');
        setTimeout(() => chatWindow.classList.add('hidden'), 200);
        localStorage.setItem('zapa_chat_abierto', 'false');
    }
}

// LÓGICA CONVERSACIONAL INTELIGENTE
function procesarFlujoConversacional(query, zapatos = []) {
    const rawInput = query.trim();
    const q = rawInput.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const rawUser = localStorage.getItem('usuario_logueado');
    const userObj = rawUser ? JSON.parse(rawUser) : null;
    let historialPedidos = JSON.parse(localStorage.getItem('zapa_historial')) || [];

    const esFormatoPedido = q.startsWith('ord-') || /^\d{5,8}$/.test(q);

    // 0. AGRADECIMIENTOS, DESPEDIDAS Y CIERRE DE SESIÓN
    if (q.includes('gracias') || q.includes('muchas gracias') || q.includes('de nada') || q.includes('ok') || q.includes('perfecto') || q.includes('adios') || q.includes('hasta luego')) {
        setTimeout(() => {
            limpiarConversacionChatSilencioso();
        }, 4000);

        return `🤖 <b>Asistente ZapaShop:</b><br><br>
        ¡A ti por escribirnos! Fue un placer ayudarte el día de hoy. 👟✨<br><br>
        🟢 <b>Conversación Finalizada.</b><br>
        <i>Limpiando la sesión y cerrando ventana... ¡Que tengas excelente día!</i>`;
    }

    // 1. SOLICITUD DE ATENCIÓN HUMANA / ASESOR ALEATORIO DE ADMIN
    if (
        q.includes('agente') || q.includes('persona') || q.includes('humano') || 
        q.includes('llamada') || q.includes('llamar') || q.includes('asesor') || 
        q.includes('soporte') || q.includes('telefono') || q.includes('contacto') || q.includes('admin')
    ) {
        // Seleccionar asesor de forma aleatoria de la lista de 5 empleados
        const asesorAleatorio = LISTA_ASESORES[Math.floor(Math.random() * LISTA_ASESORES.length)];

        return `🎧 <b>Transferencia a Atención Humana ZapaShop:</b><br><br>
        Te hemos conectado con nuestro ejecutivo de soporte:<br>
        👤 <b>${asesorAleatorio.nombre}</b><br>
        🏷️ <i>${asesorAleatorio.rol}</i><br><br>
        • 🟢 <b>Estatus:</b> Disponible en línea<br>
        • 💬 <b>WhatsApp Directo:</b> <a href="https://wa.me/525540304692?text=Hola%20${encodeURIComponent(asesorAleatorio.nombre)},%20necesito%20atencion%20personalizada" target="_blank" class="text-fuchsia-400 font-black underline">Contactar a ${asesorAleatorio.nombre.split(' ')[0]}</a><br>
        • 📞 <b>Teléfono:</b> <a href="tel:5540304692" class="text-blue-400 font-bold underline">55-4030-4692</a><br><br>
        <i>En un momento ${asesorAleatorio.nombre.split(' ')[0]} responderá a tu llamado.</i>`;
    }

    // 2. SOLICITUD DE VER PEDIDOS
    const solicitaPedido = q.includes('pedido') || q.includes('orden') || q.includes('mis compras') || q.includes('rastrear');

    if (solicitaPedido) {
        estadoChat.flujoActual = 'esperando_numero_pedido';
        guardarEstadoChat();

        if (userObj) {
            let misPedidos = historialPedidos.filter(p => p.nombreCliente === userObj.nombre || p.email === userObj.email || p.emailUsuario === userObj.email);
            if (misPedidos.length > 0) {
                let ultimo = misPedidos[misPedidos.length - 1];
                estadoChat.ultimoPedidoConsultado = ultimo;
                guardarEstadoChat();

                const badgeColor = ultimo.estado === 'Completado' ? 'text-emerald-400' : (ultimo.estado === 'Cancelado' ? 'text-rose-400' : 'text-blue-400');

                return `📦 <b>¡Hola ${userObj.nombre}! Tus compras:</b><br><br>
                Tu pedido más reciente es el <b>${ultimo.id}</b> con estatus: <b class="${badgeColor}">${ultimo.estado}</b>.<br><br>
                • Escribe <b>"${ultimo.id}"</b> para ver el detalle.<br>
                • O ingresa cualquier otro código de orden.`;
            }
        }

        return `📦 <b>Atención de Pedidos ZapaShop:</b><br><br>
        👉 <b>Ingresa tu ID de Pedido (Ej. <code>ORD-937673</code>)</b>:`;
    }

    // 3. CONSULTA POR ID ESPECÍFICO DE PEDIDO
    if (estadoChat.flujoActual === 'esperando_numero_pedido' || esFormatoPedido) {
        const pedidoEncontrado = historialPedidos.find(p => 
            p.id.toUpperCase() === rawInput.toUpperCase() || 
            p.id.replace('ORD-', '').toUpperCase() === rawInput.toUpperCase() ||
            (p.nombreCliente && p.nombreCliente.toLowerCase() === q) ||
            (p.email && p.email.toLowerCase() === q) ||
            (p.emailUsuario && p.emailUsuario.toLowerCase() === q)
        );

        estadoChat.flujoActual = null;

        if (pedidoEncontrado) {
            estadoChat.ultimoPedidoConsultado = pedidoEncontrado;
            guardarEstadoChat();

            const badgeColor = pedidoEncontrado.estado === 'Completado' ? 'text-emerald-400' : (pedidoEncontrado.estado === 'Cancelado' ? 'text-rose-400' : 'text-blue-400');
            return `🔎 <b>Pedido Encontrado (${pedidoEncontrado.id}):</b><br><br>
            • <b>Cliente:</b> ${pedidoEncontrado.nombreCliente || 'Cliente'}<br>
            • <b>Estatus Actual:</b> <span class="${badgeColor} font-black">${pedidoEncontrado.estado}</span><br>
            • <b>Dirección de Entrega:</b> ${pedidoEncontrado.direccion || 'Estándar'}<br>
            • <b>Monto Total:</b> $${pedidoEncontrado.total || '0.00'}<br><br>
            💡 <i>Pregúntame: "¿Por qué no llega?" o "Hablar con un asesor".</i>`;
        } else {
            guardarEstadoChat();
            return `❌ No encontré ningún pedido asociado a <b>"${rawInput}"</b>.<br><br>
            Verifica el código en tu perfil e inténtalo nuevamente.`;
        }
    }

    // 4. EXPLICACIÓN SEGÚN ESTATUS DEL PEDIDO
    if (q.includes('no llega') || q.includes('porque no llega') || q.includes('demora') || q.includes('retraso') || q.includes('estatus') || q.includes('donde esta')) {
        if (estadoChat.ultimoPedidoConsultado) {
            const p = estadoChat.ultimoPedidoConsultado;
            const estadoActual = p.estado || 'En Preparación';

            switch (estadoActual) {
                case 'En Preparación':
                    return `🟡 <b>Estatus: En Preparación</b><br><br>Tu orden está en empaquetado en almacén.<br>• <b>Siguiente paso:</b> En menos de 24h pasará a paquetería para envío a <b>${p.direccion}</b>.`;

                case 'En Ruta':
                    return `🚚 <b>Estatus: En Ruta de Entrega</b><br><br>Tu paquete ya viaja en el camión de reparto.<br>• <b>Destino:</b> ${p.direccion}<br>• <b>Tiempo estimado:</b> 24 a 48 horas hábiles.`;

                case 'Listo en Sucursal':
                    return `🏢 <b>Estatus: Listo en Sucursal</b><br><br>Tus tenis te esperan en mostrador.<br>• Acude con tu ID de pedido <b>${p.id}</b> e identificación oficial.`;

                case 'Completado':
                    return `🟢 <b>Estatus: Pedido Completado</b><br><br>Este pedido fue entregado con éxito. Cuentas con <b>30 días de garantía</b> para cualquier cambio o devolución.`;

                case 'Cancelado':
                    return `🔴 <b>Estatus: Pedido Cancelado</b><br><br>El pedido <b>${p.id}</b> fue cancelado por falta de stock o validación del pago.<br>• Si se realizó el cobro, tu reembolso se procesará de 24 a 72 horas automáticamente.`;

                default:
                    return `📦 Tu paquete <b>${p.id}</b> está en proceso.`;
            }
        } else {
            estadoChat.flujoActual = 'esperando_numero_pedido';
            guardarEstadoChat();
            return `🚚 Con gusto reviso la situación.<br><br>👉 <b>Escribe tu ID de Pedido (Ej. <code>ORD-937673</code>)</b>:`;
        }
    }

    // 5. ENVÍOS Y TALLAS (CON LINK A CATÁLOGO)
    if (q.includes('envio') || q.includes('costo') || q.includes('cuanto cuesta')) {
        return `🚚 <b>Información de Envíos:</b><br><br>• ¡Gratis en compras mayores a $999 MXN!<br>• Envío estándar: $99 MXN.<br>• Tiempo: 2 a 4 días hábiles a todo México.`;
    }

    if (q.includes('talla') || q.includes('tallas') || q.includes('medida')) {
        return `👟 <b>Tallas Disponibles:</b><br><br>Manejamos números del <b>25 al 29 MXN</b>.<br>👉 Revisa el stock por modelo en nuestro <a href="/catalogo" class="text-fuchsia-400 underline font-bold">Catálogo ZapaShop</a>.`;
    }

    // 6. CAMBIOS Y REEMBOLSOS
    if (q.includes('rembolso') || q.includes('reembolso') || q.includes('devolucion') || q.includes('cambio')) {
        estadoChat.flujoActual = 'esperando_sucursal';
        guardarEstadoChat();

        return `💳 <b>Cambios y Reembolsos:</b><br><br>Cuentas con <b>30 días naturales de garantía</b>.<br><br>👉 <b>Escribe tu alcaldía o zona</b> para sugerirte la sucursal más cercana:`;
    }

    if (estadoChat.flujoActual === 'esperando_sucursal') {
        estadoChat.flujoActual = null;
        guardarEstadoChat();

        return `📍 <b>Ubicación Sugerida para "${rawInput}":</b><br><br>
        🏢 <b>Sucursal Centro:</b> Av. Juárez #89 (Metro Hidalgo)<br>
        🕒 Horario: Lunes a Domingo 10:00 AM - 8:00 PM.<br>
        <i>Presenta tu ID de compra en caja para validar tu garantía en 5 minutos.</i>`;
    }

// -------------------------------------------------------------
    // CONSULTAS DE CATÁLOGO, MODELOS Y TIENDAS FÍSICAS
    // -------------------------------------------------------------

    // A) CATÁLOGO Y MODELOS DE ZAPATOS
    if (q.includes('catalogo') || q.includes('modelo') || q.includes('zapato') || q.includes('tenis') || q.includes('ver') || q.includes('comprar')) {
        return `🔥 <b>Catálogo ZapaShop:</b><br><br>
        Explora todos nuestros modelos disponibles y encuentra tus tenis ideales.<br><br>
        👉 <a href="/catalogo" class="text-fuchsia-400 underline font-bold">Ver Catálogo Completo</a>`;
    }

    // B) TIENDAS FÍSICAS Y SUCURSALES
    if (q.includes('sucursal') || q.includes('sucursales') || q.includes('tienda') || q.includes('tiendas') || q.includes('ubicacion') || q.includes('horario') || q.includes('direccion')) {
        return `📍 <b>Nuestras Sucursales Físicas:</b><br><br>
        • <b>Sucursal Centro:</b> Av. Juárez #89, Col. Centro (Metro Hidalgo)<br>
        • <b>Sucursal Iztapalapa:</b> Av. Ermita Iztapalapa #1234<br>
        • <b>Sucursal Coapa:</b> Calzada del Hueso #567<br><br>
        🕒 <b>Horario general:</b> Lunes a Domingo de 10:00 AM a 8:00 PM.<br>
        <i>💡 Presenta tu ticket o ID de compra en cualquier tienda para cambios y devoluciones.</i>`;
    }

    // FALLBACK
    return `🤖 <b>Asistente ZapaShop:</b><br><br>
    Puedo ayudarte con:<br>
    • 📦 <i>"Rastrear pedido"</i> o tu código <code>ORD-937673</code><br>
    • 🎧 <i>"Hablar con un agente"</i><br>
    • 🔄 <i>"Reembolso"</i> o <i>"Tallas"</i>`;
}

// INICIALIZADOR DE INTERFAZ DEL CHATBOT
function inicializarChatbot() {
    const rawUser = localStorage.getItem('usuario_logueado');
    const userObj = rawUser ? JSON.parse(rawUser) : null;

    const usuarioUltimoChat = localStorage.getItem('zapa_chat_usuario_activo');
    const usuarioActualId = userObj ? (userObj.email || userObj.nombre) : 'invitado';

    if (usuarioUltimoChat !== usuarioActualId) {
        localStorage.setItem('zapa_chat_usuario_activo', usuarioActualId);
        estadoChat = { flujoActual: null, ultimoPedidoConsultado: null, datosTemp: {} };
        guardarEstadoChat();
    }

    if (!document.getElementById('chat-widget-container')) {
        const chatHTML = `
        <div id="chat-widget-container" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: inherit;">
          <button id="chat-toggle-btn" class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-fuchsia-600 hover:to-pink-600 text-white p-4 rounded-full shadow-2xl shadow-blue-600/50 hover:shadow-fuchsia-600/50 transition-all duration-300 flex items-center justify-center group focus:outline-none cursor-pointer scale-105 hover:scale-110 animate-bounce">
            <i data-lucide="message-square-code" class="w-7 h-7"></i>
          </button>

          <div id="chat-window" class="hidden absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[520px] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden transition-all transform scale-95 opacity-0 duration-200">
            <div class="bg-slate-950 p-4 flex justify-between items-center border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div>
                  <h3 class="font-black text-sm tracking-wide text-white">Asistente ZapaShop</h3>
                  <p class="text-[10px] text-slate-400">Soporte Inteligente 24/7</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button onclick="limpiarConversacionChatSilencioso()" title="Reiniciar conversación" class="text-slate-400 hover:text-fuchsia-400 p-1.5 rounded-lg transition-colors cursor-pointer text-xs">
                    <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                </button>
                <button id="chat-close-btn" title="Cerrar chat" class="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
              </div>
            </div>

            <div id="chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 text-xs flex flex-col"></div>

            <!-- BOTONES CON HOVER DE CONTRASTE ROSA / FUCSIA -->
            <div class="px-3 py-2 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto text-[10px] font-bold text-slate-300">
                <button onclick="enviarOpcionChat('pedido')" class="bg-slate-800 border border-slate-700 hover:border-fuchsia-500 hover:text-fuchsia-300 hover:bg-slate-950 hover:shadow-lg hover:shadow-fuchsia-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer">📦 Mis Pedidos</button>
                <button onclick="enviarOpcionChat('hablar con un agente')" class="bg-slate-800 border border-slate-700 hover:border-fuchsia-500 hover:text-fuchsia-300 hover:bg-slate-950 hover:shadow-lg hover:shadow-fuchsia-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer">🎧 Hablar con Agente</button>
                <button onclick="enviarOpcionChat('quiero hacer un cambio')" class="bg-slate-800 border border-slate-700 hover:border-fuchsia-500 hover:text-fuchsia-300 hover:bg-slate-950 hover:shadow-lg hover:shadow-fuchsia-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 cursor-pointer">🔄 Cambios / Devolución</button>
            </div>

            <div class="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input type="text" id="chat-input" placeholder="Escribe tu mensaje..." class="flex-1 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs text-white outline-none focus:ring-2 focus:ring-fuchsia-500 font-medium placeholder:text-slate-500">
              <button id="chat-send-btn" class="bg-blue-600 hover:bg-fuchsia-600 text-white p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md hover:shadow-fuchsia-600/40">
                <i data-lucide="send" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', chatHTML);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('chat-close-btn');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (!toggleBtn || !chatWindow || !sendBtn || !chatInput) return;

    const claveStorage = obtenerClaveHistorialChat();
    let mensajesGuardados = JSON.parse(localStorage.getItem(claveStorage)) || [];

    if (mensajesGuardados.length === 0) {
        const saludoInicial = userObj 
            ? `¡Hola <b>${userObj.nombre}</b>! 👟 Soy tu asistente virtual ZapaShop. ¿En qué puedo ayudarte hoy?`
            : `¡Hola! 👟 Bienvenido a <b>ZapaShop</b>. Soy tu asistente virtual. Puedes preguntarme sobre tus pedidos, tallas o hablar con un asesor humano.`;

        mensajesGuardados.push({
            remitente: 'ZapaShop Bot',
            mensaje: saludoInicial,
            clasesCSS: 'bg-slate-800 text-slate-200 self-start border border-slate-700/60 rounded-2xl rounded-tl-none shadow-sm leading-relaxed'
        });
        localStorage.setItem(claveStorage, JSON.stringify(mensajesGuardados));
    }

    chatMessages.innerHTML = '';
    mensajesGuardados.forEach(m => {
        const div = document.createElement('div');
        div.className = `p-3.5 max-w-[85%] text-xs ${m.clasesCSS}`;
        div.innerHTML = `<b>${m.remitente}:</b> ${m.mensaje}`;
        chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const chatEstaAbierto = localStorage.getItem('zapa_chat_abierto') === 'true';
    if (chatEstaAbierto) {
        chatWindow.classList.remove('hidden');
        chatWindow.classList.remove('scale-95', 'opacity-0');
        chatWindow.classList.add('scale-100', 'opacity-100');
        reiniciarTimerInactividad();
    }

    function toggleChat() {
        const isHidden = chatWindow.classList.contains('hidden');
        if (isHidden) {
            chatWindow.classList.remove('hidden');
            setTimeout(() => {
                chatWindow.classList.remove('scale-95', 'opacity-0');
                chatWindow.classList.add('scale-100', 'opacity-100');
            }, 10);
            localStorage.setItem('zapa_chat_abierto', 'true');
            chatInput.focus();
            reiniciarTimerInactividad();
        } else {
            chatWindow.classList.remove('scale-100', 'opacity-100');
            chatWindow.classList.add('scale-95', 'opacity-0');
            setTimeout(() => chatWindow.classList.add('hidden'), 200);
            localStorage.setItem('zapa_chat_abierto', 'false');
            if (timerInactividad) clearTimeout(timerInactividad);
        }
    }

    toggleBtn.onclick = toggleChat;
    closeBtn.onclick = toggleChat;

    async function manejarInteraccion(texto) {
        if (!texto) return;

        reiniciarTimerInactividad();

        const inputElem = document.getElementById('chat-input');
        if (inputElem) inputElem.value = '';

        agregarMensajeUI('Tú', texto, 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white self-end rounded-2xl rounded-tr-none shadow-md');

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'p-3 max-w-[85%] text-xs bg-slate-800 text-slate-400 self-start border border-slate-700/50 rounded-2xl rounded-tl-none italic animate-pulse flex items-center gap-2';
        typingDiv.innerHTML = '<b>ZapaShop Bot:</b> Escribiendo... <span class="w-2 h-2 bg-fuchsia-500 rounded-full animate-ping"></span>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        let zapatosLista = [];
        try {
            const res = await fetch(API_URL);
            zapatosLista = await res.json();
        } catch (e) { 
            zapatosLista = []; 
        }

        setTimeout(() => {
            const elemTyping = document.getElementById(typingId);
            if (elemTyping) elemTyping.remove();

            const respuestaBot = procesarFlujoConversacional(texto, zapatosLista);
            agregarMensajeUI('ZapaShop Bot', respuestaBot, 'bg-slate-800 text-slate-200 self-start border border-slate-700/60 rounded-2xl rounded-tl-none shadow-sm leading-relaxed');
            guardarEstadoChat();
        }, 800);
    }

    sendBtn.onclick = () => {
        const inputElem = document.getElementById('chat-input');
        if (inputElem && inputElem.value.trim()) {
            manejarInteraccion(inputElem.value.trim());
        }
    };

    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputElem = document.getElementById('chat-input');
            if (inputElem && inputElem.value.trim()) {
                manejarInteraccion(inputElem.value.trim());
            }
        }
    };

    window.enviarOpcionChat = function(texto) {
        manejarInteraccion(texto);
    };

    function agregarMensajeUI(remitente, mensaje, clasesCSS) {
        const div = document.createElement('div');
        div.className = `p-3.5 max-w-[85%] text-xs ${clasesCSS}`;
        div.innerHTML = `<b>${remitente}:</b> ${mensaje}`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const claveStorage = obtenerClaveHistorialChat();
        let historial = JSON.parse(localStorage.getItem(claveStorage)) || [];
        historial.push({ remitente, mensaje, clasesCSS });
        localStorage.setItem(claveStorage, JSON.stringify(historial));
    }
}

// --- INICIALIZACIÓN GLOBAL DE LA APLICACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    verificarEstadoSesion();
    gestionarPermisosUI();
    
    if (typeof inicializarChatbot === 'function') {
        inicializarChatbot();
    }
    
    if (document.getElementById('productsGrid')) cargarZapatos();
    if (document.getElementById('tablaZapatos')) cargarTablaAdmin();
    if (document.getElementById('tablaPedidosAdmin')) cargarPedidosAdmin();
    
    actualizarContadorCarrito();

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#btnHamburguesa');
        if (btn) {
            const menuMovil = document.getElementById('menuMovilDesplegable');
            if (menuMovil) menuMovil.classList.toggle('hidden');
        }
    });

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

            const url = editandoID ? `${API_URL}/update/${editandoID}` : API_URL;
            try {
                const res = await fetch(url, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });
                if (res.ok) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({ title: '¡Éxito!', text: editandoID ? 'Producto actualizado' : 'Producto agregado', icon: 'success', confirmButtonColor: '#0f172a' });
                    }
                    adminForm.reset();
                    editandoID = null; 
                    cargarTablaAdmin();
                }
            } catch (error) { console.error(error); }
        });
    }

    if (window.lucide) lucide.createIcons();
});

// =======================================================
// --- CONTROL ADMINISTRABLE DE TEMÁTICA HALLOWEEN ---
// =======================================================
async function toggleHalloweenAdmin() {
    const btn = document.getElementById('btnSwitchHalloween');
    if (!btn) return;

    // Verificamos de forma segura si el botón actualmente contiene la palabra DESACTIVADO
    const estaDesactivado = btn.innerText.includes("DESACTIVADO");
    const nuevoEstado = estaDesactivado; // Si está desactivado, el nuevo estado será true (activar)
    
    try {
        await fetch('/api/config/halloween', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: nuevoEstado })
        });

        aplicarTemaHalloween(nuevoEstado);
        actualizarBotonAdminHalloween(nuevoEstado);

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: nuevoEstado ? '🎃 ¡Halloween Activado!' : '✨ Tema Clásico Restaurado',
                text: nuevoEstado ? 'La tienda ha cambiado para todos los dispositivos.' : 'Se ha restablecido la apariencia estándar.',
                icon: nuevoEstado ? 'warning' : 'info',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        }
    } catch (e) {
        console.error("Error al sincronizar con el servidor", e);
    }
}

function aplicarTemaHalloween(activo) {
    if (activo) {
        document.body.classList.add('halloween-mode');
    } else {
        document.body.classList.remove('halloween-mode');
    }
}

function actualizarBotonAdminHalloween(activo) {
    const btn = document.getElementById('btnSwitchHalloween');
    if (!btn) return;

    if (activo) {
        btn.className = "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer bg-orange-600 text-white shadow-lg shadow-orange-600/30";
        btn.innerHTML = "🎃 MODO HALLOWEEN: ACTIVADO";
    } else {
        btn.className = "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer bg-slate-100 text-slate-600 hover:bg-orange-500 hover:text-white shadow-sm";
        btn.innerHTML = "🎃 MODO HALLOWEEN: DESACTIVADO";
    }
}

// Verificar el estado de la temática al cargar cualquier página

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const respuesta = await fetch('/api/config/halloween');
        const datos = await respuesta.json();
        
        aplicarTemaHalloween(datos.halloween);
        actualizarBotonAdminHalloween(datos.halloween);
    } catch (e) {
        console.error("No se pudo obtener el estado de Halloween del servidor", e);
    }
});

// Opcional: Polling en tiempo real cada 4 segundos para que los celulares u otras pestañas cambien solos sin recargar
setInterval(async () => {
    try {
        const res = await fetch('/api/config/halloween');
        const data = await res.json();
        
        const estaActivoLocal = document.body.classList.contains('halloween-mode');
        if (data.halloween !== estaActivoLocal) {
            aplicarTemaHalloween(data.halloween);
            actualizarBotonAdminHalloween(data.halloween);
        }
    } catch (e) {}
}, 4000);
