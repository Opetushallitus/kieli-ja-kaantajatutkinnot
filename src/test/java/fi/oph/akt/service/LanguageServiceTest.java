package fi.oph.akt.service;

import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LanguageServiceTest {

	private final LanguageService languageService = new LanguageService();

	@Test
	public void testLanguageService() {
		final Set<String> codes = languageService.allLanguageCodes();

		assertEquals(192, codes.size());
		assertFalse(codes.contains(LanguageService.UNOFFICIAL_LANGUAGE));
		assertFalse(codes.contains(LanguageService.UNKNOWN_LANGUAGE));
		assertFalse(codes.contains(LanguageService.OTHER_LANGUAGE));
		assertFalse(codes.contains(LanguageService.SIGN_LANGUAGE));
		assertTrue(codes.contains("FI"));
		assertTrue(codes.contains("SV"));
	}

}