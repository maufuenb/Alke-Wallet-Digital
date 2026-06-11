function initDepositPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const bankMethodModalElement = $("#depositBankMethodModal");
  const debitModalElement = $("#depositDebitModal");
  const transferModalElement = $("#depositTransferModal");
  const giftModalElement = $("#depositGiftCardModal");
  const bankMethodModal = bankMethodModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(bankMethodModalElement[0])
    : null;
  const debitModal = debitModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(debitModalElement[0])
    : null;
  const transferModal = transferModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(transferModalElement[0])
    : null;
  const giftModal = giftModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(giftModalElement[0])
    : null;

  const debitForm = $("#depositDebitForm");
  const transferForm = $("#depositTransferForm");
  const giftForm = $("#depositGiftCardForm");

  const debitMessage = $("#debitDepositMessage");
  const transferMessage = $("#transferDepositMessage");
  const giftMessage = $("#giftDepositMessage");

  const debitResult = $("#debitDepositResult");
  const transferResult = $("#transferDepositResult");
  const giftResult = $("#giftDepositSummaryText");

  const debitBankSource = $("#debitBankSource");
  const debitCardNumber = $("#debitCardNumber");
  const debitCardHolder = $("#debitCardHolder");
  const debitCardExpiry = $("#debitCardExpiry");
  const debitCardCvv = $("#debitCardCvv");
  const debitAmount = $("#debitAmount");

  const transferBankSource = $("#transferBankSource");
  const transferReference = $("#transferReference");
  const transferAmount = $("#transferAmount");

  const giftCardSource = $("#giftCardSource");
  const giftCardCode = $("#giftCardCode");
  const giftCardPin = $("#giftCardPin");
  const giftAmount = $("#giftAmount");

  const debitBankSourceHelp = $("#debitBankSourceHelp");
  const debitCardNumberHint = $("#debitCardNumberHint");
  const debitCardHolderHint = $("#debitCardHolderHint");
  const debitCardExpiryHint = $("#debitCardExpiryHint");
  const debitCardCvvHint = $("#debitCardCvvHint");
  const debitDepositSummary = $("#debitDepositSummary");

  const transferBankSourceHelp = $("#transferBankSourceHelp");
  const transferHolderHint = $("#transferHolderHint");
  const transferRutHint = $("#transferRutHint");
  const transferAccountTypeHint = $("#transferAccountTypeHint");
  const transferAccountNumberHint = $("#transferAccountNumberHint");
  const transferEmailHint = $("#transferEmailHint");
  const transferReferenceHint = $("#transferReferenceHint");
  const transferDepositSummary = $("#transferDepositSummary");

  const giftCardCodeHint = $("#giftCardCodeHint");
  const giftCardPinHint = $("#giftCardPinHint");
  const giftDepositSummary = $("#giftDepositSummary");
  const balanceLabel = $("[data-current-balance]");
  const state = getWalletState();

  balanceLabel.text(formatCurrency(state.balance));

  function getBanks() {
    return getWalletState().depositSources?.banks || [];
  }

  function getGiftCards() {
    return getWalletState().depositSources?.giftCards || [];
  }

  function getShortMask(mask) {
    return String(mask || "").replace(/[*\s]/g, "");
  }

  function renderSourceOptions() {
    const banks = getBanks();
    const giftCards = getGiftCards();

    debitBankSource.html('<option value="">Selecciona un banco</option>');
    transferBankSource.html('<option value="">Selecciona un banco</option>');

    $.each(banks, (_, bank) => {
      const label = `${bank.name} · ${getShortMask(bank.accountMask)}`;
      const fullLabel = `${bank.name} ${bank.accountMask}`;
      debitBankSource.append($("<option></option>").val(bank.id).attr("title", fullLabel).text(label));
      transferBankSource.append($("<option></option>").val(bank.id).attr("title", fullLabel).text(label));
    });

    giftCardSource.html('<option value="">Selecciona una gift card</option>');
    $.each(giftCards, (_, card) => {
      const label = `${card.brand} · ${formatCurrency(card.amount)}`;
      const fullLabel = `${card.brand} · ${card.code}`;
      giftCardSource.append(
        $("<option></option>")
          .val(card.id)
          .attr("title", fullLabel)
          .text(label)
      );
    });

    enhanceModalSelects();
    syncCustomSelect(debitBankSource);
    syncCustomSelect(transferBankSource);
    syncCustomSelect(giftCardSource);
  }

  function resetDebitHints() {
    debitBankSourceHelp.text("Selecciona desde qué banco quieres hacer el cargo.");
    debitCardNumberHint.text("Tarjeta de prueba: selecciona un banco para ver un ejemplo.");
    debitCardHolderHint.text("Titular de prueba: selecciona un banco para ver un ejemplo.");
    debitCardExpiryHint.text("Ejemplo: 12/28");
    debitCardCvvHint.text("Ejemplo: 321");
    debitDepositSummary.text("Haz un cargo desde tu tarjeta de débito para sumarlo al saldo.");
  }

  function resetTransferHints() {
    transferBankSourceHelp.text("Elige el banco de origen para mostrar los datos de abono.");
    transferHolderHint.text("Titular: selecciona un banco para ver el ejemplo.");
    transferRutHint.text("RUT: selecciona un banco para ver el ejemplo.");
    transferAccountTypeHint.text("Tipo de cuenta: selecciona un banco para ver el ejemplo.");
    transferAccountNumberHint.text("Número de cuenta: selecciona un banco para ver el ejemplo.");
    transferEmailHint.text("Correo: selecciona un banco para ver el ejemplo.");
    transferReferenceHint.text("Puedes usar un código simple para simular el comprobante.");
    transferDepositSummary.text("Confirma cuánto transferiste para acreditarlo en tu saldo.");
  }

  function resetGiftHints() {
    giftCardCodeHint.text("Código de prueba: selecciona una gift card para ver el ejemplo.");
    giftCardPinHint.text("PIN de prueba: selecciona una gift card para ver el ejemplo.");
    giftDepositSummary.text("Usa un código de regalo para sumar saldo sin depender de otro banco.");
  }

  function resetDebitFlow() {
    debitForm.trigger("reset");
    hideAlert(debitMessage);
    debitResult.addClass("d-none").text("");
    resetDebitHints();
  }

  function resetTransferFlow() {
    transferForm.trigger("reset");
    hideAlert(transferMessage);
    transferResult.addClass("d-none").text("");
    resetTransferHints();
  }

  function resetGiftFlow() {
    giftForm.trigger("reset");
    hideAlert(giftMessage);
    giftResult.addClass("d-none").text("");
    resetGiftHints();
  }

  function completeDeposit(amount, title, description, flashMessage, summaryText, messageText, messageElement, summaryElement) {
    updateWalletState((walletState) => {
      walletState.balance += amount;
      walletState.flashMessage = flashMessage;
      walletState.movements.unshift({
        id: `m-${Date.now()}`,
        title,
        description,
        amount,
        type: "credit",
        category: "deposit",
        date: new Date().toISOString()
      });
    });

    balanceLabel.text(formatCurrency(getWalletState().balance));
    summaryElement
      .removeClass("d-none text-warning")
      .addClass("text-success")
      .text(summaryText);
    showAlert(messageElement, messageText, "success");
  }

  renderSourceOptions();
  resetDebitFlow();
  resetTransferFlow();
  resetGiftFlow();

  $("[data-bs-target-modal]").on("click", function () {
    const targetId = $(this).attr("data-bs-target-modal");
    const targetElement = document.getElementById(targetId);

    if (!targetElement) {
      return;
    }

    transitionBetweenModals(bankMethodModalElement, targetElement);
  });

  debitBankSource.on("change", function () {
    syncCustomSelect(this);
    const selectedBank = $.grep(getBanks(), (bank) => bank.id === $(this).val())[0];

    if (!selectedBank) {
      resetDebitHints();
      return;
    }

    debitBankSourceHelp.text(`${selectedBank.name}: ${selectedBank.eta}.`);
    debitCardNumberHint.text(`Tarjeta de débito de prueba: ${selectedBank.testCard.number}`);
    debitCardHolderHint.text(`Titular de prueba: ${selectedBank.testCard.holder}`);
    debitCardExpiryHint.text(`Vencimiento de prueba: ${selectedBank.testCard.expiry}`);
    debitCardCvvHint.text(`CVV de prueba: ${selectedBank.testCard.cvv}`);
    debitDepositSummary.text(`Harás un cargo con débito desde ${selectedBank.name} ${selectedBank.accountMask}.`);
  });

  transferBankSource.on("change", function () {
    syncCustomSelect(this);
    const selectedBank = $.grep(getBanks(), (bank) => bank.id === $(this).val())[0];

    if (!selectedBank) {
      resetTransferHints();
      return;
    }

    const transferAccount = selectedBank.transferAccount || {};
    transferBankSourceHelp.text(`${selectedBank.name}: ${selectedBank.eta}.`);
    transferHolderHint.text(`Titular: ${transferAccount.holder || "ALKE WALLET SPA"}`);
    transferRutHint.text(`RUT: ${transferAccount.rut || "76.543.210-9"}`);
    transferAccountTypeHint.text(`Tipo de cuenta: ${transferAccount.accountType || "Cuenta Corriente"}`);
    transferAccountNumberHint.text(`Número de cuenta: ${transferAccount.accountNumber || "0000000000"}`);
    transferEmailHint.text(`Correo: ${transferAccount.email || "abonos@alkewallet.cl"}`);
    transferReferenceHint.text(`Puedes usar un comprobante simple, por ejemplo: TRX-${selectedBank.id.toUpperCase()}.`);
    transferDepositSummary.text(`Confirma la transferencia hecha desde ${selectedBank.name} para acreditarla en tu saldo.`);
  });

  giftCardSource.on("change", function () {
    syncCustomSelect(this);
    const selectedCard = $.grep(getGiftCards(), (card) => card.id === $(this).val())[0];

    if (!selectedCard) {
      giftAmount.val("");
      resetGiftHints();
      return;
    }

    giftAmount.val(selectedCard.amount);
    giftCardCodeHint.text(`Código de prueba: ${selectedCard.code}`);
    giftCardPinHint.text(`PIN de prueba: ${selectedCard.pin}`);
    giftDepositSummary.text(`Vas a cargar ${formatCurrency(selectedCard.amount)} con ${selectedCard.brand}.`);
  });

  debitModalElement.on("hidden.bs.modal", function () {
    resetDebitFlow();
  });

  transferModalElement.on("hidden.bs.modal", function () {
    resetTransferFlow();
  });

  giftModalElement.on("hidden.bs.modal", function () {
    resetGiftFlow();
  });

  if (debitForm.length) {
    debitForm.on("submit", (event) => {
      event.preventDefault();
      hideAlert(debitMessage);
      debitResult.addClass("d-none").text("");

      const selectedBank = $.grep(getBanks(), (bank) => bank.id === debitBankSource.val())[0];
      const amount = Number(debitAmount.val());
      const cardNumber = String(debitCardNumber.val() || "").trim();
      const cardHolder = String(debitCardHolder.val() || "").trim();
      const cardExpiry = String(debitCardExpiry.val() || "").trim();
      const cardCvv = String(debitCardCvv.val() || "").trim();

      if (!selectedBank) {
        showAlert(debitMessage, "Elige el banco desde donde harás el cargo.", "danger");
        return;
      }

      if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
        showAlert(debitMessage, "Completa los datos de la tarjeta de débito para seguir.", "danger");
        return;
      }

      if (!amount || amount <= 0) {
        showAlert(debitMessage, "Ingresa un monto válido para continuar.", "danger");
        return;
      }

      completeDeposit(
        amount,
        `Ingreso con débito desde ${selectedBank.name}`,
        `${selectedBank.name} ${selectedBank.accountMask} - cargo con tarjeta de débito`,
        `Ingresaste ${formatCurrency(amount)} con débito desde ${selectedBank.name}.`,
        `El cargo por ${formatCurrency(amount)} quedó registrado con éxito.`,
        "Ingreso con débito realizado con éxito. Volviendo al menú principal.",
        debitMessage,
        debitResult
      );

      if (debitModal) {
        debitModal.hide();
      }
      navigateTo("menu.html", 2000);
    });
  }

  if (transferForm.length) {
    transferForm.on("submit", (event) => {
      event.preventDefault();
      hideAlert(transferMessage);
      transferResult.addClass("d-none").text("");

      const selectedBank = $.grep(getBanks(), (bank) => bank.id === transferBankSource.val())[0];
      const amount = Number(transferAmount.val());
      const reference = String(transferReference.val() || "").trim();

      if (!selectedBank) {
        showAlert(transferMessage, "Elige desde qué banco hiciste la transferencia.", "danger");
        return;
      }

      if (!reference) {
        showAlert(transferMessage, "Ingresa una referencia o comprobante para continuar.", "danger");
        return;
      }

      if (!amount || amount <= 0) {
        showAlert(transferMessage, "Ingresa un monto válido para continuar.", "danger");
        return;
      }

      completeDeposit(
        amount,
        `Transferencia recibida desde ${selectedBank.name}`,
        `Comprobante ${reference} - ${selectedBank.accountMask}`,
        `Tu transferencia desde ${selectedBank.name} ya fue acreditada.`,
        `La transferencia por ${formatCurrency(amount)} fue confirmada correctamente.`,
        "Transferencia confirmada con éxito. Volviendo al menú principal.",
        transferMessage,
        transferResult
      );

      if (transferModal) {
        transferModal.hide();
      }
      navigateTo("menu.html", 2000);
    });
  }

  if (giftForm.length) {
    giftForm.on("submit", (event) => {
      event.preventDefault();
      hideAlert(giftMessage);
      giftResult.addClass("d-none").text("");

      const selectedCard = $.grep(getGiftCards(), (card) => card.id === giftCardSource.val())[0];
      const amount = Number(giftAmount.val());
      const giftCode = String(giftCardCode.val() || "").trim();
      const giftPin = String(giftCardPin.val() || "").trim();

      if (!selectedCard) {
        showAlert(giftMessage, "Elige una gift card para continuar.", "danger");
        return;
      }

      if (!giftCode || !giftPin) {
        showAlert(giftMessage, "Completa el código y el PIN de la gift card.", "danger");
        return;
      }

      if (!amount || amount <= 0) {
        showAlert(giftMessage, "Ingresa un monto válido para depositar.", "danger");
        return;
      }

      completeDeposit(
        amount,
        "Ingreso con gift card",
        `Código usado: ${giftCode}`,
        `Tu gift card sumó ${formatCurrency(amount)} a tu saldo.`,
        `Tu gift card cargó ${formatCurrency(amount)} correctamente.`,
        "Gift card aplicada con éxito. Volviendo al menú principal.",
        giftMessage,
        giftResult
      );

      if (giftModal) {
        giftModal.hide();
      }
      navigateTo("menu.html", 2000);
    });
  }
}
