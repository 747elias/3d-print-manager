const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/static/login.html';
}

// Verify token
async function checkAuth() {
    try {
        const response = await fetch('/api/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Invalid token');
        }
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/static/login.html';
    }
}

// API helper
async function apiCall(url, options = {}) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    return fetch(url, { ...options, headers });
}

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    });
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/static/login.html';
});

// Load summary
async function loadSummary() {
    const response = await apiCall('/api/summary');
    const summary = await response.json();
    
    const container = document.getElementById('summaryTable');
    
    if (summary.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Noch keine Daten vorhanden.</p>';
        return;
    }
    
    const totalOpen = summary.reduce((sum, s) => sum + s.open_amount, 0);
    const totalPaid = summary.reduce((sum, s) => sum + s.paid_amount, 0);
    
    container.innerHTML = `
        <div class="summary-table">
            <table>
                <thead>
                    <tr>
                        <th>Person</th>
                        <th>Drucke</th>
                        <th>Offen</th>
                        <th>Bezahlt</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${summary.map(s => `
                        <tr>
                            <td><strong>${s.uploader}</strong></td>
                            <td>${s.total_prints}</td>
                            <td style="color: var(--danger);">CHF ${s.open_amount.toFixed(2)}</td>
                            <td style="color: var(--success);">CHF ${s.paid_amount.toFixed(2)}</td>
                            <td><strong>CHF ${s.total_amount.toFixed(2)}</strong></td>
                        </tr>
                    `).join('')}
                    <tr style="border-top: 2px solid var(--border); font-weight: bold;">
                        <td>TOTAL</td>
                        <td>${summary.reduce((sum, s) => sum + s.total_prints, 0)}</td>
                        <td style="color: var(--danger);">CHF ${totalOpen.toFixed(2)}</td>
                        <td style="color: var(--success);">CHF ${totalPaid.toFixed(2)}</td>
                        <td>CHF ${(totalOpen + totalPaid).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Load prints for admin
async function loadAdminPrints() {
    const uploaderFilter = document.getElementById('uploaderFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let url = '/api/prints?';
    if (uploaderFilter) url += `uploader=${uploaderFilter}&`;
    if (statusFilter) url += `status=${statusFilter}`;
    
    const response = await fetch(url);
    const prints = await response.json();
    
    const grid = document.getElementById('adminPrintsGrid');
    
    if (prints.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary);">Keine Drucke gefunden.</p>';
        return;
    }
    
    grid.innerHTML = prints.map(p => {
        const hasImage = p.image_path && p.image_path.includes('.');
        
        return `
        <div class="print-card">
            ${hasImage ? `
                <img src="${p.image_path}" 
                     alt="${p.name}" 
                     class="print-image"
                     onclick="openLightbox('${p.image_path}')"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="print-image" style="display: none; align-items: center; justify-content: center; font-size: 4rem; color: var(--text-secondary); background: var(--surface);">
                    🖨️
                </div>
            ` : `
                <div class="print-image" style="display: flex; align-items: center; justify-content: center; font-size: 4rem; color: var(--text-secondary); background: var(--surface);">
                    🖨️
                </div>
            `}
            <div class="print-content">
                <h3 class="print-title">${p.name}</h3>
                <div class="print-info">
                    <span><strong>Gedruckt von:</strong> ${p.uploader}</span>
                    <span><strong>Filament:</strong> ${p.filament_name}</span>
                    <span><strong>Verbrauch:</strong> ${p.filament_grams}g</span>
                    <span><strong>Preis:</strong> CHF ${p.price.toFixed(2)}</span>
                    ${p.link ? `<a href="${p.link}" target="_blank" style="color: var(--primary);">🔗 Link</a>` : ''}
                </div>
                <span class="status-badge status-${p.payment_status}">
                    ${p.payment_status === 'offen' ? '🔴 Offen' : '✅ Bezahlt'}
                </span>
                <div class="print-actions">
                    <button class="btn btn-secondary" onclick="editPrint(${p.id})">✏️ Bearbeiten</button>
                    <button class="btn ${p.payment_status === 'offen' ? 'btn-success' : 'btn-warning'}" 
                            onclick="togglePayment(${p.id}, '${p.payment_status}')">
                        ${p.payment_status === 'offen' ? '💰 Bezahlt' : '↩️ Offen'}
                    </button>
                    <button class="btn btn-danger" onclick="deletePrint(${p.id})">🗑️</button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

// Load uploaders for filter
async function loadUploaders() {
    const response = await fetch('/api/uploaders');
    const uploaders = await response.json();
    
    const select = document.getElementById('uploaderFilter');
    select.innerHTML = '<option value="">Alle Personen</option>';
    
    uploaders.forEach(u => {
        const option = document.createElement('option');
        option.value = u;
        option.textContent = u;
        select.appendChild(option);
    });
}

// Filters
document.getElementById('uploaderFilter').addEventListener('change', loadAdminPrints);
document.getElementById('statusFilter').addEventListener('change', loadAdminPrints);

// Toggle payment
async function togglePayment(id, currentStatus) {
    const newStatus = currentStatus === 'offen' ? 'bezahlt' : 'offen';
    
    const formData = new FormData();
    formData.append('payment_status', newStatus);
    
    const response = await apiCall(`/api/prints/${id}/status`, {
        method: 'PATCH',
        body: formData
    });
    
    if (response.ok) {
        loadAdminPrints();
        loadSummary();
    }
}

// Edit print
let currentFilaments = [];

async function editPrint(id) {
    const response = await fetch(`/api/prints/${id}`);
    const print = await response.json();
    
    // Load filaments for edit form
    const filamentsResponse = await fetch('/api/filaments');
    currentFilaments = await filamentsResponse.json();
    
    const select = document.getElementById('editFilamentType');
    select.innerHTML = currentFilaments.map(f => `
        <option value="${f.id}" ${f.id === print.filament_type_id ? 'selected' : ''}>
            ${f.name} (CHF ${f.price_per_kg}/kg)
        </option>
    `).join('');
    
    document.getElementById('editId').value = print.id;
    document.getElementById('editName').value = print.name;
    document.getElementById('editUploader').value = print.uploader;
    document.getElementById('editGrams').value = print.filament_grams;
    document.getElementById('editLink').value = print.link || '';
    document.getElementById('editStatus').value = print.payment_status;
    
    document.getElementById('editModal').style.display = 'block';
}

// Edit form submit
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const formData = new FormData();
    
    formData.append('name', document.getElementById('editName').value);
    formData.append('uploader', document.getElementById('editUploader').value);
    formData.append('filament_grams', document.getElementById('editGrams').value);
    formData.append('filament_type_id', document.getElementById('editFilamentType').value);
    formData.append('link', document.getElementById('editLink').value);
    formData.append('payment_status', document.getElementById('editStatus').value);
    
    const response = await apiCall(`/api/prints/${id}`, {
        method: 'PUT',
        body: formData
    });
    
    if (response.ok) {
        document.getElementById('editModal').style.display = 'none';
        loadAdminPrints();
        loadSummary();
    } else {
        alert('Fehler beim Aktualisieren');
    }
});

// Delete print
async function deletePrint(id) {
    if (!confirm('Wirklich löschen?')) return;
    
    const response = await apiCall(`/api/prints/${id}`, {
        method: 'DELETE'
    });
    
    if (response.ok) {
        loadAdminPrints();
        loadSummary();
    }
}

// Filaments management
async function loadFilaments() {
    const response = await fetch('/api/filaments');
    const filaments = await response.json();
    
    const container = document.getElementById('filamentsTable');
    
    if (filaments.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Noch keine Filamente vorhanden.</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="filaments-table">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Preis/kg</th>
                        <th>Aktionen</th>
                    </tr>
                </thead>
                <tbody>
                    ${filaments.map(f => `
                        <tr>
                            <td><strong>${f.name}</strong></td>
                            <td>CHF ${f.price_per_kg.toFixed(2)}</td>
                            <td>
                                <button class="btn btn-danger" onclick="deleteFilament(${f.id})">
                                    🗑️ Löschen
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Add filament
document.getElementById('filamentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('filamentName').value);
    formData.append('price_per_kg', document.getElementById('filamentPrice').value);
    
    const response = await apiCall('/api/filaments', {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        e.target.reset();
        loadFilaments();
    } else {
        alert('Fehler beim Hinzufügen (Name bereits vorhanden?)');
    }
});

// Delete filament
async function deleteFilament(id) {
    if (!confirm('Filament wirklich löschen?')) return;
    
    const response = await apiCall(`/api/filaments/${id}`, {
        method: 'DELETE'
    });
    
    if (response.ok) {
        loadFilaments();
    } else {
        alert('Fehler beim Löschen (wird noch verwendet?)');
    }
}

// Modal close
document.querySelectorAll('.modal .close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// Lightbox
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = src;
    lightbox.style.display = 'block';
}

document.getElementById('lightbox').addEventListener('click', function() {
    this.style.display = 'none';
});

document.querySelector('.lightbox .close').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('lightbox').style.display = 'none';
});

// Load everything on page load
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadFilaments();
    await loadPrints();
    await loadUploaders();
    loadSummary();
});

// Initialize
checkAuth();
loadSummary();
loadAdminPrints();
loadUploaders();
loadFilaments();