output "kubernetes_host" {
  value = "https://${google_container_cluster.cmp9785.endpoint}"
}

output "google_token" {
  value     = data.google_client_config.provider.access_token
  sensitive = true
}

output "cluster_ca" {
  value     = google_container_cluster.cmp9785.master_auth[0].cluster_ca_certificate
  sensitive = true
}
