/**
 * TechFix - Lógica de Interacción y Cotizador Express
 * Módulos: Cotizador inteligente, Rastreador de órdenes, Slider Antes/Después, Modo oscuro, Horario de atención y Accesibilidad.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBusinessHoursStatus();
    initMobileMenu();
    initQuoteCalculator();
    initOrderTracker();
    initComparisonSlider();
    initFaqAccordion();
    initModals();
    initContactForm();
});

/* ==========================================================================
   1. Control de Tema Claro / Oscuro con persistencia en LocalStorage
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) return;

    const savedTheme = localStorage.getItem('techfix_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon(false);
    }

    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('techfix_theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
    });
}

function updateThemeIcon(isDark) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    if (isDark) {
        icon.className = 'fa-solid fa-sun text-amber-400 text-lg';
    } else {
        icon.className = 'fa-solid fa-moon text-slate-700 text-lg';
    }
}

/* ==========================================================================
   2. Menú Móvil Accesible
   ========================================================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        if (isOpen) {
            mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
        } else {
            mobileMenu.classList.remove('hidden');
            menuBtn.setAttribute('aria-expanded', 'true');
        }
    });

    // Cerrar al pulsar un enlace de navegación
    const navLinks = mobileMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ==========================================================================
   3. Cotizador Express Interactivo con Cálculo en Tiempo Real
   ========================================================================== */
const quoteDatabase = {
    celular: {
        brands: ['Samsung Galaxy', 'Xiaomi / Redmi / Poco', 'Motorola', 'Huawei / Honor', 'Otro'],
        issues: [
            { id: 'pantalla', name: 'Pantalla rota / Táctil dañado / Sin imagen', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$650 - $2,400 MXN', note: 'Calidad Original / OLED con True Tone, según solicitado por el cliente' },
            { id: 'bateria', name: 'Batería inflada / Se descarga rápido', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$450 - $950 MXN', note: 'Ciclos en 0 y 100% de salud' },
            { id: 'carga', name: 'No carga / Falso contacto en pin de carga', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$350 - $650 MXN', note: 'Puerto Tipo-C / Lightning con micrófono probado' },
            { id: 'humedad', name: 'Equipo mojado / Daño por líquidos', time: '1 a 2 días', price: '$450 - $1,200 MXN', note: 'Lavado químico ultrasónico y sellado' },
            { id: 'placa', name: 'No enciende / Se reinicia / En corto', time: '1 a 2 días', price: '$750 - $1,800 MXN', note: 'Microsoldadura a nivel componente' },
            { id: 'camara', name: 'Cámara trasera / delantera borrosa o rota', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$450 - $1,300 MXN', note: 'Reemplazo de módulo y calibración de enfoque' }
        ]
    },
    tablet: {
        brands: ['Apple iPad (Air / Mini / Base)', 'Samsung Galaxy Tab', 'Lenovo Tab', 'Huawei MatePad', 'Amazon Fire / Otra'],
        issues: [
            { id: 'pantalla', name: 'Pantalla estrellada / Digitalizador no responde', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$750 - $2,900 MXN', note: 'Display completo o cambio de touch laminado' },
            { id: 'bateria', name: 'Batería no retiene carga o se apaga sola', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$650 - $1,400 MXN', note: 'Baterías de alta capacidad con garantía' },
            { id: 'carga', name: 'Puerto de carga flojo o roto', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$450 - $850 MXN', note: 'Resoldado o sustitución de conector flex' },
            { id: 'software', name: 'Bloqueada en el logo / Error de actualización', time: '2 a 3 días', price: '$350 - $600 MXN', note: 'Restauración de firmware oficial' },
            { id: 'chasis', name: 'Chasis doblado / Botones de volumen hundidos', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$400 - $800 MXN', note: 'Enderezado de precisión y microswitches' }
        ]
    },
    laptop: {
        brands: ['Lenovo (ThinkPad / Legion / IdeaPad)', 'Dell (XPS / Inspiron / Latitude)', 'HP (Pavilion / Omen / Envy)', 'ASUS (ROG / TUF / Zenbook)', 'Acer / MSI / Toshiba / Otra'],
        issues: [
            { id: 'mantenimiento', name: 'Mantenimiento térmico (Se calienta y apaga)', time: '2 a 4 horas (Mismo día)', price: '$450 - $850 MXN', note: 'Limpieza de ventiladores y pasta térmica Arctic MX-6' },
            { id: 'pantalla', name: 'Pantalla rota / Líneas en display / Parpadeo', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$1,200 - $3,200 MXN', note: 'Paneles IPS / FHD / 144Hz según modelo' },
            { id: 'bisagras', name: 'Bisagras rotas / Carcasa abierta al cerrar', time: '2 días', price: '$550 - $1,100 MXN', note: 'Reconstrucción con anclajes de resina epóxica' },
            { id: 'teclado', name: 'Teclado no responde / Teclas sueltas o pegajosas', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$600 - $2,000 MXN', note: 'Instalación de teclado en español con retroiluminación(según modelo)' },
            {
                id: 'ssd', name: 'Muy lenta / Actualización a disco SSD + Respaldo', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$750 - $3,500 MXN', note: 'SSD NVMe/SATA hasta 10 veces más rápido que HDD(depende del almacenamiento)'
            },
            { id: 'placa', name: 'No enciende / Luz parpadea pero pantalla negra', time: '2 a 5 días', price: '$850 - $2,500 MXN', note: 'Reparación' }
        ]
    },
    pc: {
        brands: ['PC Gamer Armada a Medida', 'PC de Oficina / Torre Ensamblada', 'HP / Dell / Lenovo (Prearmada)', 'Workstation de Diseño / Arquitectura', 'All-in-One (Todo en Uno)'],
        issues: [
            { id: 'Armado de PC/Gamer', name: 'Armado de PC/Gamer', time: 'Una vez que lleguen todo los componentes se hace procede armar la PC/Gamer (2 a 5 días hábiles)', price: 'Dependiendo del presupuesto del cliente', note: 'Armado de la PC/Gamer' },
            { id: 'mantenimiento', name: 'Mantenimiento preventivo completo y cable management', time: '3 a 5 horas', price: '$450 - $900 MXN', note: 'Desarmado, soplado profundo, pasta térmica y lubricación' },
            { id: 'no_enciende', name: 'No da video o no prende nada (Falla de hardware)', time: '24 horas (Diagnóstico)', price: '$400 - $1,200 MXN', note: 'Pruebas de fuente de poder, RAM, GPU y motherboard' },
            { id: 'formateo', name: 'Formateo seguro con respaldo de fotos y programas', time: '2 a 8 horas (mismo día)', price: '$400 - $800 MXN', note: 'Windows 11/10 limpio con drivers oficiales y paquetería office' },
            { id: 'upgrade', name: 'Actualización de componentes (GPU, RAM, Fuente, SSD)', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: 'Dependiendo del tipo de componente a aztualizar', note: 'Mano de obra para la instalación de los componentes' },
        ]
    }
};

let currentQuote = {
    deviceType: 'celular',
    brand: 'Apple (iPhone)',
    issueIndex: 0
};

function initQuoteCalculator() {
    const deviceButtons = document.querySelectorAll('.device-select-btn');
    const brandSelect = document.getElementById('quote-brand');
    const issueSelect = document.getElementById('quote-issue');

    if (!deviceButtons.length || !brandSelect || !issueSelect) return;

    // Click en tipo de dispositivo
    deviceButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            deviceButtons.forEach(b => {
                b.classList.remove('active', 'border-blue-600', 'bg-blue-50', 'text-blue-700', 'dark:bg-blue-950/40', 'dark:border-blue-500');
            });
            btn.classList.add('active');

            currentQuote.deviceType = btn.dataset.device;
            populateBrandOptions();
            populateIssueOptions();
            updateQuoteSummary();
        });
    });

    brandSelect.addEventListener('change', (e) => {
        currentQuote.brand = e.target.value;
        updateQuoteSummary();
    });

    issueSelect.addEventListener('change', (e) => {
        currentQuote.issueIndex = parseInt(e.target.value, 10);
        updateQuoteSummary();
    });

    // Inicializar listas
    populateBrandOptions();
    populateIssueOptions();
    updateQuoteSummary();

    // Botón de WhatsApp en la cotización
    const quoteWaBtn = document.getElementById('quote-whatsapp-btn');
    if (quoteWaBtn) {
        quoteWaBtn.addEventListener('click', sendQuoteToWhatsApp);
    }
}

function populateBrandOptions() {
    const brandSelect = document.getElementById('quote-brand');
    if (!brandSelect) return;
    const currentData = quoteDatabase[currentQuote.deviceType];

    brandSelect.innerHTML = '';
    currentData.brands.forEach((brand, index) => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        if (index === 0) option.selected = true;
        brandSelect.appendChild(option);
    });
    currentQuote.brand = currentData.brands[0];
}

function populateIssueOptions() {
    const issueSelect = document.getElementById('quote-issue');
    if (!issueSelect) return;
    const currentData = quoteDatabase[currentQuote.deviceType];

    issueSelect.innerHTML = '';
    currentData.issues.forEach((issue, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = issue.name;
        if (index === 0) option.selected = true;
        issueSelect.appendChild(option);
    });
    currentQuote.issueIndex = 0;
}

function updateQuoteSummary() {
    const data = quoteDatabase[currentQuote.deviceType];
    const issue = data.issues[currentQuote.issueIndex];

    const deviceNameMap = {
        celular: 'Celular / Smartphone',
        tablet: 'Tablet / iPad',
        laptop: 'Laptop / Portátil',
        pc: 'Computadora de Escritorio / PC Gamer'
    };

    const summaryDevice = document.getElementById('summary-device');
    const summaryIssue = document.getElementById('summary-issue');
    const summaryTime = document.getElementById('summary-time');
    const summaryPrice = document.getElementById('summary-price');
    const summaryNote = document.getElementById('summary-note');

    if (summaryDevice) summaryDevice.textContent = `${deviceNameMap[currentQuote.deviceType]} (${currentQuote.brand})`;
    if (summaryIssue) summaryIssue.textContent = issue.name;
    if (summaryTime) summaryTime.textContent = issue.time;
    if (summaryPrice) summaryPrice.textContent = issue.price;
    if (summaryNote) summaryNote.textContent = issue.note;
}

function sendQuoteToWhatsApp() {
    const data = quoteDatabase[currentQuote.deviceType];
    const issue = data.issues[currentQuote.issueIndex];

    const deviceNameMap = {
        celular: 'Celular',
        tablet: 'Tablet / iPad',
        laptop: 'Laptop',
        pc: 'PC de Escritorio / Gamer'
    };

    const text = `Hola TechFix, coticé en su página web y deseo consultar disponibilidad:%0A%0A` +
        `*Equipo:* ${encodeURIComponent(deviceNameMap[currentQuote.deviceType])} - ${encodeURIComponent(currentQuote.brand)}%0A` +
        `*Falla a reparar:* ${encodeURIComponent(issue.name)}%0A` +
        `*Tiempo estimado mostrado:* ${encodeURIComponent(issue.time)}%0A` +
        `*Rango aproximado:* ${encodeURIComponent(issue.price)}%0A%0A` +
        `¿Tienen refacción disponible en taller para agendar mi servicio?`;

    window.open(`https://wa.me/529711601042?text=${text}`, '_blank', 'noopener,noreferrer');
}

/* ==========================================================================
   4. Rastreador de Órdenes en Vivo (Demo funcional y buscador de tickets)
   ========================================================================== */
const orderDatabase = {
    'FIX-1042': {
        ticket: 'FIX-1042',
        device: 'iPhone 14 Pro 128GB',
        service: 'Cambio de pantalla OLED original con restauración True Tone',
        technician: 'Ing. Alejandro Morales',
        receivedAt: 'Hoy, 10:15 AM',
        step: 5, // 1: Recepción, 2: Diagnóstico, 3: Laboratorio, 4: Calidad, 5: Listo
        statusBadge: 'Listo para Entrega',
        statusColor: 'emerald',
        notes: 'Pruebas táctiles y Face ID superadas con éxito. Equipo empaquetado en espera del cliente.'
    },
    'FIX-1088': {
        ticket: 'FIX-1088',
        device: 'Laptop Lenovo Legion 5 (Ryzen 7 + RTX 3060)',
        service: 'Mantenimiento térmico profundo y reemplazo de pasta térmica Arctic MX-4',
        technician: 'Téc. Roberto Méndez',
        receivedAt: 'Ayer, 4:30 PM',
        step: 4,
        statusBadge: 'En Control de Calidad',
        statusColor: 'blue',
        notes: 'Equipo en prueba de estrés (AIDA64 + FurMark). Temperaturas estables en 68°C bajo carga máxima.'
    },
    'FIX-1120': {
        ticket: 'FIX-1120',
        device: 'PC Gamer Asus TUF / Placa B550',
        service: 'Reparación de etapa de potencia VRM y cortocircuito en línea de 12V',
        technician: 'Ing. Daniel Ruiz (Microsoldadura)',
        receivedAt: 'Hoy, 9:20 AM',
        step: 3,
        statusBadge: 'En Reparación de Laboratorio',
        statusColor: 'amber',
        notes: 'Mosfet dañado reemplazado bajo microscopio. Verificando voltajes de estabilización.'
    }
};

function initOrderTracker() {
    const searchBtn = document.getElementById('search-order-btn');
    const orderInput = document.getElementById('order-input');
    const quickTags = document.querySelectorAll('.order-quick-tag');

    if (!searchBtn || !orderInput) return;

    searchBtn.addEventListener('click', () => {
        const query = orderInput.value.trim().toUpperCase();
        if (query) renderOrderResult(query);
    });

    orderInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = orderInput.value.trim().toUpperCase();
            if (query) renderOrderResult(query);
        }
    });

    quickTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const code = tag.dataset.order;
            orderInput.value = code;
            renderOrderResult(code);
        });
    });

    // Renderizar una orden por defecto para que el usuario vea la herramienta activa
    renderOrderResult('FIX-1042');
}

/**
 * Utilidad de escape contra DOM XSS para cadenas no confiables
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderOrderResult(ticketCode) {
    const resultContainer = document.getElementById('order-result');
    if (!resultContainer) return;

    // Sanitización y lista blanca estricta (solo A-Z, 0-9 y guiones, máx 15 caracteres)
    const rawCode = (ticketCode || '').toString().trim().toUpperCase();
    const cleanCode = rawCode.replace(/[^A-Z0-9-]/g, '').slice(0, 15);

    if (!cleanCode) {
        resultContainer.innerHTML = `
            <div class="bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 text-center">
                <i class="fa-solid fa-triangle-exclamation text-amber-500 text-2xl mb-2"></i>
                <p class="text-sm font-semibold text-slate-900 dark:text-white">Folio no válido</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Ingresa un formato de orden técnico correcto (ej. FIX-1042).</p>
            </div>
        `;
        return;
    }

    const order = orderDatabase[cleanCode] || {
        ticket: cleanCode,
        device: 'Equipo en recepción técnica',
        service: 'Diagnóstico general de componentes y verificación de fallas',
        technician: 'Mesa de Diagnóstico Técnico',
        receivedAt: 'En turno del día',
        step: 2, // 1: Recepción, 2: Diagnóstico, 3: Laboratorio, 4: Calidad, 5: Listo
        statusBadge: 'En Proceso de Diagnóstico',
        statusColor: 'blue',
        notes: 'El equipo se encuentra en el banco de pruebas. Recibirás una notificación por WhatsApp cuando el presupuesto exacto esté listo.'
    };

    const steps = [
        { num: 1, title: 'Recepción', desc: 'Registro y estado físico' },
        { num: 2, title: 'Diagnóstico', desc: 'Pruebas de componentes' },
        { num: 3, title: 'Laboratorio', desc: 'Mano de obra y refacción' },
        { num: 4, title: 'Control de Calidad', desc: 'Verificación de funciones' },
        { num: 5, title: 'Listo para Retiro', desc: 'Con garantía por escrito' }
    ];

    let stepsHtml = '';
    steps.forEach((s) => {
        const isDone = s.num < order.step;
        const isCurrent = s.num === order.step;

        let iconBg = 'bg-slate-200 dark:bg-slate-700 text-slate-500';
        let stepText = 'text-slate-500 dark:text-slate-400';

        if (isDone) {
            iconBg = 'bg-emerald-600 text-white shadow-sm';
            stepText = 'text-emerald-700 dark:text-emerald-400 font-semibold';
        } else if (isCurrent) {
            iconBg = 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-md';
            stepText = 'text-blue-700 dark:text-blue-400 font-bold';
        }

        stepsHtml += `
            <div class="flex flex-col items-center text-center relative z-10 flex-1 px-2">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${iconBg}">
                    ${isDone ? '<i class="fa-solid fa-check text-xs"></i>' : s.num}
                </div>
                <p class="text-xs ${stepText}">${escapeHTML(s.title)}</p>
                <p class="text-[10px] text-slate-400 hidden sm:block mt-0.5">${escapeHTML(s.desc)}</p>
            </div>
        `;
    });

    const badgeClasses = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
        blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
        amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
    };

    resultContainer.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div>
                    <div class="flex items-center gap-3">
                        <span class="font-mono text-xl font-extrabold text-slate-900 dark:text-white">${escapeHTML(order.ticket)}</span>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badgeClasses[order.statusColor] || badgeClasses.blue}">
                            <span class="w-2 h-2 rounded-full bg-current mr-2 status-indicator-dot"></span>
                            ${escapeHTML(order.statusBadge)}
                        </span>
                    </div>
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">${escapeHTML(order.device)}</p>
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                    <p>Ingreso: <strong class="text-slate-700 dark:text-slate-200">${escapeHTML(order.receivedAt)}</strong></p>
                    <p>Asignado: <strong class="text-slate-700 dark:text-slate-200">${escapeHTML(order.technician)}</strong></p>
                </div>
            </div>

            <!-- Línea de Tiempo de Estados -->
            <div class="py-8 relative">
                <div class="flex items-center justify-between relative">
                    ${stepsHtml}
                </div>
            </div>

            <div class="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="space-y-1">
                    <p class="text-xs uppercase font-bold text-slate-400">Servicio y Notas Técnicas:</p>
                    <p class="text-sm text-slate-700 dark:text-slate-300 font-medium">${escapeHTML(order.service)}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 italic">${escapeHTML(order.notes)}</p>
                </div>
                <a href="https://wa.me/529711601042?text=Hola,%20quisiera%20consultar%20el%20ticket%20${encodeURIComponent(order.ticket)}" target="_blank" rel="noopener noreferrer" class="shrink-0 inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors">
                    <i class="fa-brands fa-whatsapp text-sm mr-2"></i> Preguntar por WhatsApp
                </a>
            </div>
        </div>
    `;
}

/* ==========================================================================
   5. Slider Interactivo Antes / Después (Comparativa visual táctil)
   ========================================================================== */
const sliderCases = {
    screen: {
        beforeImg: 'img/Displayroto-antes.jpg',
        afterImg: 'img/Display nuevo-despues.jpg',
        title: 'Sustitución de Pantalla en Smartphone',
        desc: 'Cristal estrellado sin respuesta táctil vs Instalación de panel nuevo calidad original.'
    },
    thermal: {
        beforeImg: 'img/Pc-antes.jpg',
        afterImg: 'img/Pc-despues.jpg',
        title: 'Mantenimiento Térmico de PC',
        desc: 'Pasta térmica seca y conductos obstruidos vs Sistema limpio con pasta Arctic MX-6 de alta conductividad.'
    },
    armado: {
        beforeImg: 'img/Armado de PC-antes.jpg',
        afterImg: 'img/Armado de PC-despues.jpg',
        title: 'Armado de PC/Gamer',
        desc: 'Armado de PC/Gamer de alta calidad en componentes'
    }
};

function initComparisonSlider() {
    const container = document.getElementById('comparison-container');
    const beforeWrapper = document.getElementById('comparison-before-wrapper');
    const handle = document.getElementById('comparison-handle');
    const caseButtons = document.querySelectorAll('.slider-case-btn');

    if (!container || !beforeWrapper || !handle) return;

    let isDragging = false;

    function setPosition(xPos) {
        const rect = container.getBoundingClientRect();
        let posX = xPos - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;

        const percentage = (posX / rect.width) * 100;
        beforeWrapper.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
    }

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        setPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Soporte táctil en dispositivos móviles
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        setPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Selector de casos de antes/después
    caseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            caseButtons.forEach(b => {
                b.classList.remove('bg-blue-600', 'text-white');
                b.classList.add('bg-white', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
            });
            btn.classList.remove('bg-white', 'text-slate-700', 'dark:bg-slate-800', 'dark:text-slate-300');
            btn.classList.add('bg-blue-600', 'text-white');

            const caseKey = btn.dataset.case;
            loadSliderCase(caseKey);
        });
    });
}

function loadSliderCase(key) {
    const item = sliderCases[key];
    if (!item) return;

    const beforeImg = document.getElementById('slider-before-img');
    const afterImg = document.getElementById('slider-after-img');
    const titleEl = document.getElementById('slider-case-title');
    const descEl = document.getElementById('slider-case-desc');

    if (beforeImg) beforeImg.src = item.beforeImg;
    if (afterImg) afterImg.src = item.afterImg;
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.desc;
}

/* ==========================================================================
   6. Acordeón de Preguntas Frecuentes (FAQ Accesible)
   ========================================================================== */
function initFaqAccordion() {
    const faqButtons = document.querySelectorAll('.faq-toggle-btn');
    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.classList.contains('open');

            // Cerrar otros acordeones
            document.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    const otherBtn = other.querySelector('.faq-toggle-btn');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            if (isOpen) {
                item.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* ==========================================================================
   7. Formulario de Contacto Directo con Reenvío a WhatsApp
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('contact-name').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const deviceType = document.getElementById('contact-device').value;
        const brandModel = document.getElementById('contact-model').value.trim();
        const issue = document.getElementById('contact-message').value.trim();

        const feedback = document.getElementById('contact-feedback');
        if (feedback) {
            feedback.classList.remove('hidden');
        }

        const text = `Hola TechFix, solicito atención técnica:%0A%0A` +
            `*Nombre:* ${encodeURIComponent(name)}%0A` +
            `*Teléfono:* ${encodeURIComponent(phone)}%0A` +
            `*Dispositivo:* ${encodeURIComponent(deviceType)}%0A` +
            `*Marca/Modelo:* ${encodeURIComponent(brandModel || 'No especificado')}%0A` +
            `*Falla presentada:* ${encodeURIComponent(issue)}`;

        setTimeout(() => {
            window.open(`https://wa.me/529711601042?text=${text}`, '_blank', 'noopener,noreferrer');
        }, 800);
    });
}

/* ==========================================================================
   8. Modales Accesibles de Privacidad y Términos de Servicio
   ========================================================================== */
function initModals() {
    window.openModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = function (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };

    // Cerrar al pulsar Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('[data-modal]').forEach(modal => {
                if (!modal.classList.contains('hidden')) {
                    modal.classList.add('hidden');
                    modal.setAttribute('aria-hidden', 'true');
                    document.body.style.overflow = '';
                }
            });
        }
    });

    // Cerrar al hacer clic en el backdrop
    document.querySelectorAll('[data-modal]').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        });
    });
}

/* ==========================================================================
   9. Estado Dinámico de Horario de Atención (Disponible / Fuera de servicio)
   Horarios:
   - Lunes a Sábado: 9:00 AM a 8:00 PM (9am a 8pm)
   - Domingos: 11:00 AM a 6:00 PM (11am a 6pm)
   ========================================================================== */
function initBusinessHoursStatus() {
    function checkBusinessHours() {
        const now = new Date();
        const day = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const currentHour = now.getHours() + (now.getMinutes() / 60);

        // Lunes (1) a Sábado (6): 9:00 AM a 8:00 PM (9.0 a 20.0)
        if (day >= 1 && day <= 6) {
            return currentHour >= 9.0 && currentHour < 20.0;
        }

        // Domingo (0): 11:00 AM a 6:00 PM (11.0 a 18.0)
        if (day === 0) {
            return currentHour >= 11.0 && currentHour < 18.0;
        }

        return false;
    }

    function updateStatusUI() {
        const isOpen = checkBusinessHours();

        // Barra superior
        const statusBadge = document.getElementById('business-status-badge');
        const statusDot = document.getElementById('business-status-dot');
        const statusText = document.getElementById('business-status-text');

        // Tarjeta Hero
        const heroPill = document.getElementById('hero-status-pill');
        const heroDot = document.getElementById('hero-status-dot');
        const heroText = document.getElementById('hero-status-text');

        // Sección de contacto
        const contactNote = document.getElementById('contact-status-note');

        if (isOpen) {
            if (statusBadge) statusBadge.className = 'inline-flex items-center text-emerald-400 font-semibold';
            if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 mr-2 status-indicator-dot';
            if (statusText) statusText.textContent = 'Disponible';

            if (heroPill) heroPill.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
            if (heroDot) heroDot.className = 'w-2 h-2 rounded-full bg-emerald-500 mr-2 status-indicator-dot';
            if (heroText) heroText.textContent = 'Disponible';

            if (contactNote) {
                contactNote.className = 'text-emerald-600 dark:text-emerald-400 font-semibold mt-1';
                contactNote.textContent = '● Actualmente Disponible';
            }
        } else {
            if (statusBadge) statusBadge.className = 'inline-flex items-center text-amber-400 font-semibold';
            if (statusDot) statusDot.className = 'w-2 h-2 rounded-full bg-amber-400 mr-2';
            if (statusText) statusText.textContent = 'Fuera de servicio';

            if (heroPill) heroPill.className = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
            if (heroDot) heroDot.className = 'w-2 h-2 rounded-full bg-amber-500 mr-2';
            if (heroText) heroText.textContent = 'Fuera de servicio';

            if (contactNote) {
                contactNote.className = 'text-amber-600 dark:text-amber-400 font-semibold mt-1';
                contactNote.textContent = '○ Fuera de servicio (Abrimos según horario)';
            }
        }
    }

    updateStatusUI();
    // Re-evaluar cada 60 segundos automáticamente
    setInterval(updateStatusUI, 60000);
}
