package fi.oph.yki.model.type;

// Mirrors the registration_kind enum in the database, OTHER included: PostgreSQLEnumJdbcType
// binds and extracts by constant name, so a database value with no Java constant fails to map.
// Declaration order is not load-bearing for the same reason, but is kept aligned for readers.
public enum RegistrationKind {
  ADMISSION,
  POST_ADMISSION,
  OTHER,
  QUEUE,
}
