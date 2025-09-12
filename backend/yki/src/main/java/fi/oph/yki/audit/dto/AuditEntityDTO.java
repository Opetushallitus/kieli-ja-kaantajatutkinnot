package fi.oph.yki.audit.dto;

public interface AuditEntityDTO {
  Long id();
  Integer version();
  String modifiedAt();
}
