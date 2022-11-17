package fi.oph.vkt.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentStatusChangeDTO;
import fi.oph.vkt.api.dto.clerk.ClerkEnrollmentUpdateDTO;
import fi.oph.vkt.service.ClerkEnrollmentService;
import io.swagger.v3.oas.annotations.Operation;
import javax.annotation.Resource;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(
  value = "/api/v1/clerk/enrollment",
  consumes = APPLICATION_JSON_VALUE,
  produces = APPLICATION_JSON_VALUE
)
public class ClerkEnrollmentController {

  private static final String TAG_ENROLLMENT = "Enrollment API";

  @Resource
  private ClerkEnrollmentService clerkEnrollmentService;

  @PutMapping
  @Operation(tags = TAG_ENROLLMENT, summary = "Update enrollment")
  public void updateEnrollment(@RequestBody @Valid final ClerkEnrollmentUpdateDTO dto) {
    clerkEnrollmentService.update(dto);
  }

  @PutMapping(path = "/status")
  @Operation(tags = TAG_ENROLLMENT, summary = "Change enrollment status")
  public void changeStatus(@RequestBody @Valid final ClerkEnrollmentStatusChangeDTO dto) {
    clerkEnrollmentService.changeStatus(dto);
  }
}
