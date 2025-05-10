terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.30.0"
    }
  }

  required_version = ">= 1.0"
}

provider "google" {
  project = "cmp9785"
  region  = "europe-north2"
}

