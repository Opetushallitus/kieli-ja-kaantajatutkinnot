package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "participant_onr")
public class ParticipantOnr {

  @Id
  @Column(name = "oid", unique = true, nullable = false)
  private String oid;

  @Column(name = "participant_id", nullable = false)
  private Long participantId;

  @Column(name = "oppijanumero")
  private String oppijanumero;

  @Column(name = "is_individualized")
  private Boolean individualised;

  @Column(name = "modified")
  private LocalDateTime modifiedAt;
}
