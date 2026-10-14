@echo off
setlocal EnableExtensions DisableDelayedExpansion
where node >nul 2>&1
if errorlevel 1 (
  echo Install Node.js 22.12 or newer before running local setup.
  exit /b 1
)
node "%~dp0setup-local.mjs" %*
exit /b %errorlevel%
