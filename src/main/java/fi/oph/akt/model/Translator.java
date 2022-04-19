package fi.oph.akt.model;

import java.util.Collection;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "translator")
public class Translator extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "translator_id", nullable = false)
	private long id;

	@Column(name = "onr_oid", nullable = false)
	private String onrOid;

	@OneToMany(mappedBy = "translator")
	private Collection<Authorisation> authorisations;

	@OneToMany(mappedBy = "translator")
	private Collection<ContactRequestTranslator> contactRequestTranslators;

}
