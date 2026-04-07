<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/../config/conexao.php';

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
    $senha = $dados['password'] ?? '';

    if ($email === '' || $senha === '') {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Informe e-mail e senha.'
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

    if (strlen($senha) < 6) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Senha inválida.'
        ]);
        exit;
    }

    $sql = "SELECT id, nome, email, telefone, cidade, estado, bio, avatar, senha_hash, tipo, email_verificado
            FROM usuarios
            WHERE email = :email
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);

    $usuario = $stmt->fetch();

    if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
        http_response_code(401);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'E-mail ou senha inválidos.'
        ]);
        exit;
    }

    if ((int)$usuario['email_verificado'] !== 1) {
        http_response_code(403);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Verifique seu e-mail antes de entrar.'
        ]);
        exit;
    }

    session_regenerate_id(true);

    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario_nome'] = $usuario['nome'];
    $_SESSION['usuario_email'] = $usuario['email'];
    $_SESSION['usuario_telefone'] = $usuario['telefone'];
    $_SESSION['usuario_cidade'] = $usuario['cidade'];
    $_SESSION['usuario_estado'] = $usuario['estado'];
    $_SESSION['usuario_bio'] = $usuario['bio'];
    $_SESSION['usuario_avatar'] = $usuario['avatar'];
    $_SESSION['usuario_tipo'] = $usuario['tipo'];

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Login realizado com sucesso.',
        'usuario' => [
            'id' => $usuario['id'],
            'nome' => $usuario['nome'],
            'email' => $usuario['email'],
            'telefone' => $usuario['telefone'],
            'cidade' => $usuario['cidade'],
            'estado' => $usuario['estado'],
            'bio' => $usuario['bio'],
            'avatar' => $usuario['avatar'],
            'tipo' => $usuario['tipo']
        ]
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno no login.',
        'erro' => $e->getMessage()
    ]);
    exit;
}