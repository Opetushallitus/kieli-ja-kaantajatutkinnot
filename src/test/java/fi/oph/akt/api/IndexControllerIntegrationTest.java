package fi.oph.akt.api;

import fi.oph.akt.TestUtil;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import javax.annotation.Resource;
import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test-hsql")
@AutoConfigureMockMvc
class IndexControllerIntegrationTest {

	private static String expectedIndexHtml;

	@Resource
	private MockMvc mockMvc;

	@BeforeAll
	public static void loadExpectedIndexHtml() throws IOException {
		expectedIndexHtml = TestUtil.readResourceAsString("static/index.html");
	}

	@Test
	public void testIndexHtmlIsReturnedFromRoot() throws Exception {
		assertIndexHtml("/");
	}

	@Test
	public void testIndexHtmlIsReturnedFromRandomPathWithoutExtension() throws Exception {
		assertIndexHtml("/foo/bar/a");
	}

	@Test
	public void testRandomPathWithExtensionIsNotFound() throws Exception {
		mockMvc.perform(get("/foo/bar/foo.txt")).andExpect(status().isNotFound());
	}

	@Test
	public void testStaticAssetIsReturned() throws Exception {
		final String expectedContent = TestUtil.readResourceAsString("static/static/assets/svg/logo.svg");
		assertGetContent("/static/assets/svg/logo.svg", "image/svg+xml", expectedContent);
	}

	private void assertIndexHtml(String url) throws Exception {
		assertGetContent(url, "text/html;charset=UTF-8", expectedIndexHtml);
	}

	private void assertGetContent(String url, String expectedContentType, String expectedContent) throws Exception {
		// @formatter:off
		mockMvc.perform(get(url))
				.andExpect(status().isOk())
				.andExpect(content().contentType(expectedContentType))
				.andExpect(content().string(expectedContent));
		// @formatter:on
	}

}
