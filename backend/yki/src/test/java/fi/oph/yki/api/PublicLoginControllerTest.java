package fi.oph.yki.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.PaymentLink;
import fi.oph.yki.model.Registration;
import fi.oph.yki.repository.IdentityRepository;
import fi.oph.yki.service.PaymentService;
import fi.oph.yki.service.PersonService;
import fi.oph.yki.service.PublicAuthService;
import fi.oph.yki.service.PublicIdentityService;
import fi.oph.yki.service.PublicRegistrationService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(PublicLoginController.class)
@Import({ ControllerExceptionAdvice.class, PublicIdentityService.class })
@WithMockUser
class PublicLoginControllerTest {

  private static final String ERROR_URL = "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-error";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PaymentService paymentService;

  @MockitoBean
  private PublicAuthService publicAuthService;

  @MockitoBean
  private PublicRegistrationService publicRegistrationService;

  @MockitoBean
  private PersonService personService;

  @MockitoBean
  private IdentityRepository identityRepository;

  @BeforeEach
  public void setUp() {
    final Identity identity = new Identity();
    identity.setId(3L);
    final ExamSession examSession = new ExamSession();
    examSession.setId(1L);
    final Registration registration = new Registration();
    registration.setId(2L);
    registration.setExamSession(examSession);
    final PaymentLink paymentLink = new PaymentLink();
    paymentLink.setIdentity(identity);
    paymentLink.setRegistration(registration);

    when(paymentService.getActivePaymentLink("code")).thenReturn(paymentLink);
    when(paymentService.getPaymentErrorRedirectUrl(null)).thenReturn(ERROR_URL);
  }

  @Test
  public void testLoginWithPaymentLinkStartsSessionAndRedirectsToPayment() throws Exception {
    final MvcResult result = mockMvc
      .perform(get("/v2/login/payment").param("code", "code").param("lang", "sv"))
      .andExpect(status().is3xxRedirection())
      .andExpect(
        redirectedUrl("http://localhost:8083/yki/api/v2/examSession/1/registration/2/payment/redirect?lang=sv")
      )
      .andReturn();

    assertEquals(3L, result.getRequest().getSession().getAttribute("identityId"));
  }

  @Test
  public void testLoginWithPaymentLinkWithoutLang() throws Exception {
    mockMvc
      .perform(get("/v2/login/payment").param("code", "code"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl("http://localhost:8083/yki/api/v2/examSession/1/registration/2/payment/redirect"));
  }

  @Test
  public void testLoginWithExpiredPaymentLinkRedirectsToErrorPage() throws Exception {
    when(paymentService.getActivePaymentLink("expired"))
      .thenThrow(new APIException(APIExceptionType.PAYMENT_LINK_EXPIRED));
    final MockHttpSession session = new MockHttpSession();

    mockMvc
      .perform(get("/v2/login/payment").param("code", "expired").session(session))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(ERROR_URL));

    assertNull(session.getAttribute("identityId"));
  }
}
