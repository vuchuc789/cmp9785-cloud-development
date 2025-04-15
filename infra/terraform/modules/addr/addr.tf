resource "google_compute_global_address" "cdn" {
  name = "cmp9785-cdn-ip"
}

resource "google_compute_address" "gateway" {
  name         = "cmp9785-gateway-ip"
  network_tier = "STANDARD"
}
