package fi.oph.akt.onr.model.contactDetails;

import java.util.function.Function;

public enum YhteystietoTyyppi {

	YHTEYSTIETO_SAHKOPOSTI(ReadableYhteystiedot::getSahkoposti, WritableYhteystiedot::setSahkoposti),

	YHTEYSTIETO_PUHELINNUMERO(ReadableYhteystiedot::getPuhelinnumero, WritableYhteystiedot::setPuhelinnumero),

	YHTEYSTIETO_MATKAPUHELINNUMERO(ReadableYhteystiedot::getMatkapuhelinnumero,
			WritableYhteystiedot::setMatkapuhelinnumero),

	YHTEYSTIETO_KATUOSOITE(ReadableYhteystiedot::getKatuosoite, WritableYhteystiedot::setKatuosoite),

	YHTEYSTIETO_KUNTA(ReadableYhteystiedot::getKunta, WritableYhteystiedot::setKunta),

	YHTEYSTIETO_POSTINUMERO(ReadableYhteystiedot::getPostinumero, WritableYhteystiedot::setPostinumero),

	YHTEYSTIETO_KAUPUNKI(ReadableYhteystiedot::getKaupunki, WritableYhteystiedot::setKaupunki),

	YHTEYSTIETO_MAA(ReadableYhteystiedot::getMaa, WritableYhteystiedot::setMaa);

	private final Function<ReadableYhteystiedot, String> getter;

	private final Setter<WritableYhteystiedot, String> setter;

	YhteystietoTyyppi(Function<ReadableYhteystiedot, String> getter, Setter<WritableYhteystiedot, String> setter) {
		this.getter = getter;
		this.setter = setter;
	}

	public Function<ReadableYhteystiedot, String> getGetter() {
		return getter;
	}

	public Setter<WritableYhteystiedot, String> getSetter() {
		return setter;
	}

}
