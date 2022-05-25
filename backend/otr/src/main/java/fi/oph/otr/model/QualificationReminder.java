package fi.oph.otr.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "qualification_reminder")
public class QualificationReminder extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "qualification_reminder_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "qualification_id", referencedColumnName = "qualification_id", nullable = false)
  private Qualification qualification;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "email_id", referencedColumnName = "email_id", nullable = false)
  private Email email;
}
