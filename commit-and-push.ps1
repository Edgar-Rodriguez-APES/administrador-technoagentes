# Script para hacer commit de todos los archivos y subirlos a GitHub

# Parámetros
param (
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Commit inicial del proyecto Administrador Technoagentes"
)

# Agregar todos los archivos al staging
Write-Host "Agregando todos los archivos al staging..."
git add .

# Hacer commit de los cambios
Write-Host "Haciendo commit de los cambios con el mensaje: $CommitMessage"
git commit -m $CommitMessage

# Subir los cambios a GitHub
Write-Host "Subiendo los cambios a GitHub..."
git push -u origin main

Write-Host "Proceso completado. Verifica tu repositorio en GitHub."
