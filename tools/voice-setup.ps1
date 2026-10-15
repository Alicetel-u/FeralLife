$ErrorActionPreference = 'Stop'
$voiceRoot = Split-Path -Parent $PSScriptRoot
$voiceSecretDir = Join-Path $voiceRoot '.local'
New-Item -ItemType Directory -Force -Path $voiceSecretDir | Out-Null
$voiceSecret = Read-Host 'ElevenLabs API key (hidden; never paste into chat)' -AsSecureString
$voicePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($voiceSecret)
try {
  $voicePlain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($voicePointer)
  if ([string]::IsNullOrWhiteSpace($voicePlain)) { throw 'Empty key' }
  @{ apiKey = $voicePlain } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $voiceSecretDir 'elevenlabs.json') -Encoding utf8
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($voicePointer)
  $voicePlain = $null
}
Write-Output 'Saved locally. Run npm run voice:verify. Delete .local/elevenlabs.json to remove; revoke in ElevenLabs to invalidate.'
