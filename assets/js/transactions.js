function initTransactionsPage() {
  if (redirectIfLoggedOut()) {
    return;
  }

  const list = $("[data-movement-list]");
  const filter = $("#movementFilter");

  if (!list.length) {
    return;
  }

  function renderMovements(selectedType) {
    const state = getWalletState();
    const movements = selectedType && selectedType !== "all"
      ? $.grep(state.movements, (movement) => movement.type === selectedType)
      : state.movements;

    list.empty();

    if (!movements.length) {
      list.append('<div class="list-group-item rounded-4 border text-muted">No hay movimientos para este filtro.</div>');
      return;
    }

    $.each(movements, (_, movement) => {
      const amountClass = movement.type === "credit" ? "text-success" : "text-danger";
      const amountPrefix = movement.type === "credit" ? "+" : "-";
      const item = $(`
        <div class="list-group-item rounded-4 mb-3 border d-flex justify-content-between align-items-start">
          <div>
            <h3 class="h6 mb-1"></h3>
            <p class="mb-1 text-muted"></p>
            <small class="text-muted"></small>
          </div>
          <span class="fw-bold"></span>
        </div>
      `);

      item.find("h3").text(movement.title);
      item.find("p").text(formatDate(movement.date));
      item.find("small").text(movement.description);
      item.find("span")
        .addClass(amountClass)
        .text(`${amountPrefix} ${formatCurrency(movement.amount)}`);

      list.append(item);
    });
  }

  renderMovements("all");

  if (filter.length) {
    filter.on("change", function () {
      renderMovements($(this).val());
    });
  }
}
