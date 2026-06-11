function initializeCurrentPage() {
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
}

function runWhenBootstrapReady(callback) {
  if (window.bootstrap) {
    callback();
    return;
  }

  const bootstrapScript = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"]');

  if (!bootstrapScript) {
    callback();
    return;
  }

  let hasRun = false;
  const finish = () => {
    if (hasRun) {
      return;
    }

    hasRun = true;
    callback();
  };

  bootstrapScript.addEventListener("load", finish, { once: true });
  bootstrapScript.addEventListener("error", finish, { once: true });

  let attempts = 0;
  const maxAttempts = 60;
  const intervalId = window.setInterval(() => {
    attempts += 1;

    if (window.bootstrap || attempts >= maxAttempts) {
      window.clearInterval(intervalId);
      finish();
    }
  }, 50);
}

$(function () {
  runWhenBootstrapReady(initializeCurrentPage);
});
