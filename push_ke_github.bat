@echo off
echo =======================================
echo MENDORONG PERUBAHAN KE GITHUB...
echo =======================================

echo Menambahkan file yang berubah...
git add .

echo.
echo Membuat commit...
git commit -m "update: system & WA copy enhancements"

echo.
echo Mengirim ke GitHub (push)...
git push

echo.
echo =======================================
echo SELESAI!
echo =======================================
pause
