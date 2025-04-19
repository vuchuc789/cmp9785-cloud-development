output "cert_dns_info" {
  value = google_certificate_manager_dns_authorization.default.dns_resource_record[0]
}

output "global_cert_dns_info" {
  value = google_certificate_manager_dns_authorization.global_default.dns_resource_record[0]
}

output "global_cert_map_id" {
  value = google_certificate_manager_certificate_map.global_root_cert_map.id
}
