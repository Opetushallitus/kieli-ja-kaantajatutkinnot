package fi.oph.vkt.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.FeatureFlag;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.AppLocale;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.FeatureFlagService;
import fi.oph.vkt.service.PaymentService;
import fi.oph.vkt.service.PublicAuthService;
import fi.oph.vkt.service.PublicEnrollmentService;
import fi.oph.vkt.service.PublicExamEventService;
import fi.oph.vkt.service.PublicPersonService;
import fi.oph.vkt.service.PublicReservationService;
import fi.oph.vkt.service.aws.S3Service;
import fi.oph.vkt.service.koski.KoskiService;
import fi.oph.vkt.service.koski.dto.KoskiResponseDTO;
import fi.oph.vkt.util.SessionUtil;
import fi.oph.vkt.util.UIRouteUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.NotFoundException;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  private static final Logger LOG = LoggerFactory.getLogger(PublicController.class);

  @Resource
  private PublicPersonService publicPersonService;

  @Resource
  private PublicEnrollmentService publicEnrollmentService;

  @Resource
  private PublicExamEventService publicExamEventService;

  @Resource
  private PublicAuthService publicAuthService;

  @Resource
  private PaymentService paymentService;

  @Resource
  private PublicReservationService publicReservationService;

  @Resource
  private KoskiService koskiService;

  @Resource
  private UIRouteUtil uiRouteUtil;

  @Resource
  private FeatureFlagService featureFlagService;

  @Resource
  private S3Service s3Service;

  @GetMapping(path = "/examEvent")
  public List<PublicExamEventDTO> list() {
    return publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
  }

  @PostMapping(path = "/enrollment/reservation/{reservationId:\\d+}")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentDTO createEnrollment(
    @RequestBody @Valid final PublicEnrollmentCreateDTO dto,
    @PathVariable final long reservationId,
    final HttpSession session
  ) {
    final Person person = publicAuthService.getPersonFromSession(session);

    // TODO this might need separate endpoint?
    if (dto.isFree() && featureFlagService.isEnabled(FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED)) {
      return publicEnrollmentService.createFreeEnrollment(dto, reservationId, person);
    }

    return publicEnrollmentService.createEnrollment(dto, reservationId, person);
  }

  @PostMapping(path = "/enrollment/update")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentDTO updateEnrollment(
    @RequestBody @Valid final PublicEnrollmentCreateDTO dto,
    @RequestParam final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicAuthService.getPersonFromSession(session);

    // TODO this might need separate endpoint?
    if (dto.isFree() && featureFlagService.isEnabled(FeatureFlag.FREE_ENROLLMENT_FOR_HIGHEST_LEVEL_ALLOWED)) {
      return publicEnrollmentService.updateEnrollmentForFree(dto, examEventId, person);
    }

    return publicEnrollmentService.updateEnrollmentForPayment(dto, examEventId, person);
  }

  @PostMapping(path = "/enrollment/queue")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentDTO createEnrollmentToQueue(
    @RequestBody @Valid final PublicEnrollmentCreateDTO dto,
    @RequestParam final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicAuthService.getPersonFromSession(session);

    return publicEnrollmentService.createEnrollmentToQueue(dto, examEventId, person);
  }

  /**
   * Returns info about exam event when refreshing a page during authenticate step
   */
  @GetMapping(path = "/examEvent/{examEventId:\\d+}")
  public PublicExamEventDTO getExamEventInfo(@PathVariable final long examEventId) {
    return publicExamEventService.getExamEvent(examEventId);
  }

  /**
   * TODO: remove this
   */
  @GetMapping(path = "/education")
  public List<PublicEducationDTO> getEducation(final HttpSession session) throws JsonProcessingException {
    final Person person = publicAuthService.getPersonFromSession(session);

    return koskiService.findEducations("1.2.246.562.24.97984579806"/* person.getOid() */);
  }

  /**
   * Returns info about enrollment when refreshing a page during an enrollment step
   */
  @GetMapping(path = "/examEvent/{examEventId:\\d+}/enrollment")
  public PublicEnrollmentInitialisationDTO getEnrollmentInfo(
    @PathVariable final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicAuthService.getPersonFromSession(session);

    return publicEnrollmentService.getEnrollmentInitialisationDTO(examEventId, person);
  }

  @PutMapping(path = "/reservation/{reservationId:\\d+}/renew")
  public PublicReservationDTO renewReservation(@PathVariable final long reservationId, final HttpSession session) {
    final Person person = publicAuthService.getPersonFromSession(session);

    return publicReservationService.renewReservation(reservationId, person);
  }

  @GetMapping(path = "/examEvent/{examEventId:\\d+}/redirect/{paymentLinkHash:[a-z0-9\\-]+}")
  public void createSessionAndRedirectToPreview(
    final HttpServletResponse httpResponse,
    @PathVariable final long examEventId,
    @PathVariable final String paymentLinkHash,
    final HttpSession session
  ) throws IOException {
    try {
      final Enrollment enrollment = publicEnrollmentService.getEnrollmentByExamEventAndPaymentLink(
        examEventId,
        paymentLinkHash
      );
      SessionUtil.setPersonId(session, enrollment.getPerson().getId());

      httpResponse.sendRedirect(uiRouteUtil.getEnrollmentPreviewUrl(examEventId));
    } catch (final APIException e) {
      LOG.warn("Encountered known error, redirecting to front page. Error:", e);
      httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithError(e.getExceptionType()));
    } catch (final Exception e) {
      LOG.error("Encountered unknown error, redirecting to front page. Error:", e);
      httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithGenericError());
    }
  }

  @DeleteMapping(path = "/reservation/{reservationId:\\d+}")
  public void deleteReservation(@PathVariable final long reservationId, final HttpSession session) {
    final Person person = publicAuthService.getPersonFromSession(session);

    publicReservationService.deleteReservation(reservationId, person);
  }

  @GetMapping(path = "/auth/login/{examEventId:\\d+}/{type:\\w+}")
  public void casLoginRedirect(
    final HttpServletResponse httpResponse,
    @PathVariable final long examEventId,
    @PathVariable final String type,
    @RequestParam final Optional<String> locale,
    final HttpSession session
  ) throws IOException {
    final String casLoginUrl = publicAuthService.createCasLoginUrl(
      examEventId,
      EnrollmentType.fromString(type),
      locale.isPresent() ? AppLocale.fromString(locale.get()) : AppLocale.FI
    );

    if (session != null) {
      session.invalidate();
    }

    httpResponse.sendRedirect(casLoginUrl);
  }

  @GetMapping(path = "/auth/validate/{examEventId:\\d+}/{type:\\w+}")
  public void validateTicket(
    @RequestParam final String ticket,
    @PathVariable final long examEventId,
    @PathVariable final String type,
    final HttpSession session,
    final HttpServletResponse httpResponse
  ) throws IOException {
    try {
      final EnrollmentType enrollmentType = EnrollmentType.fromString(type);
      final Person person = publicAuthService.createPersonFromTicket(ticket, examEventId, enrollmentType);
      SessionUtil.setPersonId(session, person.getId());

      if (enrollmentType.equals(EnrollmentType.QUEUE)) {
        publicEnrollmentService.initialiseEnrollmentToQueue(examEventId, person);
      } else {
        publicEnrollmentService.initialiseEnrollment(examEventId, person);
      }

      httpResponse.sendRedirect(uiRouteUtil.getEnrollmentContactDetailsUrl(examEventId));
    } catch (final APIException e) {
      LOG.warn("Encountered known error, redirecting to front page. Error:", e);
      httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithError(e.getExceptionType()));
    } catch (final Exception e) {
      LOG.error("Encountered unknown error, redirecting to front page. Error message:", e);
      httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithGenericError());
    }
  }

  @GetMapping(path = "/auth/info")
  public Optional<PublicPersonDTO> authInfo(final HttpSession session) {
    if (session == null) {
      return Optional.empty();
    }

    try {
      return Optional.of(publicPersonService.getPersonDTO(publicAuthService.getPersonFromSession(session)));
    } catch (final NotFoundException e) {
      session.invalidate();

      return Optional.empty();
    }
  }

  @GetMapping(path = "/auth/logout")
  public void logout(final HttpSession session, final HttpServletResponse httpResponse) throws IOException {
    if (session != null) {
      publicAuthService.logout(session);
      session.invalidate();
    }

    httpResponse.sendRedirect(publicAuthService.createCasLogoutUrl());
  }

  @GetMapping(path = "/payment/create/{enrollmentId:\\d+}/redirect")
  public void createPaymentAndRedirect(
    @PathVariable final Long enrollmentId,
    @RequestParam final Optional<String> locale,
    final HttpSession session,
    final HttpServletResponse httpResponse
  ) throws IOException {
    try {
      final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));
      final String redirectUrl = paymentService.createPaymentForEnrollment(
        enrollmentId,
        person,
        locale.isPresent() ? AppLocale.fromString(locale.get()) : AppLocale.FI
      );

      httpResponse.sendRedirect(redirectUrl);
    } catch (final APIException e) {
      LOG.warn("Encountered known error, redirecting to front page. Error:", e);
      httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithError(e.getExceptionType()));
    } catch (final Exception e) {
      LOG.error("Encountered unknown error, redirecting to front page. Error:", e);
      httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithGenericError());
    }
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/success")
  public void paymentSuccess(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    @RequestParam final Optional<Boolean> callback,
    final HttpServletResponse httpResponse
  ) throws IOException {
    handleFinalizePayment(
      paymentId,
      paymentParams,
      callback,
      httpResponse,
      paymentService::getFinalizePaymentSuccessRedirectUrl
    );
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/cancel")
  public void paymentCancel(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    @RequestParam final Optional<Boolean> callback,
    final HttpServletResponse httpResponse
  ) throws IOException {
    handleFinalizePayment(
      paymentId,
      paymentParams,
      callback,
      httpResponse,
      paymentService::getFinalizePaymentCancelRedirectUrl
    );
  }

  private void handleFinalizePayment(
    final Long paymentId,
    final Map<String, String> paymentParams,
    final Optional<Boolean> callback,
    final HttpServletResponse httpResponse,
    final Function<Long, String> getRedirectUrlFunction
  ) throws IOException {
    try {
      paymentService.finalizePayment(paymentId, paymentParams);
      final String redirectUrl = getRedirectUrlFunction.apply(paymentId);

      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.OK.value());
      } else {
        httpResponse.sendRedirect(redirectUrl);
      }
    } catch (final APIException e) {
      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.BAD_REQUEST.value());
      } else {
        LOG.warn("Encountered known error, redirecting to front page. Error:", e);
        httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithError(e.getExceptionType()));
      }
    } catch (final Exception e) {
      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
      } else {
        LOG.error("Encountered unknown error, redirecting to front page. Error:", e);
        httpResponse.sendRedirect(uiRouteUtil.getPublicFrontPageUrlWithGenericError());
      }
    }
  }

  @GetMapping(path = "/featureFlags")
  public Map<String, Boolean> getFeatureFlags() {
    return Arrays
      .stream(FeatureFlag.values())
      .collect(Collectors.toMap(FeatureFlag::getPropertyKey, f -> featureFlagService.isEnabled(f)));
  }

  // TODO Restrict access. Perhaps endpoint is only needed for clerk usage?
  // TODO Perhaps this could just redirect to the URL?
  @GetMapping(path = "/presign")
  public String getPresignedUrl(@RequestParam final String key) {
    return s3Service.getPresignedUrl(key);
  }

  @GetMapping(path = "/uploadPostPolicy/{examEventId:\\d+}")
  public Map<String, String> getPresignedPostPolicy(
    @PathVariable final long examEventId,
    @RequestParam final String filename,
    final HttpSession session
  ) {
    Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));
    return publicEnrollmentService.getPresignedPostRequest(examEventId, person, filename);
  }
}
