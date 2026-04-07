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

    $nome = trim($dados['name'] ?? '');
    $email = trim($dados['email'] ?? '');
    $telefone = trim($dados['phone'] ?? '');
    $cidadeCompleta = trim($dados['city'] ?? '');
    $bio = trim($dados['bio'] ?? '');
    $senha = $dados['password'] ?? '';
    $confirmarSenha = $dados['confirmPassword'] ?? '';

    $regexNome = "/^[A-Za-zÀ-ÿ0-9\s'.-]{3,100}$/u";
    $regexTelefone = "/^\d{10,11}$/";
    $regexCidadeUf = "/^[A-Za-zÀ-ÿ\s'-]{2,100},\s?[A-Za-z]{2}$/u";
    $regexSenhaForte = "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/";

    if ($nome === '' || $email === '' || $senha === '' || $confirmarSenha === '') {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Preencha os campos obrigatórios.'
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

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'E-mail inválido.'
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

    if ($cidadeCompleta !== '' && !preg_match($regexCidadeUf, $cidadeCompleta)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Informe a cidade no formato Cidade, UF.'
        ]);
        exit;
    }

    if ($bio !== '' && mb_strlen($bio) > 255) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'A bio deve ter no máximo 255 caracteres.'
        ]);
        exit;
    }

    if (!preg_match($regexSenhaForte, $senha)) {
        http_response_code(400);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'A senha deve ter no mínimo 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'
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

    $sql = "SELECT id FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Este e-mail já está cadastrado.'
        ]);
        exit;
    }

    $cidade = null;
    $estado = null;

    if ($cidadeCompleta !== '') {
        $partes = array_map('trim', explode(',', $cidadeCompleta));
        $cidade = $partes[0] ?? null;
        $estado = isset($partes[1]) ? strtoupper(substr($partes[1], 0, 2)) : null;
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $avatar = '🐾';
    $tipo = 'usuario';
    $bioFinal = $bio !== '' ? $bio : 'Novo membro da comunidade AuChei.';

    $tokenVerificacao = bin2hex(random_bytes(32));
    $tokenVerificacaoExpira = date('Y-m-d H:i:s', strtotime('+1 day'));

    $sql = "INSERT INTO usuarios (
                nome, email, telefone, cidade, estado, bio, avatar, senha_hash, tipo,
                email_verificado, token_verificacao, token_verificacao_expira
            ) VALUES (
                :nome, :email, :telefone, :cidade, :estado, :bio, :avatar, :senha_hash, :tipo,
                :email_verificado, :token_verificacao, :token_verificacao_expira
            )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome' => $nome,
        ':email' => $email,
        ':telefone' => $telefone !== '' ? $telefone : null,
        ':cidade' => $cidade,
        ':estado' => $estado,
        ':bio' => $bioFinal,
        ':avatar' => $avatar,
        ':senha_hash' => $senhaHash,
        ':tipo' => $tipo,
        ':email_verificado' => 0,
        ':token_verificacao' => $tokenVerificacao,
        ':token_verificacao_expira' => $tokenVerificacaoExpira
    ]);

    $idUsuario = $pdo->lastInsertId();

    $linkVerificacao = 'http://localhost:8080/assets/php/auth/verificar_email.php?token=' . urlencode($tokenVerificacao);

    $assunto = 'Verifique seu e-mail - AuChei';
    $corpoHtml = '
        <h2>Olá, ' . htmlspecialchars($nome, ENT_QUOTES, 'UTF-8') . '!</h2>
        <p>Obrigado por se cadastrar no AuChei.</p>
        <p>Clique no link abaixo para verificar seu e-mail:</p>
        <p><a href="' . $linkVerificacao . '">Verificar e-mail</a></p>
        <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
        <p>' . $linkVerificacao . '</p>
        <p>Este link expira em 24 horas.</p>
    ';
    $corpoTexto = "Olá, {$nome}!\n\nVerifique seu e-mail acessando:\n{$linkVerificacao}\n\nEste link expira em 24 horas.";

    $resultadoEmail = enviarEmail($email, $nome, $assunto, $corpoHtml, $corpoTexto);

    if (!$resultadoEmail['sucesso']) {
        http_response_code(500);
        echo json_encode([
            'sucesso' => false,
            'mensagem' => 'Cadastro realizado, mas não foi possível enviar o e-mail de verificação.',
            'erro' => $resultadoEmail['erro'] ?? 'Falha no envio do e-mail.'
        ]);
        exit;
    }

    http_response_code(201);
    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Cadastro realizado com sucesso! Verifique seu e-mail para ativar a conta.',
        'usuario' => [
            'id' => $idUsuario,
            'nome' => $nome,
            'email' => $email
        ]
    ]);
    exit;

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro interno no servidor.',
        'erro' => $e->getMessage()
    ]);
    exit;
}