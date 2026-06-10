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
      ? $.grep(state.movements, (movement) => getMovementCategory(movement) === selectedType)
      : state.movements;

    list.empty();

    if (!movements.length) {
      list.append('<div class="list-group-item rounded-4 border text-muted">No hay movimientos para este filtro.</div>');
      return;
    }

    $.each(movements, (_, movement) => {
      const amountClass = movement.type === "credit" ? "text-success" : "text-danger";
      const amountPrefix = movement.type === "credit" ? "+" : "-";
      const category = getMovementCategory(movement);
      const categoryLabel = {
        deposit: "Depositar",
        transfer: "Transferencia",
        withdrawal: "Retiro"
      }[category] || "Movimiento";
      const item = $(`
        <div class="movement-item list-group-item rounded-4 mb-3 border d-flex justify-content-between align-items-start gap-3">
          <div class="movement-item__body">
            <div class="movement-item__meta">
              <span class="movement-item__tag"></span>
              <small class="text-muted"></small>
            </div>
            <h3 class="h6 mb-1 mt-2"></h3>
            <p class="mb-0 text-muted"></p>
          </div>
          <span class="fw-bold movement-item__amount"></span>
        </div>
      `);

      item.find(".movement-item__tag").text(categoryLabel);
      item.find("small").text(formatDate(movement.date));
      item.find("h3").text(movement.title);
      item.find("p").text(movement.description);
      item.find(".movement-item__amount")
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
