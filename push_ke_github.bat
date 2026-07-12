@echo off
echo =======================================
echo MENDORONG PERUBAHAN KE GITHUB...
echo =======================================

echo Menambahkan file yang berubah...
git add .

echo.
echo Membuat commit...
git commit -m "feat: add pagination to reviewers admin dashboard"

echo.
echo Mengirim ke GitHub (push)...
git push

echo.
echo =======================================
echo SELESAI!
echo =======================================
pause
