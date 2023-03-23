package fi.oph.vkt.service.auth.ticketValidator;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface TicketValidator {
  String validateTicket(String ticket) throws JsonProcessingException;
}
