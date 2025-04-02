terraform {
  backend "azurerm" {
    use_oidc             = true
    resource_group_name  = "terraform"
    storage_account_name = "terraform29630583" # Can be passed via `-backend-config=`"storage_account_name=<storage account name>"` in the `init` command.
    container_name       = "terraform"         # Can be passed via `-backend-config=`"container_name=<container name>"` in the `init` command.
    key                  = "terraform.tfstate"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.24.0"

    }
  }
}

provider "azurerm" {
  features {}
}

variable "api_image_name" {
  type    = string
  default = "vuchuc781999/cmp9134-api"
}

variable "app_image_name" {
  type    = string
  default = "vuchuc781999/cmp9134-app"
}

variable "image_tag" {
  type = string
}

variable "api_url" {
  type    = string
  default = "cmp9134.api.vuchuc789.co.uk"
}

variable "app_url" {
  type    = string
  default = "cmp9134.app.vuchuc789.co.uk"
}

variable "db_user" {
  type    = string
  default = "cmp9134"
}

variable "db_password" {
  sensitive = true
  type      = string
}

variable "api_auth_token_secret_key" {
  sensitive = true
  type      = string
}

variable "openverse_url" {
  type    = string
  default = "https://api.openverse.org"
}

variable "openverse_client_id" {
  sensitive = true
  type      = string
}

variable "openverse_client_secret" {
  sensitive = true
  type      = string
}

variable "sendgrid_api_key" {
  sensitive = true
  type      = string
}

variable "api_source_email" {
  type    = string
  default = "noreply@vuchuc789.co.uk"
}

