function initDepositPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const form = $("#depositForm");
  const message = $("#depositMessage");
  const amountInput = $("#amount");
  const balanceLabel = $("[data-current-balance]");
  const summary = $("#depositSummary");
  const state = getWalletState();

  if (!form.length) {
    return;
  }

  balanceLabel.text(formatCurrency(state.balance));

  form.on("submit", (event) => {
    event.preventDefault();
    hideAlert(message);
    summary.addClass("d-none").text("");

    const amount = Number(amountInput.val());

    if (!amount || amount <= 0) {
      showAlert(message, "Ingresa un monto válido para depositar.", "danger");
      return;
    }

    updateWalletState((state) => {
      state.balance += amount;
      state.flashMessage = `Depósito realizado con éxito por ${formatCurrency(amount)}.`;
      state.movements.unshift({
        id: `m-${Date.now()}`,
        title: "Depósito realizado",
        description: "Ingreso de dinero acreditado en la cuenta",
        amount,
        type: "credit",
        date: new Date().toISOString()
      });
    });

    balanceLabel.text(formatCurrency(getWalletState().balance));
    summary
      .removeClass("d-none")
      .text(`Depositaste ${formatCurrency(amount)} correctamente.`);
    showAlert(message, "Depósito realizado con éxito. Redirigiendo al menú principal.", "success");
    navigateTo("menu.html", 2000);
  });
}
