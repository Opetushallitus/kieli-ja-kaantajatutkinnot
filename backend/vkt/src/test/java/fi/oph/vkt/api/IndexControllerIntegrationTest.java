package fi.oph.vkt.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.vkt.TestUtil;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.Resource;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;
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
    StringTemplateResolver templateResolver = new StringTemplateResolver();
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

  private void assertIndexHtml(String url) throws Exception {
    mockMvc
      .perform(get(url))
      .andDo(res -> fillNonceIntoTemplate(readCSPHeader(res)))
      .andExpect(status().isOk())
      .andExpect(content().contentType("text/html;charset=UTF-8"))
      .andExpect((content().string(expectedIndexHtml)));
  }

  private static String readCSPHeader(MvcResult res) {
    String cspDirective = res.getResponse().getHeader("Content-Security-Policy");
    if (cspDirective != null) {
      Pattern p = Pattern.compile("'nonce-([A-Za-z0-9+/]+=*)'");
      Matcher m = p.matcher(cspDirective);
      m.find();
      return m.group(1);
    } else {
      return null;
    }
  }

  private void fillNonceIntoTemplate(String nonce) {
    Context ctx = new Context();
    ctx.setVariable("cspNonce", nonce);
    expectedIndexHtml = templateEngine.process(expectedIndexHtmlTemplate, ctx);
  }

  private void assertGetContent(String url, String expectedContentType, String expectedContent) throws Exception {
    mockMvc
      .perform(get(url))
      .andExpect(status().isOk())
      .andExpect(content().contentType(expectedContentType))
      .andExpect(content().string(expectedContent));
  }
}
