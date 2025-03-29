resource "azurerm_resource_group" "app" {
  location = "uksouth"
  name     = "cmp9134-app"
}

resource "azurerm_storage_account" "app" {
  account_kind                    = "Storage"
  account_replication_type        = "LRS"
  account_tier                    = "Standard"
  allow_nested_items_to_be_public = false
  default_to_oauth_authentication = true
  name                            = "cmp9134appa79f"
  resource_group_name             = azurerm_resource_group.app.name
  location                        = azurerm_resource_group.app.location
}

resource "azurerm_service_plan" "app" {
  name                = "ASP-cmp9134app-a6cc"
  os_type             = "Linux"
  sku_name            = "B1"
  resource_group_name = azurerm_resource_group.app.name
  location            = azurerm_resource_group.app.location
}

resource "azurerm_linux_function_app" "app" {
  app_settings = {
    NEXT_PUBLIC_API_URL                 = "https://${var.api_url}/api/v1"
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
  }
  builtin_logging_enabled                        = false
  client_certificate_mode                        = "Required"
  ftp_publish_basic_authentication_enabled       = false
  https_only                                     = true
  name                                           = "cmp9134-app"
  storage_account_name                           = azurerm_storage_account.app.name
  storage_account_access_key                     = azurerm_storage_account.app.primary_access_key
  service_plan_id                                = azurerm_service_plan.app.id
  webdeploy_publish_basic_authentication_enabled = false
  resource_group_name                            = azurerm_resource_group.app.name
  location                                       = azurerm_resource_group.app.location
  site_config {
    ftps_state          = "FtpsOnly"
    http2_enabled       = true
    minimum_tls_version = "1.3"
    always_on           = true
    app_service_logs {
      retention_period_days = 1
    }
    application_stack {
      docker {
        image_name   = "vuchuc781999/cmp9134-app"
        image_tag    = var.image_tag
        registry_url = "https://index.docker.io"
      }
    }
  }
  sticky_settings {
    app_setting_names = ["NEXT_PUBLIC_API_URL"]
  }
  depends_on = [
    azurerm_service_plan.app,
  ]
}

resource "azurerm_app_service_custom_hostname_binding" "app" {
  app_service_name    = "cmp9134-app"
  hostname            = var.app_url
  resource_group_name = azurerm_resource_group.app.name
  depends_on = [
    azurerm_linux_function_app.app,
  ]
}

resource "azurerm_app_service_managed_certificate" "app" {
  custom_hostname_binding_id = azurerm_app_service_custom_hostname_binding.app.id
}

resource "azurerm_app_service_certificate_binding" "app" {
  hostname_binding_id = azurerm_app_service_custom_hostname_binding.app.id
  certificate_id      = azurerm_app_service_managed_certificate.app.id
  ssl_state           = "SniEnabled"
}
