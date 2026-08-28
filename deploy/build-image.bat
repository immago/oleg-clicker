@echo off
setlocal enabledelayedexpansion

REM Resolve repository root (parent of this script's directory).
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
cd /d "%ROOT_DIR%"

REM Check that a required command exists on PATH.
call :require docker
if errorlevel 1 exit /b 1
call :require node
if errorlevel 1 exit /b 1
call :require npm
if errorlevel 1 exit /b 1

for /f "delims=" %%i in ('node -p "require('./package.json').version"') do set "VERSION=%%i"
set "IMAGE_TAG=oleg-clicker:%VERSION%"
set "LATEST_TAG=oleg-clicker:latest"
set "ARCHIVE=output\oleg-clicker-%VERSION%.tar"

echo Version: %VERSION%
echo Image tag: %IMAGE_TAG%
echo Archive:  %ARCHIVE%

echo Building app (npm run build)...
call npm run build
if errorlevel 1 exit /b 1

if not exist "output" mkdir output

echo Building docker image (%IMAGE_TAG%)...
docker build -t "%IMAGE_TAG%" -t "%LATEST_TAG%" -f deploy\Dockerfile .
if errorlevel 1 exit /b 1

echo Saving image to %ARCHIVE%...
docker save "%IMAGE_TAG%" -o "%ARCHIVE%"
if errorlevel 1 exit /b 1

for %%I in ("%ARCHIVE%") do set "SIZE_BYTES=%%~zI"
echo Archive: %ARCHIVE% (%SIZE_BYTES% bytes)
echo Image size: %IMAGE_TAG% (compressed tar: %SIZE_BYTES% bytes)
echo To run: docker load -i "%ARCHIVE%" && docker run -d -p 8080:80 "%IMAGE_TAG%"

exit /b 0

:require
REM :require <command>
where "%~1" >nul 2>&1
if errorlevel 1 (
    echo Error: required command '%~1' is not installed or not on PATH. >&2
    exit /b 1
)
exit /b 0
