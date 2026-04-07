<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

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

    $token = trim($dados['token'] ?? '');
    $senha = $dados['password'] ?? '';
    $confirmarSenha = $dados['confirmPassword'] ?? '';

    if ($token === '' || $senha === '' || $confirmarSenha === '') {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Preencha os campos obrigatórios.'
        ]);
        exit;
    }

    if ($senha !== $confirmarSenha) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'As senhas não coincidem.'
        ]);
        exit;
    }

    $regexSenhaForte = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/";

    if (!preg_match($regexSenhaForte, $senha)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'
        ]);
        exit;
    }

    $sql = "SELECT id, token_recuperacao_expira
            FROM usuarios
            WHERE token_recuperacao = :token
            LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':token' => $token]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Token inválido.'
        ]);
        exit;
    }

    if (
        empty($usuario['token_recuperacao_expira']) ||
        strtotime($usuario['token_recuperacao_expira']) < time()
    ) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'O token de recuperação expirou.'
        ]);
        exit;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $sql = "UPDATE usuarios
            SET senha_hash = :senha_hash,
                token_recuperacao = NULL,
                token_recuperacao_expira = NULL
            WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':senha_hash' => $senhaHash,
        ':id' => $usuario['id']
    ]);

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Senha redefinida com sucesso. Faça login com a nova senha.'
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno ao redefinir senha.',
        'erro' => $e->getMessage()
    ]);
    exit;
}