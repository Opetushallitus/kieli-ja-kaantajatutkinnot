package fi.oph.akt.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.akt.api.dto.clerk.ExaminationDateDTO;
import fi.oph.akt.api.dto.clerk.modify.ExaminationDateCreateDTO;
import fi.oph.akt.service.ExaminationDateService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import javax.annotation.Resource;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/v1/clerk/examinationDate", produces = APPLICATION_JSON_VALUE)
public class ExaminationDateController {

  private static final String TAG_EXAMINATION_DATE = "Examination date API";

  @Resource
  private final ExaminationDateService examinationDateService;

  @Operation(tags = TAG_EXAMINATION_DATE, summary = "List examination dates")
  @GetMapping
  public List<ExaminationDateDTO> listExaminationDates() {
    return examinationDateService.listExaminationDatesWithoutAudit();
  }

  @Operation(tags = TAG_EXAMINATION_DATE, summary = "Create examination date")
  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public ExaminationDateDTO createExaminationDate(@RequestBody @Valid final ExaminationDateCreateDTO dto) {
    return examinationDateService.createExaminationDate(dto);
  }

  @Operation(tags = TAG_EXAMINATION_DATE, summary = "Delete examination date")
  @DeleteMapping(path = "/{examinationDateId:\\d+}")
  public void deleteExaminationDate(@PathVariable final long examinationDateId) {
    examinationDateService.deleteExaminationDate(examinationDateId);
  }
}
