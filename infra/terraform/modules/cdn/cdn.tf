# Cloud Storage bucket
resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_storage_bucket" "cdn" {
  name                        = "${random_id.bucket_prefix.hex}-cmp9785-cdn-bucket"
  location                    = var.gcp_region
  uniform_bucket_level_access = true
  storage_class               = "STANDARD"
  // delete bucket and contents on destroy.
  force_destroy = true
  // Assign specialty files
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# make bucket public
resource "google_storage_bucket_iam_member" "cdn" {
  bucket = google_storage_bucket.cdn.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# backend bucket with CDN policy with default ttl settings
resource "google_compute_backend_bucket" "cdn" {
  name        = "cmp9785-backend-bucket"
  description = "Contains beautiful images"
  bucket_name = google_storage_bucket.cdn.name
  enable_cdn  = true
  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
}

# http url map
resource "google_compute_url_map" "cdn_http" {
  name = "cmp9785-cdn-lb-redirect"
  default_url_redirect {
    https_redirect = true
    strip_query    = false
  }
}

# https url map
resource "google_compute_url_map" "cdn_https" {
  name            = "cmp9785-cdn-lb"
  default_service = google_compute_backend_bucket.cdn.id
}


# http proxy
resource "google_compute_target_http_proxy" "cdn" {
  name    = "cmp9785-cdn-http-lb-proxy"
  url_map = google_compute_url_map.cdn_http.id
}

# https proxy
resource "google_compute_target_https_proxy" "cdn" {
  name            = "cmp9785-cdn-https-lb-proxy"
  url_map         = google_compute_url_map.cdn_https.id
  certificate_map = "//certificatemanager.googleapis.com/${var.cert_map_id}"
}

# http forwarding rule
resource "google_compute_global_forwarding_rule" "cdn_http" {
  name                  = "cmp9785-cdn-http-lb-forwarding-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "80"
  target                = google_compute_target_http_proxy.cdn.id
  ip_address            = var.ip_id
}

# https forwarding rule
resource "google_compute_global_forwarding_rule" "cdn_https" {
  name                  = "cmp9785-cdn-https-lb-forwarding-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443"
  target                = google_compute_target_https_proxy.cdn.id
  ip_address            = var.ip_id
}
