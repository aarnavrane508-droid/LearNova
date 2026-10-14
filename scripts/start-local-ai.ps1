$ErrorActionPreference = 'Stop'
$ollamaExecutable = Get-Command ollama -ErrorAction SilentlyContinue
if ($ollamaExecutable) {
  $ollamaPath = $ollamaExecutable.Source
} else {
  $ollamaPath = Join-Path $env:LOCALAPPDATA 'Programs\Ollama\ollama.exe'
}
if (-not (Test-Path -LiteralPath $ollamaPath)) {
  $ollamaPath = Join-Path $PSScriptRoot '..\.verification\ollama\standalone\ollama.exe'
  $env:OLLAMA_MODELS = Join-Path $PSScriptRoot '..\.verification\ollama\models'
}
if (-not (Test-Path -LiteralPath $ollamaPath)) {
  throw 'Install Ollama from https://ollama.com/download/windows, then rerun this script.'
}
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:OLLAMA_NO_CLOUD = '1'
$env:OLLAMA_NUM_PARALLEL = '1'
$env:OLLAMA_MAX_LOADED_MODELS = '1'
$env:OLLAMA_MAX_QUEUE = '2'
$env:OLLAMA_CONTEXT_LENGTH = '4096'
# Foreground server: Ctrl+C stops it. Do not expose the unauthenticated Ollama port.
& $ollamaPath serve
exit $LASTEXITCODE
