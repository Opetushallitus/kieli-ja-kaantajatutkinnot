package fi.oph.akt.model;

import java.time.LocalDate;
import java.util.Collection;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "authorisation_term")
public class AuthorisationTerm extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "authorisation_term_id", nullable = false)
	private long id;

	@Column(name = "begin_date", nullable = false)
	private LocalDate beginDate;

	@Column(name = "end_date")
	private LocalDate endDate;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "authorisation_id", referencedColumnName = "authorisation_id", nullable = false)
	private Authorisation authorisation;

	@OneToMany(mappedBy = "authorisationTerm")
	private Collection<AuthorisationTermReminder> reminders;

}
