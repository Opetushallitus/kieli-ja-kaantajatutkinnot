package fi.oph.vkt.service.auth.ticketValidator;

import java.util.Map;

public interface TicketValidator {
  Map<String, String> validateTicket(String ticket, long examEventId);
}
