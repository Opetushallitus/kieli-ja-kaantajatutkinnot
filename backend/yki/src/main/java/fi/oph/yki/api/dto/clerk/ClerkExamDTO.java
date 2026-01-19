package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkExamDTO(String language, String level) {}
