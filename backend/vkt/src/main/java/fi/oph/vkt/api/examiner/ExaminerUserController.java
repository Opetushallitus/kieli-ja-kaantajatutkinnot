package fi.oph.vkt.api.examiner;

import fi.oph.vkt.api.dto.examiner.ExaminerUserDTO;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/tv/user", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExaminerUserController {

  @GetMapping(path = "")
  public ExaminerUserDTO currentExaminerUser() {
    final String oid = SecurityContextHolder.getContext().getAuthentication().getName();
    return ExaminerUserDTO.builder().oid(oid).build();
  }
}
