package fi.oph.vkt.service.auth.ticketValidator;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface TicketValidator {
  CasResponse validateTicket(String ticket) throws JsonProcessingException;
}
