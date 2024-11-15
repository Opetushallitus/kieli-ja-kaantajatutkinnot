package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.ExaminerExamEvent;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.ExaminerExamEventRepository;
import fi.oph.vkt.repository.ExaminerRepository;
import fi.oph.vkt.util.ClerkEnrollmentUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExaminerEnrollmentService extends AbstractEnrollmentService {

  private final EnrollmentAppointmentRepository enrollmentAppointmentRepository;
  private final ExaminerExamEventRepository examinerExamEventRepository;
  private final Environment environment;

  @Transactional
  public ExaminerEnrollmentAppointmentDTO updateAppointment(final ExaminerEnrollmentAppointmentUpdateDTO dto) {
    final EnrollmentAppointment enrollmentAppointment = enrollmentAppointmentRepository.getReferenceById(dto.id());
    final String baseUrlAPI = environment.getRequiredProperty("app.base-url.api");

    enrollmentAppointment.assertVersion(dto.version());

    if (dto.examEvent() != null) {
      final ExaminerExamEvent examinerExamEvent = examinerExamEventRepository.getReferenceById(dto.examEvent());
      enrollmentAppointment.setExaminerExamEvent(examinerExamEvent);
    }

    copyDtoFieldsToEnrollment(enrollmentAppointment, dto);
    enrollmentAppointmentRepository.flush();

    return ClerkEnrollmentUtil.createClerkEnrollmentAppointmentDTO(enrollmentAppointment, baseUrlAPI);
  }
}
