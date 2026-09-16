package fi.oph.yki.solki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExamDateSyncRequestDTO(
  @JsonProperty("kieli") String languageCode,
  @JsonProperty("pvm") String examDate
) {}
