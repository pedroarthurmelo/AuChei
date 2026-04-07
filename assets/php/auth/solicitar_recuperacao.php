<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../mail/enviar_email.php';

try {
    $dados = json_decode(file_get_contents('php://input'), true);

    if (!is_array($dados)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'JSON inválido.'
        ]);
        exit;
    }

    $email = trim($dados['email'] ?? '');

    if ($email === '') {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Informe o e-mail.'
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'E-mail inválido.'
        ]);
        exit;
    }

    $sql = "SELECT id, nome, email FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        echo json_encode([
            'sucesso' => true,
            'mensagem' => 'Se o e-mail estiver cadastrado, enviaremos um link de recuperação.'
        ]);
        exit;
    }

    $token = bin2hex(random_bytes(32));
    $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $sql = "UPDATE usuarios
            SET token_recuperacao = :token,
                token_recuperacao_expira = :expira
            WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':token' => $token,
        ':expira' => $expira,
        ':id' => $usuario['id']
    ]);

    $link = 'http://localhost:8080/redefinir_senha.html?token=' . urlencode($token);

    $assunto = 'Recuperação de senha - AuChei';
    $corpoHtml = '
        <h2>Olá, ' . htmlspecialchars($usuario['nome'], ENT_QUOTES, 'UTF-8') . '!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p>Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="' . $link . '">Redefinir senha</a></p>
        <p>Se você não solicitou isso, ignore este e-mail.</p>
        <p>Este link expira em 1 hora.</p>
    ';
    $corpoTexto = "Olá, {$usuario['nome']}!\n\nAcesse o link para redefinir sua senha:\n{$link}\n\nSe você não solicitou isso, ignore este e-mail.";

    $resultado = enviarEmail($usuario['email'], $usuario['nome'], $assunto, $corpoHtml, $corpoTexto);

    if (!$resultado['sucesso']) {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Não foi possível enviar o e-mail de recuperação.',
            'erro' => $resultado['erro'] ?? null
        ]);
        exit;
    }

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Se o e-mail estiver cadastrado, enviaremos um link de recuperação.'
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno ao solicitar recuperação.',
        'erro' => $e->getMessage()
    ]);
    exit;
}