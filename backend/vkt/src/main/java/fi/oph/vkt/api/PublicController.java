package fi.oph.vkt.api;

import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.PublicEnrollmentService;
import fi.oph.vkt.service.PublicExamEventService;
import fi.oph.vkt.service.PublicIdentificationService;
import fi.oph.vkt.service.PublicReservationService;
import java.util.List;
import javax.annotation.Resource;
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
  private PublicEnrollmentService publicEnrollmentService;

  @Resource
  private PublicExamEventService publicExamEventService;

  @Resource
  private PublicIdentificationService publicIdentificationService;

  @Resource
  private PublicReservationService publicReservationService;

  @GetMapping(path = "/examEvent")
  public List<PublicExamEventDTO> list() {
    return publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
  }

  @PostMapping(path = "/examEvent/{examEventId:\\d+}/reservation")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentInitialisationDTO initialiseEnrollment(@PathVariable final long examEventId) {
    final Person person = publicIdentificationService.identify();

    return publicEnrollmentService.initialiseEnrollment(examEventId, person);
  }

  @PostMapping(path = "/examEvent/{examEventId:\\d+}/queue")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicEnrollmentInitialisationDTO initialiseEnrollmentToQueue(@PathVariable final long examEventId) {
    final Person person = publicIdentificationService.identify();

    return publicEnrollmentService.initialiseEnrollmentToQueue(examEventId, person);
  }

  // TODO: check identity of the caller
  @PostMapping(path = "/enrollment/reservation/{reservationId:\\d+}")
  @ResponseStatus(HttpStatus.CREATED)
  public void createEnrollment(
    @RequestBody @Valid PublicEnrollmentCreateDTO dto,
    @PathVariable final long reservationId
  ) {
    publicEnrollmentService.createEnrollment(dto, reservationId);
  }

  // TODO: check identity of the caller
  @PostMapping(path = "/enrollment/queue")
  @ResponseStatus(HttpStatus.CREATED)
  public void createEnrollmentToQueue(
    @RequestBody @Valid PublicEnrollmentCreateDTO dto,
    @RequestParam final long examEventId,
    @RequestParam final long personId
  ) {
    publicEnrollmentService.createEnrollmentToQueue(dto, examEventId, personId);
  }

  @PutMapping(path = "/reservation/{reservationId:\\d+}/renew")
  public PublicReservationDTO renewReservation(@PathVariable final long reservationId) {
    // TODO: get identity from session and check that it belongs to this reservation?
    return publicReservationService.renewReservation(reservationId);
  }

  @DeleteMapping(path = "/reservation/{reservationId:\\d+}")
  public void deleteReservation(@PathVariable final long reservationId) {
    publicReservationService.deleteReservation(reservationId);
  }
}
