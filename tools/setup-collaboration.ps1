$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
  $remote = git remote get-url origin
  if ($LASTEXITCODE -ne 0 -or $remote -ne 'https://github.com/Alicetel-u/FeralLife.git') {
    throw 'origin must be https://github.com/Alicetel-u/FeralLife.git'
  }
  $hookPath = git config --local --get core.hooksPath
  if ($hookPath -and $hookPath -ne '.githooks') {
    throw 'Existing core.hooksPath found. Review it before changing hooks.'
  }
  foreach ($setting in @(@('pull.ff', 'only'), @('fetch.prune', 'true'), @('push.default', 'simple'), @('core.hooksPath', '.githooks'))) {
    git config --local $setting[0] $setting[1]
    if ($LASTEXITCODE -ne 0) { throw "git config failed: $($setting[0])" }
  }
  Write-Host 'Repository settings installed. Identity and credentials were not changed.'
  git config --local --get-regexp '^(pull\.ff|fetch\.prune|push\.default|core\.hooksPath)$'
} finally {
  Pop-Location
}
