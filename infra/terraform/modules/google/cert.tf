locals {
  domain = "cmp9785.vuchuc789.co.uk"
}

resource "google_certificate_manager_dns_authorization" "default" {
  name        = "cmp9785-dnsauth"
  description = "The default dns auth"
  location    = "europe-west2"
  domain      = local.domain
  labels = {
    "terraform" : true
  }
}

resource "google_certificate_manager_certificate" "root_cert" {
  name        = "cmp9785-rootcert"
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
