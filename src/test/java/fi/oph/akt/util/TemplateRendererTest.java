package fi.oph.akt.util;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.annotation.Resource;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test-hsql")
class TemplateRendererTest {

	@Resource
	private TemplateRenderer templateRenderer;

	@Test
	public void testContactRequestTemplateIsRendered() {
		// @formatter:off
		final String renderedContent = templateRenderer.renderContactRequestEmailBody(Map.of(
				"name", "John Doe",
				"email", "john.doe@unknown.invalid",
				"phone", "+358 400 888 777",
				"message", "This is the message."));
		// @formatter:on

		// just some sanity checks that rendered content actually contains anything
		// meaningful
		assertNotNull(renderedContent);
		assertTrue(renderedContent.contains("<html "));
		assertTrue(renderedContent.contains("John Doe"));
		assertTrue(renderedContent.contains("john.doe@unknown.invalid"));
		assertTrue(renderedContent.contains("+358 400 888 777"));
		assertTrue(renderedContent.contains("This is the message."));
	}

}