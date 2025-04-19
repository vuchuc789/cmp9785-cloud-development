terraform {
  backend "gcs" {
    bucket = "cmp-9785-terraform-state"
    prefix = "terraform/state"
  }
}

module "addr" {
  source = "./modules/addr"
}

module "ssl" {
  source = "./modules/cert"
}

module "cdn" {
  source = "./modules/cdn"

  ip_id       = module.addr.cdn_ip_id
  cert_map_id = module.ssl.global_cert_map_id
}

module "gke" {
  source = "./modules/gke"
}

module "kubernetes" {
  source = "./modules/kubernetes"

  kubernetes_host = module.gke.kubernetes_host
  google_token    = module.gke.google_token
  # cluster_ca        = module.gke.cluster_ca
  postgres_password = var.postgres_password
  auth_token_secret = var.auth_token_secret
  sendgrid_api_key  = var.sendgrid_api_key
}

