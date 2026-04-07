<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/conexao.php';

try {
    $token = trim($_GET['token'] ?? '');

    if ($token === '') {
        echo 'Token de verificação não informado.';
        exit;
    }

    $sql = "SELECT id, email_verificado, token_verificacao_expira
            FROM usuarios
            WHERE token_verificacao = :token
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':token' => $token]);

    $usuario = $stmt->fetch();

    if (!$usuario) {
        echo 'Token inválido ou usuário não encontrado.';
        exit;
    }

    if ((int)$usuario['email_verificado'] === 1) {
        echo 'Este e-mail já foi verificado.';
        exit;
    }

    if (
        empty($usuario['token_verificacao_expira']) ||
        strtotime($usuario['token_verificacao_expira']) < time()
    ) {
        echo 'O token de verificação expirou.';
        exit;
    }

    $sql = "UPDATE usuarios
            SET email_verificado = 1,
                token_verificacao = NULL,
                token_verificacao_expira = NULL
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $usuario['id']]);

    echo 'E-mail verificado com sucesso! Agora você já pode fazer login no AuChei.';
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo 'Erro interno ao verificar e-mail: ' . $e->getMessage();
    exit;
}