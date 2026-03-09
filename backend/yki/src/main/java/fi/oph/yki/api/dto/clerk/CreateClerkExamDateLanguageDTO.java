package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record CreateClerkExamDateLanguageDTO(String languageCode, String levelCode) {}
