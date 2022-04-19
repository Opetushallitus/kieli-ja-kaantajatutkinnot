package fi.oph.akt.api.clerk;

import fi.oph.akt.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akt.service.ClerkTranslatorService;
import fi.oph.akt.service.LanguageService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.Set;

@RestController
@RequestMapping(value = "/api/v1/clerk/translator", produces = MediaType.APPLICATION_JSON_VALUE)
public class ClerkTranslatorController {

	@Resource
	private ClerkTranslatorService clerkTranslatorService;

	@Resource
	private LanguageService languageService;

	@GetMapping(path = "")
	public ClerkTranslatorResponseDTO list() {
		return clerkTranslatorService.listTranslators();
	}

	@GetMapping(path = "/lang-codes")
	public Set<String> allLanguageCodes() {
		return languageService.allLanguageCodes();
	}

}
