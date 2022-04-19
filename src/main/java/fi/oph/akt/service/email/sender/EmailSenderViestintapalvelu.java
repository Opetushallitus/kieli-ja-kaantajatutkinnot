package fi.oph.akt.service.email.sender;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.akt.service.email.EmailData;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class EmailSenderViestintapalvelu implements EmailSender {

	private static final Logger LOG = LoggerFactory.getLogger(EmailSenderViestintapalvelu.class);

	private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

	private final WebClient webClient;

	@Override
	public String sendEmail(final EmailData emailData) throws JsonProcessingException {
		final Map<String, Object> postData = createPostData(emailData);
		final Mono<String> response = webClient.post().contentType(MediaType.APPLICATION_JSON).bodyValue(postData)
				.retrieve().bodyToMono(String.class);
		final String result = response.block();
		LOG.debug("WebClient result:{}", result);
		return parseExternalId(result);
	}

	private Map<String, Object> createPostData(EmailData emailData) {
		// @formatter:off
		final Map<String, Object> data = Map.of(
				"email", Map.of(
						"html", true,
						"charset", "UTF-8",
						"callingProcess", "akt",
						"sender", emailData.sender(),
						"subject", emailData.subject(),
						"body", emailData.body()),
				"recipient", List.of(Map.of("email", emailData.recipient())));
		// @formatter:on
		LOG.debug("Data:{}", data);
		return data;
	}

	private String parseExternalId(String result) throws JsonProcessingException {
		final Map<String, String> map = OBJECT_MAPPER.readValue(result, new TypeReference<>() {
		});
		return map.get("id");
	}

}
