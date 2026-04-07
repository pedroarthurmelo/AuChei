<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../../../vendor/autoload.php';

function enviarEmail(
    string $destinatarioEmail,
    string $destinatarioNome,
    string $assunto,
    string $corpoHtml,
    string $corpoTexto = ''
): array {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'pedroarthurmelorodrigues@gmail.com';
        $mail->Password = 'fuwo dqyk tlsg chin';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        $mail->CharSet = 'UTF-8';

        $mail->setFrom('pedroarthurmelorodrigues@gmail.com', 'AuChei');
        $mail->addAddress($destinatarioEmail, $destinatarioNome);

        $mail->isHTML(true);
        $mail->Subject = $assunto;
        $mail->Body = $corpoHtml;
        $mail->AltBody = $corpoTexto !== '' ? $corpoTexto : strip_tags($corpoHtml);

        $mail->send();

        return [
            'sucesso' => true,
            'mensagem' => 'E-mail enviado com sucesso.'
        ];
    } catch (Throwable $e) {
        return [
            'sucesso' => false,
            'mensagem' => 'Erro ao enviar e-mail.',
            'erro' => $e->getMessage()
        ];
    }
}