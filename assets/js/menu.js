function initMenuPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const balance = $("[data-wallet-balance]");
  const message = $("#menuMessage");
  const flashMessage = takeFlashMessage();
  const state = getWalletState();

  if (balance.length) {
    balance.text(formatCurrency(state.balance));
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
}
