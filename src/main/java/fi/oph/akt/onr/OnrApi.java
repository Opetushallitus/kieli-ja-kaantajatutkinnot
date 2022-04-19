package fi.oph.akt.onr;

import fi.oph.akt.onr.model.HenkiloDto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

abstract class OnrApi {

	public Map<String, TranslatorDetails> getTranslatorDetailsByOids(List<String> oids) {
		List<HenkiloDto> henkiloDtos = getHenkiloDtos(oids);

		Map<String, TranslatorDetails> details = new HashMap<>();

		henkiloDtos.forEach(h -> details.put(h.getOidHenkilo(), TranslatorDetailsFactory.createByHenkiloDto(h)));
		return details;
	}

	abstract List<HenkiloDto> getHenkiloDtos(List<String> oids);

}
