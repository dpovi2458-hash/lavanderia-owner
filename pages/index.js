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
                                                step="0.5"
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
