<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../mail/enviar_email.php';

try {
    if (!isset($_SESSION['usuario_id'])) {
        http_response_code(401);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Usuário não autenticado.'
        ]);
        exit;
    }

    $dados = json_decode(file_get_contents('php://input'), true);

    if (!is_array($dados)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'JSON inválido.'
        ]);
        exit;
    }

    $novoEmail = trim($dados['email'] ?? '');

    if ($novoEmail === '') {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Informe o novo e-mail.'
        ]);
        exit;
    }

    if (!filter_var($novoEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'E-mail inválido.'
        ]);
        exit;
    }

    if (mb_strtolower($novoEmail) === mb_strtolower($_SESSION['usuario_email'])) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'O novo e-mail deve ser diferente do atual.'
        ]);
        exit;
    }

    $sql = "SELECT id FROM usuarios WHERE email = :email AND id <> :id LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':email' => $novoEmail,
        ':id' => $_SESSION['usuario_id']
    ]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Este e-mail já está em uso.'
        ]);
        exit;
    }

    $token = bin2hex(random_bytes(32));
    $expira = date('Y-m-d H:i:s', strtotime('+1 day'));

    $sql = "UPDATE usuarios
            SET novo_email = :novo_email,
                token_troca_email = :token,
                token_troca_email_expira = :expira
            WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':novo_email' => $novoEmail,
        ':token' => $token,
        ':expira' => $expira,
        ':id' => $_SESSION['usuario_id']
    ]);

    $link = 'http://localhost:8080/assets/php/auth/confirmar_troca_email.php?token=' . urlencode($token);

    $assunto = 'Confirme a troca do seu e-mail - AuChei';
    $corpoHtml = '
        <h2>Olá!</h2>
        <p>Recebemos uma solicitação para alterar o e-mail da sua conta no AuChei.</p>
        <p>Para confirmar a troca, clique no link abaixo:</p>
        <p><a href="' . $link . '">Confirmar novo e-mail</a></p>
        <p>Se você não solicitou essa alteração, ignore este e-mail.</p>
        <p>Este link expira em 24 horas.</p>
    ';
    $corpoTexto = "Confirme a troca do seu e-mail acessando:\n{$link}\n\nSe você não solicitou, ignore este e-mail.";

    $resultado = enviarEmail($novoEmail, $_SESSION['usuario_nome'] ?? 'Usuário', $assunto, $corpoHtml, $corpoTexto);

    if (!$resultado['sucesso']) {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Não foi possível enviar o e-mail de confirmação.',
            'erro' => $resultado['erro'] ?? null
        ]);
        exit;
    }

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Enviamos um link de confirmação para o novo e-mail.'
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno ao solicitar troca de e-mail.',
        'erro' => $e->getMessage()
    ]);
    exit;
}