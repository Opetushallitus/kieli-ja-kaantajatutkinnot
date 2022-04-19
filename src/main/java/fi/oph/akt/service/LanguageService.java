package fi.oph.akt.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.NonNull;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class LanguageService {

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	static final String UNOFFICIAL_LANGUAGE = "98";
	static final String UNKNOWN_LANGUAGE = "99";
	static final String OTHER_LANGUAGE = "XX";
	static final String SIGN_LANGUAGE = "VK";

	private static final Set<String> IGNORED_LANGUAGE_CODES = Set.of(UNOFFICIAL_LANGUAGE, UNKNOWN_LANGUAGE,
			OTHER_LANGUAGE, SIGN_LANGUAGE);

	@Cacheable("koodistoLanguageCodes")
	public Set<String> allLanguageCodes() {
		try (final InputStream is = new ClassPathResource("koodisto/koodisto_kielet.json").getInputStream()) {
			final List<KoodistoLang> koodistoLanguages = deserializeJson(is);
			final List<KoodistoLang> filteredLanguages = koodistoLanguages.stream()
					.filter(k -> !IGNORED_LANGUAGE_CODES.contains(k.koodiArvo)).toList();
			return filteredLanguages.stream().map(KoodistoLang::koodiArvo).collect(Collectors.toSet());
		}
		catch (final IOException e) {
			throw new RuntimeException(e);
		}
	}

	private List<KoodistoLang> deserializeJson(final InputStream is) throws IOException {
		return OBJECT_MAPPER.readValue(is, new TypeReference<>() {
		});
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record KoodistoLang(@NonNull String koodiArvo, @NonNull List<KoodistoLangMeta> metadata) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record KoodistoLangMeta(@NonNull String kieli, @NonNull String nimi) {
	}

}
