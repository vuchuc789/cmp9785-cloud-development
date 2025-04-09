resource "kubernetes_namespace" "database" {
  metadata {
    name = "database"
  }
}

resource "kubernetes_namespace" "web_api" {
  metadata {
    name = "web-api"
  }
}
