package fi.oph.vkt.api.dto;

public interface FreeEnrollmentBasisDTOCommonFields {
  String type();
  String source();

  FreeEnrollmentAttachmentDTO attachments();
}
