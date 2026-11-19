@echo off
echo ==============================================================================
echo CAPSIC CARE OS - One-Click GitHub Push
echo Target: https://github.com/capsiccare/capsiccare.git
echo ==============================================================================
cd /d "%~dp0\.."

echo [1/3] Setting Git Path...
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\ucrt64\bin;C:\Program Files\nodejs;%PATH%"

echo [2/3] Pushing 'main' branch to GitHub...
git push -u origin main
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to push main branch. Please complete browser authorization.
    pause
    exit /b %ERRORLEVEL%
)

echo [3/3] Pushing 'develop' branch to GitHub...
git push -u origin develop
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to push develop branch.
    pause
    exit /b %ERRORLEVEL%
)

echo ==============================================================================
echo [SUCCESS] Both 'main' and 'develop' branches pushed successfully!
echo ==============================================================================
pause
