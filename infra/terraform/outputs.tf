output "cdn_ip" {
  value = module.addr.cdn_ip
}

output "gateway_ip" {
  value = module.addr.gateway_ip
}

output "global_cert_dns_info" {
  value = module.ssl.global_cert_dns_info
}

output "cert_dns_info" {
  value = module.ssl.cert_dns_info
}

output "kubernetes_host" {
  value = module.gke.kubernetes_host
}

output "cdn_bucket" {
  value = module.cdn.cdn_bucket
}

