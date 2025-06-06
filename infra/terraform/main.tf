terraform {
  backend "gcs" {
    bucket = "cmp-9785-terraform-state"
    prefix = "terraform/state"
  }
}

module "addr" {
  source = "./modules/addr"

  gcp_region = var.gcp_region
}

module "ssl" {
  source = "./modules/cert"

  gcp_region = var.gcp_region
}

module "cdn" {
  source = "./modules/cdn"

  gcp_region = var.gcp_region

  ip_id       = module.addr.cdn_ip_id
  cert_map_id = module.ssl.global_cert_map_id
}

module "gke" {
  source = "./modules/gke"

  gcp_region = var.gcp_region
  gcp_zones  = var.gcp_zones
}

module "kubernetes" {
  source = "./modules/kubernetes"

  kubernetes_host = module.gke.kubernetes_host
  google_token    = module.gke.google_token
  # cluster_ca      = module.gke.cluster_ca

  postgres_password   = var.postgres_password
  auth_token_secret   = var.auth_token_secret
  sendgrid_api_key    = var.sendgrid_api_key
  gemini_api_key      = var.gemini_api_key
  service_account_key = var.service_account_key
}

