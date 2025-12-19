package fi.oph.yki.api.dto.clerk;

import java.util.List;
import lombok.Builder;

@Builder
public record ClerkExamSessionDTO(List<ClerkRegistrationDTO> registrations) {}
