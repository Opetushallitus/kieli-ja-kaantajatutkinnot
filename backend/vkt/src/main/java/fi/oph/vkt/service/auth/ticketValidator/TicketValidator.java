package fi.oph.vkt.service.auth.ticketValidator;

import fi.oph.vkt.model.type.EnrollmentType;

import java.util.Map;

public interface TicketValidator {
  Map<String, String> validateTicket(String ticket, long examEventId, EnrollmentType Type);
}
