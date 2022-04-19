package fi.oph.akt.service.email;

import fi.oph.akt.api.dto.clerk.InformalEmailRequestDTO;
import fi.oph.akt.model.EmailType;
import fi.oph.akt.model.Translator;
import fi.oph.akt.repository.TranslatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClerkEmailService {

	@Resource
	private final EmailService emailService;

	@Resource
	private final TranslatorRepository translatorRepository;

	@Transactional
	public void createInformalEmails(InformalEmailRequestDTO emailRequestDTO) {
		final List<Long> distinctTranslatorIds = emailRequestDTO.translatorIds().stream().distinct().toList();
		final List<Translator> translators = translatorRepository.findAllById(distinctTranslatorIds);

		if (translators.size() != distinctTranslatorIds.size()) {
			throw new IllegalArgumentException("Each translator by provided translatorIds not found");
		}

		translators.forEach(translator -> {
			// @formatter:off
            // TODO: replace recipient with translator's email address
            EmailData emailData = EmailData.builder()
                    .sender("AKT")
                    .recipient("translator" + translator.getId() + "@test.fi")
                    .subject(emailRequestDTO.subject())
                    .body(emailRequestDTO.body())
                    .build();
            // @formatter:on

			emailService.saveEmail(EmailType.INFORMAL, emailData);
		});
	}

}
