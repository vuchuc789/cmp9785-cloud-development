terraform {
  backend "gcs" {
    bucket = "cmp-9785-terraform-state"
    prefix = "terraform/state"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.28.0"
    }

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

provider "google" {
  project = "cmp9785"
  region  = "europe-west2"
}

data "google_client_config" "provider" {}

provider "kubernetes" {
  host  = "https://${google_container_cluster.cmp9785.endpoint}"
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = base64decode(
    google_container_cluster.cmp9785.master_auth[0].cluster_ca_certificate
  )
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "gke-gcloud-auth-plugin"
  }
}

provider "helm" {
  kubernetes = {
    host  = "https://${google_container_cluster.cmp9785.endpoint}"
    token = data.google_client_config.provider.access_token
    cluster_ca_certificate = base64decode(
      google_container_cluster.cmp9785.master_auth[0].cluster_ca_certificate
    )
    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "gke-gcloud-auth-plugin"
    }
  }
}

