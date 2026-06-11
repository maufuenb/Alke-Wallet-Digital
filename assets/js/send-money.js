function renderContactOptions() {
  const select = $("#contactSelect");
  const chips = $("[data-contact-chips]");
  const state = getWalletState();
  const transferCounts = {};

  if (select.length) {
    select.html('<option value="">Selecciona un contacto</option>');
    $.each(state.contacts, (_, contact) => {
      const option = $("<option></option>")
        .val(contact.id)
        .attr("title", `${contact.name} - ${contact.alias}`)
        .text(`${contact.name} · ${contact.alias}`);
      select.append(option);
    });

    enhanceModalSelects();
    syncCustomSelect(select);
  }

  if (chips.length) {
    $.each(state.movements, (_, movement) => {
      if (movement.type !== "debit") {
        return;
      }

      if (movement.contactId) {
        transferCounts[movement.contactId] = (transferCounts[movement.contactId] || 0) + 1;
        return;
      }

      $.each(state.contacts, (_, contact) => {
        if (movement.title === `Transferencia a ${contact.name}`) {
          transferCounts[contact.id] = (transferCounts[contact.id] || 0) + 1;
        }
      });
    });

    chips.empty();
    $.each(state.contacts, (_, contact) => {
      if ((transferCounts[contact.id] || 0) < 2) {
        return;
      }

      const chip = $("<span></span>")
        .addClass("badge rounded-pill bg-light text-dark border me-2 mb-2 p-2 contact-chip")
        .attr("data-contact-id", contact.id)
        .text(contact.name);
      chips.append(chip);
    });

    if (!chips.children().length) {
      chips.append('<p class="text-muted mb-0">Todavía no tienes contactos frecuentes.</p>');
    }
  }
}

function initSendMoneyPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const existingContactModalElement = $("#existingContactModal");
  const existingContactModal = existingContactModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(existingContactModalElement[0])
    : null;
  const amountModalElement = $("#transferAmountModal");
  const amountModal = amountModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(amountModalElement[0])
    : null;
  const contactModalElement = $("#newContactModal");
  const contactModal = contactModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(contactModalElement[0])
    : null;
  const contactForm = $("#newContactForm");
  const transferForm = $("#transferForm");
  const contactMessage = $("#contactMessage");
  const transferMessage = $("#transferMessage");
  const cancelButton = $("#cancelContactForm");
  const existingContactTrigger = $("[data-transfer-step='existing']");
  const changeContactButton = $("[data-contact-change]");
  const contactSelect = $("#contactSelect");
  const transferAmount = $("#transferAmount");
  const availableBalance = $("[data-available-balance]");
  const contactChips = $("[data-contact-chips]");
  const contactSearch = $("#contactSearch");
  const contactAutocomplete = $("#contactAutocomplete");
  const contactName = $("#contactName");
  const contactCbu = $("#contactCbu");
  const contactAlias = $("#contactAlias");
  const contactBank = $("#contactBank");
  const selectedContactLabel = $("[data-selected-contact-label]");
  const state = getWalletState();

  renderContactOptions();
  setBalanceValue(availableBalance, formatCurrency(state.balance));

  function updateSelectedContactLabel(contact) {
    if (!contact) {
      selectedContactLabel.text("Sin contacto");
      return;
    }

    selectedContactLabel.text(`${contact.name} · ${contact.alias}`);
  }

  function openExistingContactStep() {
    existingContactTrigger.addClass("active");

    if (contactModalElement.hasClass("show")) {
      transitionBetweenModals(contactModalElement, existingContactModalElement, () => contactSearch.trigger("focus"));
      return;
    }

    if (amountModalElement.hasClass("show")) {
      transitionBetweenModals(amountModalElement, existingContactModalElement, () => contactSearch.trigger("focus"));
      return;
    }

    transitionBetweenModals(null, existingContactModalElement, () => contactSearch.trigger("focus"));
  }

  function openAmountStep(contact) {
    updateSelectedContactLabel(contact);

    if (existingContactModalElement.hasClass("show")) {
      transitionBetweenModals(existingContactModalElement, amountModalElement, () => transferAmount.trigger("focus"));
      return;
    }

    transitionBetweenModals(null, amountModalElement, () => transferAmount.trigger("focus"));
  }

  function resetTransferFlow() {
    transferForm.trigger("reset");
    hideAlert(transferMessage);
    contactSelect.val("");
    contactChips.find(".contact-chip").removeClass("active");
    existingContactTrigger.removeClass("active");
    updateSelectedContactLabel(null);
  }

  function selectContact(contactId) {
    const currentState = getWalletState();
    const contact = $.grep(currentState.contacts, (item) => item.id === contactId)[0];

    if (!contact) {
      updateSelectedContactLabel(null);
      return;
    }

    contactSelect.val(contact.id);
    contactSearch.val(contact.name);
    contactChips.find(".contact-chip").removeClass("active");
    contactChips.find(`[data-contact-id="${contact.id}"]`).addClass("active");
    openAmountStep(contact);
  }

  function hideAutocomplete() {
    contactAutocomplete.addClass("d-none").empty();
  }

  function renderAutocompleteResults(query) {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    const currentState = getWalletState();

    contactAutocomplete.empty();

    if (!normalizedQuery) {
      hideAutocomplete();
      return;
    }

    const matches = $.grep(currentState.contacts, (contact) => {
      const haystack = `${contact.name} ${contact.alias} ${contact.bank}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    }).slice(0, 5);

    if (!matches.length) {
      contactAutocomplete
        .removeClass("d-none")
        .append('<div class="list-group-item text-muted">No se encontraron contactos.</div>');
      return;
    }

    $.each(matches, (_, contact) => {
      const item = $("<button></button>")
        .attr({
          type: "button",
          role: "option"
        })
        .addClass("list-group-item list-group-item-action")
        .attr("data-contact-id", contact.id)
        .html(`
          <strong>${contact.name}</strong>
          <div class="small text-muted">${contact.alias} · ${contact.bank}</div>
        `);
      contactAutocomplete.append(item);
    });

    contactAutocomplete.removeClass("d-none");
  }

  if (cancelButton.length) {
    cancelButton.on("click", () => {
      contactForm.trigger("reset");
      hideAlert(contactMessage);
      if (contactModal) {
        contactModal.hide();
      }
    });
  }

  if (contactForm.length) {
    contactForm.on("submit", (event) => {
      event.preventDefault();
      hideAlert(contactMessage);

      const name = String(contactName.val() || "").trim();
      const cbu = String(contactCbu.val() || "").trim();
      const alias = String(contactAlias.val() || "").trim();
      const bank = String(contactBank.val() || "").trim();

      if (!name || !cbu || !alias || !bank) {
        showAlert(contactMessage, "Completa todos los datos del nuevo contacto.", "danger");
        return;
      }

      if (!/^\d{22}$/.test(cbu)) {
        showAlert(contactMessage, "El CBU debe tener 22 números.", "danger");
        return;
      }

      updateWalletState((walletState) => {
        walletState.contacts.push({
          id: `c-${Date.now()}`,
          name,
          cbu,
          alias,
          bank
        });
      });

      contactForm.trigger("reset");
      renderContactOptions();
      contactSearch.val(name);
      renderAutocompleteResults(name);
      showAlert(contactMessage, "Contacto agregado correctamente.", "success");
      if (contactModal) {
        contactModal.hide();
      }
      openExistingContactStep();
    });
  }

  if (contactChips.length) {
    contactChips.on("click", ".contact-chip", function () {
      selectContact($(this).data("contact-id"));
    });
  }

  if (existingContactTrigger.length) {
    existingContactTrigger.on("click", () => {
      openExistingContactStep();
    });
  }

  if (changeContactButton.length) {
    changeContactButton.on("click", () => {
      if (amountModal) {
        amountModal.hide();
      }
      openExistingContactStep();
    });
  }

  contactSelect.on("change", function () {
    syncCustomSelect(this);
    const selectedId = $(this).val();

    if (!selectedId) {
      updateSelectedContactLabel(null);
      return;
    }

    selectContact(selectedId);
  });

  if (contactSearch.length) {
    contactSearch.on("input", function () {
      renderAutocompleteResults($(this).val());
    });

    contactSearch.on("keydown", function (event) {
      if (event.key === "Escape") {
        hideAutocomplete();
      }
    });
  }

  if (contactAutocomplete.length) {
    contactAutocomplete.on("click", "[data-contact-id]", function () {
      const contactId = $(this).data("contact-id");
      selectContact(contactId);
      hideAutocomplete();
    });
  }

  $(document).on("click.sendMoneyAutocomplete", function (event) {
    if (!$(event.target).closest(".autocomplete-box").length) {
      hideAutocomplete();
    }
  });

  existingContactModalElement.on("hidden.bs.modal", function () {
    existingContactTrigger.removeClass("active");
  });

  amountModalElement.on("hidden.bs.modal", function () {
    hideAlert(transferMessage);
  });

  if (transferForm.length) {
    transferForm.on("submit", (event) => {
      event.preventDefault();
      hideAlert(transferMessage);

      const contactId = contactSelect.val();
      const amount = Number(transferAmount.val());
      const currentState = getWalletState();
      const contact = $.grep(currentState.contacts, (item) => item.id === contactId)[0];

      if (!contact) {
        showAlert(transferMessage, "Selecciona un contacto para continuar.", "danger");
        return;
      }

      if (!amount || amount <= 0) {
        showAlert(transferMessage, "Ingresa un monto válido para enviar.", "danger");
        return;
      }

      if (amount > currentState.balance) {
        showAlert(transferMessage, "No tienes saldo suficiente para realizar esta transferencia.", "danger");
        return;
      }

      updateWalletState((walletState) => {
        walletState.balance -= amount;
        walletState.flashMessage = `Enviaste ${formatCurrency(amount)} a ${contact.name}.`;
        walletState.movements.unshift({
          id: `m-${Date.now()}`,
          contactId: contact.id,
          title: `Transferencia a ${contact.name}`,
          description: `Alias: ${contact.alias} - Banco: ${contact.bank}`,
          amount,
          type: "debit",
          date: new Date().toISOString()
        });
      });

      showAlert(transferMessage, `Transferencia realizada a ${contact.name}. Redirigiendo al menú principal.`, "success");
      if (amountModal) {
        amountModal.hide();
      }
      resetTransferFlow();
      navigateTo("menu.html", 1000);
    });
  }
}
