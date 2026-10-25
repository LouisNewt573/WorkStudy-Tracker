@echo off
chcp 65001 > nul
title EduPlan - May Chu Ket Noi Dien Thoai
cd /d "%~dp0"
echo ========================================================
echo   EduPlan Studio - Máy Chủ Mạng Nội Bộ Cho Điện Thoại
echo ========================================================
echo.
echo Đang tìm địa chỉ IP máy tính của bạn...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*Loopback*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1).IPAddress; ^
   Write-Host '--------------------------------------------------------' -ForegroundColor Cyan; ^
   Write-Host ' [1] Đảm bảo điện thoại và máy tính kết nối CÙNG 1 MẠNG WI-FI' -ForegroundColor Yellow; ^
   Write-Host \" [2] Trên điện thoại, mở trình duyệt (Safari/Chrome) gõ:\" -ForegroundColor Green; ^
   Write-Host \"     http://$($ip):8080\" -ForegroundColor White -BackgroundColor DarkGreen; ^
   Write-Host '--------------------------------------------------------' -ForegroundColor Cyan; ^
   Write-Host 'Đang khởi động máy chủ (Nhấn Ctrl+C để dừng)...'; ^
   $listener = New-Object System.Net.HttpListener; ^
   $listener.Prefixes.Add('http://+:8080/'); ^
   try { $listener.Start() } catch { Write-Host 'Cần chạy quyền Administrator nếu cổng bị chặn hoặc chạy http://localhost:8080' -ForegroundColor Red }; ^
   while ($listener.IsListening) { ^
     $context = $listener.GetContext(); ^
     $request = $context.Request; ^
     $response = $context.Response; ^
     $path = $request.Url.LocalPath; ^
     if ($path -eq '/') { $path = '/index.html' }; ^
     $filePath = Join-Path (Get-Location) $path.TrimStart('/'); ^
     if (Test-Path $filePath -PathType Leaf) { ^
       $bytes = [System.IO.File]::ReadAllBytes($filePath); ^
       $ext = [System.IO.Path]::GetExtension($filePath).ToLower(); ^
       $type = switch ($ext) { ^
         '.html' { 'text/html; charset=utf-8' } ^
         '.js'   { 'application/javascript; charset=utf-8' } ^
         '.css'  { 'text/css; charset=utf-8' } ^
         '.json' { 'application/json; charset=utf-8' } ^
         default { 'application/octet-stream' } ^
       }; ^
       $response.ContentType = $type; ^
       $response.ContentLength64 = $bytes.Length; ^
       $response.OutputStream.Write($bytes, 0, $bytes.Length); ^
     } else { ^
       $response.StatusCode = 404; ^
     }; ^
     $response.Close(); ^
   }"
pause
