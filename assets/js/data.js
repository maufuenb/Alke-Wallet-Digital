const WALLET_KEY = "walletAppState";
const WALLET_DEFAULTS = {
  loggedIn: false,
  user: {
    email: "usuario@wallet.com",
    password: "1234"
  },
  balance: 245000,
  flashMessage: "",
  contacts: [
    { id: "1", name: "Ana Perez", cbu: "2850590940090418135201", alias: "ana.perez", bank: "Banco Nación" },
    { id: "2", name: "Luis Soto", cbu: "2850590940090418135202", alias: "luis.soto", bank: "Banco Provincia" },
    { id: "3", name: "Maria Lopez", cbu: "2850590940090418135203", alias: "maria.lopez", bank: "Banco Santander" }
  ],
  movements: [
    {
      id: "m1",
      title: "Depósito en efectivo",
      description: "Saldo acreditado en tu billetera",
      amount: 80000,
      type: "credit",
      date: "2026-05-29T09:30:00"
    },
    {
      id: "m2",
      title: "Transferencia a Ana Perez",
      description: "Envío realizado desde contactos frecuentes",
      amount: 15000,
      type: "debit",
      date: "2026-05-28T18:10:00"
    }
  ]
};

function cloneWalletDefaults() {
  return $.extend(true, {}, WALLET_DEFAULTS);
}

function getWalletState() {
  const saved = localStorage.getItem(WALLET_KEY);

  if (!saved) {
    const defaults = cloneWalletDefaults();
    saveWalletState(defaults);
    return defaults;
  }

  return JSON.parse(saved);
}

function saveWalletState(state) {
  localStorage.setItem(WALLET_KEY, JSON.stringify(state));
}

function updateWalletState(callback) {
  const state = getWalletState();
  callback(state);
  saveWalletState(state);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateText) {
  const date = new Date(dateText);
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date).replace(",", " -");
}

function showAlert(element, message, type) {
  const container = getAlertContainer();
  const toastId = `toast-${Date.now()}`;
  const toast = $("<div></div>");
  const target = element ? $(element) : $();

  hideAlert(target);

  toast
    .addClass(`alert alert-${type} floating-alert mb-2`)
    .text(message)
    .attr("data-toast-id", toastId)
    .hide();
  container.append(toast);

  if (target.length) {
    target.attr("data-toast-id", toastId);
  }

  toast
    .stop(true, true)
    .fadeIn(200)
    .delay(3000)
    .fadeOut(200, function () {
      $(this).remove();
    });
}

function hideAlert(element) {
  const target = element ? $(element) : $();

  if (!target.length || !target.attr("data-toast-id")) {
    return;
  }

  const toastId = target.attr("data-toast-id");
  $(`[data-toast-id="${toastId}"]`).stop(true, true).remove();

  target.attr("data-toast-id", "");
}

function setFlashMessage(message) {
  updateWalletState((state) => {
    state.flashMessage = message;
  });
}

function takeFlashMessage() {
  const state = getWalletState();
  const message = state.flashMessage;
  state.flashMessage = "";
  saveWalletState(state);
  return message;
}

function redirectIfLoggedOut() {
  const state = getWalletState();
  if (!state.loggedIn) {
    navigateTo("login.html");
    return true;
  }
  return false;
}

function bindLogoutLinks() {
  $("[data-logout]").on("click", () => {
    updateWalletState((state) => {
      state.loggedIn = false;
      state.flashMessage = "";
    });
  });
}

function getAlertContainer() {
  let container = $(".floating-alert-container");

  if (!container.length) {
    container = $("<div></div>").addClass("floating-alert-container");
    $("body").append(container);
  }

  return container;
}

function navigateTo(url, delay = 0) {
  setTimeout(() => {
    $(location).attr("href", url);
  }, delay);
}
