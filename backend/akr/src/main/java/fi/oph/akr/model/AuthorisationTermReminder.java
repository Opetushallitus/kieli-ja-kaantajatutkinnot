package fi.oph.akr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
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
