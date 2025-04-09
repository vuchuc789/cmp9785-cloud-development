resource "helm_release" "argocd" {
  name       = "argo-cd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.8.23"

  namespace        = "argocd"
  create_namespace = true

  set = [
    {
      name  = "dex.enabled"
      value = "false"
    },
    {
      name  = "notifications.enabled"
      value = "false"
    }
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

resource "kubernetes_manifest" "web_api_application" {
  manifest = {
    "apiVersion" = "argoproj.io/v1alpha1"
    "kind"       = "Application"
    "metadata" = {
      "name"      = "web-api"
      "namespace" = "argocd"
    }
    "spec" = {
      "project" = "cmp9785"
      "sources" = [
        {
          "repoURL"        = "https://github.com/vuchuc789/cmp9785-cloud-development"
          "targetRevision" = "main"
          "path"           = "infra/helm/charts/generic-app"
          "helm" = {
            "valueFiles" = [
              "$values/infra/helm/values/web-api.yaml"
            ]
          }
        },
        {
          "repoURL"        = "https://github.com/vuchuc789/cmp9785-cloud-development"
          "targetRevision" = "main"
          "ref" : "values"
        }
      ]
      "destination" = {
        "server"    = "https://kubernetes.default.svc"
        "namespace" = "web-api"
      }
      "syncPolicy" = {
        "automated" = {
          "prune"    = true
          "selfHeal" = true
        }
        "syncOptions" = [
          "CreateNamespace=true"
        ]
      }
    }
  }

  depends_on = [helm_release.argocd, kubernetes_manifest.argocd_project]
}

resource "kubernetes_manifest" "web_front_application" {
  manifest = {
    "apiVersion" = "argoproj.io/v1alpha1"
    "kind"       = "Application"
    "metadata" = {
      "name"      = "web-front"
      "namespace" = "argocd"
    }
    "spec" = {
      "project" = "cmp9785"
      "sources" = [
        {
          "repoURL"        = "https://github.com/vuchuc789/cmp9785-cloud-development"
          "targetRevision" = "main"
          "path"           = "infra/helm/charts/generic-app"
          "helm" = {
            "valueFiles" = [
              "$values/infra/helm/values/web-front.yaml"
            ]
          }
        },
        {
          "repoURL"        = "https://github.com/vuchuc789/cmp9785-cloud-development"
          "targetRevision" = "main"
          "ref" : "values"
        }
      ]
      "destination" = {
        "server"    = "https://kubernetes.default.svc"
        "namespace" = "web-front"
      }
      "syncPolicy" = {
        "automated" = {
          "prune"    = true
          "selfHeal" = true
        }
        "syncOptions" = [
          "CreateNamespace=true"
        ]
      }
    }
  }

  depends_on = [helm_release.argocd, kubernetes_manifest.argocd_project]
}
