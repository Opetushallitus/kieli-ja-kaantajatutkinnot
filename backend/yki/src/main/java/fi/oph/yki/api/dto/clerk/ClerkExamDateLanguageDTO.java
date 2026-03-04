package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkExamDateLanguageDTO(Long id, String languageCode, String levelCode) {}
