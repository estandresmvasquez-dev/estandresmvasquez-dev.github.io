// ===== UTILIDADES BÁSICAS =====
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const topInput = $('#topSearchInput');
const bottomInput = $('#bottomSearchInput');
const micTop = $('#micTop');
const micBottom = $('#micBottom');
const iconItems = $$('.icon-menu .icon-item');
const goTop = $('#goTop');
const topSearchBar = $('.search-bar.top-search');
const bottomSearchBar = $('.search-bar.bottom-search');
// Añadir el listener de clic a las barras de búsqueda
if (topSearchBar) topSearchBar.addEventListener('click', createRipple);
if (bottomSearchBar) bottomSearchBar.addEventListener('click', createRipple);

// Añadir el listener al botón "Volver Arriba" (goTop ya está definido)
if (goTop) goTop.addEventListener('click', createRipple);
// ===== 1️⃣  BUSCADOR Y LÓGICA DE BÚSQUEDA =====
function handleEnterSearch(input) {
    if (!input) return;
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const q = input.value.trim();
            if (!q) return clearHighlights();
            runClientSearch(q);
        }
    });
}
handleEnterSearch(topInput);
handleEnterSearch(bottomInput);

function runClientSearch(query) {
    const q = query.toLowerCase();
    let hits = 0;
    iconItems.forEach(card => {
        const text = (card.innerText || '').toLowerCase();
        const kw = (card.dataset.keywords || '').toLowerCase();
        const match = text.includes(q) || kw.includes(q);
        card.classList.toggle('highlight', match);
        card.style.opacity = match ? '1' : '0.35';
        hits += match ? 1 : 0;
    });
    if (hits === 0) clearHighlights();
}
function clearHighlights() {
    iconItems.forEach(card => {
        card.classList.remove('highlight');
        card.style.opacity = '';
    });
}

// ===== 2️⃣  MICRÓFONO (Web Speech API) =====
function setupMic(imgEl, targetInput) {
    if (!imgEl || !targetInput) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        imgEl.addEventListener('click', () => {
            alert('El dictado por voz no es compatible con este navegador.');
        });
        return;
    }
    const rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    const start = () => { imgEl.classList.add('mic-listening'); rec.start(); };
    const stop = () => { imgEl.classList.remove('mic-listening'); try { rec.stop(); } catch (_) { } };
    imgEl.addEventListener('click', start);
    imgEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') start();
    });
    rec.onresult = e => {
        let txt = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
            txt += e.results[i][0].transcript;
        }
        targetInput.value = txt;
    };
    rec.onend = () => { stop(); const q = targetInput.value.trim(); if (q) runClientSearch(q); };
    rec.onerror = () => stop();
}

// Inicialización de los micrófonos
setupMic(micTop, topInput);
setupMic(micBottom, bottomInput);


// ===== 8️⃣ FUNCIÓN DE ONDULACIÓN (RIPPLE) - MÁS RECIENTE (NO MODIFICAR ESTA) =====
function createRipple(event) {
    const target = event.currentTarget; // Esto debe ser la .search-bar.top-search o .search-bar.bottom-search

    const circle = document.createElement('div');

    const clientX = event.clientX;
    const clientY = event.clientY;

    const rect = target.getBoundingClientRect(); // Obtiene la posición de la BARRA ACTUAL

    const size = 20;
    const radius = size / 2;

    const x = clientX - rect.left; // Calcula la X dentro de la barra
    const y = clientY - rect.top; // Calcula la Y dentro de la barra

    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${x - radius}px`;
    circle.style.top = `${y - radius}px`;

    circle.classList.add('ripple');

    const existingRipple = target.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }
    target.appendChild(circle);
}

// ===== 5️⃣ CONTROL DEL SCROLL Y DESENFOQUE (LÓGICA UNIFICADA) =====

const blurThreshold = 300; // Distancia en píxeles para el desenfoque completo
const maxBlur = 2.5; // Máximo desenfoque deseado
const bodyEl = document.body;

if (goTop) {
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY;

        // --- Lógica 1: Botón Volver Arriba ---
        goTop.classList.toggle('show', scrollPos > 300);

        // --- Lógica 2: Desenfoque Dinámico ---
        if (scrollPos > 0) {
            let blurFactor = Math.min(scrollPos / blurThreshold, 1);
            let currentBlur = blurFactor * maxBlur;
            bodyEl.style.setProperty('--current-blur', `${currentBlur}px`);
        } else {
            bodyEl.style.setProperty('--current-blur', '0px');
        }
    });

    // Volver arriba con scroll suave
    goTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
