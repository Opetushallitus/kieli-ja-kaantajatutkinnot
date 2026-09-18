package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicPersonContactUpdateDTO;
import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.service.PublicAuthService;
import fi.oph.yki.service.PublicPersonService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/person", produces = APPLICATION_JSON_VALUE)
@ConditionalOnProperty(name = "app.customer-portal.enabled", havingValue = "true")
public class PublicPersonController {

  @Resource
  private PublicAuthService publicAuthService;

  @Resource
  private PublicPersonService publicPersonService;

  private String getOid(final HttpServletRequest request) {
    final String oid = publicAuthService.getIdentity(request).oid();

    if (oid == null || oid.isEmpty()) {
      throw new APIException(APIExceptionType.SESSION_OID_NOT_FOUND);
    }

    return oid;
  }

  @GetMapping
  public PublicPersonDTO getPerson(final HttpServletRequest request) {
    return publicPersonService.getPerson(getOid(request));
  }

  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  public Map<String, Boolean> updateContactDetails(
    final HttpServletRequest request,
    @RequestBody @Valid final PublicPersonContactUpdateDTO dto
  ) {
    publicPersonService.updateContactDetails(getOid(request), dto);

    return Map.of("success", true);
  }
}
