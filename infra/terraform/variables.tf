variable "project_id" {
  type    = string
  default = "ai-projects-442213"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "sql_instance_name" {
  type    = string
  default = "rickydata-docs-db"
}

variable "sql_database_name" {
  type    = string
  default = "rickydata_docs"
}

variable "sql_user" {
  type    = string
  default = "docs_user"
}

variable "sql_password" {
  type      = string
  sensitive = true
}

variable "sql_tier" {
  type    = string
  default = "db-f1-micro"
}

variable "sql_disk_size_gb" {
  type    = number
  default = 10
}
