package fi.oph.yki.solki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record ExamDateSyncRequestDTO(
  @JsonProperty("kieli") String languageCode,
  @JsonProperty("pvm") String examDate
) {}
