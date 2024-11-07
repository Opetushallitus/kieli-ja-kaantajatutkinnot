package fi.oph.vkt.model;

import fi.oph.vkt.model.type.ExamLanguage;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.MappedSuperclass;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class ExamEventCommon extends BaseEntity {

  // TODO Is it ok to assume ExaminerExamEvents also have exactly one language?
  @Column(name = "language", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private ExamLanguage language;

  @Column(name = "date", nullable = false)
  private LocalDate date;

  @Column(name = "is_hidden", nullable = false)
  private boolean isHidden;
}
