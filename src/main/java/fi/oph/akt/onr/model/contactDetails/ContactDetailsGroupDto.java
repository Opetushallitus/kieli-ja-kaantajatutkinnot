package fi.oph.akt.onr.model.contactDetails;

import javax.validation.Valid;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

public class ContactDetailsGroupDto implements Serializable {

	private static final long serialVersionUID = 7820975061439666995L;

	private Long id;

	private String ryhmaKuvaus;

	private String ryhmaAlkuperaTieto;

	private boolean readOnly;

	@Valid
	private Set<ContactDetailsDto> yhteystieto = new HashSet<>();

	public String getType() {
		return ryhmaKuvaus;
	}

	public String getSource() {
		return ryhmaAlkuperaTieto;
	}

	public Set<ContactDetailsDto> getDetailsSet() {
		return yhteystieto;
	}

	public void setType(String type) {
		this.ryhmaKuvaus = type;
	}

	public void setSource(String source) {
		this.ryhmaAlkuperaTieto = source;
	}

	public void setDetailsSet(Set<ContactDetailsDto> detailsSet) {
		this.yhteystieto = detailsSet;
	}

}
