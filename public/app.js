// Simulación de Base de Datos - Sistema de Finanzas Personales
class FinanceDatabase {
    constructor() {
        this.tables = {
            usuarios: 'finance_usuarios',
            cuentas_bancarias: 'finance_cuentas',
            categorias: 'finance_categorias',
            transacciones: 'finance_transacciones',
            presupuestos_mensuales: 'finance_presupuestos',
            meses_disponibles: 'finance_meses',
            configuracion: 'finance_config'
        };
        this.currentUser = null;
        this.currentMonth = 'junio_2025';
        this.initializeDatabase();
    }

    // Inicializar base de datos con datos por defecto
    initializeDatabase() {
        // Verificar si ya existe data
        if (!localStorage.getItem(this.tables.usuarios)) {
            this.seedDatabase();
        }
        this.loadConfiguration();
    }

    // Cargar datos iniciales
    seedDatabase() {
        const initialData = {
            usuarios: [
                { id: 1, nombre: "Camilo", email: "camilo@email.com", password: "123456", rol: "admin", fechaCreacion: new Date().toISOString() },
                { id: 2, nombre: "Esposa", email: "esposa@email.com", password: "123456", rol: "user", fechaCreacion: new Date().toISOString() }
            ],
            cuentas_bancarias: [
                { id: 1, nombre: "Bancolombia", tipo: "corriente", saldo: 15000000, ingresoMensual: 8000000, usuarioId: 1 },
                { id: 2, nombre: "BBVA", tipo: "ahorro", saldo: 2500000, ingresoMensual: 2000000, usuarioId: 1 },
                { id: 3, nombre: "Cuenta Ahorro", tipo: "ahorro", saldo: 1000000, ingresoMensual: 500000, usuarioId: 2 }
            ],
            categorias: [
                {
                    id: 1,
                    nombre: "Servicios del hogar",
                    icono: "🏠",
                    color: "#3B82F6",
                    conceptos: ["Agua", "Gas", "Luz", "Internet hogar", "Administración conjunto", "Telefono Mia", "Telefono Camilo", "Telefono Angelica"]
                },
                {
                    id: 2,
                    nombre: "Apoyo hogar y familia",
                    icono: "👨‍👩‍👧‍👦",
                    color: "#10B981",
                    conceptos: ["Sueldo Lina", "Sueldo Mamita sol", "Apoyo padres", "Leche Bella", "Pañales", "Mercado", "Comida mascotas"]
                },
                {
                    id: 3,
                    nombre: "Ocio y entretenimiento",
                    icono: "🎉",
                    color: "#F59E0B",
                    conceptos: ["Comidas fuera", "Salidas", "Transporte y gasolina", "Niñera nocturna"]
                },
                {
                    id: 4,
                    nombre: "Deudas y costos fijos",
                    icono: "💰",
                    color: "#EF4444",
                    conceptos: ["Medicina prepagada", "Ahorro mensual", "Credito libre inversión", "Credito auto"]
                },
                {
                    id: 5,
                    nombre: "Suscripciones",
                    icono: "📱",
                    color: "#8B5CF6",
                    conceptos: ["Netflix", "YouTube", "Spotify", "Google", "ChatGPT", "Canva", "Otras"]
                }
            ],
            presupuestos_mensuales: {
                "junio_2025": {
                    "Servicios del hogar": { estimado: 1163000, real: 0 },
                    "Apoyo hogar y familia": { estimado: 6900000, real: 0 },
                    "Ocio y entretenimiento": { estimado: 2000000, real: 0 },
                    "Deudas y costos fijos": { estimado: 5150000, real: 0 },
                    "Suscripciones": { estimado: 348000, real: 0 }
                }
            },
            transacciones: [],
            meses_disponibles: ["junio_2025"],
            configuracion: {
                mesActual: "junio_2025",
                ultimoBackup: null,
                version: "1.0.0"
            }
        };

        // Guardar datos iniciales
        Object.keys(initialData).forEach(table => {
            localStorage.setItem(this.tables[table], JSON.stringify(initialData[table]));
        });

        this.logQuery('SEED', 'Database initialized with default data');
    }

    // Cargar configuración
    loadConfiguration() {
        const config = this.select('configuracion')[0] || {};
        this.currentMonth = config.mesActual || 'junio_2025';
    }

    // Operaciones CRUD

    // SELECT - Obtener datos
    select(table, condition = null) {
        try {
            const data = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
            let result = Array.isArray(data) ? data : [data];
            
            if (condition) {
                result = result.filter(condition);
            }
            
            this.logQuery('SELECT', `${table} - ${result.length} records`);
            return result;
        } catch (error) {
            console.error('Error in SELECT:', error);
            return [];
        }
    }

    // INSERT - Insertar datos
    insert(table, record) {
        try {
            const data = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
            
            if (Array.isArray(data)) {
                // Generar ID si no existe
                if (!record.id) {
                    record.id = data.length > 0 ? Math.max(...data.map(r => r.id || 0)) + 1 : 1;
                }
                data.push(record);
            } else {
                // Para objetos (como presupuestos_mensuales)
                Object.assign(data, record);
            }
            
            localStorage.setItem(this.tables[table], JSON.stringify(data));
            this.logQuery('INSERT', `${table} - Record added`);
            return record;
        } catch (error) {
            console.error('Error in INSERT:', error);
            return null;
        }
    }

    // UPDATE - Actualizar datos
    update(table, condition, updates) {
        try {
            const data = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
            let updated = 0;
            
            if (Array.isArray(data)) {
                data.forEach(record => {
                    if (condition(record)) {
                        Object.assign(record, updates);
                        updated++;
                    }
                });
            } else {
                Object.assign(data, updates);
                updated = 1;
            }
            
            localStorage.setItem(this.tables[table], JSON.stringify(data));
            this.logQuery('UPDATE', `${table} - ${updated} records updated`);
            return updated;
        } catch (error) {
            console.error('Error in UPDATE:', error);
            return 0;
        }
    }

    // DELETE - Eliminar datos
    delete(table, condition) {
        try {
            const data = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
            let deleted = 0;
            
            if (Array.isArray(data)) {
                const newData = data.filter(record => {
                    if (condition(record)) {
                        deleted++;
                        return false;
                    }
                    return true;
                });
                localStorage.setItem(this.tables[table], JSON.stringify(newData));
            }
            
            this.logQuery('DELETE', `${table} - ${deleted} records deleted`);
            return deleted;
        } catch (error) {
            console.error('Error in DELETE:', error);
            return 0;
        }
    }

    // Consultas complejas
    aggregate(table, groupBy, aggregateField, operation = 'sum') {
        const data = this.select(table);
        const grouped = {};
        
        data.forEach(record => {
            const key = typeof groupBy === 'function' ? groupBy(record) : record[groupBy];
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(record);
        });
        
        const result = {};
        Object.keys(grouped).forEach(key => {
            const values = grouped[key].map(r => r[aggregateField] || 0);
            switch (operation) {
                case 'sum':
                    result[key] = values.reduce((a, b) => a + b, 0);
                    break;
                case 'avg':
                    result[key] = values.reduce((a, b) => a + b, 0) / values.length;
                    break;
                case 'count':
                    result[key] = values.length;
                    break;
                case 'max':
                    result[key] = Math.max(...values);
                    break;
                case 'min':
                    result[key] = Math.min(...values);
                    break;
            }
        });
        
        this.logQuery('AGGREGATE', `${table} - ${operation} by ${groupBy}`);
        return result;
    }

    // JOIN - Unir tablas
    join(leftTable, rightTable, leftKey, rightKey, type = 'inner') {
        const leftData = this.select(leftTable);
        const rightData = this.select(rightTable);
        const result = [];
        
        leftData.forEach(leftRecord => {
            const matches = rightData.filter(rightRecord => 
                leftRecord[leftKey] === rightRecord[rightKey]
            );
            
            if (matches.length > 0) {
                matches.forEach(match => {
                    result.push({ ...leftRecord, ...match });
                });
            } else if (type === 'left') {
                result.push(leftRecord);
            }
        });
        
        this.logQuery('JOIN', `${leftTable} ${type} join ${rightTable}`);
        return result;
    }

    // Backup y restauración
    backup() {
        const backup = {};
        Object.keys(this.tables).forEach(table => {
            backup[table] = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
        });
        
        backup.timestamp = new Date().toISOString();
        backup.version = "1.0.0";
        
        // Actualizar fecha de último backup
        this.update('configuracion', () => true, { ultimoBackup: backup.timestamp });
        
        this.logQuery('BACKUP', 'Database backup created');
        return backup;
    }

    restore(backupData) {
        try {
            Object.keys(this.tables).forEach(table => {
                if (backupData[table]) {
                    localStorage.setItem(this.tables[table], JSON.stringify(backupData[table]));
                }
            });
            
            this.logQuery('RESTORE', 'Database restored from backup');
            return true;
        } catch (error) {
            console.error('Error restoring backup:', error);
            return false;
        }
    }

    // Optimización
    optimize() {
        let optimized = 0;
        
        // Limpiar transacciones huérfanas
        const usuarios = this.select('usuarios');
        const userIds = usuarios.map(u => u.id);
        
        const orphanTransactions = this.select('transacciones', 
            t => !userIds.includes(t.usuarioId)
        );
        
        if (orphanTransactions.length > 0) {
            this.delete('transacciones', t => !userIds.includes(t.usuarioId));
            optimized += orphanTransactions.length;
        }
        
        this.logQuery('OPTIMIZE', `Database optimized - ${optimized} orphan records removed`);
        return optimized;
    }

    // Estadísticas de la base de datos
    getStats() {
        const stats = {};
        let totalRecords = 0;
        let totalSize = 0;
        
        Object.keys(this.tables).forEach(table => {
            const data = JSON.parse(localStorage.getItem(this.tables[table]) || '[]');
            const records = Array.isArray(data) ? data.length : 1;
            const size = new Blob([JSON.stringify(data)]).size;
            
            stats[table] = {
                records: records,
                size: size
            };
            
            totalRecords += records;
            totalSize += size;
        });
        
        stats.totalSize = totalSize;
        stats.totalRecords = totalRecords;
        
        return stats;
    }

    // Log de consultas
    logQuery(operation, details) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, operation, details };
        
        let queryLog = JSON.parse(localStorage.getItem('finance_query_log') || '[]');
        queryLog.push(logEntry);
        
        // Mantener solo las últimas 100 consultas
        if (queryLog.length > 100) {
            queryLog = queryLog.slice(-100);
        }
        
        localStorage.setItem('finance_query_log', JSON.stringify(queryLog));
    }

    getQueryLog() {
        return JSON.parse(localStorage.getItem('finance_query_log') || '[]').slice(-20);
    }

    // Limpiar toda la base de datos
    clearAll() {
        Object.values(this.tables).forEach(table => {
            localStorage.removeItem(table);
        });
        localStorage.removeItem('finance_query_log');
        this.seedDatabase();
    }
}

// Aplicación Principal
class FinanceApp {
    constructor() {
        this.db = new FinanceDatabase();
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.selectedCategory = null;
        this.selectedConcept = null;
        this.editingItem = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    // Gestión de autenticación
    checkAuthState() {
        const sessionUser = sessionStorage.getItem('finance_current_user');
        if (sessionUser) {
            this.currentUser = JSON.parse(sessionUser);
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        document.getElementById('current-user-name').textContent = this.currentUser.nombre;
        this.loadMonthSelector();
        this.showSection('dashboard');
    }

    login(email, password) {
        const users = this.db.select('usuarios', u => u.email === email && u.password === password);
        
        if (users.length > 0) {
            this.currentUser = users[0];
            sessionStorage.setItem('finance_current_user', JSON.stringify(this.currentUser));
            this.showMainApp();
            this.showNotification('¡Bienvenido ' + this.currentUser.nombre + '!', 'success');
            return true;
        }
        return false;
    }

    register(nombre, email, password, rol) {
        const existingUser = this.db.select('usuarios', u => u.email === email);
        
        if (existingUser.length > 0) {
            this.showNotification('El email ya está registrado', 'error');
            return false;
        }

        const newUser = {
            nombre,
            email,
            password,
            rol,
            fechaCreacion: new Date().toISOString()
        };

        this.db.insert('usuarios', newUser);
        this.showNotification('Usuario registrado exitosamente', 'success');
        return true;
    }

    logout() {
        sessionStorage.removeItem('finance_current_user');
        this.currentUser = null;
        this.showLoginScreen();
        this.showNotification('Sesión cerrada', 'info');
    }

    // Event Listeners
    setupEventListeners() {
        // Login/Register
        this.setupAuthListeners();
        
        // Navigation
        this.setupNavigationListeners();
        
        // Modals
        this.setupModalListeners();
        
        // Quick Add
        this.setupQuickAddListeners();
        
        // Forms
        this.setupFormListeners();
        
        // Database actions
        this.setupDatabaseListeners();
    }

    setupAuthListeners() {
        // Tabs
        document.querySelectorAll('.login-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.login-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.login-form').forEach(f => f.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-form').classList.add('active');
            });
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!this.login(email, password)) {
                this.showNotification('Credenciales incorrectas', 'error');
            }
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const rol = document.getElementById('register-role').value;
            
            if (this.register(nombre, email, password, rol)) {
                // Switch to login tab
                document.querySelector('[data-tab="login"]').click();
                document.getElementById('register-form').reset();
            }
        });

        // Demo login
        document.getElementById('demo-login').addEventListener('click', () => {
            this.login('camilo@email.com', '123456');
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    setupNavigationListeners() {
        document.querySelectorAll('.sidebar__item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        document.getElementById('month-selector').addEventListener('change', (e) => {
            this.db.currentMonth = e.target.value;
            this.db.update('configuracion', () => true, { mesActual: e.target.value });
            document.getElementById('current-month-display').textContent = this.getMonthDisplayName(e.target.value);
            this.refreshCurrentSection();
        });
    }

    setupModalListeners() {
        // Close modals
        document.querySelectorAll('.modal__close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    setupQuickAddListeners() {
        document.getElementById('quick-add-btn').addEventListener('click', () => {
            this.openQuickAddModal();
        });

        document.getElementById('quick-add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuickAdd();
        });
    }

    setupFormListeners() {
        document.getElementById('generic-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGenericForm();
        });

        // Action buttons
        document.getElementById('add-month-btn').addEventListener('click', () => {
            this.openMonthModal();
        });

        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('add-account-btn').addEventListener('click', () => {
            this.openAccountModal();
        });

        document.getElementById('generate-budget-btn').addEventListener('click', () => {
            this.generateBudget();
        });

        document.getElementById('export-transactions-btn').addEventListener('click', () => {
            this.exportTransactions();
        });
    }

    setupDatabaseListeners() {
        document.getElementById('backup-btn').addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('restore-btn').addEventListener('click', () => {
            document.getElementById('restore-input').click();
        });

        document.getElementById('restore-input').addEventListener('change', (e) => {
            this.restoreBackup(e.target.files[0]);
        });

        document.getElementById('reset-db-btn').addEventListener('click', () => {
            this.confirmAction('¿Estás seguro de reiniciar la base de datos? Se perderán todos los datos.', () => {
                this.db.clearAll();
                this.showNotification('Base de datos reiniciada', 'success');
                this.refreshCurrentSection();
            });
        });

        document.getElementById('optimize-db-btn').addEventListener('click', () => {
            const optimized = this.db.optimize();
            this.showNotification(`Base de datos optimizada. ${optimized} registros huérfanos eliminados.`, 'success');
            this.refreshCurrentSection();
        });
    }

    // Navigation
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.sidebar__item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Render section content
        this.renderSection(sectionName);
    }

    renderSection(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'meses':
                this.renderMonthsManagement();
                break;
            case 'categorias':
                this.renderCategoriesManagement();
                break;
            case 'cuentas':
                this.renderAccountsManagement();
                break;
            case 'presupuesto':
                this.renderBudgetDetails();
                break;
            case 'transacciones':
                this.renderTransactions();
                break;
            case 'reportes':
                this.renderReports();
                break;
            case 'database':
                this.renderDatabaseManagement();
                break;
        }
    }

    refreshCurrentSection() {
        this.renderSection(this.currentSection);
    }

    // Dashboard
    renderDashboard() {
        this.updateFinancialSummary();
        this.renderCategoriesStatus();
        this.renderRecentActivity();
    }

    updateFinancialSummary() {
        const cuentas = this.db.select('cuentas_bancarias');
        const totalIngresos = cuentas.reduce((sum, cuenta) => sum + (cuenta.ingresoMensual || 0), 0);
        
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        const currentBudget = presupuestos[this.db.currentMonth] || {};
        
        const totalEstimado = Object.values(currentBudget).reduce((sum, cat) => sum + (cat.estimado || 0), 0);
        const totalReal = Object.values(currentBudget).reduce((sum, cat) => sum + (cat.real || 0), 0);
        const balance = totalIngresos - totalReal;

        document.getElementById('total-ingresos').textContent = this.formatCurrency(totalIngresos);
        document.getElementById('total-estimado').textContent = this.formatCurrency(totalEstimado);
        document.getElementById('total-real').textContent = this.formatCurrency(totalReal);
        document.getElementById('balance').textContent = this.formatCurrency(balance);

        // Color coding for balance
        const balanceElement = document.getElementById('balance');
        if (balance > 0) {
            balanceElement.style.color = 'var(--color-success)';
        } else if (balance < 0) {
            balanceElement.style.color = 'var(--color-error)';
        } else {
            balanceElement.style.color = 'var(--color-text)';
        }
    }

    renderCategoriesStatus() {
        const container = document.getElementById('categories-status');
        const categorias = this.db.select('categorias');
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        const currentBudget = presupuestos[this.db.currentMonth] || {};

        container.innerHTML = '';

        categorias.forEach(categoria => {
            const budget = currentBudget[categoria.nombre] || { estimado: 0, real: 0 };
            const percentage = budget.estimado > 0 ? (budget.real / budget.estimado) * 100 : 0;

            let statusClass = 'status--success';
            if (percentage > 100) statusClass = 'status--error';
            else if (percentage > 80) statusClass = 'status--warning';

            const statusDiv = document.createElement('div');
            statusDiv.className = 'category-status';
            statusDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span>${categoria.icono} ${categoria.nombre}</span>
                    <span class="status ${statusClass}">${percentage.toFixed(0)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background-color: ${categoria.color};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--color-text-secondary); margin-top: 4px;">
                    <span>${this.formatCurrency(budget.real)}</span>
                    <span>${this.formatCurrency(budget.estimado)}</span>
                </div>
            `;
            container.appendChild(statusDiv);
        });
    }

    renderRecentActivity() {
        const container = document.getElementById('recent-activity');
        const transacciones = this.db.select('transacciones', t => t.mes === this.db.currentMonth)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);

        if (transacciones.length === 0) {
            container.innerHTML = '<p>No hay actividad reciente</p>';
            return;
        }

        container.innerHTML = transacciones.map(t => `
            <div class="activity-item">
                <div class="activity-icon">💸</div>
                <div class="activity-content">
                    <div><strong>${t.concepto}</strong> - ${t.categoria}</div>
                    <div>${this.formatCurrency(t.monto)} por ${t.responsable}</div>
                    <div class="activity-time">${this.formatDate(t.fecha)}</div>
                </div>
            </div>
        `).join('');
    }

    // Quick Add Modal
    openQuickAddModal() {
        this.loadAccountSelector();
        this.renderCategorySelection();
        document.getElementById('quick-add-modal').classList.add('active');
        document.getElementById('amount-input').focus();
    }

    loadAccountSelector() {
        const selector = document.getElementById('account-select');
        const cuentas = this.db.select('cuentas_bancarias');
        
        selector.innerHTML = '<option value="">Seleccionar cuenta</option>';
        cuentas.forEach(cuenta => {
            selector.innerHTML += `<option value="${cuenta.id}">${cuenta.nombre} (${cuenta.tipo})</option>`;
        });
    }

    renderCategorySelection() {
        const container = document.getElementById('category-selection');
        const categorias = this.db.select('categorias');
        
        container.innerHTML = '';
        categorias.forEach(categoria => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-btn';
            btn.style.borderColor = categoria.color;
            btn.innerHTML = `
                <div class="category-btn__icon">${categoria.icono}</div>
                <div class="category-btn__name">${categoria.nombre}</div>
            `;
            btn.addEventListener('click', () => this.selectCategory(categoria));
            container.appendChild(btn);
        });
    }

    selectCategory(categoria) {
        this.selectedCategory = categoria;
        this.selectedConcept = null;

        // Update selection
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.closest('.category-btn').classList.add('selected');

        this.renderConceptSelection(categoria);
    }

    renderConceptSelection(categoria) {
        const container = document.getElementById('concept-selection');
        container.innerHTML = '';

        categoria.conceptos.forEach(concepto => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'concept-btn';
            btn.textContent = concepto;
            btn.addEventListener('click', () => this.selectConcept(concepto));
            container.appendChild(btn);
        });
    }

    selectConcept(concepto) {
        this.selectedConcept = concepto;
        document.querySelectorAll('.concept-btn').forEach(btn => btn.classList.remove('selected'));
        event.target.classList.add('selected');
    }

    handleQuickAdd() {
        if (!this.selectedCategory || !this.selectedConcept) {
            this.showNotification('Selecciona una categoría y concepto', 'error');
            return;
        }

        const amount = parseFloat(document.getElementById('amount-input').value);
        const accountId = document.getElementById('account-select').value;
        const responsible = document.getElementById('responsible-select').value;
        const comment = document.getElementById('comment-input').value;

        if (!amount || amount <= 0) {
            this.showNotification('Ingresa un monto válido', 'error');
            return;
        }

        if (!accountId) {
            this.showNotification('Selecciona una cuenta', 'error');
            return;
        }

        // Create transaction
        const transaction = {
            fecha: new Date().toISOString(),
            categoria: this.selectedCategory.nombre,
            concepto: this.selectedConcept,
            monto: amount,
            cuentaId: parseInt(accountId),
            responsable: responsible,
            comentario: comment,
            mes: this.db.currentMonth,
            usuarioId: this.currentUser.id
        };

        this.db.insert('transacciones', transaction);

        // Update budget real amount
        this.updateBudgetReal(this.selectedCategory.nombre, amount);

        // Update account balance
        this.updateAccountBalance(parseInt(accountId), -amount);

        this.closeModal(document.getElementById('quick-add-modal'));
        this.resetQuickAddForm();
        this.showNotification('Gasto registrado exitosamente', 'success');
        this.refreshCurrentSection();
    }

    updateBudgetReal(categoryName, amount) {
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        
        if (!presupuestos[this.db.currentMonth]) {
            presupuestos[this.db.currentMonth] = {};
        }
        
        if (!presupuestos[this.db.currentMonth][categoryName]) {
            presupuestos[this.db.currentMonth][categoryName] = { estimado: 0, real: 0 };
        }
        
        presupuestos[this.db.currentMonth][categoryName].real += amount;
        
        this.db.update('presupuestos_mensuales', () => true, presupuestos);
    }

    updateAccountBalance(accountId, amount) {
        this.db.update('cuentas_bancarias', 
            cuenta => cuenta.id === accountId,
            { saldo: account => (account.saldo || 0) + amount }
        );
    }

    resetQuickAddForm() {
        document.getElementById('quick-add-form').reset();
        this.selectedCategory = null;
        this.selectedConcept = null;
        document.querySelectorAll('.category-btn, .concept-btn').forEach(btn => 
            btn.classList.remove('selected')
        );
        document.getElementById('concept-selection').innerHTML = '';
    }

    // Month Management
    loadMonthSelector() {
        const selector = document.getElementById('month-selector');
        const meses = this.db.select('meses_disponibles')[0] || [];
        
        selector.innerHTML = '';
        meses.forEach(mes => {
            const option = document.createElement('option');
            option.value = mes;
            option.textContent = this.getMonthDisplayName(mes);
            option.selected = mes === this.db.currentMonth;
            selector.appendChild(option);
        });
    }

    getMonthDisplayName(monthKey) {
        const monthNames = {
            'junio_2025': 'Junio 2025',
            'julio_2025': 'Julio 2025',
            'agosto_2025': 'Agosto 2025'
        };
        return monthNames[monthKey] || monthKey;
    }

    renderMonthsManagement() {
        const container = document.getElementById('months-list');
        const meses = this.db.select('meses_disponibles')[0] || [];
        
        container.innerHTML = '';
        meses.forEach(mes => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card__body">
                    <h3>${this.getMonthDisplayName(mes)}</h3>
                    <p>Estado: ${mes === this.db.currentMonth ? 'Activo' : 'Inactivo'}</p>
                    <div style="display: flex; gap: 8px; margin-top: 16px;">
                        <button class="btn btn--sm btn--secondary" onclick="app.resetMonth('${mes}')">Reiniciar</button>
                        <button class="btn btn--sm btn--outline" onclick="app.deleteMonth('${mes}')">Eliminar</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    openMonthModal() {
        this.openGenericModal('Nuevo Mes', [
            { name: 'nombre', label: 'Nombre del Mes', type: 'text', placeholder: 'Ej: Julio 2025', required: true }
        ], (data) => {
            const meses = this.db.select('meses_disponibles')[0] || [];
            const monthKey = data.nombre.toLowerCase().replace(/\s+/g, '_');
            
            if (meses.includes(monthKey)) {
                this.showNotification('Este mes ya existe', 'error');
                return false;
            }
            
            meses.push(monthKey);
            this.db.update('meses_disponibles', () => true, meses);
            this.loadMonthSelector();
            this.renderMonthsManagement();
            this.showNotification('Mes agregado exitosamente', 'success');
            return true;
        });
    }

    resetMonth(mes) {
        this.confirmAction(`¿Reiniciar todos los valores del mes ${this.getMonthDisplayName(mes)}?`, () => {
            // Reset budget
            const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
            if (presupuestos[mes]) {
                Object.keys(presupuestos[mes]).forEach(cat => {
                    presupuestos[mes][cat].real = 0;
                });
                this.db.update('presupuestos_mensuales', () => true, presupuestos);
            }
            
            // Delete transactions
            this.db.delete('transacciones', t => t.mes === mes);
            
            this.showNotification('Mes reiniciado exitosamente', 'success');
            this.refreshCurrentSection();
        });
    }

    deleteMonth(mes) {
        if (mes === this.db.currentMonth) {
            this.showNotification('No puedes eliminar el mes activo', 'error');
            return;
        }

        this.confirmAction(`¿Eliminar el mes ${this.getMonthDisplayName(mes)}? Esta acción no se puede deshacer.`, () => {
            const meses = this.db.select('meses_disponibles')[0] || [];
            const newMeses = meses.filter(m => m !== mes);
            this.db.update('meses_disponibles', () => true, newMeses);
            
            this.db.delete('transacciones', t => t.mes === mes);
            
            this.loadMonthSelector();
            this.renderMonthsManagement();
            this.showNotification('Mes eliminado exitosamente', 'success');
        });
    }

    // Categories Management
    renderCategoriesManagement() {
        const container = document.getElementById('categories-management');
        const categorias = this.db.select('categorias');
        
        container.innerHTML = '';
        categorias.forEach(categoria => {
            const item = document.createElement('div');
            item.className = 'card';
            item.innerHTML = `
                <div class="card__body">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${categoria.icono}</span>
                            <div>
                                <h4 style="margin: 0;">${categoria.nombre}</h4>
                                <div style="font-size: 12px; color: var(--color-text-secondary);">${categoria.conceptos.length} conceptos</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn--sm btn--secondary" onclick="app.editCategory(${categoria.id})">Editar</button>
                            <button class="btn btn--sm btn--outline" onclick="app.deleteCategory(${categoria.id})">Eliminar</button>
                        </div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${categoria.conceptos.map(concepto => 
                            `<span style="background: var(--color-secondary); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${concepto}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }

    openCategoryModal(category = null) {
        const isEdit = !!category;
        this.openGenericModal(
            isEdit ? 'Editar Categoría' : 'Nueva Categoría',
            [
                { name: 'nombre', label: 'Nombre', type: 'text', value: category?.nombre, required: true },
                { name: 'icono', label: 'Icono', type: 'text', value: category?.icono, placeholder: '🏠' },
                { name: 'color', label: 'Color', type: 'color', value: category?.color },
                { name: 'conceptos', label: 'Conceptos (separados por comas)', type: 'textarea', value: category?.conceptos?.join(', ') }
            ],
            (data) => {
                const categoryData = {
                    nombre: data.nombre,
                    icono: data.icono || '📂',
                    color: data.color,
                    conceptos: data.conceptos ? data.conceptos.split(',').map(c => c.trim()).filter(c => c) : []
                };

                if (isEdit) {
                    this.db.update('categorias', c => c.id === category.id, categoryData);
                    this.showNotification('Categoría actualizada', 'success');
                } else {
                    this.db.insert('categorias', categoryData);
                    this.showNotification('Categoría creada', 'success');
                }

                this.renderCategoriesManagement();
                return true;
            }
        );
    }

    editCategory(id) {
        const category = this.db.select('categorias', c => c.id === id)[0];
        if (category) {
            this.openCategoryModal(category);
        }
    }

    deleteCategory(id) {
        this.confirmAction('¿Eliminar esta categoría? Se eliminarán todas sus transacciones.', () => {
            const category = this.db.select('categorias', c => c.id === id)[0];
            if (category) {
                this.db.delete('categorias', c => c.id === id);
                this.db.delete('transacciones', t => t.categoria === category.nombre);
                this.renderCategoriesManagement();
                this.showNotification('Categoría eliminada', 'success');
            }
        });
    }

    // Accounts Management
    renderAccountsManagement() {
        const container = document.getElementById('accounts-management');
        const cuentas = this.db.select('cuentas_bancarias');
        
        container.innerHTML = '';
        cuentas.forEach(cuenta => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card__body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0 0 4px 0;">${cuenta.nombre}</h3>
                            <span style="background: var(--color-secondary); padding: 2px 8px; border-radius: 4px; font-size: 12px;">${cuenta.tipo}</span>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn--sm btn--secondary" onclick="app.editAccount(${cuenta.id})">Editar</button>
                            <button class="btn btn--sm btn--outline" onclick="app.deleteAccount(${cuenta.id})">Eliminar</button>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Saldo Actual</div>
                            <div style="font-size: 18px; font-weight: bold; font-family: var(--font-family-mono);">${this.formatCurrency(cuenta.saldo)}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Ingreso Mensual</div>
                            <div style="font-size: 18px; font-weight: bold; font-family: var(--font-family-mono);">${this.formatCurrency(cuenta.ingresoMensual || 0)}</div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    openAccountModal(account = null) {
        const isEdit = !!account;
        this.openGenericModal(
            isEdit ? 'Editar Cuenta' : 'Nueva Cuenta',
            [
                { name: 'nombre', label: 'Nombre', type: 'text', value: account?.nombre, required: true },
                { name: 'tipo', label: 'Tipo', type: 'select', options: [
                    { value: 'corriente', text: 'Corriente' },
                    { value: 'ahorro', text: 'Ahorros' }
                ], value: account?.tipo },
                { name: 'saldo', label: 'Saldo Actual', type: 'number', value: account?.saldo },
                { name: 'ingresoMensual', label: 'Ingreso Mensual', type: 'number', value: account?.ingresoMensual }
            ],
            (data) => {
                const accountData = {
                    nombre: data.nombre,
                    tipo: data.tipo,
                    saldo: parseFloat(data.saldo) || 0,
                    ingresoMensual: parseFloat(data.ingresoMensual) || 0,
                    usuarioId: this.currentUser.id
                };

                if (isEdit) {
                    this.db.update('cuentas_bancarias', c => c.id === account.id, accountData);
                    this.showNotification('Cuenta actualizada', 'success');
                } else {
                    this.db.insert('cuentas_bancarias', accountData);
                    this.showNotification('Cuenta creada', 'success');
                }

                this.renderAccountsManagement();
                return true;
            }
        );
    }

    editAccount(id) {
        const account = this.db.select('cuentas_bancarias', c => c.id === id)[0];
        if (account) {
            this.openAccountModal(account);
        }
    }

    deleteAccount(id) {
        this.confirmAction('¿Eliminar esta cuenta?', () => {
            this.db.delete('cuentas_bancarias', c => c.id === id);
            this.renderAccountsManagement();
            this.showNotification('Cuenta eliminada', 'success');
        });
    }

    // Budget Management
    generateBudget() {
        const categorias = this.db.select('categorias');
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        
        if (!presupuestos[this.db.currentMonth]) {
            presupuestos[this.db.currentMonth] = {};
        }

        categorias.forEach(categoria => {
            if (!presupuestos[this.db.currentMonth][categoria.nombre]) {
                presupuestos[this.db.currentMonth][categoria.nombre] = {
                    estimado: 1000000, // Default budget
                    real: 0
                };
            }
        });

        this.db.update('presupuestos_mensuales', () => true, presupuestos);
        this.renderBudgetDetails();
        this.showNotification('Presupuesto generado para ' + this.getMonthDisplayName(this.db.currentMonth), 'success');
    }

    renderBudgetDetails() {
        const container = document.getElementById('budget-details');
        const categorias = this.db.select('categorias');
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        const currentBudget = presupuestos[this.db.currentMonth] || {};

        container.innerHTML = '';

        categorias.forEach(categoria => {
            const budget = currentBudget[categoria.nombre] || { estimado: 0, real: 0 };
            const percentage = budget.estimado > 0 ? (budget.real / budget.estimado) * 100 : 0;
            const difference = budget.real - budget.estimado;

            let statusClass = 'status--success';
            let statusText = 'Bien';
            
            if (percentage > 100) {
                statusClass = 'status--error';
                statusText = 'Excedido';
            } else if (percentage > 80) {
                statusClass = 'status--warning';
                statusText = 'Alerta';
            }

            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'card';
            categoryDiv.innerHTML = `
                <div class="card__body">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${categoria.icono}</span>
                            <h4 style="margin: 0;">${categoria.nombre}</h4>
                        </div>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
                        <div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Estimado</div>
                            <div style="font-family: var(--font-family-mono); font-weight: bold;">${this.formatCurrency(budget.estimado)}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Real</div>
                            <div style="font-family: var(--font-family-mono); font-weight: bold;">${this.formatCurrency(budget.real)}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--color-text-secondary);">Diferencia</div>
                            <div style="font-family: var(--font-family-mono); font-weight: bold; color: ${difference > 0 ? 'var(--color-error)' : 'var(--color-success)'};">${this.formatCurrency(difference)}</div>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%; background-color: ${categoria.color};"></div>
                    </div>
                    <div style="text-align: center; margin-top: 8px; font-size: 14px; font-weight: bold;">${percentage.toFixed(1)}%</div>
                </div>
            `;
            container.appendChild(categoryDiv);
        });
    }

    // Transactions
    renderTransactions() {
        const filterSelect = document.getElementById('transaction-filter');
        const categorias = this.db.select('categorias');
        
        // Update filter options
        filterSelect.innerHTML = '<option value="all">Todas las categorías</option>';
        categorias.forEach(cat => {
            filterSelect.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`;
        });

        const selectedFilter = filterSelect.value;
        const transacciones = this.db.select('transacciones', t => {
            return t.mes === this.db.currentMonth && 
                   (selectedFilter === 'all' || t.categoria === selectedFilter);
        }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const container = document.getElementById('transactions-list');

        if (transacciones.length === 0) {
            container.innerHTML = '<div class="card"><div class="card__body"><p>No hay transacciones registradas.</p></div></div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Responsable</th>
                    <th>Comentario</th>
                </tr>
            </thead>
            <tbody>
                ${transacciones.map(t => `
                    <tr>
                        <td>${this.formatDate(t.fecha)}</td>
                        <td>${t.categoria}</td>
                        <td>${t.concepto}</td>
                        <td style="font-family: var(--font-family-mono); font-weight: bold;">${this.formatCurrency(t.monto)}</td>
                        <td>${t.responsable}</td>
                        <td>${t.comentario || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.innerHTML = '';
        container.appendChild(table);

        // Update filter listener
        filterSelect.addEventListener('change', () => {
            this.renderTransactions();
        });
    }

    exportTransactions() {
        const transacciones = this.db.select('transacciones', t => t.mes === this.db.currentMonth);
        const csvContent = this.convertToCSV(transacciones);
        this.downloadFile(csvContent, `transacciones_${this.db.currentMonth}.csv`, 'text/csv');
        this.showNotification('Transacciones exportadas', 'success');
    }

    // Reports
    renderReports() {
        this.renderBudgetCompliance();
        this.renderCategoryBreakdown();
        this.renderMonthlyTrend();
    }

    renderBudgetCompliance() {
        const container = document.getElementById('budget-compliance');
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        const currentBudget = presupuestos[this.db.currentMonth] || {};
        
        const totalEstimado = Object.values(currentBudget).reduce((sum, cat) => sum + (cat.estimado || 0), 0);
        const totalReal = Object.values(currentBudget).reduce((sum, cat) => sum + (cat.real || 0), 0);
        const compliance = totalEstimado > 0 ? (totalReal / totalEstimado) * 100 : 0;

        let statusColor = 'var(--color-success)';
        if (compliance > 100) statusColor = 'var(--color-error)';
        else if (compliance > 80) statusColor = 'var(--color-warning)';

        container.innerHTML = `
            <div class="text-center">
                <div style="font-size: 48px; font-weight: bold; color: ${statusColor}; margin-bottom: 16px;">
                    ${compliance.toFixed(1)}%
                </div>
                <p>Cumplimiento del presupuesto</p>
                <div class="progress-bar" style="margin-top: 16px;">
                    <div class="progress-fill" style="width: ${Math.min(compliance, 100)}%; background-color: ${statusColor};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 12px; color: var(--color-text-secondary);">
                    <span>Gastado: ${this.formatCurrency(totalReal)}</span>
                    <span>Presupuesto: ${this.formatCurrency(totalEstimado)}</span>
                </div>
            </div>
        `;
    }

    renderCategoryBreakdown() {
        const container = document.getElementById('category-breakdown');
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};
        const currentBudget = presupuestos[this.db.currentMonth] || {};
        const categorias = this.db.select('categorias');
        
        const totalReal = Object.values(currentBudget).reduce((sum, cat) => sum + (cat.real || 0), 0);

        container.innerHTML = '';
        categorias.forEach(categoria => {
            const budget = currentBudget[categoria.nombre] || { estimado: 0, real: 0 };
            const percentage = totalReal > 0 ? (budget.real / totalReal) * 100 : 0;

            const item = document.createElement('div');
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span>${categoria.icono} ${categoria.nombre}</span>
                    <span style="font-weight: bold;">${percentage.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${categoria.color};"></div>
                </div>
                <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; margin-bottom: 16px;">
                    ${this.formatCurrency(budget.real)}
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderMonthlyTrend() {
        const container = document.getElementById('monthly-trend');
        const meses = this.db.select('meses_disponibles')[0] || [];
        const presupuestos = this.db.select('presupuestos_mensuales')[0] || {};

        container.innerHTML = '';
        meses.forEach(mes => {
            const budget = presupuestos[mes] || {};
            const totalReal = Object.values(budget).reduce((sum, cat) => sum + (cat.real || 0), 0);
            const totalEstimado = Object.values(budget).reduce((sum, cat) => sum + (cat.estimado || 0), 0);

            const item = document.createElement('div');
            item.style.cssText = 'display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--color-border);';
            item.innerHTML = `
                <span>${this.getMonthDisplayName(mes)}</span>
                <span style="font-family: var(--font-family-mono);">${this.formatCurrency(totalReal)} / ${this.formatCurrency(totalEstimado)}</span>
            `;
            container.appendChild(item);
        });
    }

    // Database Management
    renderDatabaseManagement() {
        this.renderDatabaseStats();
        this.renderRecentQueries();
        this.renderTableStructure();
    }

    renderDatabaseStats() {
        const container = document.getElementById('db-stats');
        const stats = this.db.getStats();

        const statItems = Object.keys(stats)
            .filter(key => key !== 'totalSize' && key !== 'totalRecords')
            .map(table => {
                const tableName = table.replace(/_/g, ' ');
                return `
                    <div class="db-stat-item">
                        <span>${tableName}</span>
                        <span>${stats[table].records} registros</span>
                    </div>
                `;
            }).join('');

        container.innerHTML = statItems + `
            <div class="db-stat-item" style="border-top: 2px solid var(--color-border); padding-top: 8px; margin-top: 8px;">
                <span><strong>Total</strong></span>
                <span><strong>${stats.totalRecords} registros</strong></span>
            </div>
            <div class="db-stat-item">
                <span><strong>Tamaño Total</strong></span>
                <span><strong>${this.formatBytes(stats.totalSize)}</strong></span>
            </div>
        `;
    }

    renderRecentQueries() {
        const container = document.getElementById('recent-queries');
        const queries = this.db.getQueryLog();

        container.innerHTML = queries.slice(-10).reverse().map(query => `
            <div style="font-family: var(--font-family-mono); font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--color-border);">
                <div style="color: var(--color-primary); font-weight: bold;">${query.operation}</div>
                <div>${query.details}</div>
                <div style="color: var(--color-text-secondary);">${this.formatDate(query.timestamp)}</div>
            </div>
        `).join('');
    }

    renderTableStructure() {
        const container = document.getElementById('table-structure');
        const tables = Object.keys(this.db.tables);

        container.innerHTML = tables.map(table => {
            const sampleData = this.db.select(table)[0];
            const fields = sampleData ? Object.keys(sampleData) : [];

            return `
                <div style="margin-bottom: 16px; padding: 16px; border: 1px solid var(--color-border); border-radius: 8px;">
                    <h5 style="margin: 0 0 8px 0; color: var(--color-primary);">${table}</h5>
                    <div style="font-family: var(--font-family-mono); font-size: 12px; color: var(--color-text-secondary);">
                        Campos: ${fields.join(', ')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Backup and Restore
    createBackup() {
        const backup = this.db.backup();
        const backupJson = JSON.stringify(backup, null, 2);
        const filename = `finanzas_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        this.downloadFile(backupJson, filename, 'application/json');
        this.showNotification('Backup creado exitosamente', 'success');
    }

    restoreBackup(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                this.confirmAction('¿Restaurar backup? Se perderán todos los datos actuales.', () => {
                    if (this.db.restore(backupData)) {
                        this.showNotification('Backup restaurado exitosamente', 'success');
                        this.refreshCurrentSection();
                        this.loadMonthSelector();
                    } else {
                        this.showNotification('Error al restaurar backup', 'error');
                    }
                });
            } catch (error) {
                this.showNotification('Archivo de backup inválido', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Generic Modal
    openGenericModal(title, fields, onSubmit) {
        document.getElementById('modal-title').textContent = title;
        
        const fieldsContainer = document.getElementById('form-fields');
        fieldsContainer.innerHTML = '';

        fields.forEach(field => {
            const div = document.createElement('div');
            div.className = 'form-group';

            const label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = field.label;

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 3;
            } else if (field.type === 'select') {
                input = document.createElement('select');
                field.options?.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.text;
                    input.appendChild(opt);
                });
            } else {
                input = document.createElement('input');
                input.type = field.type || 'text';
            }

            input.className = 'form-control';
            input.name = field.name;
            input.placeholder = field.placeholder || '';
            input.required = field.required || false;
            if (field.value !== undefined) input.value = field.value;

            div.appendChild(label);
            div.appendChild(input);
            fieldsContainer.appendChild(div);
        });

        this.currentModalSubmit = onSubmit;
        document.getElementById('generic-modal').classList.add('active');
    }

    handleGenericForm() {
        const formData = new FormData(document.getElementById('generic-form'));
        const data = Object.fromEntries(formData.entries());

        if (this.currentModalSubmit && this.currentModalSubmit(data)) {
            this.closeModal(document.getElementById('generic-modal'));
        }
    }

    // Confirmation Modal
    confirmAction(message, onConfirm) {
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-modal').classList.add('active');

        const confirmBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        const handleConfirm = () => {
            onConfirm();
            this.closeModal(document.getElementById('confirm-modal'));
            confirmBtn.removeEventListener('click', handleConfirm);
        };

        const handleCancel = () => {
            this.closeModal(document.getElementById('confirm-modal'));
            confirmBtn.removeEventListener('click', handleConfirm);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
    }

    // Utility Methods
    closeModal(modal) {
        modal.classList.remove('active');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize App
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FinanceApp();
});