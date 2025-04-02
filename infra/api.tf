resource "azurerm_resource_group" "api" {
  location = "uksouth"
  name     = "cmp9134-api"
}

resource "azurerm_storage_account" "api" {
  account_kind                    = "Storage"
  account_replication_type        = "LRS"
  account_tier                    = "Standard"
  allow_nested_items_to_be_public = false
  default_to_oauth_authentication = true
  name                            = "cmp9134api8b58"
  resource_group_name             = azurerm_resource_group.api.name
  location                        = azurerm_resource_group.api.location
}

resource "azurerm_service_plan" "api" {
  name                = "ASP-cmp9134api-8d17"
  os_type             = "Linux"
  sku_name            = "B1"
  resource_group_name = azurerm_resource_group.api.name
  location            = azurerm_resource_group.api.location
}

resource "azurerm_linux_function_app" "api" {
  app_settings = {
    AUTH_TOKEN_SECRET_KEY               = var.api_auth_token_secret_key
    AZURE_POSTGRESQL_DATABASE           = azurerm_postgresql_flexible_server_database.db-cmp9134.name
    AZURE_POSTGRESQL_HOST               = azurerm_postgresql_flexible_server.db.fqdn
    AZURE_POSTGRESQL_USERNAME           = azurerm_postgresql_flexible_server.db.administrator_login
    AZURE_POSTGRESQL_PASSWORD           = azurerm_postgresql_flexible_server.db.administrator_password
    AZURE_POSTGRESQL_PORT               = "5432" # default port
    AZURE_POSTGRESQL_SSL                = "true"
    FRONTEND_URL                        = "https://${var.app_url}"
    OPENVERSE_URL                       = var.openverse_url
    OPENVERSE_CLIENT_ID                 = var.openverse_client_id
    OPENVERSE_CLIENT_SECRET             = var.openverse_client_secret
    SENDGRID_API_KEY                    = var.sendgrid_api_key
    SOURCE_EMAIL                        = var.api_source_email
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
  }
  builtin_logging_enabled                        = false
  client_certificate_mode                        = "Required"
  ftp_publish_basic_authentication_enabled       = false
  https_only                                     = true
  name                                           = "cmp9134-api"
  storage_account_name                           = azurerm_storage_account.api.name
  storage_account_access_key                     = azurerm_storage_account.api.primary_access_key
  service_plan_id                                = azurerm_service_plan.api.id
  virtual_network_subnet_id                      = azurerm_subnet.db-cmp9134-functions.id
  webdeploy_publish_basic_authentication_enabled = false
  resource_group_name                            = azurerm_resource_group.api.name
  location                                       = azurerm_resource_group.api.location
  site_config {
    ftps_state             = "FtpsOnly"
    http2_enabled          = true
    minimum_tls_version    = "1.3"
    vnet_route_all_enabled = true
    always_on              = true
    app_service_logs {
      retention_period_days = 1
    }
    application_stack {
      docker {
        image_name   = var.api_image_name
        image_tag    = var.image_tag
        registry_url = "https://index.docker.io"
      }
    }
    cors {
      allowed_origins     = ["https://${var.app_url}"]
      support_credentials = true
    }
  }
  sticky_settings {
    app_setting_names = ["AUTH_TOKEN_SECRET_KEY", "AZURE_POSTGRESQL_DATABASE", "AZURE_POSTGRESQL_HOST", "AZURE_POSTGRESQL_PASSWORD", "AZURE_POSTGRESQL_PORT", "AZURE_POSTGRESQL_SSL", "AZURE_POSTGRESQL_USERNAME", "FRONTEND_URL", "OPENVERSE_CLIENT_ID", "OPENVERSE_CLIENT_SECRET", "OPENVERSE_URL", "SENDGRID_API_KEY", "SOURCE_EMAIL", "CORS_ORIGINS", "ACCESS_TOKEN_EXPIRE_MINUTES", "AUTH_TOKEN_ALGORITHM", "DB_MAX_OVERFLOW", "DB_POOL_SIZE"]
  }
}

resource "azurerm_app_service_custom_hostname_binding" "api" {
  app_service_name    = "cmp9134-api"
  hostname            = var.api_url
  resource_group_name = azurerm_resource_group.api.name
  depends_on = [
    azurerm_linux_function_app.api,
  ]
}

resource "azurerm_app_service_managed_certificate" "api" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.api.id
}

resource "azurerm_app_service_certificate_binding" "api" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.api.id
  certificate_id      = azurerm_app_service_managed_certificate.api.id
  ssl_state           = "SniEnabled"
}

output "api-hostname" {
  value = azurerm_linux_function_app.api.default_hostname
}
