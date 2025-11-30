package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.Optional;

public record ClerkRegistrationStatusDTO(String date, Optional<LocalDate> paidAt) {}
