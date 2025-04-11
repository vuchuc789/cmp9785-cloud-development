locals {
  name   = "cmp9785"
  domain = "cmp9785.vuchuc789.co.uk"
}

resource "random_id" "tf_prefix" {
  byte_length = 8
}

resource "google_certificate_manager_dns_authorization" "default" {
  name        = "${local.name}-dnsauth-${random_id.tf_prefix.hex}"
  description = "The default dns auth"
  location    = "europe-west2"
  domain      = local.domain
  labels = {
    "terraform" : true
  }
}

resource "google_certificate_manager_certificate" "root_cert" {
  name        = "${local.name}-rootcert-${random_id.tf_prefix.hex}"
  description = "The wildcard cert"
  location    = "europe-west2"
  managed {
    domains = [local.domain, "*.${local.domain}"]
    dns_authorizations = [
      google_certificate_manager_dns_authorization.default.id
    ]
  }
  labels = {
    "terraform" : true
  }
}

# resource "google_certificate_manager_certificate_map" "default" {
#   name        = "${local.name}-certmap1-${random_id.tf_prefix.hex}"
#   description = "${local.domain} certificate map"
#   labels = {
#     "terraform" : true
#   }
# }

# resource "google_certificate_manager_certificate_map_entry" "default" {
#   name        = "${local.name}-first-entry-${random_id.tf_prefix.hex}"
#   description = "example certificate map entry"
#   map         = google_certificate_manager_certificate_map.default.name
#   labels = {
#     "terraform" : true
#   }
#   certificates = [google_certificate_manager_certificate.root_cert.id]
#   hostname     = local.domain
# }
