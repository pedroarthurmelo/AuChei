<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

function carregarSegredosVault(string $arquivo = '/vault/secrets/db.env'): array
{
    if (!file_exists($arquivo)) {
        throw new Exception("Arquivo de segredos não encontrado: {$arquivo}");
    }

    $segredos = [];
    $linhas = file($arquivo, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($linhas as $linha) {
        $linha = trim($linha);

        if ($linha === '' || !str_contains($linha, '=')) {
            continue;
        }

        [$chave, $valor] = explode('=', $linha, 2);
        $segredos[trim($chave)] = trim($valor, " \t\n\r\0\x0B\"'");
    }

    return $segredos;
}

try {
    $segredos = carregarSegredosVault();

    $host = $segredos['DB_HOST'] ?? 'mariadb';
    $dbname = $segredos['DB_NAME'] ?? 'auchei';
    $user = $segredos['DB_USER'] ?? '';
    $pass = $segredos['DB_PASS'] ?? '';

    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'sucesso' => false,
        'mensagem' => 'Erro na conexão com o banco de dados.',
        'erro_real' => $e->getMessage(),
        'arquivo' => __FILE__
    ]);
    exit;
}