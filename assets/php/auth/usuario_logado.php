<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode([
        'sucesso' => false,
        'logado' => false,
        'mensagem' => 'Usuário não autenticado.'
    ]);
    exit;
}

echo json_encode([
    'sucesso' => true,
    'logado' => true,
    'usuario' => [
        'id' => $_SESSION['usuario_id'],
        'nome' => $_SESSION['usuario_nome'],
        'email' => $_SESSION['usuario_email'],
        'telefone' => $_SESSION['usuario_telefone'] ?? '',
        'cidade' => $_SESSION['usuario_cidade'] ?? '',
        'estado' => $_SESSION['usuario_estado'] ?? '',
        'bio' => $_SESSION['usuario_bio'] ?? '',
        'avatar' => $_SESSION['usuario_avatar'] ?? '🐾',
        'tipo' => $_SESSION['usuario_tipo'] ?? 'usuario'
    ]
]);
exit;