package fi.oph.akt.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TemplateRenderer {

	private final TemplateEngine templateEngine;

	public String renderContactRequestEmailBody(final Map<String, Object> params) {
		final Context context = new Context();
		context.setVariables(params);
		return templateEngine.process("contact-request", context);
	}

}
