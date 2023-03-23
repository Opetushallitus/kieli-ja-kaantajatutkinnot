package fi.oph.vkt.service.auth;

import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CasTicketValidationService {
  private final TicketValidator ticketValidator;

  public boolean validate(final String ticket) {
    try {
      String response = ticketValidator.validateTicket(ticket);
      return true;
    } catch (final Exception e) {
      return false;
    }
  }
}
