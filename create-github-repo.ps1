# Script para crear un repositorio en GitHub y configurar el remoto

# Parámetros
param (
    [Parameter(Mandatory=$true)]
    [string]$GithubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [Parameter(Mandatory=$true)]
    [string]$GithubToken,
    
    [Parameter(Mandatory=$false)]
    [string]$Description = "Administrador Technoagentes - Aplicación web para gestionar agentes inteligentes de IA Generativa",
    
    [Parameter(Mandatory=$false)]
    [bool]$Private = $false
)

# Crear el repositorio en GitHub
$createRepoUrl = "https://api.github.com/user/repos"
$headers = @{
    Authorization = "token $GithubToken"
    Accept = "application/vnd.github.v3+json"
}
$body = @{
    name = $RepoName
    description = $Description
    private = $Private
    auto_init = $false
} | ConvertTo-Json

Write-Host "Creando repositorio $RepoName en GitHub..."
try {
    $response = Invoke-RestMethod -Uri $createRepoUrl -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "Repositorio creado exitosamente: $($response.html_url)"
} catch {
    Write-Host "Error al crear el repositorio: $_"
    exit 1
}

# Configurar el remoto en el repositorio local
$repoUrl = "https://github.com/$GithubUsername/$RepoName.git"
Write-Host "Configurando el remoto origin como $repoUrl..."
git remote add origin $repoUrl

# Verificar que el remoto se haya configurado correctamente
Write-Host "Verificando la configuración del remoto..."
git remote -v

Write-Host "Repositorio configurado exitosamente. Ahora puedes hacer commit y push de tus cambios."
Write-Host "Ejemplo:"
Write-Host "git add ."
Write-Host "git commit -m 'Commit inicial'"
Write-Host "git push -u origin main"
