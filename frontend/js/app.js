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
        
        // Load statistics when tab is opened
        if (tabName === 'statistics') {
            loadStatistics();
        }
    });
});

// Load filaments
async function loadFilaments() {
    const response = await fetch('/api/filaments');
    const filaments = await response.json();
    
    const select = document.getElementById('filament_type');
    select.innerHTML = '<option value="">Auswählen...</option>';
    
    filaments.forEach(f => {
        const option = document.createElement('option');
        option.value = f.id;
        option.textContent = `${f.name} (CHF ${f.price_per_kg}/kg)`;
        select.appendChild(option);
    });
}

// Load prints
async function loadPrints() {
    const response = await fetch('/api/prints');
    const prints = await response.json();
    
    const grid = document.getElementById('printsGrid');
    
    if (prints.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary);">Noch keine Drucke vorhanden.</p>';
        return;
    }
    
    grid.innerHTML = prints.map(p => `
        <div class="print-card">
            ${p.image_path ? `
                <img src="${p.image_path}" 
                     alt="${p.name}" 
                     class="print-image"
                     onclick="openLightbox('${p.image_path}')">
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
                    ${p.link ? `<a href="${p.link}" target="_blank" style="color: var(--primary);">🔗 Link ansehen</a>` : ''}
                </div>
                <span class="status-badge status-${p.payment_status}">
                    ${p.payment_status === 'offen' ? '🔴 Offen' : '✅ Bezahlt'}
                </span>
            </div>
        </div>
    `).join('');
}

// Submit form
document.getElementById('printForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('/api/prints', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            e.target.reset();
            loadPrints();
            alert('Druck erfolgreich gespeichert!');
        } else {
            console.error('Fehler beim Speichern');
        }
    } catch (error) {
        console.error('Fehler: ' + error.message);
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

// Statistics
let charts = {};

async function loadStatistics() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let url = '/api/statistics';
    const params = new URLSearchParams();
    
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    if (params.toString()) {
        url += '?' + params.toString();
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Update summary cards
    updateSummaryCards(data.total_stats);
    
    // Create/update charts
    createPrintsPerMonthChart(data.prints_per_month);
    createCostsPerMonthChart(data.costs_per_month);
    createFilamentOverTimeChart(data.filament_over_time);
    createTopUploadersChart(data.top_uploaders);
    createAvgPerFilamentChart(data.avg_per_filament);
}

function updateSummaryCards(stats) {
    document.getElementById('totalPrints').textContent = stats.total_prints || 0;
    document.getElementById('totalFilament').textContent = stats.total_filament ? stats.total_filament.toFixed(1) : '0';
    document.getElementById('totalCost').textContent = stats.total_cost ? stats.total_cost.toFixed(2) : '0.00';
    document.getElementById('avgPrice').textContent = stats.avg_price_per_print ? stats.avg_price_per_print.toFixed(2) : '0.00';
}

function createPrintsPerMonthChart(data) {
    const ctx = document.getElementById('printsPerMonthChart');
    
    if (charts.printsPerMonth) {
        charts.printsPerMonth.destroy();
    }
    
    charts.printsPerMonth = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Drucke',
                data: data.map(d => d.count),
                backgroundColor: '#6366f1',
                borderColor: '#4f46e5',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

function createCostsPerMonthChart(data) {
    const ctx = document.getElementById('costsPerMonthChart');
    
    if (charts.costsPerMonth) {
        charts.costsPerMonth.destroy();
    }
    
    charts.costsPerMonth = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.month),
            datasets: [{
                label: 'Kosten (CHF)',
                data: data.map(d => d.total_cost),
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return 'CHF ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

function createFilamentOverTimeChart(data) {
    const ctx = document.getElementById('filamentOverTimeChart');
    
    if (charts.filamentOverTime) {
        charts.filamentOverTime.destroy();
    }
    
    // Group by filament type
    const filamentTypes = [...new Set(data.map(d => d.filament_name))];
    const months = [...new Set(data.map(d => d.month))].sort();
    
    const colors = [
        '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#a855f7'
    ];
    
    const datasets = filamentTypes.map((filament, index) => {
        return {
            label: filament,
            data: months.map(month => {
                const entry = data.find(d => d.month === month && d.filament_name === filament);
                return entry ? entry.grams : 0;
            }),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length] + '33',
            tension: 0.4,
            fill: false
        };
    });
    
    charts.filamentOverTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#f1f5f9'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value + 'g';
                        }
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

function createTopUploadersChart(data) {
    const ctx = document.getElementById('topUploadersChart');
    
    if (charts.topUploaders) {
        charts.topUploaders.destroy();
    }
    
    charts.topUploaders = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.uploader),
            datasets: [{
                label: 'Anzahl Drucke',
                data: data.map(d => d.print_count),
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                y: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

function createAvgPerFilamentChart(data) {
    const ctx = document.getElementById('avgPerFilamentChart');
    
    if (charts.avgPerFilament) {
        charts.avgPerFilament.destroy();
    }
    
    charts.avgPerFilament = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.filament_name),
            datasets: [{
                label: 'Ø Gramm pro Druck',
                data: data.map(d => d.avg_grams),
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value.toFixed(1) + 'g';
                        }
                    },
                    grid: {
                        color: '#334155'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: '#334155'
                    }
                }
            }
        }
    });
}

function resetDateFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadStatistics();
}

// Initialize
loadFilaments();
loadPrints();