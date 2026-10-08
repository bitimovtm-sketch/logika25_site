<?php
// Роутер для `php -S`: редиректы со старых адресов, защита служебных файлов, 404, кэш.
$path = rtrim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/') ?: '/';
$redirects = [
 "/cases/tpost/7tvvyabg11-letnie-skidki-do-35" => "/cases/letnie-skidki-do-35.html",
 "/cases/tpost/mgkbb54uv1-diplomi-ot-bitrkis24-za-2023-god" => "/cases/diplomy-ot-bitrix24-za-2023-god.html",
 "/cases/tpost/oetcfreun1-video-otziv-kompanii-iskraekspert" => "/cases/video-otzyv-iskra-expert.html",
 "/cases/tpost/uitz4ntlg1-vnedrenie-crm-v-torgovo-proizvodstvennuy" => "/cases/vnedrenie-crm-v-torgovo-proizvodstvennuyu-kompaniyu.html",
 "/cases/tpost/ed8zpu9fb1-vnedrenie-crm-v-uchebnii-tsentr" => "/cases/vnedrenie-crm-v-uchebnyj-centr.html",
 "/cases/tpost/pysaocdk01-vnedrenie-crm-v-torgovuyu-kompaniyu" => "/cases/vnedrenie-crm-v-torgovuyu-kompaniyu-mir-kondicionerov.html",
 "/cases/tpost/y055y3gzz1-vnedrenie-crm-v-ekspertnuyu-organizatsiy" => "/cases/vnedrenie-crm-v-ekspertnuyu-organizaciyu.html",
 "/cases/tpost/ehyp14xna1-vnedrenie-crm-v-ekspertnuyu-kompaniyu" => "/cases/vnedrenie-crm-v-ekspertnuyu-kompaniyu.html",
 "/cases/tpost/zyvhcx42d1-vnedrenie-crm-v-torgovuyu-kompaniyu" => "/cases/vnedrenie-crm-v-torgovuyu-kompaniyu-aki.html",
 "/cases/tpost/c7nndvrh61-vnedrenie-crm-v-maloetazhnoe-stroitelstv" => "/cases/vnedrenie-crm-v-maloetazhnoe-stroitelstvo.html",
 "/cases/tpost/6uxb7zphk1-vnedrenie-crm-v-kompaniyu-po-privozu-mas" => "/cases/vnedrenie-crm-v-kompaniyu-po-privozu-mashin-iz-yaponii.html",
 "/cases/tpost/kjxx9ezeh1-vnedrenie-crm-v-salon-strizhki-zhivotnih" => "/cases/vnedrenie-crm-v-salon-strizhki-zhivotnyh.html",
 "/spasibo/tpost/317g3u0ep1-lk-dlya-klientov" => "/blog/lk-dlya-klientov.html",
 "/tpost/iocrvy2h81-raspredelenie-rashodov-po-proektam" => "/blog/raspredelenie-rashodov-po-proektam.html",
 "/spasibo/tpost/b7zus76in1-pozdravlenie-klientov-s-dnem-rozhdeniya" => "/blog/pozdravlenie-klientov-s-dnem-rozhdeniya.html",
 "/cases" => "/cases/",
 "/helpdesk" => "/helpdesk/",
 "/market" => "/market/",
 "/policy" => "/policy/",
 "/blog" => "/blog/",
 "/calculator" => "/market/calculator.html",
 "/translit" => "/market/translit.html",
 "/tasks" => "/market/tasks.html",
 "/bd" => "/market/bd.html",
 "/antileads" => "/market/antileads.html",
 "/diadoc" => "/market/diadoc.html",
 "/max" => "/market/",
 "/avtoinport" => "/market/"
];
if (isset($redirects[$path])) {
    header('Location: ' . $redirects[$path], true, 301);
    exit;
}
$root = __DIR__ . '/site';
// закрытые файлы
if (preg_match('#(^|/)\.ht|/api/config(\.sample)?\.php$#', $path)) {
    http_response_code(404);
    readfile($root . '/404.html');
    exit;
}
$file = $root . $path;
if (is_file($file) || is_dir($file)) {
    if (preg_match('#\.(png|jpe?g|svg|ttf|css|js|webp)$#i', $path)) {
        header('Cache-Control: public, max-age=2592000');
    }
    return false; // отдаёт сам встроенный сервер (index.html для папок, PHP для api/)
}
http_response_code(404);
readfile($root . '/404.html');
