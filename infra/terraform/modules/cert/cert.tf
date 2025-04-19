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

resource "google_certificate_manager_dns_authorization" "global_default" {
  name        = "cmp9785-global-dnsauth"
  description = "The global default dns auth"
  domain      = local.domain
  labels = {
    "terraform" : true
  }
}

resource "google_certificate_manager_certificate" "global_root_cert" {
  name        = "cmp9785-global-rootcert"
  description = "The global wildcard cert"
  managed {
    domains = [local.domain, "*.${local.domain}"]
    dns_authorizations = [
      google_certificate_manager_dns_authorization.global_default.id
    ]
  }
  labels = {
    "terraform" : true
  }
}

resource "google_certificate_manager_certificate_map" "global_root_cert_map" {
  name        = "cmp9785-global-rootcert-map"
  description = "The global wildcard cert map"
  labels = {
    "terraform" : true
  }
}

resource "google_certificate_manager_certificate_map_entry" "global_root_cert_map_entry" {
  name        = "cmp9785-global-rootcert-map-entry"
  description = "The global wildcard cert map entry"
  map         = google_certificate_manager_certificate_map.global_root_cert_map.name
  labels = {
    "terraform" : true
  }

  certificates = [google_certificate_manager_certificate.global_root_cert.id]
  matcher      = "PRIMARY"
}
