package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkExamDTO(Long id, String language, String level) {}
