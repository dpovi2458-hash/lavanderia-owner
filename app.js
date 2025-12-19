
const DEFAULT_SERVICES = [
    {
        id: 'lavado',
        name: 'Lavado por kilo',
        price: 6,
        unit: 'kg',
        tone: 'aqua',
        description: 'Lavado y doblado con cuidado.'
    },
    {
        id: 'secado',
        name: 'Secado',
        price: 4,
        unit: 'kg',
        tone: 'amber',
        description: 'Secado a temperatura media.'
    },
    {
        id: 'completo',
        name: 'Lavado + Secado',
        price: 9,
        unit: 'kg',
        tone: 'aqua',
        description: 'Servicio completo por kilo.'
    },
    {
        id: 'planchado',
        name: 'Planchado por pieza',
        price: 2,
        unit: 'pieza',
        tone: 'rose',
        description: 'Planchado prolijo por prenda.'
    },
    {
        id: 'especial',
        name: 'Especial (mantas, edredones)',
        price: 18,
        unit: 'servicio',
        tone: 'slate',
        description: 'Piezas grandes o delicadas.'
    }
];

const SERVICE_TEMPLATES = {
    lavado: {
        name: 'Lavado por kilo',
        price: 6,
        unit: 'kg',
        tone: 'aqua',
        description: 'Servicio diario con doblado.'
    },
    planchado: {
        name: 'Planchado por pieza',
        price: 2,
        unit: 'pieza',
        tone: 'rose',
        description: 'Planchado prolijo por prenda.'
    },
    especial: {
        name: 'Edredón premium',
        price: 20,
        unit: 'servicio',
        tone: 'slate',
        description: 'Mantas y edredones grandes.'
    }
};

const UNIT_CONFIG = {
    kg: {
        label: 'Peso (kg)',
        short: 'kg',
        step: '0.1',
        invoiceLabel: 'Peso'
    },
    pieza: {
        label: 'Cantidad (pzas)',
        short: 'pzas',
        step: '1',
        invoiceLabel: 'Cantidad'
    },
    servicio: {
        label: 'Cantidad',
        short: '',
        step: '1',
        invoiceLabel: 'Cantidad'
    },
    paquete: {
        label: 'Cantidad (paq)',
        short: 'paq',
        step: '1',
        invoiceLabel: 'Cantidad'
    }
};

const STATUS_FLOW = ['recibido', 'en_proceso', 'listo', 'entregado'];
const STATUS_LABELS = {
    recibido: 'Recibido',
    en_proceso: 'En proceso',
    listo: 'Listo',
    entregado: 'Entregado'
};
const STATUS_CLASSES = {
    recibido: 'status-recibido',
    en_proceso: 'status-proceso',
    listo: 'status-listo',
    entregado: 'status-entregado'
};
const PAYMENT_LABELS = {
    pagado: 'Pagado',
    pendiente: 'Pendiente'
};
const PAYMENT_METHOD_LABELS = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    yape: 'Yape/Plin',
    tarjeta: 'Tarjeta',
    otro: 'Otro'
};

const API_ENDPOINT = '/api/state';
const STATE_VERSION = 1;
const CAN_USE_API = window.location.protocol !== 'file:';
let apiAvailable = false;
let saveTimer = null;

let orders = safeParse('lavapro_orders', []);
let services = safeParse('lavapro_services', null);
let ownerProfile = safeParse('lavapro_owner', {
    ownerName: '',
    businessName: 'Lavandería Simple',
    phone: '',
    address: ''
});
let expenses = safeParse('lavapro_expenses', {});
let cashDaily = safeParse('lavapro_cash_daily', {});
let closures = safeParse('lavapro_closures', []);
let currentFilter = 'todos';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    await hydrateState();
    setCurrentDate();
    setupFilters();
    setupForms();
    setupServiceTemplates();
    updateOwnerUI();
    renderServiceList();
    renderServiceSelect();
    updateServicePreview();
    updateServiceFields();
    updatePriceSuggestion();
    refreshUI();
}

function safeParse(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) {
        return fallback;
    }

    try {
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
    } catch (error) {
        return fallback;
    }
}

async function hydrateState() {
    const remoteState = await loadRemoteState();
    if (remoteState) {
        applyState(remoteState);
    } else {
        orders = migrateOrders(orders);
        services = normalizeServices(services);
        ownerProfile = normalizeOwner(ownerProfile);
        expenses = normalizeMap(expenses);
        cashDaily = normalizeMap(cashDaily);
        closures = Array.isArray(closures) ? closures : [];
    }

    saveLocalState();
    if (apiAvailable) {
        scheduleRemoteSave();
    }
}

async function loadRemoteState() {
    if (!CAN_USE_API) {
        apiAvailable = false;
        return null;
    }

    try {
        const response = await fetch(API_ENDPOINT, { cache: 'no-store' });
        apiAvailable = response.ok;
        if (!response.ok) {
            return null;
        }
        const payload = await response.json();
        if (payload && payload.data) {
            return payload.data;
        }
        return null;
    } catch (error) {
        apiAvailable = false;
        return null;
    }
}

function applyState(state) {
    const snapshot = state || {};
    orders = migrateOrders(snapshot.orders || []);
    services = normalizeServices(snapshot.services);
    ownerProfile = normalizeOwner(snapshot.ownerProfile);
    expenses = normalizeMap(snapshot.expenses);
    cashDaily = normalizeMap(snapshot.cashDaily);
    closures = Array.isArray(snapshot.closures) ? snapshot.closures : [];
}

function normalizeOwner(profile) {
    const data = profile || {};
    return {
        ownerName: data.ownerName || '',
        businessName: data.businessName || 'Lavandería Simple',
        phone: data.phone || '',
        address: data.address || ''
    };
}

function normalizeMap(value) {
    if (!value || typeof value !== 'object') {
        return {};
    }
    return value;
}

function getStateSnapshot() {
    return {
        version: STATE_VERSION,
        orders,
        services,
        ownerProfile,
        expenses,
        cashDaily,
        closures,
        updatedAt: new Date().toISOString()
    };
}

function saveLocalState() {
    localStorage.setItem('lavapro_orders', JSON.stringify(orders));
    localStorage.setItem('lavapro_services', JSON.stringify(services));
    localStorage.setItem('lavapro_owner', JSON.stringify(ownerProfile));
    localStorage.setItem('lavapro_expenses', JSON.stringify(expenses));
    localStorage.setItem('lavapro_cash_daily', JSON.stringify(cashDaily));
    localStorage.setItem('lavapro_closures', JSON.stringify(closures));
}

function scheduleRemoteSave() {
    if (!apiAvailable) {
        return;
    }
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(() => {
        persistRemoteState();
    }, 700);
}

async function persistRemoteState() {
    if (!apiAvailable || !CAN_USE_API) {
        return;
    }

    try {
        await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getStateSnapshot())
        });
    } catch (error) {
        apiAvailable = false;
    }
}

function normalizeServices(existingServices) {
    if (!Array.isArray(existingServices) || existingServices.length === 0) {
        return [...DEFAULT_SERVICES];
    }
    return existingServices.map((service) => ({
        id: service.id || `S-${Date.now()}`,
        name: service.name || 'Servicio',
        price: parseMoney(service.price),
        unit: service.unit || 'servicio',
        tone: service.tone || 'aqua',
        description: service.description || ''
    }));
}

function saveOrders() {
    saveLocalState();
    scheduleRemoteSave();
}

function saveServices() {
    saveLocalState();
    scheduleRemoteSave();
}

function saveOwnerProfile() {
    saveLocalState();
    scheduleRemoteSave();
}

function saveExpenses() {
    saveLocalState();
    scheduleRemoteSave();
}

function saveCashDaily() {
    saveLocalState();
    scheduleRemoteSave();
}

function saveClosures() {
    saveLocalState();
    scheduleRemoteSave();
}

function setupForms() {
    const ownerForm = document.getElementById('owner-form');
    if (ownerForm) {
        ownerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            ownerProfile = {
                ownerName: document.getElementById('owner-name').value.trim(),
                businessName: document.getElementById('business-name').value.trim() || 'Lavandería Simple',
                phone: document.getElementById('business-phone').value.trim(),
                address: document.getElementById('business-address').value.trim()
            };
            saveOwnerProfile();
            updateOwnerUI();
        });
    }

    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const concept = document.getElementById('expense-concept').value.trim();
            const amount = parseMoney(document.getElementById('expense-amount').value);
            if (!concept || !amount) {
                return;
            }

            const expense = {
                id: `E-${Date.now()}`,
                concept,
                amount,
                date: new Date().toISOString()
            };
            const key = getDateKey(new Date());
            if (!Array.isArray(expenses[key])) {
                expenses[key] = [];
            }
            expenses[key].unshift(expense);
            saveExpenses();
            expenseForm.reset();
            renderCash();
        });
    }

    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', (event) => {
            event.preventDefault();
            saveServiceFromForm();
        });
    }

    const serviceInputs = ['service-name', 'service-price', 'service-unit', 'service-tone', 'service-desc'];
    serviceInputs.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateServicePreview);
            input.addEventListener('change', updateServicePreview);
        }
    });

    const orderForm = document.getElementById('new-order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }

    const paymentStatus = document.getElementById('payment-status');
    if (paymentStatus) {
        paymentStatus.addEventListener('change', togglePaymentMethod);
        togglePaymentMethod();
    }

    const serviceSelect = document.getElementById('service-type');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', () => {
            updateServiceFields();
            updatePriceSuggestion();
        });
    }

    const quantityInput = document.getElementById('weight');
    if (quantityInput) {
        quantityInput.addEventListener('input', updatePriceSuggestion);
    }

    const closureForm = document.getElementById('closure-form');
    if (closureForm) {
        closureForm.addEventListener('submit', handleClosureSubmit);
    }

    const closureInputs = ['opening-cash', 'owner-withdraw', 'cash-counted', 'cash-notes'];
    closureInputs.forEach((id) => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', handleClosureInput);
            input.addEventListener('change', handleClosureInput);
        }
    });
}

function setupFilters() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            chips.forEach((c) => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilter = chip.dataset.filter || 'todos';
            renderOrders();
        });
    });
}

function setupServiceTemplates() {
    const templateChips = document.querySelectorAll('.template-chip');
    templateChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const key = chip.dataset.template;
            applyTemplate(key);
        });
    });
}

function updateOwnerUI() {
    const businessName = ownerProfile.businessName?.trim() || 'Lavandería Simple';
    const ownerName = ownerProfile.ownerName?.trim() || '';

    const brandName = document.getElementById('brand-name');
    if (brandName) {
        brandName.textContent = businessName;
    }

    const ownerDisplay = document.getElementById('owner-display');
    if (ownerDisplay) {
        ownerDisplay.textContent = ownerName ? `Dueño: ${ownerName}` : 'Dueño';
    }

    const ownerFooter = document.getElementById('owner-footer');
    if (ownerFooter) {
        ownerFooter.textContent = ownerName ? `Dueño: ${ownerName}` : 'Solo para el dueño';
    }

    const ownerInitials = document.getElementById('owner-initials');
    if (ownerInitials) {
        ownerInitials.textContent = getInitials(ownerName || businessName);
    }

    const ownerNameInput = document.getElementById('owner-name');
    if (ownerNameInput) {
        ownerNameInput.value = ownerProfile.ownerName || '';
    }

    const businessNameInput = document.getElementById('business-name');
    if (businessNameInput) {
        businessNameInput.value = ownerProfile.businessName || '';
    }

    const phoneInput = document.getElementById('business-phone');
    if (phoneInput) {
        phoneInput.value = ownerProfile.phone || '';
    }

    const addressInput = document.getElementById('business-address');
    if (addressInput) {
        addressInput.value = ownerProfile.address || '';
    }
}

function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = dateStr;
    }
}

function refreshUI() {
    updateDashboard();
    renderOrders();
    renderCash();
    renderClosureHistory();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.remove('active'));

    const tab = document.getElementById(tabId);
    const button = document.getElementById(`btn-${tabId}`);
    if (tab) {
        tab.classList.add('active');
    }
    if (button) {
        button.classList.add('active');
    }
}

function openNewOrderModal() {
    const modal = document.getElementById('order-modal');
    const form = document.getElementById('new-order-form');
    if (form) {
        form.reset();
    }
    const paymentStatus = document.getElementById('payment-status');
    if (paymentStatus) {
        paymentStatus.value = 'pagado';
    }
    renderServiceSelect();
    updateServiceFields();
    updatePriceSuggestion();
    togglePaymentMethod();
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function goToServices() {
    closeModal('order-modal');
    switchTab('services');
}

function handleOrderSubmit(event) {
    event.preventDefault();

    const serviceId = document.getElementById('service-type').value;
    const service = findService(serviceId);
    const unit = service?.unit || 'servicio';
    const quantityInput = document.getElementById('weight');
    const quantityValue = parseMoney(quantityInput.value);
    const quantity = quantityValue || 0;
    const totalValue = parseMoney(document.getElementById('total-price').value);
    const paymentStatus = document.getElementById('payment-status').value;
    const paymentMethod = paymentStatus === 'pagado'
        ? document.getElementById('payment-method').value
        : '';
    const now = new Date();

    const newOrder = {
        id: getNextOrderId(),
        client: document.getElementById('client-name').value.trim(),
        service: serviceId,
        serviceName: service?.name || serviceId,
        serviceUnit: unit,
        servicePrice: service?.price ?? 0,
        quantity,
        weight: quantity,
        notes: document.getElementById('notes').value.trim(),
        total: totalValue,
        status: 'recibido',
        paymentStatus,
        paymentMethod,
        date: now.toISOString(),
        paidAt: paymentStatus === 'pagado' ? now.toISOString() : null
    };

    orders.unshift(newOrder);
    saveOrders();
    refreshUI();
    prepareInvoice(newOrder);

    setTimeout(() => {
        window.print();
        closeModal('order-modal');
        document.getElementById('new-order-form').reset();
        updateServiceFields();
        updatePriceSuggestion();
    }, 500);
}
function renderOrders() {
    const container = document.getElementById('orders-container');
    const historyContainer = document.getElementById('history-container');

    const activeOrders = orders.filter((order) => order.status !== 'entregado');
    const completedOrders = orders.filter((order) => order.status === 'entregado');

    const filteredActive = activeOrders
        .filter(matchesSearch)
        .filter((order) => currentFilter === 'todos' || order.status === currentFilter);
    const filteredHistory = completedOrders.filter(matchesSearch);

    if (container) {
        if (filteredActive.length === 0) {
            const message = activeOrders.length === 0
                ? 'No hay pedidos activos actualmente.'
                : 'No hay pedidos con este filtro.';
            const action = activeOrders.length === 0
                ? '<button class="btn-primary" onclick="openNewOrderModal()">Crear primer pedido</button>'
                : '';
            container.innerHTML = `
                <div class="empty-state">
                    <p>${message}</p>
                    ${action}
                </div>
            `;
        } else {
            container.innerHTML = filteredActive.map((order) => createOrderCard(order)).join('');
        }
    }

    if (historyContainer) {
        historyContainer.innerHTML = filteredHistory.length > 0
            ? filteredHistory.map((order) => createOrderCard(order)).join('')
            : '<p class="empty-msg">No hay pedidos en el historial.</p>';
    }
}

function createOrderCard(order) {
    const date = new Date(order.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const statusLabel = STATUS_LABELS[order.status] || order.status;
    const statusClass = STATUS_CLASSES[order.status] || 'status-recibido';
    const serviceLabel = getOrderServiceName(order);
    const unit = getOrderUnit(order);
    const unitConfig = getUnitConfig(unit);
    const paymentLabel = PAYMENT_LABELS[order.paymentStatus] || 'Pendiente';
    const paymentClass = order.paymentStatus === 'pagado' ? 'payment-paid' : 'payment-pending';
    const paymentMethod = order.paymentStatus === 'pagado'
        ? getPaymentMethodLabel(order.paymentMethod)
        : 'Pendiente';
    const notes = order.notes ? `"${order.notes}"` : 'Sin notas';
    const quantity = formatQuantity(getOrderQuantity(order), unit);
    const unitShort = unitConfig.short ? ` ${unitConfig.short}` : '';

    return `
        <div class="order-card" id="order-${order.id}">
            <div class="order-header">
                <span class="client-name">${order.client}</span>
                <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="order-details">
                <p>Servicio: ${serviceLabel} | Cantidad: ${quantity}${unitShort}</p>
                <p>Hora: ${date} | Pedido: ${order.id}</p>
                <p>Pago: <span class="payment-badge ${paymentClass}">${paymentLabel}</span>${order.paymentStatus === 'pagado' ? ` (${paymentMethod})` : ''}</p>
                <p>${notes}</p>
            </div>
            <div class="order-footer">
                <span class="order-price">S/ ${formatMoney(order.total)}</span>
                <div class="actions">
                    ${order.status !== 'entregado' ? `<button class="btn-action" onclick="nextStatus('${order.id}')">Siguiente estado</button>` : ''}
                    ${order.paymentStatus !== 'pagado' ? `<button class="btn-action" onclick="markPaid('${order.id}')">Marcar pagado</button>` : ''}
                    <button class="btn-action" onclick="reprintOrder('${order.id}')">Imprimir</button>
                    <button class="btn-action btn-danger" onclick="deleteOrder('${order.id}')">Eliminar</button>
                </div>
            </div>
        </div>
    `;
}

function nextStatus(id) {
    const order = orders.find((item) => item.id === id);
    if (!order) {
        return;
    }

    const currentIndex = STATUS_FLOW.indexOf(order.status);
    if (currentIndex < STATUS_FLOW.length - 1) {
        order.status = STATUS_FLOW[currentIndex + 1];
        saveOrders();
        refreshUI();
    }
}

function markPaid(id) {
    const order = orders.find((item) => item.id === id);
    if (!order) {
        return;
    }

    order.paymentStatus = 'pagado';
    order.paymentMethod = order.paymentMethod || 'efectivo';
    order.paidAt = new Date().toISOString();
    saveOrders();
    refreshUI();
}

function deleteOrder(id) {
    if (confirm('¿Seguro que deseas eliminar este pedido?')) {
        orders = orders.filter((order) => order.id !== id);
        saveOrders();
        refreshUI();
    }
}

function updateDashboard() {
    const activeCount = orders.filter((order) => order.status !== 'entregado').length;
    const readyCount = orders.filter((order) => order.status === 'listo').length;
    const paidToday = getPaidTodayTotal();
    const pendingTotal = getPendingTotal();

    document.getElementById('stat-active').textContent = activeCount;
    document.getElementById('stat-ready').textContent = readyCount;
    document.getElementById('stat-paid').textContent = `S/ ${formatMoney(paidToday)}`;
    document.getElementById('stat-pending').textContent = `S/ ${formatMoney(pendingTotal)}`;
}

function renderCash() {
    const paidToday = getPaidTodayTotal();
    const pendingTotal = getPendingTotal();
    const expenseTotal = getExpenseTotal(getDateKey(new Date()));
    const net = paidToday - expenseTotal;

    const cashPaid = document.getElementById('cash-paid');
    if (cashPaid) {
        cashPaid.textContent = `S/ ${formatMoney(paidToday)}`;
    }
    const cashPending = document.getElementById('cash-pending');
    if (cashPending) {
        cashPending.textContent = `S/ ${formatMoney(pendingTotal)}`;
    }
    const cashExpenses = document.getElementById('cash-expenses');
    if (cashExpenses) {
        cashExpenses.textContent = `S/ ${formatMoney(expenseTotal)}`;
    }
    const cashNet = document.getElementById('cash-net');
    if (cashNet) {
        cashNet.textContent = `S/ ${formatMoney(net)}`;
    }

    renderCashBreakdown();
    renderExpenses();
    updateClosureInputs();
    updateClosureSummary();
}

function renderCashBreakdown() {
    const container = document.getElementById('cash-breakdown');
    if (!container) {
        return;
    }

    const breakdown = getPaidBreakdownToday();
    const methods = ['efectivo', 'transferencia', 'yape', 'tarjeta', 'otro'];
    container.innerHTML = methods.map((method) => `
        <div class="breakdown-item">
            <span>${PAYMENT_METHOD_LABELS[method]}</span>
            <strong>S/ ${formatMoney(breakdown[method] || 0)}</strong>
        </div>
    `).join('');
}

function renderExpenses() {
    const list = document.getElementById('expense-list');
    if (!list) {
        return;
    }
    const items = Array.isArray(expenses[getDateKey(new Date())])
        ? expenses[getDateKey(new Date())]
        : [];
    if (items.length === 0) {
        list.innerHTML = '<p class="empty-msg">No hay gastos registrados hoy.</p>';
        return;
    }

    list.innerHTML = items.map((item) => {
        const time = new Date(item.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="expense-item">
                <div class="expense-meta">
                    <span class="expense-concept">${item.concept}</span>
                    <span class="expense-time">${time}</span>
                </div>
                <span class="expense-amount">- S/ ${formatMoney(item.amount)}</span>
                <button class="expense-remove" onclick="deleteExpense('${item.id}')">Quitar</button>
            </div>
        `;
    }).join('');
}

function deleteExpense(id) {
    const key = getDateKey(new Date());
    const items = Array.isArray(expenses[key]) ? expenses[key] : [];
    expenses[key] = items.filter((item) => item.id !== id);
    saveExpenses();
    renderCash();
}

function handleClosureInput() {
    const dateKey = getDateKey(new Date());
    cashDaily[dateKey] = {
        opening: parseMoney(document.getElementById('opening-cash').value),
        withdraw: parseMoney(document.getElementById('owner-withdraw').value),
        counted: parseMoney(document.getElementById('cash-counted').value),
        notes: document.getElementById('cash-notes').value.trim()
    };
    saveCashDaily();
    updateClosureSummary();
}

function updateClosureInputs() {
    const dateKey = getDateKey(new Date());
    const data = cashDaily[dateKey] || {};
    const opening = document.getElementById('opening-cash');
    if (opening) {
        opening.value = Number.isFinite(data.opening) ? data.opening : '';
    }
    const withdraw = document.getElementById('owner-withdraw');
    if (withdraw) {
        withdraw.value = Number.isFinite(data.withdraw) ? data.withdraw : '';
    }
    const counted = document.getElementById('cash-counted');
    if (counted) {
        counted.value = Number.isFinite(data.counted) ? data.counted : '';
    }
    const notes = document.getElementById('cash-notes');
    if (notes) {
        notes.value = data.notes || '';
    }
}

function updateClosureSummary() {
    const dateKey = getDateKey(new Date());
    const data = cashDaily[dateKey] || {};
    const opening = parseMoney(data.opening);
    const withdraw = parseMoney(data.withdraw);
    const counted = parseMoney(data.counted);
    const paidCash = getPaidCashToday();
    const expenseTotal = getExpenseTotal(dateKey);
    const expected = opening + paidCash - expenseTotal - withdraw;
    const diff = counted - expected;

    const expectedEl = document.getElementById('cash-expected');
    if (expectedEl) {
        expectedEl.textContent = `S/ ${formatMoney(expected)}`;
    }
    const diffEl = document.getElementById('cash-diff');
    if (diffEl) {
        diffEl.textContent = `S/ ${formatMoney(diff)}`;
    }
}

function handleClosureSubmit(event) {
    event.preventDefault();
    const dateKey = getDateKey(new Date());
    const data = cashDaily[dateKey] || {};
    const paidCash = getPaidCashToday();
    const paidToday = getPaidTodayTotal();
    const expenseTotal = getExpenseTotal(dateKey);
    const expected = parseMoney(data.opening) + paidCash - expenseTotal - parseMoney(data.withdraw);
    const counted = parseMoney(data.counted);
    const diff = counted - expected;

    const record = {
        id: `C-${Date.now()}`,
        dateKey,
        closedAt: new Date().toISOString(),
        opening: parseMoney(data.opening),
        withdraw: parseMoney(data.withdraw),
        counted,
        notes: data.notes || '',
        paidCash,
        paidTotal: paidToday,
        expenses: expenseTotal,
        expected,
        diff
    };

    const existingIndex = closures.findIndex((closure) => closure.dateKey === dateKey);
    if (existingIndex >= 0) {
        closures[existingIndex] = record;
    } else {
        closures.unshift(record);
    }
    saveClosures();
    renderClosureHistory();
}

function resetClosureForm() {
    const dateKey = getDateKey(new Date());
    cashDaily[dateKey] = {
        opening: 0,
        withdraw: 0,
        counted: 0,
        notes: ''
    };
    saveCashDaily();
    updateClosureInputs();
    updateClosureSummary();
}

function renderClosureHistory() {
    const list = document.getElementById('closure-list');
    if (!list) {
        return;
    }
    if (!Array.isArray(closures) || closures.length === 0) {
        list.innerHTML = '<p class="empty-msg">Aún no registras cierres.</p>';
        return;
    }

    const sorted = [...closures].sort((a, b) => new Date(b.closedAt) - new Date(a.closedAt));
    list.innerHTML = sorted.map((item) => {
        const dateLabel = new Date(item.closedAt).toLocaleString('es-ES');
        const diffLabel = item.diff >= 0 ? `+${formatMoney(item.diff)}` : formatMoney(item.diff);
        return `
            <div class="closure-item">
                <strong>${dateLabel}</strong>
                <span>Cobrado: S/ ${formatMoney(item.paidTotal)} | Gastos: S/ ${formatMoney(item.expenses)}</span>
                <span>Esperado: S/ ${formatMoney(item.expected)} | Contado: S/ ${formatMoney(item.counted)}</span>
                <span>Diferencia: S/ ${diffLabel}</span>
                ${item.notes ? `<span>Notas: ${item.notes}</span>` : ''}
            </div>
        `;
    }).join('');
}
function renderServiceSelect() {
    const select = document.getElementById('service-type');
    if (!select) {
        return;
    }

    select.innerHTML = services.map((service) => {
        const unit = getUnitConfig(service.unit);
        const unitLabel = unit.short ? ` / ${unit.short}` : '';
        return `<option value="${service.id}">${service.name} · S/ ${formatMoney(service.price)}${unitLabel}</option>`;
    }).join('');
}

function renderServiceList() {
    const list = document.getElementById('service-list');
    if (!list) {
        return;
    }

    if (!services.length) {
        list.innerHTML = '<p class="empty-msg">Aún no tienes servicios creados.</p>';
        return;
    }

    list.innerHTML = services.map((service) => {
        const unit = getUnitConfig(service.unit);
        const tone = service.tone || 'aqua';
        return `
            <div class="service-card tone-${tone}">
                <div class="service-card-header">
                    <h4>${service.name}</h4>
                    <span>S/ ${formatMoney(service.price)}</span>
                </div>
                <p>${service.description || 'Sin descripción.'}</p>
                <span class="service-unit">${getUnitLabel(unit)}</span>
                <div class="service-actions">
                    <button class="btn-action" onclick="editService('${service.id}')">Editar</button>
                    <button class="btn-action" onclick="useServiceInOrder('${service.id}')">Usar en pedido</button>
                    <button class="btn-action btn-danger" onclick="deleteService('${service.id}')">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateServicePreview() {
    const name = document.getElementById('service-name')?.value || 'Lavado express';
    const price = parseMoney(document.getElementById('service-price')?.value);
    const unit = document.getElementById('service-unit')?.value || 'kg';
    const tone = document.getElementById('service-tone')?.value || 'aqua';
    const desc = document.getElementById('service-desc')?.value || 'Describe tu servicio aquí.';

    const previewCard = document.getElementById('service-preview-card');
    if (previewCard) {
        previewCard.className = `service-card tone-${tone}`;
    }
    const previewName = document.getElementById('preview-name');
    if (previewName) {
        previewName.textContent = name;
    }
    const previewPrice = document.getElementById('preview-price');
    if (previewPrice) {
        previewPrice.textContent = `S/ ${formatMoney(price)}`;
    }
    const previewDesc = document.getElementById('preview-desc');
    if (previewDesc) {
        previewDesc.textContent = desc;
    }
    const previewUnit = document.getElementById('preview-unit');
    if (previewUnit) {
        previewUnit.textContent = getUnitLabel(getUnitConfig(unit));
    }
}

function saveServiceFromForm() {
    const idInput = document.getElementById('service-id');
    const id = idInput?.value || '';
    const name = document.getElementById('service-name').value.trim();
    const price = parseMoney(document.getElementById('service-price').value);
    const unit = document.getElementById('service-unit').value;
    const tone = document.getElementById('service-tone').value;
    const description = document.getElementById('service-desc').value.trim();

    if (!name || !price) {
        return;
    }

    if (id) {
        const index = services.findIndex((service) => service.id === id);
        if (index >= 0) {
            services[index] = {
                ...services[index],
                name,
                price,
                unit,
                tone,
                description
            };
        }
    } else {
        services.unshift({
            id: `S-${Date.now()}`,
            name,
            price,
            unit,
            tone,
            description
        });
    }

    saveServices();
    renderServiceList();
    renderServiceSelect();
    resetServiceForm();
}

function resetServiceForm() {
    const form = document.getElementById('service-form');
    if (form) {
        form.reset();
    }
    const idInput = document.getElementById('service-id');
    if (idInput) {
        idInput.value = '';
    }
    updateServicePreview();
}

function editService(id) {
    const service = findService(id);
    if (!service) {
        return;
    }
    document.getElementById('service-id').value = service.id;
    document.getElementById('service-name').value = service.name;
    document.getElementById('service-price').value = service.price;
    document.getElementById('service-unit').value = service.unit;
    document.getElementById('service-tone').value = service.tone;
    document.getElementById('service-desc').value = service.description;
    updateServicePreview();
}

function deleteService(id) {
    const service = findService(id);
    if (!service) {
        return;
    }
    if (confirm(`¿Eliminar "${service.name}"?`)) {
        services = services.filter((item) => item.id !== id);
        saveServices();
        renderServiceList();
        renderServiceSelect();
    }
}

function useServiceInOrder(id) {
    openNewOrderModal();
    const select = document.getElementById('service-type');
    if (select) {
        select.value = id;
    }
    updateServiceFields();
    updatePriceSuggestion();
}

function resetToSuggestedServices() {
    if (!confirm('¿Restaurar la lista sugerida? Se reemplazarán tus servicios actuales.')) {
        return;
    }
    services = [...DEFAULT_SERVICES];
    saveServices();
    renderServiceList();
    renderServiceSelect();
    resetServiceForm();
}

function applyTemplate(key) {
    const template = SERVICE_TEMPLATES[key];
    if (!template) {
        return;
    }
    document.getElementById('service-id').value = '';
    document.getElementById('service-name').value = template.name;
    document.getElementById('service-price').value = template.price;
    document.getElementById('service-unit').value = template.unit;
    document.getElementById('service-tone').value = template.tone;
    document.getElementById('service-desc').value = template.description;
    updateServicePreview();
}

function updateServiceFields() {
    const serviceId = document.getElementById('service-type')?.value;
    const service = findService(serviceId);
    const unit = service?.unit || 'servicio';
    const unitConfig = getUnitConfig(unit);
    const label = document.getElementById('quantity-label');
    const quantityInput = document.getElementById('weight');
    if (label) {
        label.textContent = unitConfig.label;
    }
    if (quantityInput) {
        quantityInput.step = unitConfig.step;
        quantityInput.min = unit === 'kg' ? '0' : '1';
        if (!quantityInput.value || parseFloat(quantityInput.value) === 0) {
            quantityInput.value = unit === 'kg' ? '0' : '1';
        }
    }
}

function updatePriceSuggestion() {
    const suggestionEl = document.getElementById('price-suggestion');
    if (!suggestionEl) {
        return;
    }
    const suggested = getSuggestedPrice();
    suggestionEl.textContent = `Sugerido: S/ ${formatMoney(suggested)}`;
}

function applySuggestedPrice() {
    const totalInput = document.getElementById('total-price');
    if (!totalInput) {
        return;
    }
    totalInput.value = formatMoney(getSuggestedPrice());
}

function getSuggestedPrice() {
    const serviceId = document.getElementById('service-type')?.value;
    const service = findService(serviceId);
    if (!service) {
        return 0;
    }
    const quantity = parseMoney(document.getElementById('weight')?.value);
    if (service.unit === 'servicio') {
        return service.price;
    }
    return service.price * (quantity || 0);
}
function filterOrders() {
    const query = document.getElementById('order-search').value.toLowerCase();
    searchQuery = query;
    renderOrders();
}

function matchesSearch(order) {
    if (!searchQuery) {
        return true;
    }

    const serviceName = getOrderServiceName(order);
    const haystack = [
        order.client,
        order.id,
        order.notes,
        serviceName,
        STATUS_LABELS[order.status] || '',
        PAYMENT_LABELS[order.paymentStatus] || ''
    ].join(' ').toLowerCase();

    return haystack.includes(searchQuery);
}

function togglePaymentMethod() {
    const status = document.getElementById('payment-status');
    const method = document.getElementById('payment-method');
    if (!status || !method) {
        return;
    }
    if (status.value === 'pendiente') {
        method.value = 'efectivo';
        method.setAttribute('disabled', 'disabled');
    } else {
        method.removeAttribute('disabled');
    }
}

function getNextOrderId() {
    const stored = parseInt(localStorage.getItem('lavapro_last_id'), 10);
    const maxExisting = orders.reduce((max, order) => {
        const digits = parseInt(String(order.id || '').replace(/\D/g, ''), 10);
        if (Number.isNaN(digits)) {
            return max;
        }
        return Math.max(max, digits);
    }, 0);
    const next = Math.max(stored || 0, maxExisting || 0) + 1;
    localStorage.setItem('lavapro_last_id', next);
    return `L-${String(next).padStart(4, '0')}`;
}

function getPaidTodayTotal() {
    const today = new Date();
    return orders
        .filter((order) => {
            if (order.paymentStatus !== 'pagado') {
                return false;
            }
            const paidAt = order.paidAt ? new Date(order.paidAt) : new Date(order.date);
            return isSameDay(paidAt, today);
        })
        .reduce((sum, order) => sum + order.total, 0);
}

function getPaidBreakdownToday() {
    const today = new Date();
    const breakdown = {};
    orders.forEach((order) => {
        if (order.paymentStatus !== 'pagado') {
            return;
        }
        const paidAt = order.paidAt ? new Date(order.paidAt) : new Date(order.date);
        if (!isSameDay(paidAt, today)) {
            return;
        }
        const method = order.paymentMethod || 'efectivo';
        breakdown[method] = (breakdown[method] || 0) + order.total;
    });
    return breakdown;
}

function getPaidCashToday() {
    const today = new Date();
    return orders
        .filter((order) => {
            if (order.paymentStatus !== 'pagado') {
                return false;
            }
            const paidAt = order.paidAt ? new Date(order.paidAt) : new Date(order.date);
            return isSameDay(paidAt, today) && (order.paymentMethod || 'efectivo') === 'efectivo';
        })
        .reduce((sum, order) => sum + order.total, 0);
}

function getPendingTotal() {
    return orders
        .filter((order) => order.paymentStatus === 'pendiente')
        .reduce((sum, order) => sum + order.total, 0);
}

function getExpenseTotal(dateKey) {
    const items = Array.isArray(expenses[dateKey]) ? expenses[dateKey] : [];
    return items.reduce((sum, item) => sum + item.amount, 0);
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isSameDay(dateA, dateB) {
    return dateA.getFullYear() === dateB.getFullYear()
        && dateA.getMonth() === dateB.getMonth()
        && dateA.getDate() === dateB.getDate();
}

function formatMoney(value) {
    return Number.isFinite(value) ? value.toFixed(2) : '0.00';
}

function parseMoney(value) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

function formatQuantity(value, unit) {
    const number = parseFloat(value);
    if (!Number.isFinite(number)) {
        return '0';
    }
    if (unit === 'kg') {
        return number % 1 === 0 ? number.toFixed(0) : number.toFixed(1);
    }
    return number % 1 === 0 ? number.toFixed(0) : number.toFixed(1);
}

function getUnitConfig(unit) {
    return UNIT_CONFIG[unit] || UNIT_CONFIG.servicio;
}

function getUnitLabel(unitConfig) {
    if (unitConfig.label.includes('kg')) {
        return 'Por kilo';
    }
    if (unitConfig.label.includes('pzas')) {
        return 'Por pieza';
    }
    if (unitConfig.label.includes('paq')) {
        return 'Por paquete';
    }
    return 'Por servicio';
}

function getPaymentMethodLabel(method) {
    return PAYMENT_METHOD_LABELS[method] || 'Otro';
}

function getInitials(text) {
    const parts = text.split(' ').filter(Boolean);
    if (parts.length === 0) {
        return 'DN';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function findService(id) {
    return services.find((service) => service.id === id);
}

function getOrderServiceName(order) {
    if (order.serviceName) {
        return order.serviceName;
    }
    const service = findService(order.service);
    return service?.name || order.service || 'Servicio';
}

function getOrderUnit(order) {
    if (order.serviceUnit) {
        return order.serviceUnit;
    }
    const service = findService(order.service);
    return service?.unit || 'servicio';
}

function getOrderQuantity(order) {
    if (Number.isFinite(order.quantity)) {
        return order.quantity;
    }
    if (Number.isFinite(order.weight)) {
        return order.weight;
    }
    return 0;
}

function prepareInvoice(order) {
    const unit = getOrderUnit(order);
    const unitConfig = getUnitConfig(unit);

    document.getElementById('invoice-id').textContent = `#${order.id}`;
    document.getElementById('print-client').textContent = order.client;
    document.getElementById('print-date').textContent = new Date(order.date).toLocaleString('es-ES');
    document.getElementById('print-service').textContent = getOrderServiceName(order);
    document.getElementById('print-weight').textContent = formatQuantity(getOrderQuantity(order), unit);
    document.getElementById('print-unit').textContent = unitConfig.short;
    document.getElementById('print-quantity-label').textContent = `${unitConfig.invoiceLabel}:`;
    document.getElementById('print-notes').textContent = order.notes || 'Sin notas';
    document.getElementById('print-total').textContent = formatMoney(order.total);
    document.getElementById('print-payment').textContent = PAYMENT_LABELS[order.paymentStatus] || 'Pendiente';
    document.getElementById('print-method').textContent = order.paymentStatus === 'pagado'
        ? getPaymentMethodLabel(order.paymentMethod)
        : '-';

    document.getElementById('print-business').textContent = ownerProfile.businessName || 'Lavandería Simple';
    document.getElementById('print-owner').textContent = ownerProfile.ownerName
        ? `Dueño: ${ownerProfile.ownerName}`
        : 'Dueño: -';
    document.getElementById('print-phone').textContent = ownerProfile.phone
        ? `Teléfono: ${ownerProfile.phone}`
        : 'Teléfono: -';
    document.getElementById('print-address').textContent = ownerProfile.address
        ? `Dirección: ${ownerProfile.address}`
        : 'Dirección: -';
}

function reprintOrder(id) {
    const order = orders.find((item) => item.id === id);
    if (order) {
        prepareInvoice(order);
        setTimeout(() => window.print(), 100);
    }
}

function migrateOrders(existingOrders) {
    if (!Array.isArray(existingOrders)) {
        return [];
    }

    const legacyMap = {
        lavado: 'recibido',
        secado: 'en_proceso',
        listo: 'listo',
        entregado: 'entregado'
    };

    return existingOrders.map((order) => {
        const updated = { ...order };
        if (legacyMap[updated.status]) {
            updated.status = legacyMap[updated.status];
        }
        if (!STATUS_FLOW.includes(updated.status)) {
            updated.status = 'recibido';
        }
        if (!updated.paymentStatus) {
            updated.paymentStatus = 'pagado';
        }
        if (typeof updated.paymentMethod !== 'string') {
            updated.paymentMethod = '';
        }
        if (updated.paymentStatus === 'pagado') {
            if (!updated.paidAt) {
                updated.paidAt = updated.date;
            }
            if (!updated.paymentMethod) {
                updated.paymentMethod = 'efectivo';
            }
        }

        const totalValue = parseMoney(updated.total);
        updated.total = totalValue;

        const quantityValue = parseMoney(updated.quantity ?? updated.weight);
        updated.quantity = quantityValue;
        updated.weight = quantityValue;

        if (!updated.serviceUnit) {
            const service = DEFAULT_SERVICES.find((item) => item.id === updated.service);
            updated.serviceUnit = service?.unit || 'servicio';
        }

        if (!updated.serviceName) {
            const service = DEFAULT_SERVICES.find((item) => item.id === updated.service);
            updated.serviceName = service?.name || updated.service || 'Servicio';
        }

        return updated;
    });
}

