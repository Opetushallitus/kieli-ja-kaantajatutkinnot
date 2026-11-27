package fi.oph.yki.api.clerk;

import fi.oph.yki.repository.EmailListProjection;
import fi.oph.yki.service.email.EmailService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.HtmlUtils;

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

  private static final int EMAIL_LIST_LIMIT = 200;

  @Resource
  private EmailService emailService;

  @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
  @Operation(tags = TAG_EMAIL_DEBUG, summary = "List the newest saved emails")
  public String listEmails() {
    final StringBuilder html = new StringBuilder();
    html.append("<!doctype html><html><head><meta charset=\"utf-8\"><title>Emails</title>");
    html.append("<style>body{font-family:sans-serif}table{border-collapse:collapse}");
    html.append("th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}</style></head><body>");
    html.append("<h1>Emails (newest ").append(EMAIL_LIST_LIMIT).append(")</h1><table>");
    html.append("<tr><th>Id</th><th>Created</th><th>Type</th><th>Recipient</th><th>Subject</th>");
    html.append("<th>Sent</th><th>Error</th></tr>");

    // Links are relative to /email-debug, so they work under any context path
    emailService
      .listNewestEmails(EMAIL_LIST_LIMIT)
      .forEach(email -> {
        html.append("<tr><td><a href=\"email-debug/").append(email.getId()).append("\">");
        html.append(email.getId()).append("</a></td>");
        html.append(cell(email.getCreatedAt()));
        html.append(cell(email.getEmailType()));
        html.append(cell(recipient(email)));
        html.append(cell(email.getSubject()));
        html.append(cell(email.getSentAt()));
        html.append(cell(email.getError()));
        html.append("</tr>");
      });

    html.append("</table></body></html>");
    return html.toString();
  }

  @GetMapping(path = "/{emailId}", produces = MediaType.TEXT_HTML_VALUE)
  @Operation(tags = TAG_EMAIL_DEBUG, summary = "Render the body of a saved email")
  public String renderEmail(@PathVariable final long emailId) {
    return emailService.getEmailBody(emailId);
  }

  private static String recipient(final EmailListProjection email) {
    return email.getRecipientName() + " <" + email.getRecipientAddress() + ">";
  }

  private static String cell(final Object value) {
    return "<td>" + HtmlUtils.htmlEscape(Objects.toString(value, ""), StandardCharsets.UTF_8.name()) + "</td>";
  }
}
