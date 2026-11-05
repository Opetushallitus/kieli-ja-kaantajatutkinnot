package fi.oph.yki.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.PostgresTestcontainerConfig;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.service.PaymentService;
import fi.oph.yki.service.PublicIdentityService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test-postgres")
@Import(PostgresTestcontainerConfig.class)
class PublicRegistrationControllerTest {

  private static final String PAYTRAIL_URL = "https://pay.paytrail.com/pay/test";
  private static final String SUCCESS_URL = "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-success";
  private static final String ERROR_URL = "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-error";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PaymentService paymentService;

  @MockitoBean
  private PublicIdentityService publicIdentityService;

  private final Identity identity = new Identity();

  @BeforeEach
  public void setUp() {
    when(publicIdentityService.getIdentityFromSession(any())).thenReturn(identity);
    when(paymentService.getPaymentSuccessRedirectUrl(1L)).thenReturn(SUCCESS_URL);
    when(paymentService.getPaymentErrorRedirectUrl(1L)).thenReturn(ERROR_URL);
    when(paymentService.getFinalizePaymentSuccessRedirectUrl(5L)).thenReturn(SUCCESS_URL);
    when(paymentService.getFinalizePaymentErrorRedirectUrl(5L)).thenReturn(ERROR_URL);
  }

  @Test
  public void testRedirectToPaymentRedirectsToPaytrail() throws Exception {
    when(paymentService.createPaymentForRegistration(2L, identity, AppLocale.SV)).thenReturn(PAYTRAIL_URL);

    mockMvc
      .perform(get("/api/v2/1/registration/2/payment/redirect").param("lang", "sv"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(PAYTRAIL_URL));
  }

  @Test
  public void testRedirectToPaymentForPaidRegistrationRedirectsToSuccessPage() throws Exception {
    when(paymentService.createPaymentForRegistration(eq(2L), any(), any()))
      .thenThrow(new APIException(APIExceptionType.REGISTRATION_ALREADY_PAID));

    mockMvc
      .perform(get("/api/v2/1/registration/2/payment/redirect"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(SUCCESS_URL));
  }

  @Test
  public void testRedirectToPaymentFailureRedirectsToErrorPage() throws Exception {
    when(paymentService.createPaymentForRegistration(eq(2L), any(), any()))
      .thenThrow(new APIException(APIExceptionType.REGISTRATION_NOT_OWNED));

    mockMvc
      .perform(get("/api/v2/1/registration/2/payment/redirect"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(ERROR_URL));
  }

  @Test
  public void testPaymentSuccessRedirectsToSuccessPage() throws Exception {
    mockMvc
      .perform(get("/api/v2/payment/5/success").param("checkout-status", "ok"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(SUCCESS_URL));
    verify(paymentService).finalizePayment(eq(5L), anyMap());
  }

  @Test
  public void testPaymentSuccessCallbackReturnsOk() throws Exception {
    mockMvc
      .perform(get("/api/v2/payment/5/success").param("callback", "true").param("checkout-status", "ok"))
      .andExpect(status().isOk());
  }

  @Test
  public void testPaymentValidationFailureRedirectsToErrorPage() throws Exception {
    when(paymentService.finalizePayment(eq(5L), anyMap()))
      .thenThrow(new APIException(APIExceptionType.PAYMENT_VALIDATION_FAIL));

    mockMvc
      .perform(get("/api/v2/payment/5/cancel"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(ERROR_URL));
  }

  @Test
  public void testPaymentValidationFailureCallbackReturnsBadRequest() throws Exception {
    when(paymentService.finalizePayment(eq(5L), anyMap()))
      .thenThrow(new APIException(APIExceptionType.PAYMENT_VALIDATION_FAIL));

    mockMvc.perform(get("/api/v2/payment/5/cancel").param("callback", "true")).andExpect(status().isBadRequest());
  }
}
