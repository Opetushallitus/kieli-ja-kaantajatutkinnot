package fi.oph.akt.onr;

import fi.oph.akt.onr.model.HenkiloDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// TODO: unfinished implementation
@Service
public class OnrService extends OnrApi {

	private final String onrApiUrl = "https://virkailija.untuvaopintopolku.fi/oppijanumerorekisteri-service";

	WebClient onrClient = WebClient.builder().baseUrl(onrApiUrl)
			.defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
			.defaultHeader("Caller-Id", "1.2.246.562.10.00000000001.akt").build();

	@Override
	public List<HenkiloDto> getHenkiloDtos(List<String> oids) {
		Mono<HenkiloDto[]> response = onrClient.post().uri("/henkilo/henkilotByHenkiloOidList")
				.contentType(MediaType.APPLICATION_JSON).bodyValue(oids).retrieve().bodyToMono(HenkiloDto[].class);

		HenkiloDto[] henkilos = response.block();

		if (henkilos != null) {
			return Arrays.asList(henkilos);
		}
		return new ArrayList<>();
	}

}
