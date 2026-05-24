<?php
/**
 * Captura de lead da landing page Conexão VIP.
 * Recebe nome + telefone (e cidade opcional) via POST, valida,
 * sanitiza e persiste. Responde em JSON.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método não permitido.']);
    exit;
}

$nome     = trim((string) ($_POST['nome'] ?? ''));
$telefone = preg_replace('/\D/', '', (string) ($_POST['telefone'] ?? ''));
$cidade   = trim((string) ($_POST['cidade'] ?? ''));

if ($nome === '' || strlen($telefone) < 10 || strlen($telefone) > 11) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Informe seu nome e um telefone válido com DDD.']);
    exit;
}

$lead = [
    'nome'     => htmlspecialchars($nome, ENT_QUOTES, 'UTF-8'),
    'telefone' => $telefone,
    'cidade'   => htmlspecialchars($cidade, ENT_QUOTES, 'UTF-8'),
    'data'     => date('c'),
    'origem'   => 'site',
];

// Persistência simples (em produção: banco de dados, e-mail ou CRM).
$arquivo = __DIR__ . '/leads.jsonl';
file_put_contents(
    $arquivo,
    json_encode($lead, JSON_UNESCAPED_UNICODE) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

$primeiroNome = explode(' ', $nome)[0];
echo json_encode([
    'ok'      => true,
    'message' => "Recebido, {$primeiroNome}! Em breve a gente entra em contato. 🚀",
], JSON_UNESCAPED_UNICODE);
