package fi.oph.vkt.api.dto.examiner;

import fi.oph.vkt.api.dto.MunicipalityDTO;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record ExaminerDetailsDTO(
  @NonNull Long id,
  @NonNull Integer version,
  @NonNull String oid,
  @NonNull String email,
  @NonNull String phoneNumber,
  @NonNull String lastName,
  @NonNull String firstName,
  @NonNull Boolean examLanguageFinnish,
  @NonNull Boolean examLanguageSwedish,
  @NonNull Boolean isPublic,
  @NonNull @NotEmpty List<MunicipalityDTO> municipalities,
  @NonNull List<ExaminerExamEventDTO> examEvents,
  @NonNull List<ExaminerContactRequestDTO> contactRequests
) {}
