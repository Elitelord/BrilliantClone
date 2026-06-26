# Reset Firestore progress/mastery for known user IDs and reset streak fields.
# Usage: powershell -File scripts/reset-firestore-users.ps1

$ErrorActionPreference = 'Stop'
$project = 'brilliantclone-b4a2a'
$uids = @(
  'SONkzmgIT6YXxNaEZFj1SmiRwlw2',
  'UFvbuz2vCoNDHYHMMWzH34zkuWp1'
)

foreach ($uid in $uids) {
  Write-Host "Deleting progress for $uid..."
  npx -y firebase-tools@latest firestore:delete "users/$uid/progress" -r -f --project $project
  Write-Host "Deleting mastery for $uid..."
  npx -y firebase-tools@latest firestore:delete "users/$uid/mastery" -r -f --project $project
}

Write-Host 'Done. Streak fields on user docs still need reset via update (run reset-streaks.ps1 or sign in fresh).'
