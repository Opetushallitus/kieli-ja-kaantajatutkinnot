package fi.oph.vkt.service.auth.ticketValidator;

public interface TicketValidator {
  String validateTicket(String ticket);
}
