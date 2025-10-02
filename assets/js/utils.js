// utils.js - Funciones utilitarias compartidas
class Utils {
    constructor() {
        this.categorias = [];
        this.loadCategorias();
    }

    // ========== FUNCIONES DE CATEGORÍAS ==========
    async loadCategorias() {
        try {
            const response = await fetch('api/obtener_categorias.php');
            const result = await response.json();
            
            if (result.success) {
                this.categorias = result.data;
            } else {
                console.error('❌ Error al cargar categorías:', result.message);
            }
        } catch (error) {
            console.error('❌ Error de conexión al cargar categorías:', error);
        }
    }

    getNombreCategoria(idCategoria) {
        if (!this.categorias || this.categorias.length === 0) {
            return `Categoría ${idCategoria}`;
        }
        
        const categoria = this.categorias.find(cat => cat.id == idCategoria);
        return categoria ? categoria.nombre : `Categoría ${idCategoria}`;
    }

    parseCategoriasData(categoriasJson) {
        try {
            return JSON.parse(categoriasJson || '{}');
        } catch (e) {
            console.error('Error parsing categorias data:', e);
            return {};
        }
    }

    generarOpcionesCategorias() {
        if (this.categorias.length === 0) return '<option value="">Cargando categorías...</option>';
        
        return this.categorias.map(cat => 
            `<option value="${cat.id}">${cat.nombre}</option>`
        ).join('');
    }

    // ========== FUNCIÓN COMPARTIDA PARA GENERAR EXCEL ==========
    generarExcelDesdeDatos(reporte, incidentes) {
        
        try {
            // Crear libro de trabajo
            const wb = XLSX.utils.book_new();
            
            // Parsear datos de categorías
            const categoriasData = this.parseCategoriasData(reporte.total_por_categoria);
            
            // Hoja de resumen
            const summaryData = [
                ['REPORTE DE CIBERSEGURIDAD', ''],
                ['Semana', reporte.semana],
                ['Rango de Fechas', reporte.rango_fechas],
                ['Estado General', reporte.estado_general],
                [''],
                ['RESUMEN DE INCIDENTES', ''],
                ['Total de Incidentes', reporte.total_incidentes],
                ['Semana Anterior', reporte.semana_anterior],
                ['Tasa de Resolución (%)', parseFloat(reporte.tasa_resolucion).toFixed(2)],
                [''],
                ['INCIDENTES POR CATEGORÍA', ''],
            ];
            
            // Agregar categorías dinámicamente
            Object.entries(categoriasData).forEach(([catId, count]) => {
                const nombreCategoria = this.getNombreCategoria(catId);
                summaryData.push([nombreCategoria, count]);
            });
            
            summaryData.push(
                ['', ''],
                ['INDICADORES CLAVE (KPIs)', ''],
                ['Tiempo Promedio de Respuesta', reporte.tiempo_respuesta],
                ['Incidentes Resueltos (%)', reporte.incidentes_resueltos],
                ['Variación vs. Semana Anterior', reporte.variacion],
                ['', ''],
                ['NECESIDADES INMEDIATAS', ''],
                [reporte.necesidades],
                ['', ''],
                ['RECOMENDACIONES', ''],
                [reporte.recomendaciones]
            );
            
            const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws_summary, "Resumen");
            
            // Hoja de incidentes
            const incidentData = [
                ['#', 'Título', 'Descripción', 'Categoría', 'Impacto', 'Estado', 'Acción Tomada']
            ];
            
            incidentes.forEach((incidente, index) => {
                const nombreCategoria = this.getNombreCategoria(incidente.id_categoria);
                incidentData.push([
                    index + 1,
                    incidente.titulo,
                    incidente.descripcion,
                    nombreCategoria,
                    incidente.impacto,
                    incidente.estado,
                    incidente.accion
                ]);
            });
            
            const ws_incidents = XLSX.utils.aoa_to_sheet(incidentData);
            XLSX.utils.book_append_sheet(wb, ws_incidents, "Incidentes");
            
            // Generar y descargar archivo
            const fileName = `Reporte_Ciberseguridad_${reporte.semana}_${new Date().getFullYear()}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error al generar Excel:', error);
            throw new Error('Error al generar el archivo Excel: ' + error.message);
        }
    }

    // ========== FUNCIONES DE VALIDACIÓN ==========
    validarTotalCategorias() {
        const totalInput = document.getElementById('totalIncidents');
        const sumaElement = document.getElementById('sumaCategorias');
        const errorElement = document.getElementById('totalCategoriasError');
        
        if (!totalInput || !sumaElement) return;
        
        const total = parseInt(totalInput.value) || 0;
        const suma = parseInt(sumaElement.textContent) || 0;
        
        if (total !== suma) {
            if (errorElement) errorElement.style.display = 'block';
            totalInput.style.borderColor = '#e74c3c';
            return false;
        } else {
            if (errorElement) errorElement.style.display = 'none';
            totalInput.style.borderColor = '';
            return true;
        }
    }

    actualizarSumaCategorias() {
        const inputs = document.querySelectorAll('.categoria-count');
        let suma = 0;
        
        inputs.forEach(input => {
            suma += parseInt(input.value) || 0;
        });
        
        const sumaElement = document.getElementById('sumaCategorias');
        if (sumaElement) {
            sumaElement.textContent = suma;
        }
        
        this.validarTotalCategorias();
    }

    // ========== FUNCIONES DE FORMATEO ==========
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatModalMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>');
    }

    getStatusText(status) {
        const statusMap = {
            'green': '🟢 Normal',
            'yellow': '🟡 Atención',
            'red': '🔴 Crítico'
        };
        return statusMap[status] || status;
    }

    // ========== FUNCIONES DE FORMULARIOS ==========
    limpiarFormulario() {
        const form = document.getElementById('reportForm');
        if (form) {
            form.reset();
        }
        
        // Limpiar contenedor de incidentes
        const container = document.getElementById('incidentsContainer');
        if (container) {
            container.innerHTML = this.getHTMLIncidenteInicial();
        }
        
        // Resetear suma de categorías
        const sumaElement = document.getElementById('sumaCategorias');
        if (sumaElement) {
            sumaElement.textContent = '0';
        }
    }

    getHTMLIncidenteInicial() {
        return `
            <div class="incident-card">
                <h3>Incidente #1</h3>
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
                            ${this.generarOpcionesCategorias()}
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
            </div>
        `;
    }
}

// Crear instancia global
const utils = new Utils();