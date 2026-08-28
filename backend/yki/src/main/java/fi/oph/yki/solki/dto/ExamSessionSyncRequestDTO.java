package fi.oph.yki.solki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ExamSessionSyncRequestDTO(
  @JsonProperty("kieli") String languageCode,
  @JsonProperty("taso") String level,
  @JsonProperty("pvm") String examDate,
  @JsonProperty("jarjestaja") String organizerOid
) {}
