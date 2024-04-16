package fi.oph.vkt.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.vkt.TestUtil;
import jakarta.annotation.Resource;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@SpringBootTest
@ActiveProfiles("test-hsql")
@AutoConfigureMockMvc
class IndexControllerIntegrationTest {

  private static String expectedIndexHtml;
  private static String expectedIndexHtmlTemplate;
  private static SpringTemplateEngine templateEngine;

  @Resource
  private MockMvc mockMvc;

  @BeforeAll
  public static void loadExpectedIndexHtml() throws IOException {
    expectedIndexHtmlTemplate = TestUtil.readResourceAsString("static/index.html");
    templateEngine = new SpringTemplateEngine();
    final StringTemplateResolver templateResolver = new StringTemplateResolver();
    templateResolver.setTemplateMode(TemplateMode.HTML);
    templateEngine.setTemplateResolver(templateResolver);
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
    final String expectedContent = TestUtil.readResourceAsString("static/vkt/static/assets/svg/footer_wave.svg");
    assertGetContent("/vkt/static/assets/svg/footer_wave.svg", "image/svg+xml", expectedContent);
  }

  @Test
  public void testDifferentNoncesAreReturnedForDifferentRequests() {
    final List<String> urls = List.of("/", "/", "/foo", "/foo", "/");
    final Set<String> nonces = urls
      .stream()
      .map(url -> {
        try {
          return readNonceFromCSPHeader(mockMvc.perform(get(url)).andReturn());
        } catch (Exception e) {
          throw new RuntimeException(e);
        }
      })
      .collect(Collectors.toSet());
    assertEquals(urls.size(), nonces.size());
  }

  private void assertIndexHtml(final String url) throws Exception {
    mockMvc
      .perform(get(url))
      .andDo(res -> fillNonceIntoTemplate(readNonceFromCSPHeader(res)))
      .andExpect(status().isOk())
      .andExpect(content().contentType("text/html;charset=UTF-8"))
      .andExpect((content().string(expectedIndexHtml)));
  }

  private static String readNonceFromCSPHeader(final MvcResult res) {
    final String cspDirective = res.getResponse().getHeader("Content-Security-Policy");
    if (cspDirective != null) {
      final Pattern p = Pattern.compile("'nonce-([A-Za-z0-9+/]+=*)'");
      final Matcher m = p.matcher(cspDirective);
      m.find();
      return m.group(1);
    } else {
      return null;
    }
  }

  private void fillNonceIntoTemplate(final String nonce) {
    final Context ctx = new Context();
    ctx.setVariable("cspNonce", nonce);
    expectedIndexHtml = templateEngine.process(expectedIndexHtmlTemplate, ctx);
  }

  private void assertGetContent(final String url, final String expectedContentType, final String expectedContent)
    throws Exception {
    mockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(content().contentType(expectedContentType))
      .andExpect(content().string(expectedContent));
  }
}
