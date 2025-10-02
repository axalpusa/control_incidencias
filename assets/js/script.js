let incidentCount = 1;
let modalCallback = null;
let categorias = [];

// Inicializar el formulario cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

// Inicializar el formulario sin mostrar mensaje
function initializeForm() {
    const form = document.getElementById('reportForm');
    if (!form) {
        console.error('No se encontró el formulario con ID reportForm');
        return;
    }
    utils.limpiarFormulario();
    incidentCount = 1;
}

function addIncident() {
    if (incidentCount >= 5) {
        showMessage('Máximo 5 incidentes permitidos', 'warning');
        return;
    }
    incidentCount++;
    const container = document.getElementById('incidentsContainer');
    const newIncident = document.createElement('div');
    newIncident.className = 'incident-card';
    newIncident.innerHTML = `
        <h3>Incidente #${incidentCount}</h3>
        <div class="form-group">
            <label>Título:</label>
            <input type="text" class="incident-title" name="incidentTitle[]" placeholder="Ingrese título del incidente" required>
        </div>
        <div class="form-group">
            <label>Descripción:</label>
            <textarea class="incident-desc" name="incidentDesc[]" placeholder="Describa el incidente..." required></textarea>
        </div>
        <div class="form-grid form-grid-3">
            <div class="form-group">
                <label>Categoría:</label>
                <select class="incident-categoria" name="incidentCategoria[]" required>
                    <option value="">Seleccione categoría...</option>
                    ${utils.generarOpcionesCategorias()}
                </select>
            </div>
            <div class="form-group">
                <label>Impacto:</label>
                <select class="incident-impact" name="incidentImpact[]" required>
                    <option value="">Seleccione impacto...</option>
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                </select>
            </div>
            <div class="form-group">
                <label>Estado:</label>
                <select class="incident-status" name="incidentStatus[]" required>
                    <option value="">Seleccione estado...</option>
                    <option value="Resuelto">Resuelto</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Pendiente">Pendiente</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Acción Tomada:</label>
            <textarea class="incident-action" name="incidentAction[]" placeholder="Describa las acciones tomadas..." required></textarea>
        </div>
        <button type="button" class="remove-incident-btn" onclick="removeIncident(this)">🗑️ Eliminar Incidente</button>
    `;
    container.appendChild(newIncident);
   // showMessage('Nuevo incidente agregado correctamente', 'success');
}

function removeIncident(btn) {
    if (incidentCount <= 1) {
        showMessage('Debe haber al menos un incidente', 'warning');
        return;
    }
    
    showConfirmModal(
        '🗑️ Eliminar Incidente',
        '¿Estás seguro de que quieres eliminar este incidente? Esta acción no se puede deshacer.',
        function() {
            btn.parentElement.remove();
            incidentCount--;
            updateIncidentNumbers();
            showMessage('Incidente eliminado correctamente', 'info');
        }
    );
}

function updateIncidentNumbers() {
    const incidents = document.querySelectorAll('.incident-card');
    incidents.forEach((card, index) => {
        const h3 = card.querySelector('h3');
        h3.textContent = `Incidente #${index + 1}`;
    });
}

// Funciones del Modal
function showModal(title, message, type = 'info', callback = null) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOkBtn = document.querySelector('.modal-ok-btn');
    
    if (!modal || !modalTitle || !modalMessage) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message.includes('\n') ? message.replace(/\n/g, '<br>') : message;
    
    modal.className = 'modal';
    modal.classList.add(`modal-${type}`);
    modal.style.display = 'block';
    
    // Guardar callback si existe
    modalCallback = callback;
    
    setTimeout(() => {
        if (modalOkBtn) modalOkBtn.focus();
    }, 100);
}

function showConfirmModal(title, message, callback) {
    const modal = document.getElementById('messageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalOkBtn = document.querySelector('.modal-ok-btn');
    const modalCancelBtn = document.querySelector('.modal-cancel-btn');
    
    if (!modal || !modalTitle || !modalMessage) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.innerHTML = message.includes('\n') ? message.replace(/\n/g, '<br>') : message;
    
    modal.className = 'modal modal-confirm';
    modalCancelBtn.style.display = 'inline-block';
    modalOkBtn.textContent = 'Sí, continuar';
    modalCancelBtn.textContent = 'Cancelar';
    
    modalCallback = function() {
        callback();
        modalCancelBtn.style.display = 'none';
        modalOkBtn.textContent = 'Aceptar';
    };
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('messageModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Ejecutar callback si existe
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

function showMessage(message, type = 'info') {
    const titles = {
        success: '✅ Éxito',
        error: '❌ Error',
        warning: '⚠️ Advertencia',
        info: 'ℹ️ Información'
    };
    
    showModal(titles[type], message, type);
}

// Función para limpiar el formulario (SOLO se ejecuta con el botón)
function clearForm() {
    showConfirmModal(
        '🗑️ Limpiar Formulario',
        '¿Estás seguro de que quieres limpiar todo el formulario? Se perderán todos los datos no guardados.',
        function() {
            utils.limpiarFormulario();
            incidentCount = 1;
            showMessage('Formulario limpiado correctamente', 'success');
        }
    );
}

// Función para validar el formulario
function validateForm() {
    const form = document.getElementById('reportForm');
    if (!form) {
        showMessage('Error: Formulario no encontrado', 'error');
        return false;
    }
    
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    // Resetear estilos de error
    requiredFields.forEach(field => {
        field.style.borderColor = '';
    });
    
    // Validar campos requeridos
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        }
    });
    
    // Validar que al menos un incidente tenga título
    const incidentTitles = document.querySelectorAll('.incident-title');
    let hasValidIncident = false;
    incidentTitles.forEach(title => {
        if (title.value.trim()) {
            hasValidIncident = true;
        }
    });
    
     // Validar categorías en incidentes
     const incidentCategorias = document.querySelectorAll('.incident-categoria');
     let hasCategoriaError = false;
     incidentCategorias.forEach((categoria, index) => {
         const titulo = incidentTitles[index];
         // Solo validar categoría si el incidente tiene título
         if (titulo && titulo.value.trim() && !categoria.value) {
             categoria.style.borderColor = '#e74c3c';
             hasCategoriaError = true;
             isValid = false;
         }
     });

     // Validar suma de categorías vs total
    utils.validarTotalCategorias();
    const totalError = document.getElementById('totalCategoriasError');
    if (totalError.style.display === 'block') {
        isValid = false;
    }

    if (!hasValidIncident) {
        showMessage('Debe ingresar al menos un incidente con título', 'warning');
        isValid = false;
    }
    
    if (!isValid) {
        showMessage('Por favor, complete todos los campos requeridos marcados en rojo', 'error');
    }
    
    return isValid;
}

// Función para guardar en la base de datos
async function saveToDatabase() {

    generateExcel();

    if (!validateForm()) {
        return;
    }
    
    const form = document.getElementById('reportForm');
    const formData = new FormData(form);
    
    // Mostrar modal de carga
    showModal('⏳ Guardando', 'Procesando su reporte, por favor espere...', 'info');
    
    try {
        const response = await fetch('api/guardar.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        // Cerrar modal de loading
        closeModal();
        
        if (response.ok) {
            if (result.success) {
                showMessage(result.message, result.type);
                
                // Limpiar formulario solo si fue exitoso (sin mostrar mensaje adicional)
                if (result.success) {
                    initializeForm();
                }
            } else {
                showMessage(result.message, result.type);
            }
        } else {
            showMessage('Error en el servidor: ' + (result.message || 'Error desconocido'), 'error');
        }
    } catch (error) {
        closeModal();
        console.error('Error:', error);
        
        if (error instanceof SyntaxError) {
            showMessage('❌ Error: El servidor no respondió correctamente. Verifique que el archivo guardar.php esté configurado correctamente.', 'error');
        } else {
            showMessage('❌ Error de conexión: ' + error.message, 'error');
        }
    }
}

function generateExcel() {
    if (!validateForm()) {
        return;
    }
    
    try {
        const form = document.getElementById('reportForm');
        const formData = new FormData(form);
        
        // Convertir FormData a objeto
        const reporte = {
            semana: formData.get('week'),
            rango_fechas: formData.get('dateRange'),
            estado_general: formData.get('overallStatus'),
            total_incidentes: formData.get('totalIncidents'),
            semana_anterior: formData.get('previousWeek'),
            tasa_resolucion: formData.get('resolutionRate'),
            tiempo_respuesta: formData.get('avgResponse'),
            incidentes_resueltos: formData.get('resolved'),
            variacion: formData.get('variation'),
            necesidades: formData.get('needs'),
            recomendaciones: formData.get('recommendations'),
            total_por_categoria: '{}' // Por ahora vacío, se puede mejorar
        };
        
        // Obtener incidentes del formulario
        const incidentes = [];
        const titles = formData.getAll('incidentTitle[]');
        const descs = formData.getAll('incidentDesc[]');
        const impacts = formData.getAll('incidentImpact[]');
        const statuses = formData.getAll('incidentStatus[]');
        const actions = formData.getAll('incidentAction[]');
        const categorias = formData.getAll('incidentCategoria[]') || [];
        
        titles.forEach((title, index) => {
            if (title.trim() !== '') {
                incidentes.push({
                    titulo: title,
                    descripcion: descs[index] || '',
                    impacto: impacts[index] || '',
                    estado: statuses[index] || '',
                    accion: actions[index] || '',
                    id_categoria: categorias[index] || 1
                });
            }
        });
        
        // Usar la función de utils
        utils.generarExcelDesdeDatos(reporte, incidentes);
        showMessage('✅ Archivo Excel generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al generar Excel:', error);
        showMessage('❌ Error al generar el archivo Excel: ' + error.message, 'error');
    }
}


// Cargar categorías al iniciar
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    cargarCategorias();
});

// Función para cargar categorías desde la API
async function cargarCategorias() {
    try {
        const response = await fetch('api/obtener_categorias.php');
        const result = await response.json();
        
        if (result.success) {
            categorias = result.data;
            renderizarCategorias();
            actualizarCategoriasEnIncidentes();
        } else {
            console.error('Error al cargar categorías:', result.message);
            showMessage('Error al cargar categorías: ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        showMessage('Error de conexión al cargar categorías: ' + error.message, 'error');
    }
}

// Función para renderizar categorías en el formulario
function renderizarCategorias() {
    const container = document.getElementById('categoriasContainer');
    
    if (categorias.length === 0) {
        container.innerHTML = '<p>No hay categorías disponibles</p>';
        return;
    }
    
    let html = '<div class="form-grid">';
    
    categorias.forEach((categoria, index) => {
        html += `
            <div class="form-group">
                <label>${categoria.nombre}:</label>
                <input type="number" 
                       id="catCount_${categoria.id}" 
                       name="catCount_${index}"
                       value="0" 
                       min="0" 
                       class="categoria-count"
                       onchange="utils.actualizarSumaCategorias()">
                <input type="hidden" name="catId_${index}" value="${categoria.id}">
                <small style="color: #666;">${categoria.descripcion}</small>
            </div>
        `;
    });
    
    html += '</div>';
    html += `<input type="hidden" id="categoriaCount" name="categoriaCount" value="${categorias.length}">`;
    html += `<div class="categorias-summary">
                <p>📊 <strong>Suma de categorías:</strong> <span id="sumaCategorias">0</span></p>
            </div>`;
    
    container.innerHTML = html;
}


// Función para actualizar selects de categoría en incidentes existentes
function actualizarCategoriasEnIncidentes() {
    const selects = document.querySelectorAll('.incident-categoria');
    const opciones = utils.generarOpcionesCategorias();
    
    selects.forEach(select => {
        const valorActual = select.value;
        
        const primeraOpcion = select.querySelector('option[value=""]');
        select.innerHTML = primeraOpcion ? primeraOpcion.outerHTML + opciones : '<option value="">Seleccione categoría...</option>' + opciones;
        
        if (valorActual && select.querySelector(`option[value="${valorActual}"]`)) {
            select.value = valorActual;
        }
    });
}
