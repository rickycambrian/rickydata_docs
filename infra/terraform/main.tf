terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "required" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com"
  ])

  service            = each.key
  disable_on_destroy = false
}

resource "google_sql_database_instance" "docs" {
  name             = var.sql_instance_name
  region           = var.region
  database_version = "POSTGRES_15"

  settings {
    tier              = var.sql_tier
    availability_type = "ZONAL"
    disk_type         = "PD_SSD"
    disk_size         = var.sql_disk_size_gb
    disk_autoresize   = true
    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = true

  depends_on = [google_project_service.required]
}

resource "google_sql_database" "docs" {
  name     = var.sql_database_name
  instance = google_sql_database_instance.docs.name
}

resource "google_sql_user" "docs" {
  name     = var.sql_user
  instance = google_sql_database_instance.docs.name
  password = var.sql_password
}

resource "google_artifact_registry_repository" "web" {
  location      = var.region
  repository_id = "rickydata-docs-web"
  format        = "DOCKER"

  depends_on = [google_project_service.required]
}

resource "google_artifact_registry_repository" "api" {
  location      = var.region
  repository_id = "rickydata-docs-api"
  format        = "DOCKER"

  depends_on = [google_project_service.required]
}

resource "google_secret_manager_secret" "ingest_token" {
  secret_id = "rickydata-docs-ingest-token"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "rickydata-docs-database-url"
  replication {
    auto {}
  }
}
