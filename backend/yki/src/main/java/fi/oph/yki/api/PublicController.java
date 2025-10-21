package fi.oph.yki.api;

import fi.oph.yki.api.dto.PublicEducationDTO;
import fi.oph.yki.model.FeatureFlag;
import fi.oph.yki.model.Registration;
import fi.oph.yki.service.FeatureFlagService;
import fi.oph.yki.service.RegistrationService;
import fi.oph.yki.service.aws.S3Service;
import fi.oph.yki.service.koski.KoskiService;
import fi.oph.yki.util.StringUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/public", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private RegistrationService registrationService;

  @Resource
  private FeatureFlagService featureFlagService;

  @Autowired
  private S3Service s3Service;

  @PostMapping(path = "/education/{registrationId:\\d+}")
  @ResponseStatus(HttpStatus.CREATED)
  public List<PublicEducationDTO> updateEducation(
    @PathVariable final long registrationId,
    final HttpServletRequest request
  ) {
    final String oid = StringUtil.getOidFromRequest(request);

    if (oid == null || oid.isEmpty()) {
      return Collections.emptyList();
    }

    final Registration registration = registrationService.findRegistration(registrationId, oid);

    try {
      return registrationService.updateEducations(registration);
    } catch (final Exception e) {
      return Collections.emptyList();
    }
  }

  @GetMapping(path = "/uploadPostPolicy/{examSessionId:\\d+}")
  public Map<String, String> getPresignedPostPolicy(
    @PathVariable final long examSessionId,
    @RequestParam final String filename,
    final HttpServletRequest request
  ) {
    final String oid = StringUtil.getOidFromRequest(request);
    if (oid == null || oid.isEmpty()) {
      throw new RuntimeException("OID not present");
    }

    // TODO Validate given examSessionId
    //  - exam should exist
    //  - registration period for exam should be open
    //  - other constraints?

    if (featureFlagService.isEnabled(FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED)) {
      final String millis = String.valueOf(System.currentTimeMillis());
      final String extension = FilenameUtils.getExtension(filename);
      final String key = examSessionId + "/" + oid + "/" + millis + "." + extension;
      return s3Service.getPresignedPostRequest(key, extension);
    } else {
      throw new RuntimeException("Not allowed");
    }
  }
}
