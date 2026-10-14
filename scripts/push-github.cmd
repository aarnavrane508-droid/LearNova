@echo off
setlocal EnableExtensions DisableDelayedExpansion

if "%CODEX_SANDBOX_NETWORK_DISABLED%"=="1" (
  echo This session blocks network access. Run this helper in your own Windows Terminal.
  exit /b 1
)

pushd "%~dp0.." || exit /b 1
where git >nul 2>&1
if errorlevel 1 goto missingTools
where gh >nul 2>&1
if errorlevel 1 goto missingTools
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 goto failed

set "taskRemote="
for /f "delims=" %%R in ('git remote get-url origin 2^>nul') do set "taskRemote=%%R"
if not "%taskRemote%"=="https://github.com/aarnavrane508-droid/LearNova.git" (
  echo Stopped: origin must point to aarnavrane508-droid/LearNova.
  goto failed
)

set "taskPending="
for /f "delims=" %%S in ('git status --porcelain') do set "taskPending=yes"
if defined taskPending (
  echo Stopped: commit or review your uncommitted changes before pushing.
  goto failed
)

call :checkIdentity
if not errorlevel 1 goto accountReady

echo Sign in as aarnavrane508-droid on the GitHub authorization page.
echo Select that account in your browser before approving GitHub CLI access.
gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key
if errorlevel 1 goto failed
call :checkIdentity
if errorlevel 1 (
  echo Stopped: the authenticated account is not aarnavrane508-droid.
  goto failed
)

:accountReady
set "taskCanPush="
for /f "delims=" %%P in ('gh api repos/aarnavrane508-droid/LearNova --hostname github.com --jq .permissions.push 2^>nul') do set "taskCanPush=%%P"
if not "%taskCanPush%"=="true" (
  echo Stopped: the selected account does not have verified write access to LearNova.
  goto failed
)

git -c credential.helper= -c "credential.helper=!gh auth git-credential" push -u origin main
if errorlevel 1 goto failed
echo Push completed: https://github.com/aarnavrane508-droid/LearNova
popd
exit /b 0

:checkIdentity
set "taskGithubLogin="
for /f "delims=" %%G in ('gh api user --hostname github.com --jq .login 2^>nul') do set "taskGithubLogin=%%G"
if "%taskGithubLogin%"=="aarnavrane508-droid" exit /b 0
exit /b 1

:missingTools
echo Install Git and GitHub CLI before running this helper.
goto failed

:failed
echo Push was not confirmed. Review the error above; no force push was attempted.
popd
exit /b 1
