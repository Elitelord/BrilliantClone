# Create demo reviewer account via Firebase Auth REST API.
# Reads VITE_FIREBASE_API_KEY from .env in repo root.

$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

$envFile = Join-Path (Get-Location) '.env'
if (-not (Test-Path $envFile)) { throw '.env not found' }
$apiKeyLine = Get-Content $envFile | Where-Object { $_ -match '^VITE_FIREBASE_API_KEY=' }
$apiKey = ($apiKeyLine -replace '^VITE_FIREBASE_API_KEY="?', '') -replace '"$', ''

$email = 'demo@brilliantclone.app'
$password = 'PopulationPathDemo1!'
$displayName = 'Demo Reviewer'

$body = @{
  email = $email
  password = $password
  displayName = $displayName
  returnSecureToken = $true
} | ConvertTo-Json

try {
  $resp = Invoke-RestMethod -Method Post `
    -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey" `
    -ContentType 'application/json' `
    -Body $body
  Write-Host "Created demo account: $email (uid: $($resp.localId))"
} catch {
  $err = $_.ErrorDetails.Message | ConvertFrom-Json
  if ($err.error.message -eq 'EMAIL_EXISTS') {
    Write-Host "Demo account already exists: $email"
  } else {
    throw $_
  }
}

Write-Host ''
Write-Host 'Demo credentials for reviewers:'
Write-Host "  Email:    $email"
Write-Host "  Password: $password"
