package fi.oph.yki.api.clerk;

import fi.oph.yki.service.email.EmailService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Renders a saved email in the browser, for checking email templates locally. Exists only with
 * the dev profile, hidden from the API docs (@Hidden) and admin-only via the existing
 * /v2/api/clerk/** security matcher.
 */
@Hidden
@Profile("dev")
@RestController
@RequestMapping(value = "/v2/api/clerk/email-debug")
public class EmailDebugController {

  private static final String TAG_EMAIL_DEBUG = "Email debug API";

  @Resource
  private EmailService emailService;

  @GetMapping(path = "/{emailId}", produces = MediaType.TEXT_HTML_VALUE)
  @Operation(tags = TAG_EMAIL_DEBUG, summary = "Render the body of a saved email")
  public String renderEmail(@PathVariable final long emailId) {
    return emailService.getEmailBody(emailId);
  }
}
