package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentDTO;
import fi.oph.vkt.api.dto.examiner.ExaminerEnrollmentAppointmentUpdateDTO;
import fi.oph.vkt.service.ExaminerEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/tv/{oid}/enrollment", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerEnrollmentController {

  @Resource
  private ExaminerEnrollmentService examinerEnrollmentService;

  private static final String TAG_ENROLLMENT = "Examiner enrollment API";

  @PutMapping(path = "/appointment/{enrollmentAppointmentId:\\d+}")
  @Operation(tags = TAG_ENROLLMENT, summary = "Update enrollment appointment")
  public ExaminerEnrollmentAppointmentDTO updateEnrollmentAppointment(
    @RequestBody @Valid final ExaminerEnrollmentAppointmentUpdateDTO dto
  ) {
    return examinerEnrollmentService.updateAppointment(dto);
  }
}
