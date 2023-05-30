package fi.oph.vkt.service.auth;

import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.service.auth.ticketValidator.TicketValidator;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CasTicketValidationService {

  private final TicketValidator ticketValidator;

  public Map<String, String> validate(final String ticket, final long examEventId, final EnrollmentType type) {
    return ticketValidator.validateTicket(ticket, examEventId, type);
  }
}
