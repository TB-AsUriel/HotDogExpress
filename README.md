# 🌭 HotDog Express

Aplicación web para la venta y administración de una tienda de hot dogs.

**Eslogan:** *"El sabor que te hace volver"*

---

## Descripción

Sistema web desarrollado con HTML, CSS y JavaScript puro (sin frameworks).
Incluye una **parte pública** donde los clientes ordenan hot dogs personalizados,
y una **parte administrativa** donde el dueño administra pedidos, productos,
inventario, ventas, reportes, utilidades y personal.

> ⚠️ **Nota académica:** el almacenamiento se hace con `localStorage` del navegador
> para poder demostrar el funcionamiento sin instalar nada. Para una aplicación en
> producción sería necesario un backend (Node.js, PHP, Python, etc.) y una base de
> datos (MySQL, PostgreSQL, etc.).

---

## Funciones

### Cliente (público)
- Catálogo de productos (hot dogs, hamburguesas y complementos).
- Hot dogs con tocino o sin tocino.
- Personalización: ingredientes adicionales con precio (+ queso, jalapeños, etc.).
- Cálculo automático de precios con JavaScript.
- Carrito de compras con `localStorage` (modificar cantidades, eliminar artículos).
- Pedido a domicilio con método de pago (efectivo, tarjeta, transferencia).
- Confirmación con número de pedido y estado `PENDIENTE`.

### Administrador
- Login simulado (usuario `admin`, contraseña `admin123`).
- Dashboard con indicadores y gráficas (ventas, pedidos, productos, utilidad).
- Administración de pedidos (cambiar estado, ver, cancelar, eliminar).
- Administración de productos (agregar, editar, eliminar, precio, disponibilidad).
- Administración de ingredientes e inventario (entradas y salidas con motivo,
  alerta de **INVENTARIO BAJO**).
- Ventas por día, semana y mes, por categoría y método de pago.
- Reportes (generar e imprimir).
- Utilidades (ventas − costo de ingredientes − pagos al personal − otros gastos).
- Registro de empleados (personal).
- Registro de pagos al personal (con filtros).

---

## Tecnologías

- HTML5
- CSS3 (Grid, Flexbox, media queries)
- JavaScript puro
- Canvas para las gráficas (sin librerías externas)
- Git y GitHub
- Visual Studio Code

---

## Instalación y ejecución

1. Clonar o descargar el proyecto.
2. Abrir la carpeta `HotDogExpress` en Visual Studio Code.
3. Instalar la extensión **Live Server** (se usa solo para abrir la página).
4. Clic derecho sobre `index.html` y elegir **"Open with Live Server"**.

También se puede abrir `index.html` directamente con doble clic en el navegador;
las páginas funcionan igual.

### Datos de acceso al panel administrativo

| Campo      | Valor      |
| ---------- | ---------- |
| Usuario    | `admin`    |
| Contraseña | `admin123` |

---

## Estructura del proyecto

```text
HotDogExpress/
│
├── index.html        Página de inicio (hero, promociones, nosotros, contacto)
├── menu.html         Catálogo de productos y personalización
├── carrito.html      Carrito de compras
├── pedido.html       Formulario de pedido y confirmación
├── login.html        Acceso del administrador (simulado)
├── admin.html        Panel administrativo (todas las secciones)
│
├── css/
│   ├── styles.css    Estilos globales y página de inicio
│   ├── menu.css      Estilos del menú y ventana de personalización
│   ├── carrito.css   Estilos del carrito
│   └── admin.css     Estilos del panel administrativo
│
├── js/
│   ├── data.js       Datos de demostración y funciones de localStorage
│   ├── main.js       Utilidades comunes (formatos, toast, contador)
│   ├── productos.js  Catálogo y personalización de productos
│   ├── carrito.js    Lógica del carrito (agregar, quitar, cantidades)
│   ├── pedidos.js    Validación y confirmación de pedidos
│   ├── login.js      Inicio de sesión del administrador
│   └── admin.js      Lógica del panel administrativo
│
├── img/
│   ├── logo.png
│   ├── hotdog-clasico.jpg
│   ├── hotdog-tocino.jpg
│   ├── hamburguesa.jpg
│   ├── papas.jpg
│   └── refresco.jpg
│
├── README.md
└── .gitignore
```

> Las imágenes actuales son **placeholder** de demostración (diseñadas para que el
> proyecto funcione). Para usarlas en producción, reemplaza los archivos de
> `img/` por fotografías reales conservando los mismos nombres.

---

## Cómo probar todas las funciones

### Flujo del cliente
1. Abrir `index.html` → ver hero, promociones, nosotros y contacto.
2. Ir a **Menú** → elegir un hot dog → se abre la **personalización**
   (¿tocino? + ingredientes extra + cantidad). El total se actualiza solo.
3. **AGREGAR AL CARRITO** → el contador de la navegación aumenta.
4. Ir a **Carrito** → subir/bajar cantidad, eliminar artículo, ver total.
5. **REALIZAR PEDIDO** → capturar nombre, teléfono, dirección y método de pago.
6. **CONFIRMAR PEDIDO** → aparece el número de pedido y el estado `PENDIENTE`.
   Los ingredientes se descuentan automáticamente del inventario.

### Flujo del administrador
1. Abrir `login.html` → entrar con `admin` / `admin123`.
2. **Dashboard** → indicadores del día y 3 gráficas.
3. **Pedidos** → cambiar estado del pedido, ver detalle, cancelar o eliminar.
4. **Productos** → agregar/editar/eliminar productos y cambiar su disponibilidad.
5. **Ingredientes** → ver stock y alertas, aumentar/disminuir stock.
6. **Inventario** → registrar entradas y salidas con motivo.
7. **Ventas / Reportes / Utilidades** → consultar con distintos periodos.
8. **Personal / Pagos** → registrar empleados y pagos.

---

## Subir el proyecto a GitHub

### 1) Crear el repositorio
1. Entrar a [github.com](https://github.com) e iniciar sesión.
2. Clic en **New** (o **+** → **New repository**).
3. Nombre del repositorio: `HotDogExpress`.
4. Dejarlo **Public** (GitHub Pages solo funciona en repositorios públicos
   con cuenta gratuita).
5. **No** marcar "Add a README" (el proyecto ya incluye uno).
6. Clic en **Create repository**.

### 2) Configurar Git en Visual Studio Code
Abrir la terminal de VS Code (Ctrl + Ñ / Ctrl + J) dentro de la carpeta
`HotDogExpress` y ejecutar:

```bash
git init
git add .
git commit -m "Primer commit - HotDog Express"
```

Conectar con el repositorio (reemplaza `URL_DEL_REPOSITORIO` por la dirección
que GitHub muestra en la página del repositorio, ej.
`https://github.com/TU_USUARIO/HotDogExpress.git`):

```bash
git remote add origin URL_DEL_REPOSITORIO
git branch -M main
git push -u origin main
```

> La primera vez, VS Code (o Git Credential Manager) pedirá iniciar sesión en
> GitHub. Después ya no volverá a pedirlo.

### 3) Actualizar después de un cambio

```bash
git add .
git commit -m "Actualización del proyecto"
git push
```

---

## Publicar con GitHub Pages

1. Entrar al repositorio en GitHub.
2. Ir a **Settings**.
3. En el menú lateral, entrar a **Pages**.
4. En **Branch**, seleccionar `main` y en la carpeta seleccionar `/root`.
5. Clic en **Save**.
6. Esperar unos segundos a que GitHub publique el sitio.
7. Abrir el enlace que genera GitHub:
   `https://TU_USUARIO.github.io/HotDogExpress/`

> GitHub Pages sirve páginas estáticas (HTML/CSS/JS). El `localStorage` de cada
> visitante se guarda en su propio navegador, por lo que cada demostración es
> independiente por equipo.

---

## Autor

**Uriel**

Proyecto escolar — HotDog Express, 2026.