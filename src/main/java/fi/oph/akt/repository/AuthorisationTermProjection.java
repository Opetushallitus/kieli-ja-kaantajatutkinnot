package fi.oph.akt.repository;

import java.time.LocalDate;

public record AuthorisationTermProjection(long authorisationId, LocalDate beginDate, LocalDate endDate) {
}
