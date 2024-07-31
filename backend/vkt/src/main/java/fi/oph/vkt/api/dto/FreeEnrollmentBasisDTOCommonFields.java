package fi.oph.vkt.api.dto;

import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import java.util.List;

public interface FreeEnrollmentBasisDTOCommonFields {
  FreeEnrollmentType type();
  FreeEnrollmentSource source();

  List<FreeEnrollmentAttachmentDTO> attachments();
}
