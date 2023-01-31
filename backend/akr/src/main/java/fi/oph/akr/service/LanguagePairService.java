package fi.oph.akr.service;

import fi.oph.akr.service.koodisto.LanguageService;
import fi.oph.akr.util.localisation.Language;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LanguagePairService {

  private final LanguageService languageService;

  public String getLanguagePairLocalisation(
    final String fromLangCode,
    final String toLangCode,
    final Language language
  ) {
    return (
      languageService.getLocalisationValue(fromLangCode, language).orElse(fromLangCode) +
      " - " +
      languageService.getLocalisationValue(toLangCode, language).orElse(toLangCode)
    );
  }
}
