package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkExamLocationDTO(String name, String municipality, String lang) {}
