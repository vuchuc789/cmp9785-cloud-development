resource "kubernetes_namespace" "database" {
  metadata {
    name = "database"
  }

  depends_on = [helm_release.argocd]
}

resource "kubernetes_namespace" "web_api" {
  metadata {
    name = "web-api"
  }

  depends_on = [helm_release.argocd]
}

# Add newly created namespaces to depends_on of argocd_apps
