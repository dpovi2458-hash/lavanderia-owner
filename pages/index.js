import Head from 'next/head';
import Script from 'next/script';

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Lavanderia del Dueno - Control Diario</title>
                <meta
                    name="description"
                    content="Panel sencillo para el dueno: pedidos, servicios propios y cierre de caja profesional."
                />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <link rel="stylesheet" href="/style.css" />
            </Head>

            <div className="app-container">
                <aside className="sidebar">
                    <div className="logo">
                        <div className="logo-icon">LP</div>
                        <div>
                            <h1 id="brand-name">Lavanderia Simple</h1>
                            <p className="logo-subtitle">Cuenta del dueno</p>
                        </div>
                    </div>
                    <nav>
                        <button
                            className="nav-btn active"
                            id="btn-dashboard"
                            onClick={() => window.switchTab('dashboard')}
                        >
                            <span className="icon">#</span> Panel
                        </button>
                        <button
                            className="nav-btn"
                            id="btn-services"
                            onClick={() => window.switchTab('services')}
                        >
                            <span className="icon">*</span> Servicios
                        </button>
                        <button
                            className="nav-btn"
                            id="btn-new-order"
                            onClick={() => window.openNewOrderModal()}
                        >
                            <span className="icon">+</span> Nuevo pedido
                        </button>
                        <button
                            className="nav-btn"
                            id="btn-cash"
                            onClick={() => window.switchTab('cash')}
                        >
                            <span className="icon">$</span> Caja profesional
                        </button>
                        <button
                            className="nav-btn"
                            id="btn-history"
                            onClick={() => window.switchTab('history')}
                        >
                            <span className="icon">=</span> Historial
                        </button>
                    </nav>
                    <div className="sidebar-footer">
                        <p id="owner-footer">Solo para el dueno</p>
                        <span className="status-dot" /> Activo
                    </div>
                </aside>
                <main className="main-content">
                    <header className="top-bar">
                        <div className="search-container">
                            <input
                                type="text"
                                id="order-search"
                                placeholder="Buscar cliente, ID o notas..."
                                onInput={() => window.filterOrders()}
                            />
                            <span className="search-icon">/</span>
                        </div>
                        <div className="user-profile">
                            <div className="user-meta">
                                <span className="date" id="current-date"></span>
                                <span className="owner-tag" id="owner-display">Dueno</span>
                            </div>
                            <div className="avatar" id="owner-initials">DN</div>
                        </div>
                    </header>

                    <section id="dashboard" className="tab-content active">
                        <div className="owner-hero">
                            <div>
                                <p className="eyebrow">Panel del dueno</p>
                                <h2>Control diario sin empleados</h2>
                                <p>Registra pedidos, cobra y emite facturas en blanco y negro.</p>
                            </div>
                            <div className="hero-actions">
                                <button className="btn-primary" onClick={() => window.openNewOrderModal()}>
                                    Nuevo pedido
                                </button>
                                <button className="btn-secondary" onClick={() => window.switchTab('cash')}>
                                    Cierre de caja
                                </button>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Pedidos activos</h3>
                                <p id="stat-active">0</p>
                            </div>
                            <div className="stat-card">
                                <h3>Listos para entregar</h3>
                                <p id="stat-ready">0</p>
                            </div>
                            <div className="stat-card">
                                <h3>Cobrado hoy</h3>
                                <p id="stat-paid">S/ 0.00</p>
                            </div>
                            <div className="stat-card">
                                <h3>Pendiente por cobrar</h3>
                                <p id="stat-pending">S/ 0.00</p>
                            </div>
                        </div>

                        <div className="orders-section">
                            <div className="section-header">
                                <h2>Pedidos en curso</h2>
                                <div className="filters">
                                    <span className="filter-chip active" data-filter="todos">Todos</span>
                                    <span className="filter-chip" data-filter="recibido">Recibido</span>
                                    <span className="filter-chip" data-filter="en_proceso">En proceso</span>
                                    <span className="filter-chip" data-filter="listo">Listo</span>
                                </div>
                            </div>

                            <div className="orders-list" id="orders-container">
                                <div className="empty-state">
                                    <p>No hay pedidos activos actualmente.</p>
                                    <button className="btn-primary" onClick={() => window.openNewOrderModal()}>
                                        Crear primer pedido
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="services" className="tab-content">
                        <div className="section-header">
                            <h2>Servicios a tu medida</h2>
                            <button
                                className="btn-secondary"
                                type="button"
                                onClick={() => window.resetToSuggestedServices()}
                            >
                                Restaurar sugeridos
                            </button>
                        </div>

                        <div className="services-layout">
                            <div className="service-creator">
                                <div className="creator-head">
                                    <div>
                                        <h3>Crea tu servicio</h3>
                                        <p>Elige una plantilla o arma tu servicio en segundos.</p>
                                    </div>
                                    <div className="template-group">
                                        <button type="button" className="template-chip" data-template="lavado">
                                            Lavado por kilo
                                        </button>
                                        <button type="button" className="template-chip" data-template="planchado">
                                            Planchado por pieza
                                        </button>
                                        <button type="button" className="template-chip" data-template="especial">
                                            Edredon premium
                                        </button>
                                    </div>
                                </div>

                                <form id="service-form" className="service-form">
                                    <input type="hidden" id="service-id" />
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="service-name">Nombre del servicio</label>
                                            <input
                                                type="text"
                                                id="service-name"
                                                placeholder="Ej: Lavado express"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="service-price">Precio S/</label>
                                            <input
                                                type="number"
                                                id="service-price"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="service-unit">Unidad de cobro</label>
                                            <select id="service-unit">
                                                <option value="kg">Por kilo (kg)</option>
                                                <option value="pieza">Por pieza</option>
                                                <option value="servicio">Por servicio</option>
                                                <option value="paquete">Por paquete</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="service-tone">Estilo de tarjeta</label>
                                            <select id="service-tone">
                                                <option value="aqua">Aqua</option>
                                                <option value="amber">Arena</option>
                                                <option value="rose">Rosa</option>
                                                <option value="slate">Carbon</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="service-desc">Descripcion corta</label>
                                        <input
                                            type="text"
                                            id="service-desc"
                                            placeholder="Ej: Entrega en 24 horas"
                                        />
                                    </div>
                                    <div className="creator-actions">
                                        <button type="submit" className="btn-primary" id="service-submit">
                                            Guardar servicio
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            id="service-reset"
                                            onClick={() => window.resetServiceForm()}
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                </form>

                                <div className="service-preview">
                                    <p className="preview-label">Vista previa</p>
                                    <div className="service-card tone-aqua" id="service-preview-card">
                                        <div className="service-card-header">
                                            <h4 id="preview-name">Lavado express</h4>
                                            <span id="preview-price">S/ 0.00</span>
                                        </div>
                                        <p id="preview-desc">Describe tu servicio aqui.</p>
                                        <span className="service-unit" id="preview-unit">Por kilo</span>
                                    </div>
                                </div>
                            </div>

                            <div className="service-list-block">
                                <div className="section-header compact">
                                    <h3>Tus servicios</h3>
                                </div>
                                <div id="service-list" className="service-list"></div>
                            </div>
                        </div>
                    </section>
                    <section id="cash" className="tab-content">
                        <div className="section-header">
                            <h2>Caja del dueno</h2>
                        </div>

                        <div className="cash-grid primary">
                            <div className="cash-card">
                                <h3>Resumen de hoy</h3>
                                <div className="cash-row">
                                    <span>Cobrado hoy</span>
                                    <strong id="cash-paid">S/ 0.00</strong>
                                </div>
                                <div className="cash-row">
                                    <span>Pendiente por cobrar</span>
                                    <strong id="cash-pending">S/ 0.00</strong>
                                </div>
                                <div className="cash-row">
                                    <span>Gastos del dia</span>
                                    <strong id="cash-expenses">S/ 0.00</strong>
                                </div>
                                <div className="cash-row total">
                                    <span>Balance del dia</span>
                                    <strong id="cash-net">S/ 0.00</strong>
                                </div>
                                <p className="helper">Balance = cobrado hoy - gastos.</p>
                            </div>

                            <div className="cash-card">
                                <h3>Ventas por metodo</h3>
                                <div className="cash-breakdown" id="cash-breakdown"></div>
                                <p className="helper">Solo incluye pedidos pagados hoy.</p>
                            </div>

                            <div className="cash-card">
                                <h3>Datos del dueno</h3>
                                <form id="owner-form" className="owner-form">
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="owner-name">Nombre del dueno</label>
                                            <input
                                                type="text"
                                                id="owner-name"
                                                placeholder="Ej: Maria Perez"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="business-name">Nombre del negocio</label>
                                            <input
                                                type="text"
                                                id="business-name"
                                                placeholder="Ej: Lavanderia Simple"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="business-phone">Telefono</label>
                                            <input
                                                type="text"
                                                id="business-phone"
                                                placeholder="Ej: 999 123 456"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="business-address">Direccion</label>
                                            <input
                                                type="text"
                                                id="business-address"
                                                placeholder="Ej: Jr. Lima 123"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary">Guardar datos</button>
                                </form>
                            </div>
                        </div>

                        <div className="cash-grid secondary">
                            <div className="cash-card closure-card">
                                <div className="section-header compact">
                                    <h3>Cierre de caja profesional</h3>
                                </div>
                                <form id="closure-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                    <label htmlFor="opening-cash">Caja inicial S/</label>
                                    <input
                                        type="number"
                                        id="opening-cash"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                        </div>
                                        <div className="form-group">
                                    <label htmlFor="owner-withdraw">Retiro del dueno S/</label>
                                    <input
                                        type="number"
                                        id="owner-withdraw"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                    <label htmlFor="cash-counted">Efectivo contado S/</label>
                                    <input
                                        type="number"
                                        id="cash-counted"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                    />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="cash-notes">Notas de cierre</label>
                                            <input type="text" id="cash-notes" placeholder="Ej: falta vuelto" />
                                        </div>
                                    </div>
                                    <div className="closure-summary">
                                        <div className="summary-item">
                                            <span>Esperado en caja</span>
                                            <strong id="cash-expected">S/ 0.00</strong>
                                        </div>
                                        <div className="summary-item">
                                            <span>Diferencia</span>
                                            <strong id="cash-diff">S/ 0.00</strong>
                                        </div>
                                    </div>
                                    <div className="creator-actions">
                                        <button type="submit" className="btn-primary">Guardar cierre</button>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={() => window.resetClosureForm()}
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="expense-card">
                                <div className="section-header compact">
                                    <h3>Gastos del dia</h3>
                                </div>
                                <form id="expense-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="expense-concept">Concepto</label>
                                            <input
                                                type="text"
                                                id="expense-concept"
                                                placeholder="Ej: Detergente, bolsas..."
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                    <label htmlFor="expense-amount">Monto S/</label>
                                    <input
                                        type="number"
                                        id="expense-amount"
                                        step="0.01"
                                        min="0"
                                        required
                                        placeholder="0.00"
                                    />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-secondary">Registrar gasto</button>
                                </form>
                                <div className="expense-list" id="expense-list">
                                    <p className="empty-msg">No hay gastos registrados hoy.</p>
                                </div>
                            </div>
                        </div>

                        <div className="closure-history" id="closure-history">
                            <div className="section-header compact">
                                <h3>Historial de cierres</h3>
                            </div>
                            <div className="closure-list" id="closure-list">
                                <p className="empty-msg">Aun no registras cierres.</p>
                            </div>
                        </div>
                    </section>

                    <section id="history" className="tab-content">
                        <div className="section-header">
                            <h2>Historial de pedidos</h2>
                        </div>
                        <div className="orders-list" id="history-container">
                            <p className="empty-msg">No hay pedidos en el historial.</p>
                        </div>
                    </section>
                </main>
            </div>
            <div id="order-modal" className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Nuevo pedido</h2>
                        <span className="close" onClick={() => window.closeModal('order-modal')}>
                            &times;
                        </span>
                    </div>
                    <form id="new-order-form">
                        <div className="form-group">
                            <label htmlFor="client-name">Nombre del cliente</label>
                            <input
                                type="text"
                                id="client-name"
                                required
                                placeholder="Ej: Juan Perez"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="service-type">Servicio</label>
                            <select id="service-type"></select>
                            <button type="button" className="link-btn" onClick={() => window.goToServices()}>
                                Crear o editar servicios
                            </button>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="weight" id="quantity-label">Cantidad</label>
                                <input
                                    type="number"
                                    id="weight"
                                    step="0.1"
                                    min="0"
                                    defaultValue="1"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="total-price">Total S/</label>
                                <input
                                    type="number"
                                    id="total-price"
                                    step="0.01"
                                    min="0"
                                    required
                                    placeholder="0.00"
                                />
                                <div className="price-helper">
                                    <span id="price-suggestion">Sugerido: S/ 0.00</span>
                                    <button
                                        type="button"
                                        className="link-btn"
                                        onClick={() => window.applySuggestedPrice()}
                                    >
                                        Usar sugerido
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="notes">Notas / Observaciones</label>
                            <textarea id="notes" placeholder="Ej: Delicados, sin suavizante..."></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="payment-status">Estado de pago</label>
                                <select id="payment-status">
                                    <option value="pagado">Pagado</option>
                                    <option value="pendiente">Pendiente</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="payment-method">Metodo de pago</label>
                                <select id="payment-method">
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="yape">Yape/Plin</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => window.closeModal('order-modal')}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary">Guardar e imprimir</button>
                        </div>
                    </form>
                </div>
            </div>
            <div id="printable-invoice" className="print-only">
                <div className="invoice-box">
                    <header>
                        <div className="header-content">
                            <p className="receipt-title">FACTURA DE SERVICIO</p>
                            <p className="company-name" id="print-business">Lavanderia Simple</p>
                            <p className="company-details" id="print-owner">Dueno: -</p>
                            <p className="company-details" id="print-phone">Telefono: -</p>
                            <p className="company-details" id="print-address">Direccion: -</p>
                            <p className="invoice-id" id="invoice-id">#0000</p>
                        </div>
                    </header>
                    <hr />
                    <div className="details">
                        <p><strong>Cliente:</strong> <span id="print-client">-</span></p>
                        <p><strong>Fecha:</strong> <span id="print-date">-</span></p>
                        <p><strong>Servicio:</strong> <span id="print-service">-</span></p>
                        <p>
                            <strong id="print-quantity-label">Cantidad:</strong> <span id="print-weight">-</span>{' '}
                            <span id="print-unit">-</span>
                        </p>
                        <p><strong>Pago:</strong> <span id="print-payment">-</span></p>
                        <p><strong>Metodo:</strong> <span id="print-method">-</span></p>
                    </div>
                    <hr />
                    <div className="notes">
                        <p><strong>Notas:</strong></p>
                        <p id="print-notes">-</p>
                    </div>
                    <hr />
                    <div className="total-section">
                        <p className="total-label">TOTAL:</p>
                        <p className="total-amount">
                            S/ <span id="print-total">0.00</span>
                        </p>
                    </div>
                    <div className="footer">
                        <p>Gracias por su preferencia.</p>
                        <p>Presentar este ticket para recoger su ropa.</p>
                    </div>
                </div>
            </div>

            <Script src="/app.js" strategy="afterInteractive" />
        </>
    );
}
