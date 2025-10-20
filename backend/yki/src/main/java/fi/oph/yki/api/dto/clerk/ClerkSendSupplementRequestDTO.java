package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkSendSupplementRequestDTO(String message, LocalDate dueDate) {}
