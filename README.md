# Alke Wallet

Aplicación frontend de billetera digital construida con HTML, CSS, JavaScript, jQuery y Bootstrap 5.

El proyecto simula una experiencia bancaria moderna con foco en:
- flujo de autenticación
- navegación entre vistas
- operaciones de depósito, retiro y envío de dinero
- historial de movimientos
- persistencia local de estado
- diseño responsive con comportamiento distinto entre desktop y mobile

## Demo funcional https://maufuenb.github.io/Alke-Wallet-Digital/

La aplicación parte en:

- `EjercicioP/index.html`

Y redirige a:

- `EjercicioP/pages/login.html`

Credenciales demo:

- Correo: `usuario@wallet.com`
- Clave: `1234`

## Tecnologías usadas

- HTML5
- CSS3
- JavaScript
- jQuery `3.7.1`
- Bootstrap `5.3.3`
- Font Awesome `6.7.2`
- `localStorage` para persistencia del estado simulado

## Objetivo del proyecto

Este proyecto modela una billetera digital tipo banco/app financiera. No consume backend real: todo el comportamiento se simula en el navegador usando estado local, datos demo y navegación entre páginas estáticas.

Está pensado como ejercicio frontend, pero con una estructura suficientemente modular como para escalar visualmente y funcionalmente.

## Estructura del proyecto

```text
Proyecto Modulo 2/
├─ README.md
└─ EjercicioP/
   ├─ index.html
   ├─ assets/
   │  ├─ css/
   │  │  ├─ styles.css
   │  │  └─ pages/
   │  │     ├─ login.css
   │  │     ├─ menu.css
   │  │     ├─ operations.css
   │  │     ├─ send-money.css
   │  │     └─ transactions.css
   │  └─ js/
   │     ├─ data.js
   │     ├─ deposit.js
   │     ├─ layout.js
   │     ├─ login.js
   │     ├─ main.js
   │     ├─ menu.js
   │     ├─ retirar.js
   │     ├─ send-money.js
   │     └─ transactions.js
   └─ pages/
      ├─ login.html
      ├─ menu.html
      ├─ deposit.html
      ├─ retirar.html
      ├─ sendMoney.html
      └─ transactions.html
```

## Arquitectura general

La app está organizada en tres capas simples:

1. Vistas HTML
2. Layout y utilidades compartidas
3. Lógica específica por página

### 1. Vistas HTML

Cada página define:

- `data-page` para identificar la vista
- `data-layout` para elegir layout (`auth` o `app`)
- un `<template data-page-content>` con su contenido principal
- opcionalmente un `<template data-page-extra>` para modales y contenido auxiliar

Eso permite que el layout se genere dinámicamente desde JavaScript sin duplicar header, footer o navegación.

### 2. Layout y utilidades compartidas

Los archivos clave aquí son:

- `assets/js/layout.js`
- `assets/js/data.js`
- `assets/js/main.js`
- `assets/css/styles.css`

### 3. Lógica específica por página

Cada flujo tiene su propio archivo:

- `login.js`
- `menu.js`
- `deposit.js`
- `retirar.js`
- `send-money.js`
- `transactions.js`

Esto evita mezclar reglas de negocio entre vistas.

## Layouts

### Layout `auth`

Usado por:

- `pages/login.html`

Características:

- header simple
- footer simple
- contenido centrado
- en mobile, el formulario de login se abre desde un botón `Ingresar` en un modal visual

### Layout `app`

Usado por:

- `menu.html`
- `deposit.html`
- `retirar.html`
- `sendMoney.html`
- `transactions.html`

Características:

- header global
- sidebar en desktop
- bottom navigation en mobile
- menú de usuario en mobile
- footer persistente
- contenido central renderizado desde template

## Manejo del estado

Toda la persistencia simulada se gestiona en:

- `assets/js/data.js`

### Claves de `localStorage`

- `walletAppState`
- `walletBalanceVisibility`

### Estado principal

El objeto `WALLET_DEFAULTS` define:

- estado de sesión (`loggedIn`)
- usuario demo
- saldo
- mensaje flash
- fuentes de depósito
- cuentas de retiro
- contactos
- movimientos

### Funciones compartidas importantes

#### Estado

- `getWalletState()`: lee el estado desde `localStorage`, lo sanea y mezcla con defaults
- `saveWalletState(state)`: guarda el estado completo
- `updateWalletState(callback)`: actualiza el estado de forma centralizada

#### Navegación y sesión

- `redirectIfLoggedOut()`: protege vistas privadas
- `bindLogoutLinks()`: enlaza los botones de cerrar sesión
- `navigateTo(url, delay)`: redirige con retraso opcional

#### Alertas

- `showAlert(element, message, type)`: muestra alertas flotantes
- `hideAlert(element)`: limpia alertas asociadas
- `setFlashMessage(message)`: guarda mensaje temporal entre vistas
- `takeFlashMessage()`: consume el mensaje flash

#### Saldo

- `setBalanceValue(element, valueText)`: inyecta valor visible y versión persistente
- `syncBalanceVisibility(scope)`: sincroniza mostrar/ocultar saldo
- `bindBalanceVisibilityToggle(scope)`: enlaza botones de visibilidad

#### Modales

- `cleanupModalArtifacts()`: limpia backdrop y estado residual de Bootstrap
- `transitionBetweenModals(currentModalRef, nextModalRef, afterShow)`: transición segura entre modales encadenados

#### Selects custom

- `enhanceModalSelects(scope)`: reemplaza visualmente los `select` nativos dentro de modales
- `syncCustomSelect(selectElement)`: sincroniza trigger, opciones y selección

## Inicialización global

`assets/js/main.js` centraliza el arranque.

Responsabilidades:

- detectar la página actual mediante `data-page`
- enlazar utilidades compartidas
- esperar a que Bootstrap esté disponible antes de inicializar páginas que dependen de modales
- ejecutar el inicializador correcto por vista

Mapa actual:

- `login -> initLoginPage`
- `menu -> initMenuPage`
- `deposit -> initDepositPage`
- `retirar -> initRetirarPage`
- `send-money -> initSendMoneyPage`
- `transactions -> initTransactionsPage`

## Layout dinámico

`assets/js/layout.js` es una de las piezas más importantes del proyecto.

Se encarga de:

- inyectar Font Awesome si falta
- inyectar Bootstrap Bundle si falta
- construir el layout `auth`
- construir el layout `app`
- generar navegación desktop y mobile
- renderizar header, sidebar, footer y user menu
- sincronizar alturas del shell con variables CSS
- controlar el modal mobile del login

Esto reduce duplicación en los HTML.

## Vistas y responsabilidad por página

### `login.html` + `login.js`

Responsabilidades:

- login demo
- validación de credenciales
- toggle mostrar/ocultar contraseña
- carga rápida de credenciales demo
- persistencia de sesión

Notas:

- en mobile el formulario no queda siempre visible
- se abre desde el botón `Ingresar` del header

### `menu.html` + `menu.js`

Responsabilidades:

- mostrar saldo principal
- consumir `flashMessage`
- accesos rápidos
- desbloqueo de tarjeta virtual en mobile mediante clave

### `deposit.html` + `deposit.js`

Responsabilidades:

- depósitos por débito
- depósitos por transferencia
- depósitos con gift card
- actualización del saldo
- registro de movimiento en historial
- encadenamiento de modales

### `retirar.html` + `retirar.js`

Responsabilidades:

- seleccionar cuenta de retiro
- validar monto
- descontar saldo
- registrar movimiento de retiro

### `sendMoney.html` + `send-money.js`

Responsabilidades:

- agregar contactos
- seleccionar contactos existentes
- autocompletado de contactos
- mostrar contactos frecuentes
- validar transferencia
- descontar saldo
- registrar movimiento
- limpiar correctamente el flujo al cerrar modales

### `transactions.html` + `transactions.js`

Responsabilidades:

- listar movimientos
- filtrar por tipo
- renderizar historial con scroll interno

## Organización CSS

Se separó el CSS en:

### Base compartida

- `assets/css/styles.css`

Contiene solo estilos reutilizables:

- variables
- layout global
- header/footer/sidebar
- componentes base compartidos
- tipografía
- formularios
- modales
- navegación mobile

### CSS por página o flujo

- `login.css`: estilos exclusivos del login
- `menu.css`: dashboard principal, saldo y tarjeta virtual
- `transactions.css`: historial y lista de movimientos
- `operations.css`: estilos compartidos entre depositar, retirar y enviar dinero
- `send-money.css`: estilos exclusivos del flujo de envío y selección de contactos

Esta separación mejora:

- mantenibilidad
- localización de bugs
- escalabilidad visual
- menor acoplamiento

## Patrones reutilizados en la UI

### 1. Templates HTML + layout dinámico

Cada página define solo su contenido. El resto lo genera `layout.js`.

### 2. Estado centralizado

Todas las operaciones escriben en una sola fuente de verdad: `walletAppState`.

### 3. Modales encadenados

Los flujos complejos no abren modales superpuestos manualmente. Se usa:

- `transitionBetweenModals()`

para cerrar uno, limpiar artefactos y abrir el siguiente.

### 4. Flash messages entre páginas

Permiten mostrar mensajes de éxito después de navegar al menú.

### 5. Visibilidad del saldo compartida

La preferencia de mostrar u ocultar el saldo se comparte entre vistas.

## Responsive design

El proyecto no replica la misma interfaz en todos los tamaños; adapta la experiencia.

### Desktop

- apariencia más cercana a banca web
- sidebar lateral
- jerarquía visual amplia
- tarjetas y paneles más grandes

### Mobile

- navegación inferior
- menú de usuario compacto
- modal de login desde el header
- tarjetas y acciones apiladas
- estructuras más cercanas a una app financiera tipo billetera móvil

## Flujo de datos entre vistas

1. El usuario inicia sesión.
2. Se marca `loggedIn = true`.
3. Las vistas privadas validan sesión con `redirectIfLoggedOut()`.
4. Cada operación modifica `balance`, `movements`, `contacts` o `flashMessage`.
5. Al volver al menú, se consume `flashMessage` y se actualiza el saldo.

## Consideraciones importantes

- No existe backend real.
- No hay autenticación segura real.
- Los datos viven en `localStorage`.
- El proyecto funciona como simulación frontend.
- Si se quiere reiniciar el estado, basta con limpiar `localStorage`.

## Cómo ejecutar el proyecto

Opciones simples:

### Opción 1

Abrir:

- `EjercicioP/index.html`

### Opción 2

Servir el proyecto con un servidor local, por ejemplo con VS Code Live Server.

Recomendado porque:

- evita problemas de rutas
- hace más cómoda la navegación entre páginas

## Posibles mejoras futuras

- migrar a componentes reales con framework
- separar capa de datos en módulos ES
- añadir pruebas de interacción
- conectar con backend/API real
- tipar la lógica con TypeScript
- centralizar rutas y configuración
- persistir datos por usuario
- internacionalización y accesibilidad más profunda

## Créditos

Proyecto de interfaz tipo billetera digital desarrollado como ejercicio frontend, con énfasis en:

- arquitectura simple pero modular
- experiencia responsive
- reutilización de utilidades
- mantenimiento visual por vista

