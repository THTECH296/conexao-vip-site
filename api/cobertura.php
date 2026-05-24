<?php
/**
 * Proxy de cobertura — consome a API REST ViaCEP no servidor e
 * verifica se o CEP pertence a uma cidade atendida pela Conexão VIP.
 * Uso: GET api/cobertura.php?cep=39800000
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const CIDADES_ATENDIDAS = [
    'teofilo otoni', 'almenara', 'aracuai', 'itaobim', 'jequitinhonha',
    'medina', 'nanuque', 'padre paraiso', 'salinas',
];

/** Remove acentos e normaliza para comparação. */
function normalizar(string $texto): string
{
    $texto = mb_strtolower(trim($texto), 'UTF-8');
    $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texto);

    return $ascii !== false ? $ascii : $texto;
}

$cep = preg_replace('/\D/', '', (string) ($_GET['cep'] ?? ''));

if (strlen($cep) !== 8) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Informe um CEP válido com 8 dígitos.']);
    exit;
}

// Consome a API REST do ViaCEP server-side
$ch = curl_init("https://viacep.com.br/ws/{$cep}/json/");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 8,
    CURLOPT_USERAGENT      => 'ConexaoVIP-Site/1.0',
]);
$resposta = curl_exec($ch);
$status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$dados = json_decode((string) $resposta, true);

if ($status !== 200 || !is_array($dados) || !empty($dados['erro'])) {
    echo json_encode(['ok' => false, 'message' => 'CEP não encontrado.']);
    exit;
}

$cidade = (string) ($dados['localidade'] ?? '');
$uf     = (string) ($dados['uf'] ?? '');
$atende = in_array(normalizar($cidade), CIDADES_ATENDIDAS, true);

echo json_encode([
    'ok'      => true,
    'atende'  => $atende,
    'cidade'  => $cidade,
    'uf'      => $uf,
    'message' => $atende
        ? "Boa notícia! A Conexão VIP atende {$cidade} – {$uf}."
        : "Ainda não chegamos em {$cidade}, mas estamos expandindo.",
], JSON_UNESCAPED_UNICODE);
