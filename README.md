# TechFix - Sitio Web Profesional para Servicio Técnico

Sitio web moderno, de alto rendimiento y enfocado a conversión para un taller o negocio especializado en la reparación de **celulares, tablets, laptops y computadoras PC**.

---

## 🚀 Características Principales

1. **Estado de Atención Dinámico en Tiempo Real (En Línea / Mostrador)**:
   - **Barra superior / Encabezado:** Muestra permanentemente **"Disponible en línea"** para atención digital y WhatsApp.
   - **Estado del Mostrador (Taller presencial):**
     - **Lunes a Sábado (9:00 AM a 4:00 PM):** Muestra **"Disponible"** en verde.
     - **Domingos (11:00 AM a 4:00 PM):** Muestra **"Disponible"** en verde.
     - **Fuera de estos horarios:** Cambia automáticamente a **"No disponible"** en la tarjeta de Estado del Mostrador y en la sección de contacto.

2. **Cotizador Express Interactivo**:
   - Selección por tipo de equipo: Celulares, Tablets, Laptops y PCs Gamer/Oficina.
   - Cálculo en tiempo real de tiempo de entrega estimado, rango de precio referencial y especificaciones del servicio.
   - Botón directo para enviar la cotización pre-redactada a WhatsApp con 1 solo clic.

3. **Catálogo de Servicios Técnico Especializado**:
   - 📱 **Celulares**: Pantallas OLED/AMOLED con True Tone, baterías al 100% de salud, pin de carga y tapas traseras.
   - 📟 **Tablets e iPads**: Digitalizadores táctiles, displays laminados, conectores flex y enderezado de chasis.
   - 💻 **Laptops y MacBooks**: Mantenimiento térmico con pasta Arctic MX-4, reparación estructural de bisagras rotas, actualización a SSD NVMe y teclados.
   - 🖥️ **PCs de Escritorio y Gamer**: Diagnóstico de GPU/Fuente/RAM, ensamble optimizado con flujo de aire, formateo seguro y refrigeración líquida.
   - 🔬 **Microsoldadura y Placa Madre**: Cámara térmica infrarroja y microscopio para cortocircuitos.
   - 💾 **Recuperación de Archivos**: Rescate de discos dañados y migración de sistema operativo.

4. **Comparador Interactivo Antes / Después**:
   - Slider táctil y deslizable para contrastar el estado de llegada vs. equipo terminado.

5. **Modo Claro / Modo Oscuro (Light & Dark Mode)**:
   - Selector en la barra de navegación con persistencia en `localStorage`.

6. **Diseño Mobile-First y Accesible**:
   - Barra flotante inferior fija para móviles con botones táctiles grandes (≥48px): Llamar, Cotizar, WhatsApp.
   - Contraste visual verificado WCAG AA y navegación por teclado accesible.

7. **Aviso de Privacidad y Términos de Servicio Integrados**:
   - Modales emergentes que garantizan la estricta confidencialidad de fotos y archivos personales conforme a normativas de protección de datos.

---

## 📁 Estructura del Proyecto

```text
Pagina web/
│
├── index.html          # Estructura principal y secciones semánticas
├── css/
│   └── styles.css      # Variables de tema, slider de antes/después y utilidades
├── js/
│   └── app.js          # Cotizador, horarios dinámicos, rastreador, slider y eventos
└── README.md           # Documentación y guía de personalización
```

---

## 🛠️ Cómo Probarlo en tu Computadora

1. Simplemente haz **doble clic en `index.html`** para abrirlo en tu navegador preferido (Google Chrome, Microsoft Edge, Brave, Firefox, etc.).
2. No requiere instalar Node.js, Python ni servidores complicados: funciona al 100% de manera estática y autónoma.

---

## ⚙️ Cómo Personalizar tus Datos

### 1. Cambiar el Número de WhatsApp
En `index.html` y en `js/app.js`, busca el número `529711601042` y reemplázalo por tu propio número de teléfono con lada internacional.

### 2. Horarios de Atención
El horario configurado es:
- **Lunes a Sábado:** 9:00 AM a 8:00 PM (9am a 8pm)
- **Domingos:** 11:00 AM a 6:00 PM (11am a 6pm)

Para modificar las horas de apertura en el script automático, edita la función `initBusinessHoursStatus()` en [js/app.js](file:///c:/Users/jorge/Downloads/Pagina%20web/js/app.js).

### 3. Modificar Precios o Marcas del Cotizador
En [js/app.js](file:///c:/Users/jorge/Downloads/Pagina%20web/js/app.js), edita el objeto `quoteDatabase` para ajustar tus marcas preferidas, precios locales en tu moneda y tiempos de entrega.

---

## 🌐 Publicación Gratuita en Internet

Puedes alojar esta página web de forma 100% gratuita con certificado SSL (HTTPS) en:
- **Netlify**: Arrastra la carpeta completa `Pagina web` a [app.netlify.com/drop](https://app.netlify.com/drop) y quedará en línea en 10 segundos.
- **Vercel**: Conecta tu repositorio o usa `npx vercel`.
- **GitHub Pages**: Sube los archivos a una rama `main` en un repositorio de GitHub y activa Pages en la configuración.
