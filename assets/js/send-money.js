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
        .text(`${contact.name} - ${contact.alias}`);
      select.append(option);
    });
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

  const contactModalElement = $("#newContactModal");
  const contactModal = contactModalElement.length ? bootstrap.Modal.getOrCreateInstance(contactModalElement[0]) : null;
  const contactForm = $("#newContactForm");
  const transferForm = $("#transferForm");
  const contactMessage = $("#contactMessage");
  const transferMessage = $("#transferMessage");
  const cancelButton = $("#cancelContactForm");
  const contactSelect = $("#contactSelect");
  const transferAmount = $("#transferAmount");
  const availableBalance = $("[data-available-balance]");
  const contactChips = $("[data-contact-chips]");
  const contactName = $("#contactName");
  const contactCbu = $("#contactCbu");
  const contactAlias = $("#contactAlias");
  const contactBank = $("#contactBank");
  const state = getWalletState();

  renderContactOptions();
  availableBalance.text(formatCurrency(state.balance));

  function selectContact(contactId) {
    contactSelect.val(contactId);
    contactChips.find(".contact-chip").removeClass("active");
    contactChips.find(`[data-contact-id="${contactId}"]`).addClass("active");
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

      updateWalletState((state) => {
        state.contacts.push({
          id: `c-${Date.now()}`,
          name,
          cbu,
          alias,
          bank
        });
      });

      contactForm.trigger("reset");
      renderContactOptions();
      selectContact($("#contactSelect").val());
      showAlert(contactMessage, "Contacto agregado correctamente.", "success");
      if (contactModal) {
        contactModal.hide();
      }
    });
  }

  if (contactChips.length) {
    contactChips.on("click", ".contact-chip", function () {
      selectContact($(this).data("contact-id"));
    });
  }

  contactSelect.on("change", function () {
    selectContact($(this).val());
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
      navigateTo("menu.html", 1000);
    });
  }
}
