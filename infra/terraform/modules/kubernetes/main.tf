terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.36.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "3.0.0-pre2"
    }
  }

  required_version = ">= 1.0"
}

provider "kubernetes" {
  host  = var.kubernetes_host
  token = var.google_token
  # cluster_ca_certificate = base64decode(var.cluster_ca)
  # exec {
  #   api_version = "client.authentication.k8s.io/v1beta1"
  #   command     = "gke-gcloud-auth-plugin"
  # }
}

provider "helm" {
  kubernetes = {
    host  = var.kubernetes_host
    token = var.google_token
    # cluster_ca_certificate = base64decode(var.cluster_ca)
    # exec = {
    #   api_version = "client.authentication.k8s.io/v1beta1"
    #   command     = "gke-gcloud-auth-plugin"
    # }
  }
}

