const API_BASE_URL = 'http://127.0.0.1:3001/api';
let currentSort = false;
let currentSearchTerm = '';

const contactsList = document.getElementById('contactsList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortBtn = document.getElementById('sortBtn');
const newContactBtn = document.getElementById('newContactBtn');
const saveContactBtn = document.getElementById('saveContactBtn');
const contactForm = document.getElementById('contactForm');
const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
const modalTitle = document.getElementById('contactModalLabel');
const contactIdInput = document.getElementById('contactId');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const isFavoriteCheck = document.getElementById('isFavorite');
const formErrorDiv = document.getElementById('formError');
const toastEl = document.getElementById('liveToast');
const toast = new bootstrap.Toast(toastEl);

function showMessage(message, isError = false) {
    const toastBody = toastEl.querySelector('.toast-body');
    toastBody.textContent = message;
    toastEl.classList.toggle('bg-danger', isError);
    toastEl.classList.toggle('bg-success', !isError);
    toast.show();
}

async function loadContacts() {
    try {
        let url = `${API_BASE_URL}/contacts`;
        if (currentSearchTerm) {
            url = `${API_BASE_URL}/contacts/search?q=${encodeURIComponent(currentSearchTerm)}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al cargar contactos');
        const result = await response.json();
        let contacts = result.data;
        if (currentSort) {
            contacts.sort((a, b) => a.name.localeCompare(b.name));
        }
        renderContacts(contacts);
    } catch (error) {
        console.error(error);
        showMessage('Error al cargar los contactos', true);
        contactsList.innerHTML = '<div class="col text-center">Error al cargar contactos. Intente más tarde.</div>';
    }
}

function renderContacts(contacts) {
    if (!contacts.length) {
        contactsList.innerHTML = '<div class="col text-center">No se encontraron contactos.</div>';
        return;
    }

    contactsList.innerHTML = contacts.map(contact => `
        <div class="col">
            <div class="card h-100 contact-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title">${escapeHtml(contact.name)}</h5>
                        <i class="fas fa-star favorite-star ${contact.isFavorite ? '' : 'not-favorite'}" 
                           data-id="${contact.id}" data-favorite="${contact.isFavorite}"></i>
                    </div>
                    <p class="card-text">
                        <i class="fas fa-phone"></i> ${escapeHtml(contact.phone)}<br>
                        <i class="fas fa-envelope"></i> ${escapeHtml(contact.email)}
                    </p>
                </div>
                <div class="card-footer bg-transparent d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary edit-contact" data-id="${contact.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-contact" data-id="${contact.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.favorite-star').forEach(star => {
        star.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = star.getAttribute('data-id');
            const isFavorite = star.getAttribute('data-favorite') === 'true';
            await toggleFavorite(id, !isFavorite);
        });
    });
    document.querySelectorAll('.edit-contact').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            loadContactForEdit(id);
        });
    });
    document.querySelectorAll('.delete-contact').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteContact(id);
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function toggleFavorite(id, newState) {
    try {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}/favorite`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFavorite: newState })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar favorito');
        }
        await loadContacts();
        showMessage('Favorito actualizado');
    } catch (error) {
        console.error(error);
        showMessage(error.message, true);
    }
}

async function deleteContact(id) {
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar');
        }
        await loadContacts();
        showMessage('Contacto eliminado');
    } catch (error) {
        console.error(error);
        showMessage(error.message, true);
    }
}

async function loadContactForEdit(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/contacts/${id}`);
        if (!response.ok) throw new Error('Contacto no encontrado');
        const result = await response.json();
        const contact = result.data;
        contactIdInput.value = contact.id;
        nameInput.value = contact.name;
        phoneInput.value = contact.phone;
        emailInput.value = contact.email;
        isFavoriteCheck.checked = contact.isFavorite;
        modalTitle.textContent = 'Editar Contacto';
        formErrorDiv.classList.add('d-none');
        contactModal.show();
    } catch (error) {
        console.error(error);
        showMessage(error.message, true);
    }
}

saveContactBtn.addEventListener('click', async () => {
    let isValid = true;
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();

    if (!name) {
        nameInput.classList.add('is-invalid');
        isValid = false;
    } else {
        nameInput.classList.remove('is-invalid');
    }

    const phoneRegex = /^\d+$/;
    if (!phone || !phoneRegex.test(phone)) {
        phoneInput.classList.add('is-invalid');
        isValid = false;
    } else {
        phoneInput.classList.remove('is-invalid');
    }

    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        isValid = false;
    } else {
        emailInput.classList.remove('is-invalid');
    }

    if (!isValid) return;

    const contactData = {
        name,
        phone,
        email,
        isFavorite: isFavoriteCheck.checked
    };

    const id = contactIdInput.value;
    const url = id ? `${API_BASE_URL}/contacts/${id}` : `${API_BASE_URL}/contacts`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al guardar');
        }
        await loadContacts();
        contactModal.hide();
        showMessage(id ? 'Contacto actualizado' : 'Contacto creado');
        resetForm();
    } catch (error) {
        console.error(error);
        formErrorDiv.textContent = error.message;
        formErrorDiv.classList.remove('d-none');
    }
});

function resetForm() {
    contactIdInput.value = '';
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    isFavoriteCheck.checked = false;
    modalTitle.textContent = 'Nuevo Contacto';
    formErrorDiv.classList.add('d-none');
    nameInput.classList.remove('is-invalid');
    phoneInput.classList.remove('is-invalid');
    emailInput.classList.remove('is-invalid');
}

newContactBtn.addEventListener('click', resetForm);

searchBtn.addEventListener('click', () => {
    currentSearchTerm = searchInput.value.trim();
    loadContacts();
});

sortBtn.addEventListener('click', () => {
    currentSort = !currentSort;
    sortBtn.textContent = currentSort ? 'Ordenar (Predeterminado)' : 'Ordenar Alfabéticamente';
    loadContacts();
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentSearchTerm = searchInput.value.trim();
        loadContacts();
    }
});

loadContacts();