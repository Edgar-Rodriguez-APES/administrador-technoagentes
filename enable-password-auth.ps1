# Habilitar el flujo USER_PASSWORD_AUTH en el cliente de Cognito
aws cognito-idp update-user-pool-client `
  --user-pool-id us-east-1_lJikpz0Bu `
  --client-id 67tqo3vsmpg25bt50f1sud1rk0 `
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH

Write-Host "Flujo USER_PASSWORD_AUTH habilitado correctamente."
