package fi.oph.akr.api.clerk;

import fi.oph.akr.api.dto.clerk.InformalEmailRequestDTO;
import fi.oph.akr.service.email.ClerkEmailService;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/clerk/email", produces = MediaType.APPLICATION_JSON_VALUE)
public class EmailController {

  @Resource
  private ClerkEmailService clerkEmailService;

  @PostMapping("/informal")
  @ResponseStatus(HttpStatus.CREATED)
  public void createInformalEmails(@Valid @RequestBody final InformalEmailRequestDTO emailRequestDTO) {
    clerkEmailService.createInformalEmails(emailRequestDTO);
  }
}
