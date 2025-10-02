let allReportes = [];
let currentPage = 1;
let itemsPerPage = 10;
let filteredReportes = [];
let categorias = [];

// Cargar reportes y categorías cuando la página se carga
document.addEventListener('DOMContentLoaded', function() {
    loadCategorias();
    loadReportes();
});

// ========== FUNCIONES DE CATEGORÍAS ==========
async function loadCategorias() {
    try {
        const response = await fetch('api/obtener_categorias.php');
        const result = await response.json();
        
        if (result.success) {
            categorias = result.data;
        } else {
            console.error('❌ Error al cargar categorías:', result.message);
        }
    } catch (error) {
        console.error('❌ Error de conexión al cargar categorías:', error);
    }
}

function getNombreCategoria(idCategoria) {
    if (!categorias || categorias.length === 0) {
        return `Categoría ${idCategoria}`;
    }
    
    const categoria = categorias.find(cat => cat.id == idCategoria);
    return categoria ? categoria.nombre : `Categoría ${idCategoria}`;
}

function parseCategoriasData(categoriasJson) {
    try {
        return JSON.parse(categoriasJson || '{}');
    } catch (e) {
        console.error('Error parsing categorias data:', e);
        return {};
    }
}

// ========== FUNCIONES PRINCIPALES ==========
async function loadReportes() {
    showLoading(true);
    
    try {
        const response = await fetch('api/obtener_reportes.php');
        const result = await response.json();
        
        if (result.success) {
            allReportes = result.data;
            filteredReportes = [...allReportes];
            showLoading(false);
            updateEstadisticas();
            renderReportes();
        } else {
            showLoading(false);
            showMessage('Error al cargar reportes: ' + result.message, 'error');
        }
    } catch (error) {
        showLoading(false);
        showMessage('Error de conexión: ' + error.message, 'error');
    }
}

// ========== RENDERIZADO DE TABLA ==========
function renderReportes() {
    const tbody = document.getElementById('reportesBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const table = document.getElementById('reportesTable');
    const pagination = document.getElementById('pagination');
    
    if (filteredReportes.length === 0) {
        table.style.display = 'none';
        pagination.style.display = 'none';
        noDataMessage.style.display = 'block';
        return;
    }
    
    table.style.display = 'table';
    noDataMessage.style.display = 'none';
    
    // Calcular paginación
    const totalPages = Math.ceil(filteredReportes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentReportes = filteredReportes.slice(startIndex, endIndex);
    
    // Renderizar filas
    tbody.innerHTML = currentReportes.map(reporte => {
        // Parsear categorías para mostrar en tooltip
        const categoriasData = parseCategoriasData(reporte.total_por_categoria);
        const categoriasText = Object.entries(categoriasData)
            .map(([catId, count]) => `${getNombreCategoria(catId)}: ${count}`)
            .join(', ');
        
        return `
        <tr>
            <td>${reporte.id}</td>
            <td><strong>${reporte.semana}</strong></td>
            <td>${reporte.rango_fechas}</td>
            <td>
                <span class="status-badge status-${reporte.estado_general}">
                    ${utils.getStatusText(reporte.estado_general)}
                </span>
            </td>
            <td>${reporte.total_incidentes}</td>
            <td>${reporte.tasa_resolucion}%</td>
            <td title="${categoriasText}">${utils.formatDate(reporte.fecha_registro)}</td>
            <td>
                <button class="btn-action btn-download" onclick="descargarReporte(${reporte.id})" title="Descargar Excel">
                    📊 Excel
                </button>
                <button class="btn-action btn-view" onclick="verDetalles(${reporte.id})" title="Ver detalles">
                    👁️ Ver
                </button>
            </td>
        </tr>
        `;
    }).join('');
    
    // Actualizar paginación
    updatePagination(totalPages);
}

// ========== FUNCIÓN VER DETALLES ==========
function verDetalles(idReporte) {
    const reporte = allReportes.find(r => r.id == idReporte);
    
    if (!reporte) {
        showMessage('Reporte no encontrado', 'error');
        return;
    }
    
    // Parsear categorías usando utils
    const categoriasData = utils.parseCategoriasData(reporte.total_por_categoria);
    const categoriasDetalle = Object.entries(categoriasData)
        .map(([catId, count]) => `• ${utils.getNombreCategoria(catId)}: ${count} incidentes`)
        .join('\n');
    
    const mensaje = `
📋 <strong>${reporte.semana}</strong>
📅 ${reporte.rango_fechas}
🟢 Estado: ${utils.getStatusText(reporte.estado_general)}
📊 Total Incidentes: ${reporte.total_incidentes}
🎯 Tasa Resolución: ${parseFloat(reporte.tasa_resolucion).toFixed(2)}%

<strong>Desglose por Categoría:</strong>
${categoriasDetalle || 'No hay datos de categorías'}

<strong>KPIs:</strong>
⏱️ Tiempo Respuesta: ${reporte.tiempo_respuesta}
✅ Resueltos: ${reporte.incidentes_resueltos}
📈 Variación: ${reporte.variacion}

<strong>Necesidades:</strong>
${reporte.necesidades || 'No especificado'}

<strong>Recomendaciones:</strong>
${reporte.recomendaciones || 'No especificado'}
    `.trim();
    
    showModal('👁️ Detalles del Reporte', mensaje, 'info');
}


// ========== FUNCIONES DE UTILIDAD ==========
function showLoading(show) {
    document.getElementById('loadingMessage').style.display = show ? 'block' : 'none';
    document.getElementById('reportesTable').style.display = show ? 'none' : 'table';
    document.getElementById('noDataMessage').style.display = 'none';
}

function filterReportes() {
    const searchWeek = document.getElementById('searchWeek').value.toLowerCase();
    const filterStatus = document.getElementById('filterStatus').value;
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    
    filteredReportes = allReportes.filter(reporte => {
        const matchWeek = reporte.semana.toLowerCase().includes(searchWeek);
        const matchStatus = !filterStatus || reporte.estado_general === filterStatus;
        return matchWeek && matchStatus;
    });
    
    currentPage = 1;
    renderReportes(); // ← SE VUELVE A LLAMAR AQUÍ TAMBIÉN
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredReportes.length / itemsPerPage);
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    renderReportes(); 
}

// ========== FUNCIONES DE DESCARGAR EXCEL ==========
async function descargarReporte(idReporte) {
    try {
        showMessage('⏳ Cargando datos del reporte...', 'info');
        
        const response = await fetch(`api/obtener_reporte.php?id=${idReporte}`);
        const result = await response.json();
        
        if (!result.success) {
            showMessage('❌ Error al obtener reporte: ' + result.message, 'error');
            return;
        }
        
        const { reporte, incidentes } = result.data;
        
        // Usar la función de utils
        utils.generarExcelDesdeDatos(reporte, incidentes);
        showMessage('✅ Archivo Excel generado exitosamente', 'success');
        
    } catch (error) {
        console.error('❌ Error en descargarReporte:', error);
        showMessage('❌ Error: ' + error.message, 'error');
    }
}


// ========== FUNCIONES DE ESTADÍSTICAS ==========
function updateEstadisticas() {
    const estadisticas = document.getElementById('estadisticas');
    const statsContent = document.getElementById('statsContent');
    
    if (allReportes.length === 0) {
        estadisticas.style.display = 'none';
        return;
    }
    
    const totalReportes = allReportes.length;
    
    // DEBUG DETALLADO de cada reporte
    let sumaDebug = 0;
    const totalIncidentes = allReportes.reduce((sum, reporte, index) => {
        const incidentesRaw = reporte.total_incidentes;
        const incidentesNum = parseInt(incidentesRaw) || 0;
        
        sumaDebug += incidentesNum;
        
        return sum + incidentesNum;
    }, 0);
    
    // Calcular resolución promedio
    const sumaResolucion = allReportes.reduce((sum, reporte) => {
        const resolucion = parseFloat(reporte.tasa_resolucion) || 0;
        return sum + resolucion;
    }, 0);
    
    const avgResolucion = sumaResolucion / totalReportes;
    
    const estados = allReportes.reduce((acc, reporte) => {
        acc[reporte.estado_general] = (acc[reporte.estado_general] || 0) + 1;
        return acc;
    }, {});
    
    // Mostrar estadísticas corregidas
    statsContent.innerHTML = `
        <div class="stat-card">
            <div class="stat-number">${totalReportes}</div>
            <div class="stat-label">Total Reportes</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${totalIncidentes}</div>
            <div class="stat-label">Incidentes Totales</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${avgResolucion.toFixed(2)}%</div>
            <div class="stat-label">Resolución Promedio</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${estados.green || 0}</div>
            <div class="stat-label">🟢 Operación Normal</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${estados.yellow || 0}</div>
            <div class="stat-label">🟡 Requiere Atención</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${estados.red || 0}</div>
            <div class="stat-label">🔴 Situación Crítica</div>
        </div>
    `;
}

// ========== FUNCIONES DEL MODAL ==========
let modalCallback = null;

function showModal(title, message, type = 'info', callback = null) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    
    if (!modal || !modalTitle || !modalMessage) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = utils.formatModalMessage(message);
    
    modal.className = 'modal';
    modal.classList.add(`modal-${type}`);
    modal.style.display = 'block';
    
    modalCallback = callback;
    
    setTimeout(() => {
        const modalOkBtn = document.querySelector('.modal-ok-btn');
        if (modalOkBtn) modalOkBtn.focus();
    }, 100);
}

function showMessage(message, type = 'info') {
    const titles = {
        success: '✅ Éxito',
        error: '❌ Error',
        warning: '⚠️ Advertencia',
        info: 'ℹ️ Información'
    };
    showModal(titles[type], message, type);
}

function closeModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (modalCallback) {
        modalCallback();
        modalCallback = null;
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('messageModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Cerrar modal con ESC
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('messageModal');
    if (event.key === 'Escape' && modal && modal.style.display === 'block') {
        closeModal();
    }
});