terraform {
  backend "gcs" {
    bucket = "cmp-9785-terraform-state"
    prefix = "terraform/state"
  }
}

module "google" {
  source = "./modules/google"
}

module "kubernetes" {
  source = "./modules/kubernetes"

  kubernetes_host   = module.google.kubernetes_host
  google_token      = module.google.google_token
  cluster_ca        = module.google.cluster_ca
  postgres_password = var.postgres_password
  auth_token_secret = var.auth_token_secret
  sendgrid_api_key  = var.sendgrid_api_key
}

