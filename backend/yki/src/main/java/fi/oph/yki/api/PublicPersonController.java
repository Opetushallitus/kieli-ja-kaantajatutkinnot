package fi.oph.yki.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.PublicPersonDTO;
import fi.oph.yki.service.PublicPersonService;
import fi.oph.yki.util.StringUtil;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/v2/api/public/person", produces = APPLICATION_JSON_VALUE)
public class PublicPersonController {

  @Resource
  private PublicPersonService publicPersonService;

  private static String getOid(final HttpServletRequest request) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      throw new APIException(APIExceptionType.SESSION_OID_NOT_FOUND);
    }

    return oid;
  }

  @GetMapping
  public PublicPersonDTO getPerson(final HttpServletRequest request) {
    return publicPersonService.getPerson(getOid(request));
  }
}
