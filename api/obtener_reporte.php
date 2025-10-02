<?php
require_once 'config.php';
// Configuración de errores
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header('Content-Type: application/json');

// Función para enviar errores en formato JSON
function sendError($message, $code = 500) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit;
}

// Función para enviar éxito en formato JSON
function sendSuccess($data) {
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    exit;
}

try {
    // Validar método
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Método no permitido', 405);
    }

    // Validar ID
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        sendError('ID de reporte no proporcionado', 400);
    }

    $idReporte = intval($_GET['id']);
    
    if ($idReporte <= 0) {
        sendError('ID de reporte inválido: ' . $idReporte, 400);
    }

    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        sendError('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    // Obtener datos del reporte
    $sqlReporte = "SELECT * FROM reportes WHERE id = ?";
    $stmtReporte = $conn->prepare($sqlReporte);
    
    if (!$stmtReporte) {
        sendError('Error en preparación de consulta: ' . $conn->error);
    }

    $stmtReporte->bind_param("i", $idReporte);
    
    if (!$stmtReporte->execute()) {
        sendError('Error al ejecutar consulta: ' . $stmtReporte->error);
    }

    $resultReporte = $stmtReporte->get_result();

    if ($resultReporte->num_rows === 0) {
        sendError('Reporte no encontrado para ID: ' . $idReporte, 404);
    }

    $reporte = $resultReporte->fetch_assoc();
    $stmtReporte->close();

    // Obtener incidentes del reporte
    $sqlIncidentes = "SELECT * FROM incidentes WHERE id_reporte = ? ORDER BY id";
    $stmtIncidentes = $conn->prepare($sqlIncidentes);
    
    if (!$stmtIncidentes) {
        sendError('Error en preparación de incidentes: ' . $conn->error);
    }

    $stmtIncidentes->bind_param("i", $idReporte);
    
    if (!$stmtIncidentes->execute()) {
        sendError('Error al ejecutar consulta de incidentes: ' . $stmtIncidentes->error);
    }

    $resultIncidentes = $stmtIncidentes->get_result();

    $incidentes = [];
    while ($row = $resultIncidentes->fetch_assoc()) {
        $incidentes[] = $row;
    }
    
    $stmtIncidentes->close();
    $conn->close();

    // Devolver datos en formato JSON
    sendSuccess([
        'reporte' => $reporte,
        'incidentes' => $incidentes
    ]);

} catch (Exception $e) {
    sendError('Error interno del servidor: ' . $e->getMessage());
}
?>