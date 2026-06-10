const WALLET_KEY = "walletAppState";
const WALLET_DEFAULTS = {
  loggedIn: false,
  user: {
    email: "usuario@wallet.com",
    password: "1234"
  },
  balance: 245000,
  flashMessage: "",
  depositSources: {
    giftCards: [
      { id: "gift-01", brand: "GiftCard Regalo", code: "REGALO-ALKE-2026", pin: "1025", amount: 15000 },
      { id: "gift-02", brand: "GiftCard Cumple", code: "CUMPLE-WALLET-500", pin: "7781", amount: 25000 }
    ],
    banks: [
      {
        id: "bank-01",
        name: "Banco Estado",
        accountMask: "**** 1842",
        eta: "Se acredita en minutos",
        testCard: {
          number: "4532 1234 5678 1842",
          holder: "ANA PEREZ",
          expiry: "12/28",
          cvv: "321"
        },
        transferAccount: {
          holder: "ALKE WALLET SPA",
          rut: "76.543.210-9",
          accountType: "Cuenta Vista",
          accountNumber: "00124577891",
          email: "abonos@alkewallet.cl"
        }
      },
      {
        id: "bank-02",
        name: "Banco de Chile",
        accountMask: "**** 5508",
        eta: "Normalmente dentro de 1 hora",
        testCard: {
          number: "4720 8765 4400 5508",
          holder: "LUIS SOTO",
          expiry: "09/27",
          cvv: "456"
        },
        transferAccount: {
          holder: "ALKE WALLET SPA",
          rut: "76.543.210-9",
          accountType: "Cuenta Corriente",
          accountNumber: "00458963214",
          email: "transferencias@alkewallet.cl"
        }
      },
      {
        id: "bank-03",
        name: "Santander",
        accountMask: "**** 9114",
        eta: "Disponible el mismo día",
        testCard: {
          number: "4987 0001 1200 9114",
          holder: "MARIA LOPEZ",
          expiry: "03/29",
          cvv: "889"
        },
        transferAccount: {
          holder: "ALKE WALLET SPA",
          rut: "76.543.210-9",
          accountType: "Cuenta Corriente",
          accountNumber: "00874211563",
          email: "ingresos@alkewallet.cl"
        }
      }
    ]
  },
  withdrawalSources: {
    bankAccounts: [
      {
        id: "withdraw-bank-01",
        bank: "Banco Estado",
        accountType: "Cuenta RUT",
        accountMask: "**** 4312",
        holder: "Tu cuenta principal",
        eta: "Disponible en minutos"
      },
      {
        id: "withdraw-bank-02",
        bank: "Banco de Chile",
        accountType: "Cuenta Corriente",
        accountMask: "**** 8804",
        holder: "Tu cuenta secundaria",
        eta: "Se refleja dentro de 1 hora"
      }
    ]
  },
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
      category: "deposit",
      date: "2026-05-29T09:30:00"
    },
    {
      id: "m2",
      title: "Transferencia a Ana Perez",
      description: "Envío realizado desde contactos frecuentes",
      amount: 15000,
      type: "debit",
      category: "transfer",
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

  const parsedState = JSON.parse(saved);
  const mergedState = $.extend(true, cloneWalletDefaults(), parsedState);
  mergedState.withdrawalSources = $.extend(true, {}, cloneWalletDefaults().withdrawalSources);

  if (JSON.stringify(parsedState) !== JSON.stringify(mergedState)) {
    saveWalletState(mergedState);
  }

  return mergedState;
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
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateText) {
  const date = new Date(dateText);
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date).replace(",", " -");
}

function getMovementCategory(movement) {
  if (movement.category) {
    return movement.category;
  }

  if (movement.type === "credit") {
    return "deposit";
  }

  if (movement.contactId || String(movement.title || "").toLowerCase().includes("transferencia")) {
    return "transfer";
  }

  return "withdrawal";
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

function enhanceModalSelects(scope = document) {
  $(scope).find(".modal-content select.form-select").each(function () {
    const select = $(this);

    if (!select.attr("data-custom-select-id")) {
      select.attr("data-custom-select-id", `custom-select-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
    }

    let wrapper = select.next(".app-select");

    if (!wrapper.length) {
      wrapper = $(`
        <div class="app-select dropdown">
          <button
            type="button"
            class="btn app-select__trigger dropdown-toggle"
            data-bs-toggle="dropdown"
            data-bs-display="static"
            aria-expanded="false">
            <span class="app-select__label"></span>
          </button>
          <div class="dropdown-menu app-select__menu"></div>
        </div>
      `);

      select.after(wrapper);
      select.addClass("app-select__native");
    }

    syncCustomSelect(select);
  });
}

function syncCustomSelect(selectElement) {
  const select = $(selectElement);
  const wrapper = select.next(".app-select");

  if (!wrapper.length) {
    return;
  }

  const trigger = wrapper.find(".app-select__trigger");
  const label = wrapper.find(".app-select__label");
  const menu = wrapper.find(".app-select__menu");
  const selectedOption = select.find("option:selected");
  const selectedText = String(selectedOption.text() || "").trim() || "Selecciona una opción";

  label.text(selectedText);
  trigger.attr("title", selectedText);
  menu.empty();

  select.find("option").each(function () {
    const option = $(this);
    const optionValue = option.val();
    const optionText = String(option.text() || "").trim();
    const item = $("<button></button>")
      .attr({
        type: "button",
        "data-option-value": optionValue,
        title: optionText
      })
      .addClass("dropdown-item app-select__item")
      .text(optionText);

    if (option.is(":disabled")) {
      item.prop("disabled", true).addClass("disabled");
    }

    if (optionValue === select.val()) {
      item.addClass("active");
    }

    item.on("click", function () {
      select.val(optionValue).trigger("change");
    });

    menu.append(item);
  });
}
