package fi.oph.yki.api;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import fi.oph.yki.config.ControllerExceptionAdvice;
import fi.oph.yki.service.PaymentService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PublicPaymentController.class)
@Import(ControllerExceptionAdvice.class)
@WithMockUser
@TestPropertySource(properties = "app.v2.enabled=true")
class PublicPaymentControllerTest {

  private static final String BASE_URL = "/api/v2/payment";
  private static final String SUCCESS_URL = "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-success";
  private static final String CANCEL_URL = "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-cancel";
  private static final String ERROR_URL = "https://foo.bar/yki/ilmoittautuminen/v2/maksu/tila?status=payment-error";

  @Resource
  private MockMvc mockMvc;

  @MockitoBean
  private PaymentService paymentService;

  @BeforeEach
  public void setUp() {
    when(paymentService.getFinalizePaymentSuccessRedirectUrl(5L)).thenReturn(SUCCESS_URL);
    when(paymentService.getFinalizePaymentCancelRedirectUrl(5L)).thenReturn(CANCEL_URL);
    when(paymentService.getFinalizePaymentErrorRedirectUrl(5L)).thenReturn(ERROR_URL);
  }

  @Test
  public void testPaymentSuccessRedirectsToSuccessPage() throws Exception {
    mockMvc
      .perform(get(BASE_URL + "/5/success").param("checkout-status", "ok"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(SUCCESS_URL));
    verify(paymentService).finalizePayment(eq(5L), anyMap());
  }

  @Test
  public void testPaymentSuccessCallbackReturnsOk() throws Exception {
    mockMvc
      .perform(get(BASE_URL + "/5/success").param("callback", "true").param("checkout-status", "ok"))
      .andExpect(status().isOk());
    verify(paymentService).finalizePayment(eq(5L), anyMap());
  }

  @Test
  public void testPaymentCancelRedirectsToCancelPage() throws Exception {
    mockMvc
      .perform(get(BASE_URL + "/5/cancel").param("checkout-status", "fail"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(CANCEL_URL));
  }

  @Test
  public void testPaymentValidationFailureRedirectsToErrorPage() throws Exception {
    when(paymentService.finalizePayment(eq(5L), anyMap()))
      .thenThrow(new APIException(APIExceptionType.PAYMENT_VALIDATION_FAIL));

    mockMvc
      .perform(get(BASE_URL + "/5/cancel"))
      .andExpect(status().is3xxRedirection())
      .andExpect(redirectedUrl(ERROR_URL));
  }

  @Test
  public void testPaymentValidationFailureCallbackReturnsBadRequest() throws Exception {
    when(paymentService.finalizePayment(eq(5L), anyMap()))
      .thenThrow(new APIException(APIExceptionType.PAYMENT_VALIDATION_FAIL));

    mockMvc.perform(get(BASE_URL + "/5/cancel").param("callback", "true")).andExpect(status().isBadRequest());
  }

  @Test
  public void testPaymentUnexpectedFailureCallbackReturnsInternalServerError() throws Exception {
    when(paymentService.finalizePayment(eq(5L), anyMap())).thenThrow(new RuntimeException("database down"));

    mockMvc.perform(get(BASE_URL + "/5/success").param("callback", "true")).andExpect(status().isInternalServerError());
  }
}
