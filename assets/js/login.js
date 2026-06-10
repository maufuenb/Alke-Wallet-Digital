function initLoginPage() {
  const form = $("#loginForm");
  const message = $("#loginMessage");
  const emailInput = $("#email");
  const passwordInput = $("#password");
  const fillDemoAccessButton = $("#fillDemoAccess");
  const togglePasswordButton = $("#togglePassword");
  const validEmail = WALLET_DEFAULTS.user.email.toLowerCase();
  const validPassword = WALLET_DEFAULTS.user.password;

  if (!form.length) {
    return;
  }

  if (fillDemoAccessButton.length) {
    fillDemoAccessButton.on("click", () => {
      emailInput.val(WALLET_DEFAULTS.user.email);
      passwordInput.val(WALLET_DEFAULTS.user.password);
      hideAlert(message);
      emailInput.trigger("focus");
    });
  }

  if (togglePasswordButton.length) {
    togglePasswordButton.on("click", () => {
      const isPassword = passwordInput.attr("type") === "password";
      passwordInput.attr("type", isPassword ? "text" : "password");
      togglePasswordButton
        .attr("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña")
        .html(`<i class="fa-solid ${isPassword ? "fa-eye-slash" : "fa-eye"}"></i>`);
    });
  }

  form.on("submit", (event) => {
    event.preventDefault();
    hideAlert(message);

    const email = String(emailInput.val() || "").trim().toLowerCase();
    const password = String(passwordInput.val() || "").trim();

    if (!email || !password) {
      showAlert(message, "Completa email y contraseña antes de continuar.", "danger");
      return;
    }

    if (email !== validEmail || password !== validPassword) {
      showAlert(message, "Credenciales incorrectas. Intenta nuevamente.", "danger");
      return;
    }

    updateWalletState((currentState) => {
      currentState.loggedIn = true;
    });

    showAlert(message, "Inicio de sesión exitoso. Redirigiendo al menú principal.", "success");
    navigateTo("menu.html", 900);
  });
}
