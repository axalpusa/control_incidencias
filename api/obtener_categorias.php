<?php
require_once 'config.php';

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
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        sendError('Error de conexión a la base de datos: ' . $conn->connect_error);
    }

    // Obtener categorías activas
    $sql = "SELECT id, nombre, descripcion FROM categorias WHERE activo = TRUE ORDER BY nombre";
    $result = $conn->query($sql);

    if (!$result) {
        sendError('Error al obtener categorías: ' . $conn->error);
    }

    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row;
    }

    $conn->close();

    // Devolver datos en formato JSON
    echo json_encode([
        'success' => true,
        'data' => $categorias
    ]);

} catch (Exception $e) {
    sendError('Error interno del servidor: ' . $e->getMessage());
}
?>