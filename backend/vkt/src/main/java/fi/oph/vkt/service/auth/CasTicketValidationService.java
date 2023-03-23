package fi.oph.vkt.service.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.service.auth.ticketValidator.CasResponse;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CasTicketValidationService {

  private final TicketValidator ticketValidator;

  public CasResponse validate(final String ticket) throws JsonProcessingException {
    return ticketValidator.validateTicket(ticket);
  }
}
