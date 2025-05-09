variable "gcp_region" {
  type    = string
  default = "us-central1"
}

variable "gcp_zones" {
  type = list(string)
  default = [
    "us-central1-a",
    "us-central1-b",
    "us-central1-c",
  ]
}

variable "postgres_password" {
  type      = string
  sensitive = true
}

variable "auth_token_secret" {
  type      = string
  sensitive = true
}

variable "sendgrid_api_key" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "service_account_key" {
  type      = string
  sensitive = true
}
