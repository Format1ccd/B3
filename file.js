function onOpen() {
  const ui = SpreadsheetApp.getUi();

  const warehouseMenu = ui.createMenu('📦 Склад')
    .addItem('📁 Открыть лист "SMD+Склад"', 'openSMDWarehouseSheet')
    .addItem('📥📤 Массовые операции', 'showUnifiedBatchDialog')
    .addItem('🔍 Поиск компонентов', 'showComponentSearch')
    .addItem('🔒 Резервирование', 'showReservationDialog')
    .addItem('📊 График использования', 'showUsageChart')
    .addItem('🖨️ Экспорт инвентаризации', 'exportInventoryToDoc')
    .addItem('↩️ Отменить операцию', 'showCancelOperationDialog');

  const recipeMenu = ui.createMenu('📋 Рецептура')
    .addItem('📁 Открыть лист "Рецептура"', 'openRecipeSheet')
    .addItem('🔄 Обновить остатки', 'updateRecipeStockValues');

  const planningMenu = ui.createMenu('📅 Планирование')
    .addItem('🧾 Расчёт потребности', 'showPlanningDialog')
    .addItem('⚠️ Проверить остатки', 'addLowStockAlerts');

  const dataMenu = ui.createMenu('💾 Данные')
    .addItem('📁 Импорт/Экспорт', 'showImportExportDialog')
    .addItem('🔄 Синхронизация', 'syncData');

  const systemMenu = ui.createMenu('⚙️ Система')
    .addItem('🚀 Инициализация', 'initializeSystem')
    .addItem('📊 Статистика', 'showSystemStats');

  ui.createMenu('🛠️ Управление')
    .addSubMenu(warehouseMenu)
    .addSubMenu(recipeMenu)
    .addSubMenu(planningMenu)
    .addSubMenu(dataMenu)
    .addSubMenu(systemMenu)
    .addToUi();
}