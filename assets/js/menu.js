function initMenuPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const balance = $("[data-wallet-balance]");
  const message = $("#menuMessage");
  const virtualCardAccessModalElement = $("#virtualCardAccessModal");
  const virtualCardAccessForm = $("#virtualCardAccessForm");
  const virtualCardPassword = $("#virtualCardPassword");
  const toggleVirtualCardPassword = $("#toggleVirtualCardPassword");
  const virtualCardAccessMessage = $("#virtualCardAccessMessage");
  const virtualCardPanel = $("[data-virtual-card-panel]");
  const flashMessage = takeFlashMessage();
  const state = getWalletState();

  if (balance.length) {
    setBalanceValue(balance, formatCurrency(state.balance));
  }

  if (flashMessage) {
    showAlert(message, flashMessage, "success");
  }

  $("[data-redirect-label]").on("click", function (event) {
    const button = $(this);

    event.preventDefault();
    showAlert(message, `Redirigiendo a ${button.data("redirect-label")}.`, "info");

    navigateTo(button.attr("href"), 800);
  });

  function resetVirtualCardAccess() {
    if (virtualCardAccessForm.length) {
      virtualCardAccessForm.trigger("reset");
    }

    hideAlert(virtualCardAccessMessage);
    virtualCardPanel.addClass("d-none");
    virtualCardPassword.attr("type", "password");
    toggleVirtualCardPassword
      .attr("aria-label", "Mostrar contraseña")
      .html('<i class="fa-solid fa-eye"></i>');
  }

  if (toggleVirtualCardPassword.length) {
    toggleVirtualCardPassword.on("click", () => {
      const isPassword = virtualCardPassword.attr("type") === "password";
      virtualCardPassword.attr("type", isPassword ? "text" : "password");
      toggleVirtualCardPassword
        .attr("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña")
        .html(`<i class="fa-solid ${isPassword ? "fa-eye-slash" : "fa-eye"}"></i>`);
    });
  }

  if (virtualCardAccessForm.length) {
    virtualCardAccessForm.on("submit", (event) => {
      event.preventDefault();
      hideAlert(virtualCardAccessMessage);

      const password = String(virtualCardPassword.val() || "").trim();
      const validPassword = String(getWalletState().user?.password || WALLET_DEFAULTS.user.password).trim();

      if (!password) {
        showAlert(virtualCardAccessMessage, "Ingresa tu clave para continuar.", "danger");
        return;
      }

      if (password !== validPassword) {
        showAlert(virtualCardAccessMessage, "La clave no coincide con tu sesión actual.", "danger");
        virtualCardPanel.addClass("d-none");
        return;
      }

      virtualCardPanel.removeClass("d-none");
      showAlert(virtualCardAccessMessage, "Tarjeta virtual desbloqueada.", "success");
    });
  }

  virtualCardAccessModalElement.on("hidden.bs.modal", resetVirtualCardAccess);
}
