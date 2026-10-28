/**
 * TechFix - Lógica de Interacción y Cotizador Express
 * Módulos: Cotizador inteligente, Slider Antes/Después, Modo oscuro, Horario de atención y Accesibilidad.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initBusinessHoursStatus();
    initMobileMenu();
    initQuoteCalculator();
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
        icon.className = 'fa-solid fa-sun theme-icon-dark';
    } else {
        icon.className = 'fa-solid fa-moon theme-icon-light';
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
            { id: 'teclado', name: 'Teclado no responde / Teclas sueltas o pegajosas', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$600 - $2,000 MXN', note: 'Instalación de teclado en español con retroiluminación (según modelo)' },
            {
                id: 'ssd', name: 'Muy lenta / Actualización a disco SSD + Respaldo', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: '$750 - $3,500 MXN', note: 'SSD NVMe/SATA hasta 10 veces más rápido que HDD (depende del almacenamiento)'
            },
            { id: 'placa', name: 'No enciende / Luz parpadea pero pantalla negra', time: '2 a 5 días', price: '$850 - $2,500 MXN', note: 'Reparación' }
        ]
    },
    pc: {
        brands: ['PC Gamer Armada a Medida', 'PC de Oficina / Torre Ensamblada', 'HP / Dell / Lenovo (Prearmada)', 'Workstation de Diseño / Arquitectura', 'All-in-One (Todo en Uno)'],
        issues: [
            { id: 'Armado de PC/Gamer', name: 'Armado de PC/Gamer', time: 'Una vez que lleguen todos los componentes se procede a armar la PC/Gamer (2 a 5 días hábiles)', price: 'Dependiendo del presupuesto del cliente', note: 'Armado de la PC/Gamer' },
            { id: 'mantenimiento', name: 'Mantenimiento preventivo completo y cable management', time: '3 a 5 horas', price: '$450 - $900 MXN', note: 'Desarmado, soplado profundo, pasta térmica y lubricación' },
            { id: 'no_enciende', name: 'No da video o no prende nada (Falla de hardware)', time: '24 horas (Diagnóstico)', price: '$400 - $1,200 MXN', note: 'Pruebas de fuente de poder, RAM, GPU y motherboard' },
            { id: 'formateo', name: 'Formateo seguro con respaldo de fotos y programas', time: '2 a 8 horas (mismo día)', price: '$400 - $800 MXN', note: 'Windows 11/10 limpio con drivers oficiales y paquetería office' },
            { id: 'upgrade', name: 'Actualización de componentes (GPU, RAM, Fuente, SSD)', time: 'Una vez que llegue la refacción se hace el cambio (2 a 5 días hábiles)', price: 'Dependiendo del tipo de componente a actualizar', note: 'Mano de obra para la instalación de los componentes' },
        ]
    }
};

let currentQuote = {
    deviceType: 'celular',
    brand: 'Samsung Galaxy',
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
            deviceButtons.forEach(b => b.classList.remove('active'));
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
   4. Slider Interactivo Antes / Después (Comparativa visual táctil)
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
            caseButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

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
   5. Acordeón de Preguntas Frecuentes (FAQ Accesible)
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
   6. Formulario de Contacto Directo con Reenvío a WhatsApp
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
   7. Modales Accesibles de Privacidad y Términos de Servicio
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
   8. Estado Dinámico de Atención (En Línea y Mostrador)
   - Encabezado / Barra superior: "Disponible en línea" constante para atención digital.
   - Estado del Mostrador:
     * Lunes a Sábado: 9:00 AM a 4:00 PM (9am a 4pm)
     * Domingos: 11:00 AM a 4:00 PM (11am a 4pm)
     * Dentro de horario: "Disponible"
     * Fuera de horario: "No disponible"
   ========================================================================== */
function initBusinessHoursStatus() {
    function checkMostradorHours() {
        const now = new Date();
        const day = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const currentHour = now.getHours() + (now.getMinutes() / 60);

        // Lunes (1) a Sábado (6): 9:00 AM a 4:00 PM (9.0 a 16.0)
        if (day >= 1 && day <= 6) {
            return currentHour >= 9.0 && currentHour < 16.0;
        }

        // Domingo (0): 11:00 AM a 4:00 PM (11.0 a 16.0)
        if (day === 0) {
            return currentHour >= 11.0 && currentHour < 16.0;
        }

        return false;
    }

    function updateStatusUI() {
        // 1. Barra superior: Siempre "Disponible en línea"
        const statusBadge = document.getElementById('business-status-badge');
        const statusText = document.getElementById('business-status-text');

        if (statusBadge) {
            statusBadge.classList.add('status-open');
            statusBadge.classList.remove('status-closed');
        }
        if (statusText) {
            statusText.textContent = 'Disponible en línea';
        }

        // 2. Estado del Mostrador (Hero y Contacto)
        const isMostradorOpen = checkMostradorHours();

        // Tarjeta Hero
        const heroPill = document.getElementById('hero-status-pill');
        const heroText = document.getElementById('hero-status-text');

        // Sección de contacto
        const contactNote = document.getElementById('contact-status-note');

        if (isMostradorOpen) {
            if (heroPill) {
                heroPill.classList.add('status-open');
                heroPill.classList.remove('status-closed');
            }
            if (heroText) {
                heroText.textContent = 'Disponible';
            }

            if (contactNote) {
                contactNote.style.color = 'var(--brand-emerald)';
                contactNote.textContent = '● Actualmente Disponible';
            }
        } else {
            if (heroPill) {
                heroPill.classList.add('status-closed');
                heroPill.classList.remove('status-open');
            }
            if (heroText) {
                heroText.textContent = 'No disponible';
            }

            if (contactNote) {
                contactNote.style.color = 'var(--brand-amber)';
                contactNote.textContent = '○ No disponible (Consulte horarios de atención)';
            }
        }
    }

    updateStatusUI();
    // Re-evaluar cada 60 segundos automáticamente
    setInterval(updateStatusUI, 60000);
}
