package fi.oph.akt.onr.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@AllArgsConstructor
@Getter
@Setter
public class KielisyysDto implements Serializable {

	private static final long serialVersionUID = 7217945009330980201L;

	private String kieliKoodi;

	private String kieliTyyppi;

}
