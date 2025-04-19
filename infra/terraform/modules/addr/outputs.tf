output "cdn_ip_id" {
  value = google_compute_global_address.cdn.id
}

output "cdn_ip" {
  value = google_compute_global_address.cdn.address
}

output "gateway_ip" {
  value = google_compute_address.gateway.address
}
