package fi.oph.akt.model;

import java.time.LocalDate;
import java.util.Collection;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
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
@Table(name = "authorisation")
public class Authorisation extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "authorisation_id", nullable = false)
	private long id;

	@Column(name = "aut_date")
	private LocalDate autDate;

	@Column(name = "kkt_check")
	private String kktCheck;

	@Column(name = "vir_date")
	private LocalDate virDate;

	@Column(name = "assurance_date")
	private LocalDate assuranceDate;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "translator_id", referencedColumnName = "translator_id", nullable = false)
	private Translator translator;

	@Column(name = "basis", nullable = false)
	@Enumerated(value = EnumType.STRING)
	private AuthorisationBasis basis;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "meeting_date_id", referencedColumnName = "meeting_date_id")
	private MeetingDate meetingDate;

	@OneToMany(mappedBy = "authorisation")
	private Collection<LanguagePair> languagePairs;

	@OneToMany(mappedBy = "authorisation")
	private Collection<AuthorisationTerm> terms;

}
