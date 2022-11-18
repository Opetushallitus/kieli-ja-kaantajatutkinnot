package fi.oph.vkt.api;

import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLevel;
import fi.oph.vkt.service.PublicExamEventService;
import fi.oph.vkt.service.PublicIdentificationService;
import fi.oph.vkt.service.PublicReservationService;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/examEvent", produces = MediaType.APPLICATION_JSON_VALUE)
public class PublicController {

  @Resource
  private PublicExamEventService publicExamEventService;

  @Resource
  private PublicIdentificationService publicIdentificationService;

  @Resource
  private PublicReservationService publicReservationService;

  @GetMapping
  public List<PublicExamEventDTO> list() {
    return publicExamEventService.listExamEvents(ExamLevel.EXCELLENT);
  }

  @PostMapping(path = "/{examEventId:\\d+}/reservation")
  @ResponseStatus(HttpStatus.CREATED)
  public PublicReservationDTO identifyAndCreateReservation(@PathVariable final long examEventId) {
    final Person person = publicIdentificationService.identify();

    return publicReservationService.createReservation(examEventId, person);
  }

  @DeleteMapping(path = "/reservation/{reservationId:\\d+}")
  public void deleteReservation(@PathVariable final long reservationId) {
    publicReservationService.deleteReservation(reservationId);
  }
}
