terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.28.0"
    }
  }

  required_version = ">= 1.0"
}

provider "google" {
  project = "cmp9785"
  region  = "europe-west2"
}

