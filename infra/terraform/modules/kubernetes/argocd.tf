resource "helm_release" "argocd" {
  name       = "argo-cd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.8.23"

  namespace        = "argocd"
  create_namespace = true

  values = [
    file("${path.module}/argocd-values.yaml")
  ]
}

resource "kubernetes_manifest" "argocd_project" {
  manifest = {
    "apiVersion" = "argoproj.io/v1alpha1"
    "kind"       = "AppProject"
    "metadata" = {
      "name"      = "cmp9785"
      "namespace" = "argocd"
    }
    "spec" = {
      "description" = "CMP9785 Cloud Development"
      "sourceRepos" = ["*"]
      "destinations" = [
        {
          "namespace" : "*",
          "server" : "https://kubernetes.default.svc"
        }
      ],
      "clusterResourceWhitelist" : [
        {
          "group" : "*",
          "kind" : "*"
        }
      ],
      "namespaceResourceWhitelist" : [
        {
          "group" : "*",
          "kind" : "*"
        }
      ],
      "orphanedResources" : {
        "warn" : true
      }
    }
  }

  depends_on = [helm_release.argocd]
}

resource "kubernetes_manifest" "argocd_apps" {
  manifest = {
    "apiVersion" = "argoproj.io/v1alpha1"
    "kind"       = "Application"
    "metadata" = {
      "name"      = "applications"
      "namespace" = "argocd"
    }
    "spec" = {
      "project" = "cmp9785"
      "source" = {
        "repoURL"        = "https://github.com/vuchuc789/cmp9785-cloud-development"
        "targetRevision" = "main"
        "path"           = "infra/kustomize/apps"
      }
      "destination" = {
        "server" = "https://kubernetes.default.svc"
      }
      "syncPolicy" = {
        "automated" = {
          "selfHeal" = true
          "prune"    = true
        }
        "syncOptions" = [
          "RespectIgnoreDifferences=true"
        ]
      }
      "ignoreDifferences" = [
        {
          "group"     = "*"
          "kind"      = "Application"
          "namespace" = "*"
          "jsonPointers" = [
            # Allow manually disabling auto sync for apps, useful for debugging.
            "/spec/syncPolicy/automated",
            # These are automatically updated on a regular basis. Not ignoring last applied configuration since it's used for computing diffs after normalization.
            "/metadata/annotations/argocd.argoproj.io~1refresh",
            "/operation"
          ]
        }
      ]
    }
  }

  wait {
    fields = {
      "status.health.status" = "Healthy"
    }
  }

  depends_on = [
    helm_release.argocd,
    kubernetes_manifest.argocd_project,
  ]
}

