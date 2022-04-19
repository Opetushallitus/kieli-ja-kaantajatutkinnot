package fi.oph.akt.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "language_pair")
public class LanguagePair extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "language_pair_id", nullable = false)
	private long id;

	@Size(min = 1, max = 10)
	@Column(name = "from_lang", nullable = false, length = 10)
	private String fromLang;

	@Size(min = 1, max = 10)
	@Column(name = "to_lang", nullable = false, length = 10)
	private String toLang;

	@Column(name = "permission_to_publish", nullable = false)
	private boolean permissionToPublish;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "authorisation_id", referencedColumnName = "authorisation_id", nullable = false)
	private Authorisation authorisation;

}
