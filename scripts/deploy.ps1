# Deploy Weather Tracker to GitHub Pages
# Prerequisites: GitHub CLI installed and authenticated (run: gh auth login)

$ErrorActionPreference = "Stop"

Write-Host "Checking GitHub authentication..."
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Run 'gh auth login' first, then re-run this script."
    exit 1
}

$repoName = "weather-tracker"
$owner = (gh api user -q .login)

Write-Host "Deploying to github.com/$owner/$repoName ..."

# Create repo if it doesn't exist
$repoExists = gh repo view "$owner/$repoName" 2>$null
if (-not $repoExists) {
    gh repo create $repoName --public --description "Liquid glass weather tracker with NASA EONET and Open-Meteo"
}

# Set remote and push
git remote remove origin 2>$null
git remote add origin "https://github.com/$owner/$repoName.git"
git push -u origin main

# Enable GitHub Pages via Actions
gh api "repos/$owner/$repoName/pages" -X POST -f build_type=workflow 2>$null

Write-Host ""
Write-Host "Done! Enable Pages if needed:"
Write-Host "  https://github.com/$owner/$repoName/settings/pages"
Write-Host "  Set Source to 'GitHub Actions'"
Write-Host ""
Write-Host "Live URL (after workflow completes):"
Write-Host "  https://$owner.github.io/$repoName/"
