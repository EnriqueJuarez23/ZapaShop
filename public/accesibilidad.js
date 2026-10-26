// =======================================================
// --- MÓDULO DE ACCESIBILIDAD WEB (ZAPASHOP) ---
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    inyectarWidgetAccesibilidad();
    inyectarEstilosAccesibilidad();
    inicializarTooltipsGlobales();
    cargarOpcionesGuardadas();
});

// 1. Inyección del menú flotante de Accesibilidad (Con el monito universal clásico)
function inyectarWidgetAccesibilidad() {
    if (document.getElementById('accesibilidad-widget-container')) return;

    // Símbolo de Accesibilidad Universal con la silueta humana (cabeza, cuerpo, brazos y piernas abiertos)
    const svgIconoAccesibilidad = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100" class="w-8 h-8">
            <!-- Círculo exterior -->
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="7"/>
            <!-- Círculo interior -->
            <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="3"/>
            <!-- Silueta humana central (cabeza, cuerpo, brazos y piernas abiertos) -->
            <circle cx="50" cy="30" r="9" fill="currentColor"/>
            <path d="M50 43 C38 43, 24 48, 22 53 L26 57 C28 54, 40 51, 50 51 C60 51, 72 54, 74 57 L78 53 C76 48, 62 43, 50 43 Z" fill="currentColor"/>
            <path d="M45 51 L38 78 L45 82 L50 62 L55 82 L62 78 L55 51 Z" fill="currentColor"/>
        </svg>
    `;

    const html = `
    <div id="accesibilidad-widget-container" class="fixed bottom-6 left-6 md:top-24 md:bottom-auto z-[9998] font-sans">
        <button id="acc-toggle-btn" title="Menú de Accesibilidad" class="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-2xl shadow-blue-600/50 transition-all duration-300 flex items-center justify-center cursor-pointer scale-110 hover:scale-125">
            ${svgIconoAccesibilidad}
        </button>

        <div id="acc-panel" class="hidden absolute bottom-20 left-0 md:bottom-auto md:top-16 w-72 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-4 space-y-3 text-xs">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 class="font-black text-sm text-white flex items-center gap-2">
                    <span class="w-6 h-6 flex items-center justify-center text-blue-400">${svgIconoAccesibilidad}</span> Menú Accesibilidad
                </h4>
                <button id="acc-close-btn" title="Cerrar panel" class="text-slate-400 hover:text-white p-1 cursor-pointer">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <div class="space-y-2">
                <button onclick="toggleModoNocturno()" title="Activar Modo Nocturno" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">⬛ Modo Nocturno (Puro)</span>
                    <span id="st-nocturno" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleTexto200()" title="Ampliar Texto al 200%" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🔍 Texto Grande (200%)</span>
                    <span id="st-texto" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleEscalaGrises()" title="Cambiar a Escala de Grises" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🎨 Escala de Grises</span>
                    <span id="st-grises" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleCursorGrande()" title="Aumentar tamaño del cursor" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🖱️ Cursor Grande</span>
                    <span id="st-cursor" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleAltoContraste()" title="Activar Alto Contraste" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">⚡ Alto Contraste</span>
                    <span id="st-contraste" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleGuiaLectura()" title="Mostrar Guía de Lectura" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">📏 Guía de Lectura</span>
                    <span id="st-guia" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleLecturaVoz()" title="Leer elementos en voz alta por cursor" class="w-full text-left bg-slate-800 hover:bg-blue-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🔊 Leer Página en Voz Alta</span>
                    <span id="st-voz" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>
            </div>

            <button onclick="resetAccesibilidad()" title="Restablecer valores predeterminados" class="w-full bg-rose-900/40 hover:bg-rose-600 text-rose-200 hover:text-white py-2 rounded-xl text-[11px] font-bold transition cursor-pointer mt-2 border border-rose-800/50">
                🔄 Restablecer Todo
            </button>
        </div>
    </div>

    <div id="acc-guia-bar" class="hidden fixed left-0 w-full h-10 bg-amber-400/30 border-y-2 border-amber-400 pointer-events-none z-[99999]"></div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
    if (window.lucide) lucide.createIcons();

    const toggleBtn = document.getElementById('acc-toggle-btn');
    const closeBtn = document.getElementById('acc-close-btn');
    const panel = document.getElementById('acc-panel');

    toggleBtn.onclick = () => panel.classList.toggle('hidden');
    closeBtn.onclick = () => panel.classList.add('hidden');
}

// 2. Estilos CSS dinámicos aplicados al documento
function inyectarEstilosAccesibilidad() {
    const style = document.createElement('style');
    style.id = 'acc-custom-styles';
    style.innerHTML = `
        body.acc-texto-200, body.acc-texto-200 p, body.acc-texto-200 span, body.acc-texto-200 a, body.acc-texto-200 button, body.acc-texto-200 input, body.acc-texto-200 h1, body.acc-texto-200 h2, body.acc-texto-200 h3, body.acc-texto-200 h4 {
            font-size: 130% !important;
            line-height: 1.6 !important;
        }

        body.acc-escala-grises {
            filter: grayscale(100%) !important;
        }

        body.acc-cursor-grande, body.acc-cursor-grande * {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='black' stroke='white' stroke-width='2'%3E%3Cpath d='M3 3l7 18 3-7 7-3L3 3z'/%3E%3C/svg%3E"), auto !important;
        }

        body.acc-alto-contraste, body.acc-alto-contraste div, body.acc-alto-contraste section, body.acc-alto-contraste nav {
            background-color: #ffffff !important;
            color: #000000 !important;
            border-color: #000000 !important;
        }
        body.acc-alto-contraste a, body.acc-alto-contraste button {
            background-color: #000000 !important;
            color: #ffff00 !important;
            font-weight: bold !important;
            border: 2px solid #000000 !important;
        }

        /* MODO NOCTURNO PURO (Negro absoluto unificado en index y catálogo) */
        body.acc-modo-nocturno, 
        body.acc-modo-nocturno div, 
        body.acc-modo-nocturno section, 
        body.acc-modo-nocturno nav,
        body.acc-modo-nocturno header,
        body.acc-modo-nocturno .bg-slate-900,
        body.acc-modo-nocturno .bg-slate-800,
        body.acc-modo-nocturno [class*="bg-"] {
            background-color: #000000 !important;
            border-color: #1e3a8a !important;
            color: #ffffff !important;
        }
        body.acc-modo-nocturno h1, body.acc-modo-nocturno h2, body.acc-modo-nocturno h3, body.acc-modo-nocturno h4 {
            color: #ffffff !important;
        }
        body.acc-modo-nocturno p, body.acc-modo-nocturno span {
            color: #e2e8f0 !important;
        }
        body.acc-modo-nocturno a {
            color: #60a5fa !important;
        }
    `;
    document.head.appendChild(style);

    document.addEventListener('mousemove', (e) => {
        const guiaBar = document.getElementById('acc-guia-bar');
        if (guiaBar && !guiaBar.classList.contains('hidden')) {
            guiaBar.style.top = (e.clientY - 20) + 'px';
        }
    });
}

// 3. Tooltips flotantes por Hover (Muestra el nombre de cualquier icono o botón al pasar el cursor)
function inicializarTooltipsGlobales() {
    if (document.getElementById('acc-tooltip-flotante')) return;

    const tooltip = document.createElement('div');
    tooltip.id = 'acc-tooltip-flotante';
    tooltip.className = 'fixed hidden z-[99999] bg-slate-900 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-2xl border border-blue-500/50 pointer-events-none transition-all duration-150 whitespace-nowrap';
    document.body.appendChild(tooltip);

    document.addEventListener('mouseover', (e) => {
        // Verificar si la Guía de Lectura está activa (la barra no debe tener la clase 'hidden')
        const guiaBar = document.getElementById('acc-guia-bar');
        const guiaActiva = guiaBar && !guiaBar.classList.contains('hidden');

        if (!guiaActiva) {
            tooltip.classList.add('hidden');
            return;
        }

        const target = e.target.closest('button, a, [title], [aria-label], img, input, select, #chat-toggle-btn');
        if (!target) {
            tooltip.classList.add('hidden');
            return;
        }

        let textoTooltip = target.getAttribute('title') || target.getAttribute('aria-label') || target.innerText?.trim();
        
        if (target.id === 'acc-toggle-btn' || target.closest('#accesibilidad-widget-container')) {
            textoTooltip = "Menú de Accesibilidad";
        } else if (target.id === 'chat-toggle-btn' || target.closest('#chat-widget-container')) {
            textoTooltip = "Asistente Virtual ZapaShop (Chat)";
        } else if (target.tagName === 'IMG') {
            textoTooltip = "Imagen de producto o sección";
        }

        if (textoTooltip && textoTooltip.length < 40) {
            tooltip.innerText = textoTooltip;
            tooltip.classList.remove('hidden');
        }
    });

    document.addEventListener('mousemove', (e) => {
        const guiaBar = document.getElementById('acc-guia-bar');
        const guiaActiva = guiaBar && !guiaBar.classList.contains('hidden');

        if (!guiaActiva || tooltip.classList.contains('hidden')) return;
        
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY - 35) + 'px';
    });

    document.addEventListener('mouseout', () => {
        tooltip.classList.add('hidden');
    });
}

// 4. LECTURA EN VOZ ALTA INTELIGENTE POR HOVER
let synth = window.speechSynthesis;
let lecturaVozActiva = false;
let ultimoTextoLeido = '';

function toggleLecturaVoz() {
    lecturaVozActiva = !lecturaVozActiva;
    actualizarEstadoUI('st-voz', lecturaVozActiva);

    if (lecturaVozActiva) {
        if (!synth) {
            alert('Tu navegador no soporta lectura en voz alta.');
            lecturaVozActiva = false;
            actualizarEstadoUI('st-voz', false);
            return;
        }
        hablarTexto("Lectura por cursor activada. Pasa el cursor sobre cualquier elemento para escuchar su descripción.");
    } else {
        if (synth) synth.cancel();
    }
    guardarOpciones();
}

function hablarTexto(texto) {
    if (!lecturaVozActiva || !synth) return;
    if (texto === ultimoTextoLeido) return;

    synth.cancel();
    ultimoTextoLeido = texto;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;
    
    utterance.onend = () => {
        if (ultimoTextoLeido === texto) ultimoTextoLeido = '';
    };

    synth.speak(utterance);
}

document.addEventListener('mouseover', (e) => {
    if (!lecturaVozActiva) return;

    const target = e.target.closest('button, a, img, h1, h2, h3, h4, span, label, input, select');
    if (!target) return;

    let textoALeer = '';

    if (target.tagName === 'IMG') {
        textoALeer = target.alt || target.title || 'Imagen de producto o sección';
    } else if (target.tagName === 'INPUT') {
        textoALeer = target.placeholder ? `Campo de texto: ${target.placeholder}` : 'Campo de entrada';
    } else if (target.tagName === 'SELECT') {
        textoALeer = 'Menú desplegable';
    } else {
        textoALeer = target.innerText || target.textContent || '';
    }

    textoALeer = textoALeer.trim();
    if (textoALeer && textoALeer.length < 100) {
        hablarTexto(textoALeer);
    }
});

// 5. Funciones de Activación y Guardado
function toggleModoNocturno() {
    document.body.classList.toggle('acc-modo-nocturno');
    actualizarEstadoUI('st-nocturno', document.body.classList.contains('acc-modo-nocturno'));
    guardarOpciones();
}

function toggleTexto200() {
    document.body.classList.toggle('acc-texto-200');
    actualizarEstadoUI('st-texto', document.body.classList.contains('acc-texto-200'));
    guardarOpciones();
}

function toggleEscalaGrises() {
    document.body.classList.toggle('acc-escala-grises');
    actualizarEstadoUI('st-grises', document.body.classList.contains('acc-escala-grises'));
    guardarOpciones();
}

function toggleCursorGrande() {
    document.body.classList.toggle('acc-cursor-grande');
    actualizarEstadoUI('st-cursor', document.body.classList.contains('acc-cursor-grande'));
    guardarOpciones();
}

function toggleAltoContraste() {
    document.body.classList.toggle('acc-alto-contraste');
    actualizarEstadoUI('st-contraste', document.body.classList.contains('acc-alto-contraste'));
    guardarOpciones();
}

function toggleGuiaLectura() {
    const guiaBar = document.getElementById('acc-guia-bar');
    if (guiaBar) {
        guiaBar.classList.toggle('hidden');
        actualizarEstadoUI('st-guia', !guiaBar.classList.contains('hidden'));
        guardarOpciones();
    }
}

function actualizarEstadoUI(id, activo) {
    const el = document.getElementById(id);
    if (!el) return;
    if (activo) {
        el.innerText = 'ON';
        el.className = 'text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full';
    } else {
        el.innerText = 'OFF';
        el.className = 'text-[10px] bg-slate-700 px-2 py-0.5 rounded-full';
    }
}

function guardarOpciones() {
    const estado = {
        nocturno: document.body.classList.contains('acc-modo-nocturno'),
        texto: document.body.classList.contains('acc-texto-200'),
        grises: document.body.classList.contains('acc-escala-grises'),
        cursor: document.body.classList.contains('acc-cursor-grande'),
        contraste: document.body.classList.contains('acc-alto-contraste'),
        guia: !document.getElementById('acc-guia-bar')?.classList.contains('hidden')
    };
    localStorage.setItem('zapa_accesibilidad', JSON.stringify(estado));
}

function cargarOpcionesGuardadas() {
    const estado = JSON.parse(localStorage.getItem('zapa_accesibilidad'));
    if (!estado) return;

    if (estado.nocturno) toggleModoNocturno();
    if (estado.texto) toggleTexto200();
    if (estado.grises) toggleEscalaGrises();
    if (estado.cursor) toggleCursorGrande();
    if (estado.contraste) toggleAltoContraste();
    if (estado.guia) toggleGuiaLectura();
}

function resetAccesibilidad() {
    if (synth) synth.cancel();
    localStorage.removeItem('zapa_accesibilidad');
    document.body.classList.remove('acc-modo-nocturno', 'acc-texto-200', 'acc-escala-grises', 'acc-cursor-grande', 'acc-alto-contraste');
    const guiaBar = document.getElementById('acc-guia-bar');
    if (guiaBar) guiaBar.classList.add('hidden');

    ['st-nocturno', 'st-texto', 'st-grises', 'st-cursor', 'st-contraste', 'st-guia', 'st-voz'].forEach(id => actualizarEstadoUI(id, false));
}
