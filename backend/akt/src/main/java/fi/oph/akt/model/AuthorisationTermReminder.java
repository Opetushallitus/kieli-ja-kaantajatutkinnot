package fi.oph.akt.model;

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

@Getter
@Setter
@Entity
@Table(name = "authorisation_term_reminder")
public class AuthorisationTermReminder extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "authorisation_term_reminder_id", nullable = false)
  private long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "authorisation_id", referencedColumnName = "authorisation_id", nullable = false)
  private Authorisation authorisation;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "email_id", referencedColumnName = "email_id", nullable = false)
  private Email email;
}
