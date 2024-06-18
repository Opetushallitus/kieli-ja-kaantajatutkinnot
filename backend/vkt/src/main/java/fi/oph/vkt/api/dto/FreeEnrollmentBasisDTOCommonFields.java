package fi.oph.vkt.api.dto;

import java.util.List;

public interface FreeEnrollmentBasisDTOCommonFields {
  String type();
  String source();

  List<FreeEnrollmentAttachmentDTO> attachments();
}
