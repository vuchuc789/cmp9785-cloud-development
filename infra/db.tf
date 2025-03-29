resource "azurerm_resource_group" "db" {
  location = "uksouth"
  name     = "cmp9134-db"
}

resource "azurerm_virtual_network" "db" {
  address_space       = ["10.0.2.0/24", "10.0.3.0/24"]
  name                = "cmp9134-db-vnet"
  location            = azurerm_resource_group.db.location
  resource_group_name = azurerm_resource_group.db.name
}

resource "azurerm_subnet" "db" {
  address_prefixes     = ["10.0.2.0/24"]
  name                 = "cmp9134"
  service_endpoints    = ["Microsoft.Storage"]
  resource_group_name  = azurerm_resource_group.db.name
  virtual_network_name = azurerm_virtual_network.db.name
  delegation {
    name = "dlg-Microsoft.DBforPostgreSQL-flexibleServers"
    service_delegation {
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
    }
  }
}

resource "azurerm_subnet" "db-cmp9134-functions" {
  address_prefixes     = ["10.0.3.0/24"]
  name                 = "cmp9134_functions"
  resource_group_name  = azurerm_resource_group.db.name
  virtual_network_name = azurerm_virtual_network.db.name
  delegation {
    name = "delegation"
    service_delegation {
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
      name    = "Microsoft.Web/serverFarms"
    }
  }
}

resource "azurerm_private_dns_zone" "db" {
  name                = "cmp9134-db.private.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.db.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "db" {
  name                  = "cmp9134-db"
  private_dns_zone_name = azurerm_private_dns_zone.db.name
  resource_group_name   = azurerm_resource_group.db.name
  virtual_network_id    = azurerm_virtual_network.db.id
}

resource "azurerm_postgresql_flexible_server" "db" {
  delegated_subnet_id           = azurerm_subnet.db.id
  name                          = "cmp9134-db"
  location                      = azurerm_resource_group.db.location
  resource_group_name           = azurerm_resource_group.db.name
  private_dns_zone_id           = azurerm_private_dns_zone.db.id
  public_network_access_enabled = false
  zone                          = "1"
  version                       = "16"
  administrator_login           = var.db_user
  administrator_password        = var.db_password

  storage_mb   = 32768
  storage_tier = "P4"

  sku_name = "B_Standard_B1ms"

  depends_on = [
    azurerm_virtual_network.db
  ]
}

resource "azurerm_postgresql_flexible_server_database" "db-cmp9134" {
  name      = "cmp9134"
  server_id = azurerm_postgresql_flexible_server.db.id
}
