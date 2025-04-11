resource "google_compute_network" "vpc" {
  name = "cmp9786-vpc"

  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name = "cmp9786-subnet"

  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.10.0.0/24"
}

resource "google_compute_subnetwork" "proxy_subnet" {
  name = "cmp9786-proxy-subnet"

  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.10.1.0/24"

  purpose = "REGIONAL_MANAGED_PROXY"
  role    = "ACTIVE"
}
