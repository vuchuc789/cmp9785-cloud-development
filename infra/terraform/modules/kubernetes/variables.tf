variable "kubernetes_host" {
  type = string
}

variable "google_token" {
  type      = string
  sensitive = true
}

# variable "cluster_ca" {
#   type        = string
#   sensitive   = true
#   description = "It should be in base64 format"
# }

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
