package fi.oph.vkt.api;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentType;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.PaymentService;
import fi.oph.vkt.service.PublicAuthService;
import fi.oph.vkt.service.PublicEnrollmentService;
import fi.oph.vkt.service.PublicExamEventService;
import fi.oph.vkt.service.PublicPersonService;
import fi.oph.vkt.service.PublicReservationService;
import fi.oph.vkt.util.SessionUtil;
import fi.oph.vkt.util.exception.APIException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;
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

  @GetMapping(path = "/examEvent")
  public List<PublicExamEventDTO> list() {
    return publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
  }

  @PostMapping(path = "/enrollment/reservation/{reservationId:\\d+}")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentDTO createEnrollment(
    @RequestBody @Valid PublicEnrollmentCreateDTO dto,
    @PathVariable final long reservationId,
    final HttpSession session
  ) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    return publicEnrollmentService.createEnrollment(dto, reservationId, person);
  }

  @PostMapping(path = "/enrollment/queue")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentDTO createEnrollmentToQueue(
    @RequestBody @Valid PublicEnrollmentCreateDTO dto,
    @RequestParam final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    return publicEnrollmentService.createEnrollmentToQueue(dto, examEventId, person.getId());
  }

  @GetMapping(path = "/examEvent/{examEventId:\\d+}")
  public PublicEnrollmentInitialisationDTO getEnrollmentInfo(
    @PathVariable final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    return publicEnrollmentService.getEnrollmentInitialisationDTO(examEventId, person);
  }

  @PutMapping(path = "/reservation/{reservationId:\\d+}/renew")
  public PublicReservationDTO renewReservation(@PathVariable final long reservationId, final HttpSession session) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    return publicReservationService.renewReservation(reservationId, person);
  }

  @GetMapping(path = "/examEvent/{examEventId:\\d+}/redirect/{personHash:[a-z0-9\\-]+}")
  public void createSessionAndRedirectToPreview(
    final HttpServletResponse httpResponse,
    @PathVariable final long examEventId,
    @PathVariable final String personHash,
    final HttpSession session
  ) throws IOException {
    final Person person = publicPersonService.getPersonByHash(personHash);
    SessionUtil.setPersonId(session, person.getId());

    httpResponse.sendRedirect(publicAuthService.getPreviewUrl(examEventId));
  }

  @DeleteMapping(path = "/reservation/{reservationId:\\d+}")
  public void deleteReservation(@PathVariable final long reservationId, final HttpSession session) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    publicReservationService.deleteReservation(reservationId, person);
  }

  @GetMapping(path = "/auth/login/{examEventId:\\d+}/{type:\\w+}")
  public void casLoginRedirect(
    final HttpServletResponse httpResponse,
    @PathVariable final long examEventId,
    @PathVariable final String type,
    final HttpSession session
  ) throws IOException {
    final String casLoginUrl = publicAuthService.createCasLoginUrl(examEventId, EnrollmentType.fromString(type));

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

      httpResponse.sendRedirect(publicAuthService.getEnrollmentContactDetailsURL(examEventId));
    } catch (APIException e) {
      httpResponse.sendRedirect(publicAuthService.getErrorUrl(e.getExceptionType()));
    } catch (Exception e) {
      httpResponse.sendRedirect(publicAuthService.getErrorUrl());
    }
  }

  @GetMapping(path = "/auth/info")
  public Person authInfo(final HttpSession session) {
    return publicPersonService.getPerson(SessionUtil.getPersonId(session));
  }

  @GetMapping(path = "/payment/create/{enrollmentId:\\d+}/redirect")
  public void createPaymentAndRedirect(
    @PathVariable Long enrollmentId,
    final HttpSession session,
    final HttpServletResponse httpResponse
  ) throws IOException {
    try {
      final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));
      final String redirectUrl = paymentService.createPaymentForEnrollment(enrollmentId, person);

      httpResponse.sendRedirect(redirectUrl);
    } catch (APIException e) {
      httpResponse.sendRedirect(publicAuthService.getErrorUrl(e.getExceptionType()));
    } catch (Exception e) {
      httpResponse.sendRedirect(publicAuthService.getErrorUrl());
    }
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/cancel")
  public void paymentCancel(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    @RequestParam final Optional<Boolean> callback,
    final HttpServletResponse httpResponse
  ) throws IOException {
    try {
      final String cancelUrl = paymentService.cancel(paymentId, paymentParams);

      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.OK.value());
      } else {
        httpResponse.sendRedirect(cancelUrl);
      }
    } catch (APIException e) {
      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.BAD_REQUEST.value());
      } else {
        httpResponse.sendRedirect(publicAuthService.getErrorUrl(e.getExceptionType()));
      }
    } catch (Exception e) {
      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
      } else {
        httpResponse.sendRedirect(publicAuthService.getErrorUrl());
      }
    }
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/success")
  public void paymentSuccess(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    @RequestParam final Optional<Boolean> callback,
    final HttpServletResponse httpResponse
  ) throws IOException {
    try {
      final String successUrl = paymentService.success(paymentId, paymentParams);

      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.OK.value());
      } else {
        httpResponse.sendRedirect(successUrl);
      }
    } catch (APIException e) {
      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.BAD_REQUEST.value());
      } else {
        httpResponse.sendRedirect(publicAuthService.getErrorUrl(e.getExceptionType()));
      }
    } catch (Exception e) {
      if (callback.isPresent() && callback.get()) {
        httpResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
      } else {
        httpResponse.sendRedirect(publicAuthService.getErrorUrl());
      }
    }
  }
}
