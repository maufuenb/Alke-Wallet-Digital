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
  const bootstrapBundleSrc = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";

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
  const currentNavItem = appNavItems.find((item) => item.page === page);
  const currentPageLabel = currentNavItem ? currentNavItem.label : "Billetera Digital";

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

  function ensureBootstrapBundle() {
    const hasBootstrapBundle = document.querySelector(`script[src="${bootstrapBundleSrc}"]`);

    if (hasBootstrapBundle || window.bootstrap) {
      return;
    }

    const script = document.createElement("script");
    script.src = bootstrapBundleSrc;
    document.body.appendChild(script);
  }

  function getNavMarkup() {
    return appNavItems.map((item) => {
      const buttonClass = item.page === page ? "btn btn-primary text-start" : "btn btn-outline-primary text-start";
      return `
        <a href="${item.href}" class="${buttonClass}" data-nav-link="${item.page}">
          <span class="d-inline-flex align-items-center gap-2">
            <i class="fa-solid ${item.icon}"></i>
            <span>${item.label}</span>
          </span>
        </a>
      `;
    }).join("");
  }

  function getMobileNavMarkup() {
    return appNavItems.map((item) => {
      const linkClass = item.page === page ? "app-mobile-nav__link active" : "app-mobile-nav__link";
      return `
        <a href="${item.href}" class="${linkClass}" data-mobile-nav-link="${item.page}">
          <i class="fa-solid ${item.icon}"></i>
          <span>${item.label}</span>
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

  function getTopbarCopy() {
    return `
      <div class="app-topbar__copy">
        <span class="app-topbar__eyebrow">Panel digital</span>
        <strong class="app-topbar__title">${currentPageLabel}</strong>
      </div>
    `;
  }

  function getTopbarMeta() {
    return `
      <div class="app-topbar__meta">
        <span class="app-topbar__pill app-topbar__pill--user">
          <i class="fa-regular fa-user"></i>
          Usuario demo
        </span>
      </div>
    `;
  }

  function getMobileUserMenu() {
    return `
      <div class="dropdown d-lg-none">
        <button
          type="button"
          class="btn btn-outline-primary app-mobile-user-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          aria-label="Abrir opciones de usuario">
          <i class="fa-regular fa-user"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-end app-mobile-user-menu">
          <span class="dropdown-item-text small text-muted">Usuario demo</span>
          <div class="dropdown-divider"></div>
          <a href="login.html" class="dropdown-item app-mobile-user-menu__item text-danger" data-logout>
            <i class="fa-solid fa-right-from-bracket"></i>
            <span>Cerrar sesión</span>
          </a>
        </div>
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
    ensureBootstrapBundle();
    body.className = "page-bg d-flex flex-column";
    root.innerHTML = `
      <div class="auth-shell d-flex flex-column min-vh-100">
        <header class="bg-white border-bottom">
          <div class="container py-3 d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              ${getBrandMarkup()}
            </div>
            <span class="text-muted small d-none d-sm-inline">Acceso seguro</span>
            <button type="button" class="btn btn-outline-primary btn-sm d-sm-none auth-login-toggle" data-auth-login-toggle>
              Ingresar
            </button>
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

    const authLoginToggle = root.querySelector("[data-auth-login-toggle]");
    const authLoginPanel = root.querySelector("[data-auth-login-panel]");
    const authLoginClose = root.querySelector("[data-auth-login-close]");
    const authMobileQuery = window.matchMedia("(max-width: 575.98px)");

    function openAuthLoginModal() {
      body.classList.add("auth-login-open");

      window.setTimeout(() => {
        const firstField = authLoginPanel?.querySelector("#email");
        if (firstField) {
          firstField.focus();
        }
      }, 120);
    }

    function closeAuthLoginModal() {
      body.classList.remove("auth-login-open");
    }

    if (authLoginToggle && authLoginPanel) {
      authLoginToggle.addEventListener("click", () => {
        if (!authMobileQuery.matches) {
          return;
        }

        openAuthLoginModal();
      });

      authLoginPanel.addEventListener("click", (event) => {
        if (!authMobileQuery.matches) {
          return;
        }

        if (event.target === authLoginPanel) {
          closeAuthLoginModal();
        }
      });
    }

    if (authLoginClose) {
      authLoginClose.addEventListener("click", () => {
        closeAuthLoginModal();
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && body.classList.contains("auth-login-open")) {
        closeAuthLoginModal();
      }
    });

    if (authMobileQuery.addEventListener) {
      authMobileQuery.addEventListener("change", (event) => {
        if (!event.matches) {
          closeAuthLoginModal();
        }
      });
    }
  }

  function renderAppLayout() {
    ensureFontAwesome();
    ensureBootstrapBundle();
    body.className = "page-bg";
    root.innerHTML = `
      <div class="app-shell d-flex flex-column">
        <header class="app-header bg-white border-bottom">
          <div class="container-fluid py-3 d-flex justify-content-between align-items-center gap-3">
            <div class="app-header__side app-header__side--left d-flex align-items-center gap-3 min-w-0">
              <div class="d-flex align-items-center gap-2 app-topbar-brand">
                ${getBrandMarkup()}
              </div>
            </div>
            <div class="app-header__center min-w-0">
              ${getTopbarCopy()}
            </div>
            <div class="app-header__side app-header__side--right d-flex align-items-center justify-content-end">
            <div class="app-topbar__status d-flex d-lg-none">
              ${getMobileUserMenu()}
            </div>
            <div class="app-topbar__status d-none d-lg-flex">
              ${getTopbarMeta()}
            </div>
            </div>
          </div>
        </header>

        <div class="app-body d-lg-flex flex-grow-1">
          <input type="checkbox" id="sidebar-toggle" class="sidebar-toggle">
          <aside class="sidebar bg-white border-end p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h5 mb-0 text-primary">Navegación</h2>
              <label for="sidebar-toggle" class="btn btn-sm btn-outline-secondary d-lg-none" aria-label="Cerrar menú">
                <i class="fa-solid fa-xmark"></i>
              </label>
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
            <main class="container py-4 py-md-5 flex-grow-1">
              ${content}
            </main>
          </div>
        </div>

        <footer class="app-footer bg-white border-top position-sticky bottom-0">
          <div class="container-fluid py-3">
            <div class="app-footer__desktop text-center text-muted small d-none d-lg-block">
              Billetera Digital
            </div>
            <nav class="app-mobile-nav d-lg-none" aria-label="Navegación principal móvil">
              ${getMobileNavMarkup()}
            </nav>
          </div>
        </footer>
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
