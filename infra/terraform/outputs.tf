output "sql_connection_name" {
  value = google_sql_database_instance.docs.connection_name
}

output "sql_instance_name" {
  value = google_sql_database_instance.docs.name
}

output "sql_database_name" {
  value = google_sql_database.docs.name
}
