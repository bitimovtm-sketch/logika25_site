<?php
/**
 * Приём заявок с сайта и создание лида в Битрикс24 через входящий вебхук.
 * 1) В Битрикс24: Разработчикам → Другое → Входящий вебхук (права: CRM).
 * 2) Скопируйте config.sample.php в config.php и вставьте URL вебхука.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function out($ok, $err = null, $code = 200) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'error' => $err], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'method', 405);

// Настройки: переменные окружения (Railway) либо файл config.php (обычный хостинг)
$configFile = __DIR__ . '/config.php';
if (getenv('BITRIX_WEBHOOK_URL')) {
    $cfg = [
        'webhook_url'    => getenv('BITRIX_WEBHOOK_URL'),
        'assigned_by_id' => (int)getenv('BITRIX_ASSIGNED_BY_ID'),
        'fallback_email' => getenv('FALLBACK_EMAIL') ?: '',
    ];
} elseif (file_exists($configFile)) {
    $cfg = require $configFile;
} else {
    out(false, 'not_configured', 500);
}

// honeypot
if (!empty($_POST['company'])) out(true);

// простейшее ограничение частоты (1 заявка / 20 сек с IP)
$ip = $_SERVER['REMOTE_ADDR'] ?? '0';
$flag = sys_get_temp_dir() . '/logika_lead_' . md5($ip);
if (file_exists($flag) && time() - filemtime($flag) < 20) out(false, 'too_fast', 429);
@touch($flag);

$clean = function ($v, $max = 300) {
    $v = trim(strip_tags((string)$v));
    return mb_substr($v, 0, $max);
};
$name   = $clean($_POST['name'] ?? '', 120);
$phone  = $clean($_POST['phone'] ?? '', 40);
$msg    = $clean($_POST['comment'] ?? '', 1500);
$source = $clean($_POST['source'] ?? 'Сайт', 120);
$page   = $clean($_POST['page'] ?? '', 300);

if (mb_strlen($name) < 2 || strlen(preg_replace('/\D/', '', $phone)) < 10) out(false, 'validation', 422);

$fields = [
    'TITLE'       => 'Заявка с сайта logika25.ru: ' . $source,
    'NAME'        => $name,
    'PHONE'       => [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']],
    'COMMENTS'    => trim($msg . "\n\nСтраница: " . $page),
    'SOURCE_ID'   => 'WEB',
    'SOURCE_DESCRIPTION' => $source,
    'OPENED'      => 'Y',
];
if (!empty($cfg['assigned_by_id'])) $fields['ASSIGNED_BY_ID'] = (int)$cfg['assigned_by_id'];

$url = rtrim($cfg['webhook_url'], '/') . '/crm.lead.add.json';
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['fields' => $fields, 'params' => ['REGISTER_SONET_EVENT' => 'Y']]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
]);
$res = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$j = json_decode((string)$res, true);
if ($http === 200 && !empty($j['result'])) out(true);

// запасной канал: письмо на почту
if (!empty($cfg['fallback_email'])) {
    @mail($cfg['fallback_email'], '=?UTF-8?B?' . base64_encode('Заявка с сайта (Битрикс24 недоступен)') . '?=',
        "Имя: $name\nТелефон: $phone\nИсточник: $source\nКомментарий: $msg\nСтраница: $page",
        "Content-Type: text/plain; charset=UTF-8\r\nFrom: no-reply@logika25.ru");
    out(true);
}
out(false, 'bitrix_error', 502);
