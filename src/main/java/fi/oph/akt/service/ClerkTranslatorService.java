package fi.oph.akt.service;

import fi.oph.akt.api.dto.LanguagePairsDictDTO;
import fi.oph.akt.api.dto.clerk.AuthorisationTermDTO;
import fi.oph.akt.api.dto.clerk.ClerkLanguagePairDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorAuthorisationDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorContactDetailsDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorDTO;
import fi.oph.akt.api.dto.clerk.ClerkTranslatorResponseDTO;
import fi.oph.akt.model.Translator;
import fi.oph.akt.onr.TranslatorDetails;
import fi.oph.akt.onr.OnrServiceMock;
import fi.oph.akt.repository.AuthorisationLanguagePairProjection;
import fi.oph.akt.repository.AuthorisationRepository;
import fi.oph.akt.repository.AuthorisationTermProjection;
import fi.oph.akt.repository.AuthorisationTermRepository;
import fi.oph.akt.repository.TranslatorAuthorisationProjection;
import fi.oph.akt.repository.LanguagePairRepository;
import fi.oph.akt.repository.TranslatorRepository;
import fi.oph.akt.util.AuthorisationTermProjectionComparator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StopWatch;

import javax.annotation.Resource;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ClerkTranslatorService {

	private static final Logger LOG = LoggerFactory.getLogger(ClerkTranslatorService.class);

	private static final AuthorisationTermProjectionComparator authorisationTermProjectionComparator = new AuthorisationTermProjectionComparator();

	@Resource
	private final AuthorisationRepository authorisationRepository;

	@Resource
	private final AuthorisationTermRepository authorisationTermRepository;

	@Resource
	private final LanguagePairRepository languagePairRepository;

	@Resource
	private final TranslatorRepository translatorRepository;

	@Resource
	// TODO (OPHAKTKEH-52): use actual API outside local environment
	private final OnrServiceMock onrServiceMock;

	@Transactional(readOnly = true)
	public ClerkTranslatorResponseDTO listTranslators() {
		final StopWatch st = new StopWatch();

		st.start("translatorRepository.findAll");
		final List<Translator> translators = translatorRepository.findAll();
		st.stop();

		st.start("getTranslatorsDetails");
		final Map<String, TranslatorDetails> translatorDetails = getTranslatorsDetails(translators.stream());
		st.stop();

		st.start("getTranslatorAuthorisationProjections");
		final Map<Long, List<TranslatorAuthorisationProjection>> translatorAuthProjections = getTranslatorAuthorisationProjections();
		st.stop();

		st.start("getAuthorisationLanguagePairProjections");
		final Map<Long, List<AuthorisationLanguagePairProjection>> authLanguagePairProjections = getAuthorisationLanguagePairProjections();
		st.stop();

		st.start("getAuthorisationTermProjections");
		final Map<Long, List<AuthorisationTermProjection>> authTermProjections = getAuthorisationTermProjections();
		st.stop();

		st.start("createClerkTranslatorDTOs");
		List<ClerkTranslatorDTO> clerkTranslatorDTOS = createClerkTranslatorDTOs(translators, translatorDetails,
				translatorAuthProjections, authLanguagePairProjections, authTermProjections);
		st.stop();

		st.start("getLanguagePairsDictDTO");
		LanguagePairsDictDTO languagePairsDictDTO = getLanguagePairsDictDTO();
		st.stop();

		st.start("getDistinctTowns");
		List<String> towns = getDistinctTowns(translatorDetails.values());
		st.stop();

		LOG.info(st.prettyPrint());

		// @formatter:off
		return ClerkTranslatorResponseDTO.builder()
				.translators(clerkTranslatorDTOS)
				.langs(languagePairsDictDTO)
				.towns(towns)
				.build();
		// @formatter:on
	}

	private Map<String, TranslatorDetails> getTranslatorsDetails(final Stream<Translator> translators) {
		return onrServiceMock.getTranslatorDetailsByOids(translators.map(Translator::getOnrOid).toList());
	}

	private Map<Long, List<TranslatorAuthorisationProjection>> getTranslatorAuthorisationProjections() {
		return authorisationRepository.listTranslatorAuthorisationProjections().stream()
				.collect(Collectors.groupingBy(TranslatorAuthorisationProjection::translatorId));
	}

	private Map<Long, List<AuthorisationLanguagePairProjection>> getAuthorisationLanguagePairProjections() {
		return languagePairRepository.listAuthorisationLanguagePairProjections().stream()
				.collect(Collectors.groupingBy(AuthorisationLanguagePairProjection::authorisationId));
	}

	private Map<Long, List<AuthorisationTermProjection>> getAuthorisationTermProjections() {
		return authorisationTermRepository.listAuthorisationTermProjections().stream()
				.collect(Collectors.groupingBy(AuthorisationTermProjection::authorisationId));
	}

	private List<ClerkTranslatorDTO> createClerkTranslatorDTOs(final List<Translator> translators,
			final Map<String, TranslatorDetails> translatorDetails,
			final Map<Long, List<TranslatorAuthorisationProjection>> translatorAuthProjections,
			final Map<Long, List<AuthorisationLanguagePairProjection>> authLanguagePairProjections,
			final Map<Long, List<AuthorisationTermProjection>> authTermProjections) {

		return translators.stream().map(translator -> {
			final TranslatorDetails details = translatorDetails.get(translator.getOnrOid());

			final List<TranslatorAuthorisationProjection> authorisations = translatorAuthProjections
					.get(translator.getId());

			final Map<Long, List<AuthorisationLanguagePairProjection>> languagePairs = new HashMap<>();
			final Map<Long, List<AuthorisationTermProjection>> terms = new HashMap<>();

			authorisations.stream().map(TranslatorAuthorisationProjection::authorisationId).forEach(aId -> {
				languagePairs.put(aId, authLanguagePairProjections.get(aId));

				// `authTermProjections.get(aId)` may be null
				terms.put(aId, authTermProjections.get(aId));
			});

			return createClerkTranslatorDTO(translator, details, authorisations, languagePairs, terms);
		}).toList();
	}

	private ClerkTranslatorDTO createClerkTranslatorDTO(Translator translator, TranslatorDetails translatorDetails,
			List<TranslatorAuthorisationProjection> authProjections,
			Map<Long, List<AuthorisationLanguagePairProjection>> languagePairProjections,
			Map<Long, List<AuthorisationTermProjection>> termProjections) {

		ClerkTranslatorContactDetailsDTO contactDetailsDTO = getContactDetailsDTO(translatorDetails);
		List<ClerkTranslatorAuthorisationDTO> authorisationDTOS = getAuthorisationDTOs(authProjections,
				languagePairProjections, termProjections);

		return ClerkTranslatorDTO.builder().id(translator.getId()).contactDetails(contactDetailsDTO)
				.authorisations(authorisationDTOS).build();
	}

	private ClerkTranslatorContactDetailsDTO getContactDetailsDTO(TranslatorDetails details) {
		// @formatter:off
		return ClerkTranslatorContactDetailsDTO.builder()
				.firstName(details.firstName())
				.lastName(details.lastName())
				.email(details.email())
				.phoneNumber(details.phone())
				.identityNumber(details.identityNumber())
				.street(details.street())
				.postalCode(details.postalCode())
				.town(details.town())
				.country(details.country())
				.build();
		// @formatter:on
	}

	private List<ClerkTranslatorAuthorisationDTO> getAuthorisationDTOs(
			List<TranslatorAuthorisationProjection> authProjections,
			Map<Long, List<AuthorisationLanguagePairProjection>> languagePairProjections,
			Map<Long, List<AuthorisationTermProjection>> termProjections) {

		return authProjections.stream().map(authProjection -> {
			// @formatter:off
			long authorisationId = authProjection.authorisationId();

			List<AuthorisationTermProjection> terms = termProjections.get(authorisationId);
			AuthorisationTermDTO termDTO = null;

			if (terms != null && !terms.isEmpty()) {
				AuthorisationTermProjection termProjection = terms.stream()
						.max(authorisationTermProjectionComparator)
						.get();

				termDTO = AuthorisationTermDTO.builder()
						.beginDate(termProjection.beginDate())
						.endDate(termProjection.endDate())
						.build();
			}

			List<ClerkLanguagePairDTO> languagePairDTOS = languagePairProjections.get(authorisationId)
					.stream()
					.map(lpp -> ClerkLanguagePairDTO.builder()
							.from(lpp.fromLang())
							.to(lpp.toLang())
							.permissionToPublish(lpp.permissionToPublish())
							.build()
					)
					.toList();

			return ClerkTranslatorAuthorisationDTO.builder()
					.basis(authProjection.authorisationBasis())
					.term(termDTO)
					.languagePairs(languagePairDTOS)
					.build();
			// @formatter:on
		}).toList();
	}

	private LanguagePairsDictDTO getLanguagePairsDictDTO() {
		List<String> fromLangs = languagePairRepository.getDistinctFromLangs();
		List<String> toLangs = languagePairRepository.getDistinctToLangs();

		return LanguagePairsDictDTO.builder().from(fromLangs).to(toLangs).build();
	}

	private List<String> getDistinctTowns(Collection<TranslatorDetails> translatorDetails) {
		return translatorDetails.stream().map(TranslatorDetails::town).distinct().sorted().toList();
	}

}
