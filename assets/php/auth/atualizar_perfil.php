<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');
session_start();

require_once __DIR__ . '/../config/conexao.php';

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

    $nome = trim($dados['name'] ?? '');
    $telefone = trim($dados['phone'] ?? '');
    $cidadeCompleta = trim($dados['city'] ?? '');
    $bio = trim($dados['bio'] ?? '');

    $regexNome = "/^[A-Za-zÀ-ÿ0-9\s'.-]{3,100}$/u";
    $regexTelefone = "/^\d{10,11}$/";
    $regexCidadeUf = "/^[A-Za-zÀ-ÿ\s'-]{2,100},\s?[A-Za-z]{2}$/u";

    if ($nome === '') {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Informe o nome.'
        ]);
        exit;
    }

    if (!preg_match($regexNome, $nome)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Nome inválido.'
        ]);
        exit;
    }

    if ($telefone !== '') {
        $telefone = preg_replace('/\D+/', '', $telefone);

        if (!preg_match($regexTelefone, $telefone)) {
            http_response_code(400);
            echo json_encode([
                'sucesso' => false,
                'mensagem' => 'Telefone inválido. Use 10 ou 11 dígitos.'
            ]);
            exit;
        }
    }

    $cidade = null;
    $estado = null;

    if ($cidadeCompleta !== '') {
        if (!preg_match($regexCidadeUf, $cidadeCompleta)) {
            http_response_code(400);
            echo json_encode([
                'sucesso' => false,
                'mensagem' => 'Informe a cidade no formato Cidade, UF.'
            ]);
            exit;
        }

        $partes = array_map('trim', explode(',', $cidadeCompleta));
        $cidade = $partes[0] ?? null;
        $estado = isset($partes[1]) ? strtoupper(substr($partes[1], 0, 2)) : null;
    }

    if ($bio !== '' && mb_strlen($bio) > 255) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'A bio deve ter no máximo 255 caracteres.'
        ]);
        exit;
    }

    $sql = "UPDATE usuarios
            SET nome = :nome,
                telefone = :telefone,
                cidade = :cidade,
                estado = :estado,
                bio = :bio
            WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome' => $nome,
        ':telefone' => $telefone !== '' ? $telefone : null,
        ':cidade' => $cidade,
        ':estado' => $estado,
        ':bio' => $bio !== '' ? $bio : null,
        ':id' => $_SESSION['usuario_id']
    ]);

    $_SESSION['usuario_nome'] = $nome;
    $_SESSION['usuario_telefone'] = $telefone;
    $_SESSION['usuario_cidade'] = $cidade;
    $_SESSION['usuario_estado'] = $estado;
    $_SESSION['usuario_bio'] = $bio;

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Perfil atualizado com sucesso.',
        'usuario' => [
            'id' => $_SESSION['usuario_id'],
            'nome' => $nome,
            'email' => $_SESSION['usuario_email'],
            'telefone' => $telefone,
            'cidade' => $cidade,
            'estado' => $estado,
            'bio' => $bio,
            'avatar' => $_SESSION['usuario_avatar'] ?? '🐾',
            'tipo' => $_SESSION['usuario_tipo'] ?? 'usuario'
        ]
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno ao atualizar perfil.',
        'erro' => $e->getMessage()
    ]);
    exit;
}