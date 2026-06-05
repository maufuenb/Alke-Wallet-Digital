function initLoginPage() {
  const form = $("#loginForm");
  const message = $("#loginMessage");
  const emailInput = $("#email");
  const passwordInput = $("#password");
  const validEmail = WALLET_DEFAULTS.user.email.toLowerCase();
  const validPassword = WALLET_DEFAULTS.user.password;

  if (!form.length) {
    return;
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
