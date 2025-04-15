data "google_container_engine_versions" "europewest2b" {
  location       = "europe-west2-b"
  version_prefix = "1.31."
}

resource "google_service_account" "default" {
  account_id   = "cmp9785-gke"
  display_name = "CMP9785 GKE"
}

resource "google_container_cluster" "cmp9785" {
  name = "cmp9785-cluster"

  remove_default_node_pool = true
  initial_node_count       = 1

  location = "europe-west2-b"

  deletion_protection = false

  network    = google_compute_network.vpc.name
  subnetwork = google_compute_subnetwork.subnet.name

  datapath_provider = "ADVANCED_DATAPATH"
  networking_mode   = "VPC_NATIVE"

  gateway_api_config {
    channel = "CHANNEL_STANDARD"
  }

  monitoring_service = "none"
  logging_service    = "none"

  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "172.16.0.0/16"
    services_ipv4_cidr_block = "172.17.0.0/16"
  }
}

resource "google_container_node_pool" "cmp9785_nodes" {
  name       = "cmp9785-node-pool"
  cluster    = google_container_cluster.cmp9785.name
  node_count = 3

  location = "europe-west2-b"

  version = data.google_container_engine_versions.europewest2b.release_channel_latest_version["STABLE"]

  node_config {
    preemptible  = true
    machine_type = "e2-standard-4"
    disk_size_gb = 30

    image_type = "ubuntu_containerd"

    service_account = google_service_account.default.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}

