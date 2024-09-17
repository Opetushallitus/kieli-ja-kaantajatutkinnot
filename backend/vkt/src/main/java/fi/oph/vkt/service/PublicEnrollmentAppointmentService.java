package fi.oph.vkt.service;

import fi.oph.vkt.api.dto.FreeEnrollmentAttachmentDTO;
import fi.oph.vkt.api.dto.FreeEnrollmentDetails;
import fi.oph.vkt.api.dto.FreeEnrollmentDetailsDTO;
import fi.oph.vkt.api.dto.PublicEducationDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentCreateDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentDTO;
import fi.oph.vkt.api.dto.PublicEnrollmentInitialisationDTO;
import fi.oph.vkt.api.dto.PublicExamEventDTO;
import fi.oph.vkt.api.dto.PublicFreeEnrollmentBasisDTO;
import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.PublicReservationDTO;
import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.EnrollmentAppointment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.FeatureFlag;
import fi.oph.vkt.model.FreeEnrollment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.Reservation;
import fi.oph.vkt.model.UploadedFileAttachment;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.FreeEnrollmentSource;
import fi.oph.vkt.model.type.FreeEnrollmentType;
import fi.oph.vkt.repository.EnrollmentAppointmentRepository;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.ExamEventRepository;
import fi.oph.vkt.repository.FreeEnrollmentRepository;
import fi.oph.vkt.repository.ReservationRepository;
import fi.oph.vkt.repository.UploadedFileAttachmentRepository;
import fi.oph.vkt.service.aws.S3Service;
import fi.oph.vkt.service.koski.KoskiService;
import fi.oph.vkt.util.EnrollmentUtil;
import fi.oph.vkt.util.ExamEventUtil;
import fi.oph.vkt.util.PersonUtil;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

  public void savePersonInfo(long targetId, Person person) {}
}
