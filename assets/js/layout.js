(function () {
  const body = document.body;

  if (!body) {
    return;
  }

  const page = body.dataset.page || "";
  const layout = body.dataset.layout || "";
  const title = body.dataset.title || document.title;
  const root = document.querySelector("[data-layout-root]");
  const contentTemplate = document.querySelector("[data-page-content]");
  const extraTemplate = document.querySelector("[data-page-extra]");
  const fontAwesomeHref = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";

  document.title = title;

  if (!root || !contentTemplate) {
    return;
  }

  const content = contentTemplate.innerHTML.trim();
  const extraContent = extraTemplate ? extraTemplate.innerHTML.trim() : "";

  const appNavItems = [
    { href: "menu.html", page: "menu", label: "Menú Principal", icon: "fa-house" },
    { href: "deposit.html", page: "deposit", label: "Depositar", icon: "fa-money-bill-trend-up" },
    { href: "retirar.html", page: "retirar", label: "Retirar", icon: "fa-money-bill-wave" },
    { href: "sendMoney.html", page: "send-money", label: "Enviar Dinero", icon: "fa-paper-plane" },
    { href: "transactions.html", page: "transactions", label: "Movimientos", icon: "fa-clock-rotate-left" }
  ];

  function ensureFontAwesome() {
    const hasFontAwesome = document.querySelector(`link[href="${fontAwesomeHref}"]`);

    if (hasFontAwesome) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontAwesomeHref;
    document.head.appendChild(link);
  }

  function getNavMarkup() {
    return appNavItems.map((item) => {
      const buttonClass = item.page === page ? "btn btn-primary text-start" : "btn btn-outline-primary text-start";
      return `
        <a href="${item.href}" class="${buttonClass}">
          <span class="d-inline-flex align-items-center gap-2">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </span>
        </a>
      `;
    }).join("");
  }

  function getBrandMarkup() {
    return `
      <div class="brand-mark" aria-hidden="true">
        <span class="brand-mark__node brand-mark__node--top"></span>
        <span class="brand-mark__node brand-mark__node--left"></span>
        <span class="brand-mark__node brand-mark__node--right"></span>
        <span class="brand-mark__flow"></span>
      </div>
      <div>
        <h1 class="h4 mb-0 text-primary">Alke Wallet</h1>
        <p class="mb-0 small text-muted">Billetera Digital</p>
      </div>
    `;
  }

  function syncAppShellOffsets() {
    const header = root.querySelector(".app-header");
    const footer = root.querySelector(".app-footer");

    if (!header || !footer) {
      return;
    }

    document.documentElement.style.setProperty("--app-header-height", `${header.offsetHeight}px`);
    document.documentElement.style.setProperty("--app-footer-height", `${footer.offsetHeight}px`);
  }

  function renderAuthLayout() {
    ensureFontAwesome();
    body.className = "page-bg d-flex flex-column";
    root.innerHTML = `
      <div class="auth-shell d-flex flex-column min-vh-100">
        <header class="bg-white border-bottom">
          <div class="container py-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              ${getBrandMarkup()}
            </div>
            <span class="text-muted small">Acceso seguro</span>
          </div>
        </header>

        <main class="container flex-grow-1 d-flex align-items-center justify-content-center py-4">
          ${content}
        </main>

        <footer class="bg-white border-top mt-auto">
          <div class="container py-3 text-center text-muted small">
            Billetera Digital - Interfaz visual de ejemplo
          </div>
        </footer>
      </div>

      ${extraContent}
    `;
  }

  function renderAppLayout() {
    ensureFontAwesome();
    body.className = "page-bg";
    root.innerHTML = `
      <div class="app-shell d-lg-flex">
        <input type="checkbox" id="sidebar-toggle" class="sidebar-toggle">
        <aside class="sidebar bg-white border-end p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="h5 mb-0 text-primary">Navegación</h2>
            <label for="sidebar-toggle" class="btn btn-sm btn-outline-secondary d-lg-none">X</label>
          </div>
          <nav class="nav flex-column gap-2">
            ${getNavMarkup()}
            <a href="login.html" class="btn btn-outline-secondary text-start text-danger mt-3" data-logout>
              <span class="d-inline-flex align-items-center gap-2">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Cerrar sesión</span>
              </span>
            </a>
          </nav>
        </aside>
        <label for="sidebar-toggle" class="sidebar-overlay"></label>

        <div class="content-column flex-grow-1 d-flex flex-column">
          <header class="app-header bg-white border-bottom">
            <div class="container-fluid py-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                ${getBrandMarkup()}
              </div>
              <label for="sidebar-toggle" class="btn btn-outline-primary d-lg-none mb-0">☰</label>
            </div>
          </header>

          <main class="container py-4 py-md-5 flex-grow-1">
            ${content}
          </main>

          <footer class="app-footer bg-white border-top position-sticky bottom-0">
            <div class="container-fluid py-3 text-center text-muted small">
              Billetera Digital
            </div>
          </footer>
        </div>
      </div>

      ${extraContent}
    `;
  }

  if (layout === "auth") {
    renderAuthLayout();
    contentTemplate.remove();
    if (extraTemplate) {
      extraTemplate.remove();
    }
    return;
  }

  if (layout === "app") {
    renderAppLayout();
    contentTemplate.remove();
    if (extraTemplate) {
      extraTemplate.remove();
    }
    syncAppShellOffsets();
    window.addEventListener("resize", syncAppShellOffsets);
  }
})();
