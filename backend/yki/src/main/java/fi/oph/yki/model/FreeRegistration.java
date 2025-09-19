package fi.oph.yki.model;

import fi.oph.yki.model.type.FreeRegisterSource;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "free_registration")
public class FreeRegistration {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "free_registration_id", nullable = false)
  private long id;

  @OneToOne(mappedBy = "freeRegistration", fetch = FetchType.LAZY, optional = false)
  private Registration registration;

  @Column(name = "source", nullable = false)
  @Enumerated(value = EnumType.STRING)
  private FreeRegisterSource source;

  @Column(name = "matriculation_exam", nullable = false)
  private Boolean matriculationExam;

  @Column(name = "higher_education_concluded", nullable = false)
  private Boolean higherEducationConcluded;

  @Column(name = "higher_education_enrolled", nullable = false)
  private Boolean higherEducationEnrolled;

  @Column(name = "eb", nullable = false)
  private Boolean eb;

  @Column(name = "dia", nullable = false)
  private Boolean dia;

  @Column(name = "other", nullable = false)
  private Boolean other;
}
