<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/enviar_email.php';

$resultado = enviarEmail(
    'pedroarthurmelorodrigues2@gmail.com',
    'Pedro',
    'Teste de envio AuChei',
    '<h1>Teste de e-mail</h1><p>Seu sistema AuChei está enviando e-mails.</p>',
    'Teste de e-mail - Seu sistema AuChei está enviando e-mails.'
);

echo json_encode($resultado, JSON_UNESCAPED_UNICODE);