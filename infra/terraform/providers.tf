terraform {
  required_version = ">=1.0"

  backend "azurerm" {
    use_oidc             = true
    resource_group_name  = "terraform"
    storage_account_name = "tf29630583"
    container_name       = "terraform"
    key                  = "terraform.tfstate"
  }

  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~>1.5"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.9.1"
    }
  }
}

provider "azurerm" {
  features {}
}
