<?php
require_once 'config.php';
// Habilitar reporte de errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configurar respuesta como JSON
header('Content-Type: application/json');

// Validar que es una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'type' => 'error',
        'message' => 'Método no permitido'
    ]);
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'type' => 'error',
        'message' => 'Error de conexión a la base de datos: ' . $conn->connect_error
    ]);
    exit;
}

// Función para limpiar datos
function limpiarDato($dato) {
    return htmlspecialchars(trim($dato));
}

// ---------------- VALIDAR Y LIMPIAR DATOS ----------------
$semana       = limpiarDato($_POST['week']);
$rango        = limpiarDato($_POST['dateRange']);
$estado       = limpiarDato($_POST['overallStatus']);
$total        = intval($_POST['totalIncidents']);
$anterior     = intval($_POST['previousWeek']);
$resolucion   = intval($_POST['resolutionRate']);
$respuesta    = limpiarDato($_POST['avgResponse']);
$resueltos    = limpiarDato($_POST['resolved']);
$variacion    = limpiarDato($_POST['variation']);
$needs        = limpiarDato($_POST['needs']);
$recommendations = limpiarDato($_POST['recommendations']);

// Procesar categorías (ahora vienen como array)
$categorias_data = [];
if (!empty($_POST['categoriaCount'])) {
    $categoriaCount = intval($_POST['categoriaCount']);
    for ($i = 0; $i < $categoriaCount; $i++) {
        if (isset($_POST["catId_$i"]) && isset($_POST["catCount_$i"])) {
            $catId = intval($_POST["catId_$i"]);
            $catCount = intval($_POST["catCount_$i"]);
            if ($catId > 0 && $catCount >= 0) {
                $categorias_data[$catId] = $catCount;
            }
        }
    }
}

// Convertir a JSON para guardar en la base de datos
$total_por_categoria = json_encode($categorias_data);

// ---------------- INSERTAR REPORTE ----------------
$sql = "INSERT INTO reportes 
(semana, rango_fechas, estado_general, total_incidentes, semana_anterior, tasa_resolucion, tiempo_respuesta, incidentes_resueltos, variacion, necesidades, recomendaciones, total_por_categoria, fecha_registro)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la preparación: ' . $conn->error
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("sssiisssssss",
    $semana, $rango, $estado, $total, $anterior, $resolucion, 
    $respuesta, $resueltos, $variacion, $needs, $recommendations, $total_por_categoria
);

if ($stmt->execute()) {
    $idReporte = $stmt->insert_id;
    $response = [
        'success' => true,
        'message' => '✅ Reporte guardado correctamente',
        'data' => [
            'id_reporte' => $idReporte,
            'semana' => $semana,
            'total_incidentes' => $total
        ]
    ];
    
    // ---------------- DATOS DE INCIDENTES ----------------
    $incidentesGuardados = 0;
    if (!empty($_POST['incidentTitle'])) {
        $titles = $_POST['incidentTitle'];
        $descs  = $_POST['incidentDesc'];
        $impacts = $_POST['incidentImpact'];
        $statuses = $_POST['incidentStatus'];
        $actions = $_POST['incidentAction'];
        $categorias = $_POST['incidentCategoria'] ?? [];

        $sqlInc = "INSERT INTO incidentes (id_reporte, titulo, descripcion, impacto, estado, accion, id_categoria) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmtInc = $conn->prepare($sqlInc);
        
        if ($stmtInc) {
            foreach ($titles as $i => $titulo) {
                if (!empty(trim($titulo))) {
                    $desc   = limpiarDato($descs[$i]);
                    $impacto= limpiarDato($impacts[$i]);
                    $estadoInc = limpiarDato($statuses[$i]);
                    $accion = limpiarDato($actions[$i]);
                    $id_categoria = isset($categorias[$i]) ? intval($categorias[$i]) : 1;

                    $stmtInc->bind_param("isssssi", $idReporte, $titulo, $desc, $impacto, $estadoInc, $accion, $id_categoria);
                    if ($stmtInc->execute()) {
                        $incidentesGuardados++;
                    }
                }
            }
            $stmtInc->close();
            
            $response['data']['incidentes_guardados'] = $incidentesGuardados;
            $response['message'] .= "\n✅ $incidentesGuardados incidente(s) guardado(s) correctamente";
        }
    }
    
    echo json_encode($response);
} else {
    echo json_encode([
        'success' => false,
        'message' => '❌ Error al ejecutar la consulta: ' . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>