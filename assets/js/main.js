$(function () {
  const page = $("body").data("page");
  const pageInitializers = {
    login: window.initLoginPage,
    menu: window.initMenuPage,
    deposit: window.initDepositPage,
    retirar: window.initRetirarPage,
    "send-money": window.initSendMoneyPage,
    transactions: window.initTransactionsPage
  };

  bindLogoutLinks();
  bindBalanceVisibilityToggle();
  $(document).on("hidden.bs.modal", ".modal", cleanupModalArtifacts);

  if ($.isFunction(pageInitializers[page])) {
    pageInitializers[page]();
  }

  syncBalanceVisibility();
});
