resource "google_compute_network" "vpc" {
  name = "cmp9785-vpc"

  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "subnet" {
  name = "cmp9785-subnet"

  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.10.0.0/24"
}

resource "google_compute_subnetwork" "proxy_subnet" {
  name = "cmp9785-proxy-subnet"

  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.10.1.0/24"

  purpose = "REGIONAL_MANAGED_PROXY"
  role    = "ACTIVE"
}

resource "google_compute_router" "router" {
  name    = "cmp9785-router"
  network = google_compute_network.vpc.name
}

resource "google_compute_router_nat" "router_nat" {
  name   = "cmp9785-router-nat"
  router = google_compute_router.router.name

  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.subnet.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }
}
