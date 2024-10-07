package fi.oph.vkt.service;

import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PublicEnrollmentAppointmentService extends AbstractEnrollmentService {

  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;

  public EnrollmentAppointment getEnrollmentAppointmentByHash(
    final long enrollmentAppointmentId,
    final String authHash
  ) {
    return enrollmentAppointmentRepository.findByIdAndAuthHash(enrollmentAppointmentId, authHash).orElseThrow();
  }

  public void savePersonInfo(final long targetId, final Long appointmentId, final Person person) {
    if (targetId != appointmentId) {
      throw new APIException(APIExceptionType.SESSION_APPOINTMENT_ID_MISMATCH);
    }

    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository
      .findById(targetId)
      .orElseThrow();

    if (enrollmentAppointment.getPerson() != null && enrollmentAppointment.getPerson().getId() != person.getId()) {
      throw new APIException(APIExceptionType.SESSION_APPOINTMENT_PERSON_MISMATCH);
    }

    enrollmentAppointment.setPerson(person);
    enrollmentAppointmentRepository.saveAndFlush(enrollmentAppointment);
  }
}
