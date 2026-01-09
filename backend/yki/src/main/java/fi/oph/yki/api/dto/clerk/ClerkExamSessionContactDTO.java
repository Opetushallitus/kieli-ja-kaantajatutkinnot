package fi.oph.yki.api.dto.clerk;

import lombok.Builder;

@Builder
public record ClerkExamSessionContactDTO(String email, String name, String phoneNumber) {}
