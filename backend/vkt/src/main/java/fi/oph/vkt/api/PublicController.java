package fi.oph.vkt.api;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.PaymentService;
import fi.oph.vkt.service.PublicAuthService;
import fi.oph.vkt.service.PublicEnrollmentService;
import fi.oph.vkt.service.PublicExamEventService;
import fi.oph.vkt.service.PublicPersonService;
import fi.oph.vkt.service.PublicReservationService;
import fi.oph.vkt.util.SessionUtil;
import java.io.IOException;
import java.util.List;
import java.util.Map;
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

  @PostMapping(path = "/examEvent/{examEventId:\\d+}/reservation")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentInitialisationDTO initialiseEnrollment(
    @PathVariable final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    return publicEnrollmentService.initialiseEnrollment(examEventId, person);
  }

  @PostMapping(path = "/examEvent/{examEventId:\\d+}/queue")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentInitialisationDTO initialiseEnrollmentToQueue(
    @PathVariable final long examEventId,
    final HttpSession session
  ) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    return publicEnrollmentService.initialiseEnrollmentToQueue(examEventId, person);
  }

  @PostMapping(path = "/enrollment/reservation/{reservationId:\\d+}")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentDTO createEnrollment(
    @RequestBody @Valid PublicEnrollmentCreateDTO dto,
    @PathVariable final long reservationId,
    final HttpSession session
  ) throws IOException, InterruptedException {
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

  @DeleteMapping(path = "/reservation/{reservationId:\\d+}")
  public void deleteReservation(@PathVariable final long reservationId, final HttpSession session) {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));

    publicReservationService.deleteReservation(reservationId, person);
  }

  @GetMapping(path = "/auth/login/{examEventId:\\d+}/{type:\\w+}")
  public void casLoginRedirect(
    final HttpServletResponse httpResponse,
    @PathVariable final long examEventId,
    @PathVariable final String type
  ) throws IOException {
    final String casLoginUrl = publicAuthService.createCasLoginUrl(examEventId, type);
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
    final Person person = publicAuthService.createPersonFromTicket(ticket, examEventId, type);
    SessionUtil.setPersonId(session, person.getId());

    if (type.equals("queue")) {
      publicEnrollmentService.initialiseEnrollmentToQueue(examEventId, person);
    } else {
      publicEnrollmentService.initialiseEnrollment(examEventId, person);
    }

    httpResponse.sendRedirect(String.format("http://localhost:4002/vkt/ilmoittaudu/%s/tiedot", examEventId));
  }

  @GetMapping(path = "/auth/info")
  public Person authInfo(final HttpSession session) {
    return publicPersonService.getPerson(SessionUtil.getPersonId(session));
  }

  @GetMapping(path = "/payment/create/{enrollmentId:\\d+}/redirect")
  public void createAndRedirect(
    @PathVariable Long enrollmentId,
    final HttpSession session,
    final HttpServletResponse httpResponse
  ) throws IOException {
    final Person person = publicPersonService.getPerson(SessionUtil.getPersonId(session));
    final String redirectUrl = paymentService.create(enrollmentId, person);

    httpResponse.sendRedirect(redirectUrl);
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/cancel")
  public void paymentCancel(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    final HttpServletResponse httpResponse
  ) throws IOException {
    final String cancelUrl = paymentService.cancel(paymentId, paymentParams);

    httpResponse.sendRedirect(cancelUrl);
  }

  @GetMapping(path = "/payment/{paymentId:\\d+}/success")
  public void paymentSuccess(
    @PathVariable final Long paymentId,
    @RequestParam final Map<String, String> paymentParams,
    final HttpServletResponse httpResponse
  ) throws IOException {
    final String successUrl = paymentService.success(paymentId, paymentParams);

    httpResponse.sendRedirect(successUrl);
  }
}
