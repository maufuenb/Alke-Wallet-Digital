$(function () {
  const page = $("body").data("page");
  const pageInitializers = {
    login: window.initLoginPage,
    menu: window.initMenuPage,
    deposit: window.initDepositPage,
    "send-money": window.initSendMoneyPage,
    transactions: window.initTransactionsPage
  };

  bindLogoutLinks();

  if ($.isFunction(pageInitializers[page])) {
    pageInitializers[page]();
  }
});
