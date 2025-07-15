/**
 * main.js - Aplicación principal para la gestión de eventos
 * Implementa autenticación, gestión de eventos y persistencia de sesión
 */

// API Configuration
const API_BASE_URL = 'http://localhost:3001';

// Application State
let currentUser = null;
let currentPage = 'home';
let events = [];
let editingEventId = null;

// DOM Elements
const elements = {
    // Navigation
    navMenu: document.getElementById('navMenu'),
    navToggle: document.getElementById('navToggle'),
    loginLink: document.getElementById('loginLink'),
    registerLink: document.getElementById('registerLink'),
    userMenu: document.getElementById('userMenu'),
    userName: document.getElementById('userName'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Pages
    pages: {
        home: document.getElementById('homePage'),
        login: document.getElementById('loginPage'),
        register: document.getElementById('registerPage'),
        events: document.getElementById('eventsPage')
    },
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    eventForm: document.getElementById('eventForm'),
    
    // Modals
    eventModal: document.getElementById('eventModal'),
    eventDetailsModal: document.getElementById('eventDetailsModal'),
    
    // Event elements
    eventsList: document.getElementById('eventsList'),
    createEventBtn: document.getElementById('createEventBtn'),
    
    // Loading and notifications
    loadingSpinner: document.getElementById('loadingSpinner'),
    toastContainer: document.getElementById('toastContainer')
};

// Utility Functions
const utils = {
    showLoading() {
        elements.loadingSpinner.style.display = 'flex';
    },
    
    hideLoading() {
        elements.loadingSpinner.style.display = 'none';
    },
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    formatTime(timeString) {
        return timeString;
    },
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
};

// API Functions
const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Users
    async getUsers() {
        return this.request('/users');
    },
    
    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    
    async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email);
    },
    
    // Events
    async getEvents() {
        return this.request('/events');
    },
    
    async createEvent(eventData) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    },
    
    async updateEvent(id, eventData) {
        return this.request(`/events/${id}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    },
    
    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    },
    
    // Attendees
    async getAttendees() {
        return this.request('/attendees');
    },
    
    async createAttendee(attendeeData) {
        return this.request('/attendees', {
            method: 'POST',
            body: JSON.stringify(attendeeData)
        });
    },
    
    async deleteAttendee(id) {
        return this.request(`/attendees/${id}`, {
            method: 'DELETE'
        });
    }
};

// Authentication Functions
const auth = {
    isAuthenticated() {
        return currentUser !== null;
    },
    
    isAdmin() {
        return currentUser && currentUser.role === 'administrador';
    },
    
    login(user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.updateUI();
    },
    
    logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUI();
        router.navigateTo('/');
    },
    
    updateUI() {
        if (this.isAuthenticated()) {
            elements.loginLink.style.display = 'none';
            elements.registerLink.style.display = 'none';
            elements.userMenu.style.display = 'flex';
            elements.userName.textContent = currentUser.name;
            
            if (this.isAdmin()) {
                elements.createEventBtn.style.display = 'inline-flex';
            } else {
                elements.createEventBtn.style.display = 'none';
            }
        } else {
            elements.loginLink.style.display = 'inline';
            elements.registerLink.style.display = 'inline';
            elements.userMenu.style.display = 'none';
            elements.createEventBtn.style.display = 'none';
        }
    },
    
    checkSession() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
    }
};

// Router Functions
const router = {
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    },
    
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const path = hash.split('?')[0];
        
        this.navigateTo(path);
    },
    
    navigateTo(path) {
        currentPage = path === '/' ? 'home' : path.slice(1);
        
        // Hide all pages
        Object.values(elements.pages).forEach(page => {
            page.classList.remove('active');
        });
        
        // Show current page
        if (elements.pages[currentPage]) {
            elements.pages[currentPage].classList.add('active');
        } else {
            elements.pages.home.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-page="${currentPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Load page-specific content
        this.loadPageContent(currentPage);
    },
    
    async loadPageContent(page) {
        switch (page) {
            case 'events':
                await eventsManager.loadEvents();
                break;
        }
    }
};

// Events Management
const eventsManager = {
    async loadEvents() {
        try {
            utils.showLoading();
            events = await api.getEvents();
            this.renderEvents();
        } catch (error) {
            utils.showToast('Error al cargar los eventos', 'error');
        } finally {
            utils.hideLoading();
        }
    },
    
    renderEvents() {
        if (!elements.eventsList) return;
        
        elements.eventsList.innerHTML = events.map(event => this.createEventCard(event)).join('');
        
        // Add event listeners to cards
        this.addEventCardListeners();
    },
    
    createEventCard(event) {
        const isAdmin = auth.isAdmin();
        const isRegistered = this.isUserRegistered(event.id);
        const availableSpots = event.capacity - event.registeredAttendees;
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-header">
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">${utils.formatDate(event.date)} - ${utils.formatTime(event.time)}</div>
                </div>
                <div class="event-body">
                    <div class="event-description">${event.description}</div>
                    <div class="event-details">
                        <div class="event-detail">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-users"></i>
                            <span>${event.registeredAttendees}/${event.capacity} asistentes</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-dollar-sign"></i>
                            <span>$${event.price}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-calendar-check"></i>
                            <span>${availableSpots} cupos disponibles</span>
                        </div>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-primary btn-small view-event-btn">
                            <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                        ${isAdmin ? `
                            <button class="btn btn-secondary btn-small edit-event-btn">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-danger btn-small delete-event-btn">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        ` : ''}
                        ${!isAdmin && !isRegistered && availableSpots > 0 ? `
                            <button class="btn btn-primary btn-small register-event-btn">
                                <i class="fas fa-user-plus"></i> Registrarse
                            </button>
                        ` : ''}
                        ${!isAdmin && isRegistered ? `
                            <button class="btn btn-danger btn-small unregister-event-btn">
                                <i class="fas fa-user-minus"></i> Cancelar Registro
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },
    
    addEventCardListeners() {
        // View event details
        document.querySelectorAll('.view-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.closest('.event-card').dataset.eventId;
                this.showEventDetails(eventId);
            });
        });
        
        // Edit event (admin only)
        document.querySelectorAll('.edit-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.closest('.event-card').dataset.eventId;
                this.editEvent(eventId);
            });
        });
        
        // Delete event (admin only)
        document.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.closest('.event-card').dataset.eventId;
                this.deleteEvent(eventId);
            });
        });
        
        // Register for event
        document.querySelectorAll('.register-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.closest('.event-card').dataset.eventId;
                this.registerForEvent(eventId);
            });
        });
        
        // Unregister from event
        document.querySelectorAll('.unregister-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.closest('.event-card').dataset.eventId;
                this.unregisterFromEvent(eventId);
            });
        });
    },
    
    async showEventDetails(eventId) {
        const event = events.find(e => e.id == eventId);
        if (!event) return;
        
        const attendees = await api.getAttendees();
        const eventAttendees = attendees.filter(a => a.eventId == eventId);
        
        const detailsHtml = `
            <h2>${event.title}</h2>
            <div class="event-details-full">
                <p><strong>Descripción:</strong> ${event.description}</p>
                <p><strong>Fecha:</strong> ${utils.formatDate(event.date)}</p>
                <p><strong>Hora:</strong> ${utils.formatTime(event.time)}</p>
                <p><strong>Ubicación:</strong> ${event.location}</p>
                <p><strong>Capacidad:</strong> ${event.capacity} personas</p>
                <p><strong>Asistentes registrados:</strong> ${event.registeredAttendees}</p>
                <p><strong>Precio:</strong> $${event.price}</p>
                <p><strong>Estado:</strong> ${event.status}</p>
            </div>
            ${eventAttendees.length > 0 ? `
                <h3>Asistentes Registrados</h3>
                <div class="attendees-list">
                    ${eventAttendees.map(attendee => `
                        <div class="attendee-item">
                            <span>${attendee.name}</span>
                            <span>${attendee.email}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        document.getElementById('eventDetails').innerHTML = detailsHtml;
        elements.eventDetailsModal.style.display = 'block';
    },
    
    editEvent(eventId) {
        const event = events.find(e => e.id == eventId);
        if (!event) return;
        
        editingEventId = eventId;
        document.getElementById('modalTitle').textContent = 'Editar Evento';
        
        // Fill form with event data
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventCapacity').value = event.capacity;
        document.getElementById('eventPrice').value = event.price;
        
        elements.eventModal.style.display = 'block';
    },
    
    async deleteEvent(eventId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
        
        try {
            utils.showLoading();
            await api.deleteEvent(eventId);
            utils.showToast('Evento eliminado exitosamente', 'success');
            await this.loadEvents();
        } catch (error) {
            utils.showToast('Error al eliminar el evento', 'error');
        } finally {
            utils.hideLoading();
        }
    },
    
    async registerForEvent(eventId) {
        if (!auth.isAuthenticated()) {
            utils.showToast('Debes iniciar sesión para registrarte', 'error');
            return;
        }
        
        try {
            utils.showLoading();
            
            const attendeeData = {
                eventId: parseInt(eventId),
                userId: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                registrationDate: new Date().toISOString().split('T')[0]
            };
            
            await api.createAttendee(attendeeData);
            
            // Update event attendees count
            const event = events.find(e => e.id == eventId);
            if (event) {
                event.registeredAttendees += 1;
                await api.updateEvent(eventId, event);
            }
            
            utils.showToast('Registro exitoso', 'success');
            await this.loadEvents();
        } catch (error) {
            utils.showToast('Error al registrarse en el evento', 'error');
        } finally {
            utils.hideLoading();
        }
    },
    
    async unregisterFromEvent(eventId) {
        if (!confirm('¿Estás seguro de que quieres cancelar tu registro?')) return;
        
        try {
            utils.showLoading();
            
            const attendees = await api.getAttendees();
            const userAttendee = attendees.find(a => a.eventId == eventId && a.userId == currentUser.id);
            
            if (userAttendee) {
                await api.deleteAttendee(userAttendee.id);
                
                // Update event attendees count
                const event = events.find(e => e.id == eventId);
                if (event) {
                    event.registeredAttendees -= 1;
                    await api.updateEvent(eventId, event);
                }
                
                utils.showToast('Registro cancelado exitosamente', 'success');
                await this.loadEvents();
            }
        } catch (error) {
            utils.showToast('Error al cancelar el registro', 'error');
        } finally {
            utils.hideLoading();
        }
    },
    
    isUserRegistered(eventId) {
        // This would need to be implemented with actual attendee data
        // For now, returning false as placeholder
        return false;
    }
};

// Form Handlers
const formHandlers = {
    init() {
        // Login form
        elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
        
        // Register form
        elements.registerForm.addEventListener('submit', this.handleRegister.bind(this));
        
        // Event form
        elements.eventForm.addEventListener('submit', this.handleEventSubmit.bind(this));
        
        // Logout button
        elements.logoutBtn.addEventListener('click', () => auth.logout());
        
        // Create event button
        elements.createEventBtn.addEventListener('click', () => this.showCreateEventForm());
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                elements.eventModal.style.display = 'none';
                elements.eventDetailsModal.style.display = 'none';
            });
        });
        
        // Cancel event button
        document.getElementById('cancelEventBtn').addEventListener('click', () => {
            elements.eventModal.style.display = 'none';
            this.resetEventForm();
        });
        
        // Mobile navigation toggle
        elements.navToggle.addEventListener('click', () => {
            elements.navMenu.classList.toggle('active');
        });
    },
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!utils.validateEmail(email)) {
            utils.showToast('Por favor ingresa un email válido', 'error');
            return;
        }
        
        try {
            utils.showLoading();
            
            const user = await api.getUserByEmail(email);
            
            if (!user || user.password !== password) {
                utils.showToast('Email o contraseña incorrectos', 'error');
                return;
            }
            
            auth.login(user);
            utils.showToast('Inicio de sesión exitoso', 'success');
            router.navigateTo('/events');
            
        } catch (error) {
            utils.showToast('Error al iniciar sesión', 'error');
        } finally {
            utils.hideLoading();
        }
    },
    
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;
        
        if (!utils.validateEmail(email)) {
            utils.showToast('Por favor ingresa un email válido', 'error');
            return;
        }
        
        if (password.length < 6) {
            utils.showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        try {
            utils.showLoading();
            
            // Check if user already exists
            const existingUser = await api.getUserByEmail(email);
            if (existingUser) {
                utils.showToast('Ya existe un usuario con este email', 'error');
                return;
            }
            
            const userData = {
                name,
                username,
                email,
                password,
                role
            };
            
            await api.createUser(userData);
            
            utils.showToast('Usuario registrado exitosamente', 'success');
            router.navigateTo('/login');
            
        } catch (error) {
            utils.showToast('Error al registrar usuario', 'error');
        } finally {
            utils.hideLoading();
        }
    },
    
    showCreateEventForm() {
        editingEventId = null;
        document.getElementById('modalTitle').textContent = 'Crear Evento';
        this.resetEventForm();
        elements.eventModal.style.display = 'block';
    },
    
    resetEventForm() {
        elements.eventForm.reset();
        editingEventId = null;
    },
    
    async handleEventSubmit(e) {
        e.preventDefault();
        
        const eventData = {
            title: document.getElementById('eventTitle').value,
            description: document.getElementById('eventDescription').value,
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value,
            capacity: parseInt(document.getElementById('eventCapacity').value),
            price: parseFloat(document.getElementById('eventPrice').value),
            organizer: currentUser.username,
            status: 'activo',
            registeredAttendees: editingEventId ? 
                events.find(e => e.id == editingEventId)?.registeredAttendees || 0 : 0
        };
        
        try {
            utils.showLoading();
            
            if (editingEventId) {
                await api.updateEvent(editingEventId, eventData);
                utils.showToast('Evento actualizado exitosamente', 'success');
            } else {
                await api.createEvent(eventData);
                utils.showToast('Evento creado exitosamente', 'success');
            }
            
            elements.eventModal.style.display = 'none';
            this.resetEventForm();
            await eventsManager.loadEvents();
            
        } catch (error) {
            utils.showToast('Error al guardar el evento', 'error');
        } finally {
            utils.hideLoading();
        }
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    auth.checkSession();
    router.init();
    formHandlers.init();
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.eventModal) {
            elements.eventModal.style.display = 'none';
            formHandlers.resetEventForm();
        }
        if (e.target === elements.eventDetailsModal) {
            elements.eventDetailsModal.style.display = 'none';
        }
    });
    
    console.log('Event Management SPA initialized successfully!');
});
