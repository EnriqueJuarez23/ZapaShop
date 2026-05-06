// 1. ESTADO GLOBAL: Cargar carrito desde localStorage al iniciar
let carrito = JSON.parse(localStorage.getItem('zapa_carrito')) || [];

// --- SECCIÓN: CARGA DE PRODUCTOS ---

async function cargarZapatos() {
    try {
        const respuesta = await fetch('/api/zapatos');
        const zapatos = await respuesta.json();

        const grid = document.getElementById('productsGrid');
        if (!grid) return; // Solo actúa si existe el grid (Inicio o Catálogo)
        
        grid.innerHTML = ''; 

        zapatos.forEach(zapato => {
            grid.innerHTML += `
                <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all p-4 border border-gray-100 group">
                    <div class="relative overflow-hidden rounded-xl mb-4">
                        <img src="${zapato.img || 'https://via.placeholder.com/400'}" 
                             alt="${zapato.nombre}" 
                             class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div>
                        <span class="text-blue-600 text-xs font-bold uppercase tracking-wider">${zapato.categoria}</span>
                        <h3 class="text-lg font-bold text-gray-900 mt-1">${zapato.nombre}</h3>
                    </div>
                    <div class="flex justify-between items-center mt-4">
                        <span class="text-2xl font-black text-gray-900">$${zapato.precio}</span>
                        <button onclick="agregarAlCarrito(${zapato.id}, '${zapato.nombre}', ${zapato.precio})" 
                                class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors flex items-center gap-2">
                            <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                            Agregar
                        </button>
                    </div>
                </div>
            `;
        });

        lucide.createIcons();
    } catch (error) {
        console.error("Error cargando los zapatos:", error);
    }
}

// --- SECCIÓN: FILTROS ---

function filtrarCatalogo() {
    const texto = document.getElementById('searchInput')?.value.toLowerCase() || "";
    const categoria = document.getElementById('categoryFilter')?.value || "Todos";
    const tarjetas = document.querySelectorAll('#productsGrid > div');

    tarjetas.forEach(tarjeta => {
        const nombre = tarjeta.querySelector('h3').innerText.toLowerCase();
        const catTarjeta = tarjeta.querySelector('span').innerText;

        const coincideTexto = nombre.includes(texto);
        const coincideCat = categoria === 'Todos' || catTarjeta.toLowerCase() === categoria.toLowerCase();

        tarjeta.style.display = (coincideTexto && coincideCat) ? 'block' : 'none';
    });
}

// --- SECCIÓN: LÓGICA DEL CARRITO ---

function agregarAlCarrito(id, nombre, precio) {
    carrito.push({ id, nombre, precio });
    
    // Guardar en localStorage para que persista entre páginas
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    
    actualizarContadorCarrito();
    alert(`¡${nombre} agregado al carrito!`);
    
    if (document.getElementById('listaCarrito')) {
        actualizarVistaCarrito();
    }
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    if (contador) {
        contador.innerText = carrito.length;
    }
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('listaCarrito');
    const totalElemento = document.getElementById('totalCarrito');
    const subtotalElemento = document.getElementById('subtotalCarrito');
    
    if (!lista) return;

    if (carrito.length === 0) {
        lista.innerHTML = `<p class="text-center py-10 text-gray-400">Tu carrito está vacío actualmente.</p>`;
        if (totalElemento) totalElemento.innerText = '$0.00';
        if (subtotalElemento) subtotalElemento.innerText = '$0.00';
        return;
    }

    let total = 0;
    lista.innerHTML = carrito.map((item, index) => {
        total += item.precio;
        return `
            <div class="flex justify-between items-center border-b py-4">
                <div>
                    <h4 class="font-bold text-gray-900">${item.nombre}</h4>
                    <p class="text-sm text-blue-600 font-medium">$${item.precio}</p>
                </div>
                <button onclick="eliminarDelCarrito(${index})" class="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <i data-lucide="trash-2" class="w-5 h-5"></i>
                </button>
            </div>
        `;
    }).join('');
    
    if (totalElemento) totalElemento.innerText = `$${total.toFixed(2)}`;
    if (subtotalElemento) subtotalElemento.innerText = `$${total.toFixed(2)}`;
    lucide.createIcons();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('zapa_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarVistaCarrito();
}

// --- SECCIÓN: ADMINISTRACIÓN ---

async function configurarFormularioAdmin() {
    const form = document.getElementById('adminForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nuevoZapato = {
            nombre: document.getElementById('adminNombre').value,
            precio: Number(document.getElementById('adminPrecio').value),
            categoria: document.getElementById('adminCategoria').value,
            img: document.getElementById('adminImg').value
        };

        try {
            const respuesta = await fetch('/api/zapatos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoZapato)
            });

            if (respuesta.ok) {
                alert('¡Zapato agregado al catálogo!');
                form.reset();
            }
        } catch (error) {
            alert('Error al conectar con el servidor');
        }
    });
}

// Función para cambiar entre Iniciar Sesión y Registro
function cambiarModo(modo) {
    const fLogin = document.getElementById('formLogin');
    const fRegistro = document.getElementById('formRegistro');
    const bLogin = document.getElementById('btnTabLogin');
    const bRegistro = document.getElementById('btnTabRegistro');

    if (modo === 'registro') {
        fLogin.classList.add('hidden');
        fRegistro.classList.remove('hidden');
        bRegistro.classList.add('bg-white', 'shadow-sm', 'text-blue-600');
        bLogin.classList.remove('bg-white', 'shadow-sm', 'text-blue-600');
        bLogin.classList.add('text-gray-500');
    } else {
        fRegistro.classList.add('hidden');
        fLogin.classList.remove('hidden');
        bLogin.classList.add('bg-white', 'shadow-sm', 'text-blue-600');
        bRegistro.classList.remove('bg-white', 'shadow-sm', 'text-blue-600');
        bRegistro.classList.add('text-gray-500');
    }
}

// Lógica para el envío del registro
document.getElementById('formRegistro')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Capturamos los datos que pediste
    const datosUsuario = {
        nombre: document.getElementById('regNombre').value,
        apellidos: document.getElementById('regApellidos').value,
        usuario: document.getElementById('regUser').value,
        correo: document.getElementById('regEmail').value,
        pass: document.getElementById('regPass').value
    };

    console.log("Usuario registrado:", datosUsuario);
    alert(`¡Bienvenido ${datosUsuario.nombre}! Tu cuenta ha sido creada con éxito.`);
    
    // Aquí podrías redirigirlo al catálogo después de registrarse
    window.location.href = '/';
});

// --- SECCIÓN: INICIO DE SESIÓN ---

document.getElementById('formLogin')?.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtenemos los campos del formulario de login
    // Nota: Asegúrate de que en tu HTML el primer input tenga id="loginUser" 
    // y el de password tenga id="loginPass"
    const usuarioInput = e.target.querySelector('input[type="text"]').value;
    const passwordInput = e.target.querySelector('input[type="password"]').value;

    // SIMULACIÓN DE VALIDACIÓN:
    // Aquí podrías validar contra una base de datos real en el futuro.
    // Por ahora, si el usuario escribe algo, lo dejamos pasar.
    if (usuarioInput && passwordInput) {
        
        // Guardamos el nombre del usuario en localStorage para que la página lo "recuerde"
        localStorage.setItem('usuario_logueado', usuarioInput);
        
        alert(`¡Bienvenido de nuevo, ${usuarioInput}!`);
        
        // Redirigimos al inicio para que vea el catálogo
        window.location.href = '/';
    } else {
        alert("Por favor, completa todos los campos.");
    }
});

// --- SECCIÓN: GESTIÓN DE SESIÓN ---

function verificarEstadoSesion() {
    const usuario = localStorage.getItem('usuario_logueado');
    const fLogin = document.getElementById('formLogin');
    const fRegistro = document.getElementById('formRegistro');
    const tabSelector = document.querySelector('.flex.bg-gray-100'); // El selector de pestañas
    const seccionLogueado = document.getElementById('seccionUsuarioLogueado');
    const nombreSpan = document.getElementById('nombreUsuarioPerfil');

    if (usuario && seccionLogueado) {
        // Si hay usuario, escondemos formularios y mostramos bienvenida
        if (fLogin) fLogin.classList.add('hidden');
        if (fRegistro) fRegistro.classList.add('hidden');
        if (tabSelector) tabSelector.classList.add('hidden');
        
        seccionLogueado.classList.remove('hidden');
        if (nombreSpan) nombreSpan.innerText = usuario;
    }
}

function cerrarSesion() {
    // Borramos solo el usuario, pero dejamos el carrito (si quieres que se quede)
    localStorage.removeItem('usuario_logueado');
    alert("Has cerrado sesión correctamente.");
    window.location.href = '/perfil'; // Recargamos para mostrar el login de nuevo
}

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
const usuarioNombre = localStorage.getItem('usuario_logueado');
const linkPerfil = document.querySelector('a[href="/perfil"]');

if (usuarioNombre && linkPerfil) {
    // Cambiamos el texto de "Iniciar Sesión" por el nombre del usuario
    linkPerfil.innerHTML = `<i data-lucide="user" class="w-5 h-5"></i> Hola, ${usuarioNombre}`;
    lucide.createIcons();
}


    cargarZapatos();
    actualizarContadorCarrito();
    configurarFormularioAdmin();
    actualizarVistaCarrito();
    verificarEstadoSesion(); 

    // Listeners para filtros
    document.getElementById('searchInput')?.addEventListener('input', filtrarCatalogo);
    document.getElementById('categoryFilter')?.addEventListener('change', filtrarCatalogo);



});
