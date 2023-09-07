package fi.oph.vkt.audit.dto;

public interface AuditEntityDTO {
  Long id();
  Integer version();
  String modifiedAt();
}
