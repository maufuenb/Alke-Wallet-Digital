function initRetirarPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const bankModalElement = $("#withdrawBankModal");
  const bankModal = bankModalElement.length
    ? bootstrap.Modal.getOrCreateInstance(bankModalElement[0])
    : null;

  const bankForm = $("#withdrawBankForm");
  const bankMessage = $("#withdrawBankMessage");
  const bankResult = $("#withdrawBankResult");
  const bankSource = $("#withdrawBankSource");
  const bankReason = $("#withdrawBankReason");
  const bankAmount = $("#withdrawBankAmount");

  const bankSourceHelp = $("#withdrawBankSourceHelp");
  const bankHolderHint = $("#withdrawBankHolderHint");
  const bankTypeHint = $("#withdrawBankTypeHint");
  const bankEtaHint = $("#withdrawBankEtaHint");
  const bankReasonHint = $("#withdrawBankReasonHint");
  const bankSummaryHint = $("#withdrawBankSummaryHint");

  const balanceLabel = $("[data-current-balance]");
  balanceLabel.text(formatCurrency(getWalletState().balance));

  function getBankAccounts() {
    return getWalletState().withdrawalSources?.bankAccounts || [];
  }

  function getShortMask(mask) {
    return String(mask || "").replace(/[*\s]/g, "");
  }

  function renderOptions() {
    const bankAccounts = getBankAccounts();

    bankSource.html('<option value="">Selecciona una cuenta</option>');
    $.each(bankAccounts, (_, account) => {
      bankSource.append(
        $("<option></option>")
          .val(account.id)
          .attr("title", `${account.bank} ${account.accountMask}`)
          .text(`${account.bank} · ${getShortMask(account.accountMask)}`)
      );
    });

    enhanceModalSelects();
    syncCustomSelect(bankSource);
  }

  function resetBankHints() {
    bankSourceHelp.text("Elige cuál de tus cuentas recibirá este retiro.");
    bankHolderHint.text("Titular: selecciona una cuenta para ver el detalle.");
    bankTypeHint.text("Tipo de cuenta: selecciona una cuenta para ver el detalle.");
    bankEtaHint.text("Tiempo estimado: selecciona una cuenta para ver el detalle.");
    bankReasonHint.text("Te sirve para reconocer después por qué moviste este saldo.");
    bankSummaryHint.text("El dinero saldrá de tu saldo disponible y llegará a la cuenta que elijas.");
  }

  function resetBankFlow() {
    bankForm.trigger("reset");
    hideAlert(bankMessage);
    bankResult.addClass("d-none").text("");
    resetBankHints();
  }

  function completeWithdrawal(amount, title, description, flashMessage, summaryText, messageText) {
    updateWalletState((walletState) => {
      walletState.balance -= amount;
      walletState.flashMessage = flashMessage;
      walletState.movements.unshift({
        id: `m-${Date.now()}`,
        title,
        description,
        amount,
        type: "debit",
        category: "withdrawal",
        date: new Date().toISOString()
      });
    });

    balanceLabel.text(formatCurrency(getWalletState().balance));
    bankResult
      .removeClass("d-none text-success")
      .addClass("text-warning")
      .text(summaryText);
    showAlert(bankMessage, messageText, "success");
  }

  function validateAmount(amount) {
    const currentState = getWalletState();

    if (!amount || amount <= 0) {
      showAlert(bankMessage, "Ingresa un monto válido para mover.", "danger");
      return false;
    }

    if (amount > currentState.balance) {
      showAlert(bankMessage, "No tienes saldo suficiente para hacer este movimiento.", "danger");
      return false;
    }

    return true;
  }

  renderOptions();
  resetBankFlow();

  bankSource.on("change", function () {
    syncCustomSelect(this);
    const selectedAccount = $.grep(getBankAccounts(), (account) => account.id === $(this).val())[0];

    if (!selectedAccount) {
      resetBankHints();
      return;
    }

    bankSourceHelp.text(`Enviarás este retiro a tu cuenta en ${selectedAccount.bank}.`);
    bankHolderHint.text(`Titular: ${selectedAccount.holder}`);
    bankTypeHint.text(`Tipo de cuenta: ${selectedAccount.accountType}`);
    bankEtaHint.text(`Tiempo estimado: ${selectedAccount.eta}`);
    bankSummaryHint.text(`Moverás saldo hacia tu cuenta ${selectedAccount.accountMask} en ${selectedAccount.bank}.`);
  });

  bankModalElement.on("hidden.bs.modal", function () {
    resetBankFlow();
  });

  if (!bankForm.length) {
    return;
  }

  bankForm.on("submit", (event) => {
    event.preventDefault();
    hideAlert(bankMessage);
    bankResult.addClass("d-none").text("");

    const selectedAccount = $.grep(getBankAccounts(), (account) => account.id === bankSource.val())[0];
    const reason = String(bankReason.val() || "").trim();
    const amount = Number(bankAmount.val());

    if (!selectedAccount) {
      showAlert(bankMessage, "Elige una de tus cuentas para continuar.", "danger");
      return;
    }

    if (!reason) {
      showAlert(bankMessage, "Agrega un motivo breve para identificar este movimiento.", "danger");
      return;
    }

    if (!validateAmount(amount)) {
      return;
    }

    completeWithdrawal(
      amount,
      `Movimiento a ${selectedAccount.bank}`,
      `${selectedAccount.accountType} ${selectedAccount.accountMask} - ${reason}`,
      `Moviste ${formatCurrency(amount)} a tu cuenta en ${selectedAccount.bank}.`,
      `Moviste ${formatCurrency(amount)} a tu cuenta correctamente.`,
      "Movimiento confirmado. Volviendo al menú principal."
    );

    if (bankModal) {
      bankModal.hide();
    }
    navigateTo("menu.html", 2000);
  });
}
