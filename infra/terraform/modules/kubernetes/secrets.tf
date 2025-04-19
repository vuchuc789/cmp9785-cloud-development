resource "kubernetes_secret" "postgres_password" {
  metadata {
    name      = "postgres-password"
    namespace = "database"
  }

  data = {
    postgres-password = var.postgres_password
    password          = var.postgres_password
  }

  depends_on = [kubernetes_namespace.database]
}

resource "kubernetes_secret" "web_api" {
  metadata {
    name      = "web-api-secret-envs"
    namespace = "web-api"
  }

  data = {
    DB_PASSWORD           = var.postgres_password
    AUTH_TOKEN_SECRET_KEY = var.auth_token_secret
    SENDGRID_API_KEY      = var.sendgrid_api_key
    GEMINI_API_KEY        = var.gemini_api_key
  }

  depends_on = [kubernetes_namespace.web_api]
}

resource "kubernetes_secret" "web_api_sa" {
  metadata {
    name      = "web-api-service-account-key"
    namespace = "web-api"
  }

  data = {
    "service-account-key.json" = var.service_account_key
  }

  depends_on = [kubernetes_namespace.web_api]
}
