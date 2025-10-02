<?php
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

try {
    // Validar método
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Método no permitido', 405);
    }

    // Datos de conexión
    $host = "localhost";
    $user = "root";      
    $pass = "";          
    $db   = "ciberseguridad";

    // Conectar
    $conn = new mysqli($host, $user, $pass, $db);
    
    if ($conn->connect_error) {
        sendError('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    // Obtener reportes
    $sql = "SELECT * FROM reportes ORDER BY fecha_registro DESC";
    $result = $conn->query($sql);

    if (!$result) {
        sendError('Error al obtener reportes: ' . $conn->error);
    }

    $reportes = [];
    while ($row = $result->fetch_assoc()) {
        $reportes[] = $row;
    }

    $conn->close();

    // Devolver datos en formato JSON
    echo json_encode([
        'success' => true,
        'data' => $reportes
    ]);

} catch (Exception $e) {
    sendError('Error interno del servidor: ' . $e->getMessage());
}
?>