package fi.oph.yki.service;

import fi.oph.yki.model.Person;
import jakarta.servlet.http.HttpSession;
import org.springframework.transaction.annotation.Transactional;

public class PublicAuthService {
  @Transactional(readOnly = true)
  public Person getPersonFromSession(final HttpSession session) {
  }
}
