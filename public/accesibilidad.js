// =======================================================
// --- MÓDULO DE ACCESIBILIDAD WEB (ZAPASHOP) ---
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    inyectarWidgetAccesibilidad();
    inyectarEstilosAccesibilidad();
    cargarOpcionesGuardadas();
});

// 1. Inyección del menú flotante de Accesibilidad
function inyectarWidgetAccesibilidad() {
    if (document.getElementById('accesibilidad-widget-container')) return;

    const html = `
    <div id="accesibilidad-widget-container" style="position: fixed; top: 100px; left: 20px; z-index: 9998; font-family: sans-serif;">
        <!-- Botón Flotante -->
        <button id="acc-toggle-btn" title="Menú de Accesibilidad" class="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer scale-105 hover:scale-110">
            <i data-lucide="accessibility" class="w-6 h-6"></i>
        </button>

        <!-- Panel de Opciones -->
        <div id="acc-panel" class="hidden absolute top-14 left-0 w-72 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-4 space-y-3 text-xs">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 class="font-black text-sm text-white flex items-center gap-2">
                    <i data-lucide="accessibility" class="w-4 h-4 text-indigo-400"></i> Accesibilidad
                </h4>
                <button id="acc-close-btn" class="text-slate-400 hover:text-white p-1 cursor-pointer">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>

            <!-- Opciones -->
            <div class="space-y-2">
                <button onclick="toggleModoNocturno()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🌙 Modo Nocturno</span>
                    <span id="st-nocturno" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleTexto200()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🔍 Texto Grande (200%)</span>
                    <span id="st-texto" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleEscalaGrises()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🎨 Escala de Grises</span>
                    <span id="st-grises" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleCursorGrande()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🖱️ Cursor Grande</span>
                    <span id="st-cursor" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleAltoContraste()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">⚡ Alto Contraste</span>
                    <span id="st-contraste" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleGuiaLectura()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">📏 Guía de Lectura</span>
                    <span id="st-guia" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>

                <button onclick="toggleLecturaVoz()" class="w-full text-left bg-slate-800 hover:bg-indigo-600/30 p-2.5 rounded-xl flex items-center justify-between transition cursor-pointer border border-slate-700/50">
                    <span class="flex items-center gap-2">🔊 Leer Página en Voz Alta</span>
                    <span id="st-voz" class="text-[10px] bg-slate-700 px-2 py-0.5 rounded-full">OFF</span>
                </button>
            </div>

            <button onclick="resetAccesibilidad()" class="w-full bg-rose-900/40 hover:bg-rose-600 text-rose-200 hover:text-white py-2 rounded-xl text-[11px] font-bold transition cursor-pointer mt-2 border border-rose-800/50">
                🔄 Restablecer Todo
            </button>
        </div>
    </div>

    <!-- Barra para la Guía de Lectura -->
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
        /* Texto al 200% */
        body.acc-texto-200, body.acc-texto-200 p, body.acc-texto-200 span, body.acc-texto-200 a, body.acc-texto-200 button, body.acc-texto-200 input, body.acc-texto-200 h1, body.acc-texto-200 h2, body.acc-texto-200 h3, body.acc-texto-200 h4 {
            font-size: 130% !important;
            line-height: 1.6 !important;
        }

        /* Escala de Grises */
        body.acc-escala-grises {
            filter: grayscale(100%) !important;
        }

        /* Cursor Grande */
        body.acc-cursor-grande, body.acc-cursor-grande * {
            cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='black' stroke='white' stroke-width='2'%3E%3Cpath d='M3 3l7 18 3-7 7-3L3 3z'/%3E%3C/svg%3E"), auto !important;
        }

        /* ALTO CONTRASTE REAL (Fondo blanco puro y texto negro profundo) */
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
        body.acc-alto-contraste img {
            filter: contrast(150%) !important;
        }

        /* MODO NOCTURNO REAL (Fondo negro OLED absoluto #000000 con texto blanco brillante) */
        body.acc-modo-nocturno, body.acc-modo-nocturno div, body.acc-modo-nocturno section, body.acc-modo-nocturno nav {
            background-color: #000000 !important;
            color: #f1f5f9 !important;
            border-color: #333333 !important;
        }
        body.acc-modo-nocturno p, body.acc-modo-nocturno span, body.acc-modo-nocturno h1, body.acc-modo-nocturno h2, body.acc-modo-nocturno h3 {
            color: #ffffff !important;
        }
        body.acc-modo-nocturno a {
            color: #38bdf8 !important;
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

// 3. Funciones de Activación / Desactivación
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

// 4. LECTURA EN VOZ ALTA (TEXT-TO-SPEECH)
let synth = window.speechSynthesis;
let utterance = null;

function toggleLecturaVoz() {
    const stVoz = document.getElementById('st-voz');
    const estaLeyendo = stVoz.innerText === 'ON';

    if (estaLeyendo) {
        if (synth) synth.cancel();
        actualizarEstadoUI('st-voz', false);
    } else {
        if (!synth) {
            alert('Tu navegador no soporta lectura en voz alta.');
            return;
        }

        // Recopilar el texto principal de la página actual
        const textoPrincipal = document.querySelector('main') ? document.querySelector('main').innerText : document.body.innerText;
        
        utterance = new SpeechSynthesisUtterance(textoPrincipal);
        utterance.lang = 'es-MX'; // Español latino
        utterance.rate = 1.0; // Velocidad normal

        utterance.onend = () => {
            actualizarEstadoUI('st-voz', false);
        };

        synth.speak(utterance);
        actualizarEstadoUI('st-voz', true);
    }
}

function actualizarEstadoUI(id, activo) {
    const el = document.getElementById(id);
    if (!el) return;
    if (activo) {
        el.innerText = 'ON';
        el.className = 'text-[10px] bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full';
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
