package fi.oph.akt.onr.model.contactDetails;

import lombok.AllArgsConstructor;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

@AllArgsConstructor
public class ContactDetailsDto implements Serializable {

	private static final long serialVersionUID = 4785135498967497621L;

	@NotNull
	private final YhteystietoTyyppi yhteystietoTyyppi;

	private final String yhteystietoArvo;

	public YhteystietoTyyppi getYhteystietoTyyppi() {
		return yhteystietoTyyppi;
	}

	public String getValue() {
		return yhteystietoArvo;
	}

}
