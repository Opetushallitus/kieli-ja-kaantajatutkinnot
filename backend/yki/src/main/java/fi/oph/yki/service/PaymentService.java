package fi.oph.yki.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import fi.oph.yki.model.ExamSession;
import fi.oph.yki.model.Identity;
import fi.oph.yki.model.Payment;
import fi.oph.yki.model.Registration;
import fi.oph.yki.model.RegistrationChangeEvent;
import fi.oph.yki.model.type.AppLocale;
import fi.oph.yki.model.type.ExamSessionType;
import fi.oph.yki.model.type.PartialExamType;
import fi.oph.yki.model.type.PaymentStatus;
import fi.oph.yki.model.type.RegistrationState;
import fi.oph.yki.payment.PaymentProvider;
import fi.oph.yki.payment.paytrail.Customer;
import fi.oph.yki.payment.paytrail.Item;
import fi.oph.yki.payment.paytrail.PaytrailConfig;
import fi.oph.yki.payment.paytrail.PaytrailResponseDTO;
import fi.oph.yki.repository.PaymentRepository;
import fi.oph.yki.repository.RegistrationChangeEventRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.util.UUIDSource;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import fi.oph.yki.util.exception.NotFoundException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private static final Logger LOG = LoggerFactory.getLogger(PaymentService.class);
  public static final String REFERENCE_PREFIX = "YKI-EXAM-";

  private final PaymentProvider paymentProvider;
  private final PaymentRepository paymentRepository;
  private final RegistrationRepository registrationRepository;
  private final RegistrationChangeEventRepository registrationChangeEventRepository;
  private final Environment environment;
  private final UUIDSource uuidSource;

  private int getConfiguredExamFee(final String feeKey) {
    return environment.getRequiredProperty("app.exam-fee." + feeKey, Integer.class);
  }

  private List<String> getExamFeeKeys(final Registration registration) {
    final ExamSession examSession = registration.getExamSession();
    final PartialExamType partialExamType = registration.getPartialExamType();

    if (examSession.getType() == ExamSessionType.READ_SPEAK) {
      return switch (partialExamType) {
        case READ -> List.of("keski-read");
        case SPEAK -> List.of("keski-speak");
        default -> List.of("keski-read", "keski-speak");
      };
    }
    if (examSession.getType() == ExamSessionType.LISTEN_WRITE) {
      return switch (partialExamType) {
        case LISTEN -> List.of("keski-listen");
        case WRITE -> List.of("keski-write");
        default -> List.of("keski-listen", "keski-write");
      };
    }

    return List.of(examSession.getLevel().toLowerCase());
  }

  private int getExamFeeInCents(final Registration registration) {
    final int examFee = registration.getExamFee() != null
      ? registration.getExamFee()
      : getExamFeeKeys(registration).stream().mapToInt(this::getConfiguredExamFee).sum();

    return examFee * 100;
  }

  private void completeRegistration(final Registration registration) {
    final RegistrationState state = registration.getState();

    if (state == RegistrationState.SUBMITTED) {
      registration.setState(RegistrationState.COMPLETED);
    } else if (state == RegistrationState.EXPIRED || state == RegistrationState.CANCELLED) {
      // Payment can arrive after the registration has expired or been cancelled
      registration.setState(RegistrationState.PAID_AND_CANCELLED);
    } else {
      LOG.error("Payment completed for registration {} in unexpected state {}", registration.getId(), state);
      return;
    }
    registrationRepository.save(registration);

    final RegistrationChangeEvent changeEvent = new RegistrationChangeEvent();
    changeEvent.setEvent("COMPLETE_PAYMENT");
    changeEvent.setRegistrationId(registration.getId());
    changeEvent.setExamSessionId(registration.getExamSession().getId());
    changeEvent.setRegistrationState(registration.getState());
    changeEvent.setRegistrationKind(registration.getKind());
    if (registration.getOriginalExamSession() != null) {
      changeEvent.setOriginalExamSessionId(registration.getOriginalExamSession().getId());
    }
    changeEvent.setCreatedAt(LocalDateTime.now());
    changeEvent.setAuthorType("INTEGRATION");
    registrationChangeEventRepository.save(changeEvent);
  }

  @Transactional
  public Payment finalizePayment(final Long paymentId, final Map<String, String> paymentParams) {
    final Payment payment = paymentRepository
      .findWithLockingById(paymentId)
      .orElseThrow(() -> new NotFoundException("Payment not found"));
    final PaymentStatus currentStatus = payment.getPaymentStatus();
    final PaymentStatus newStatus = PaymentStatus.fromString(paymentParams.get("checkout-status"));

    if (!paymentProvider.validate(paymentParams)) {
      LOG.error("Payment ({}) validation failed for params {}", paymentId, paymentParams);
      throw new APIException(APIExceptionType.PAYMENT_VALIDATION_FAIL);
    }

    if (currentStatus == PaymentStatus.OK && newStatus != PaymentStatus.OK) {
      LOG.error("Cannot change payment status from OK to {} for payment {}", newStatus, paymentId);
      throw new APIException(APIExceptionType.PAYMENT_ALREADY_PAID);
    }

    // Already paid. Payment url may be called multiple times
    if (currentStatus == PaymentStatus.OK) {
      return payment;
    }

    final int amount = Integer.parseInt(paymentParams.get("checkout-amount"));
    if (amount != payment.getAmount()) {
      LOG.error("Payment ({}) amount ({}) does not match expected amount ({})", paymentId, amount, payment.getAmount());
      throw new APIException(APIExceptionType.PAYMENT_AMOUNT_MISMATCH);
    }

    final String checkoutReference = paymentParams.get("checkout-reference");
    if (!checkoutReference.equals(payment.getMerchantReference())) {
      LOG.error(
        "Checkout reference ({}) does not match payment merchant reference ({})",
        checkoutReference,
        payment.getMerchantReference()
      );
      throw new APIException(APIExceptionType.PAYMENT_REFERENCE_MISMATCH);
    }

    payment.setPaymentStatus(newStatus);
    if (newStatus == PaymentStatus.OK) {
      payment.setPaidAt(LocalDateTime.now());
      completeRegistration(payment.getRegistration());
    }
    paymentRepository.saveAndFlush(payment);

    return payment;
  }

  @Transactional(readOnly = true)
  public String getFinalizePaymentSuccessRedirectUrl(final Long paymentId) {
    return getFinalizePaymentRedirectUrl(paymentId, "payment-success");
  }

  @Transactional(readOnly = true)
  public String getFinalizePaymentCancelRedirectUrl(final Long paymentId) {
    return getFinalizePaymentRedirectUrl(paymentId, "payment-cancel");
  }

  @Transactional(readOnly = true)
  public String getFinalizePaymentErrorRedirectUrl(final Long paymentId) {
    final Long examSessionId = paymentRepository
      .findById(paymentId)
      .map(payment -> payment.getRegistration().getExamSession().getId())
      .orElse(null);

    return getPaymentErrorRedirectUrl(examSessionId);
  }

  public String getPaymentSuccessRedirectUrl(final long examSessionId) {
    return getPaymentStatusRedirectUrl(examSessionId, "payment-success");
  }

  public String getPaymentErrorRedirectUrl(final Long examSessionId) {
    return getPaymentStatusRedirectUrl(examSessionId, "payment-error");
  }

  private String getFinalizePaymentRedirectUrl(final Long paymentId, final String status) {
    final Payment payment = paymentRepository
      .findById(paymentId)
      .orElseThrow(() -> new NotFoundException("Payment not found"));

    return getPaymentStatusRedirectUrl(payment.getRegistration().getExamSession().getId(), status);
  }

  private String getPaymentStatusRedirectUrl(final Long examSessionId, final String status) {
    final String statusUrl = String.format(
      "%s/ilmoittautuminen/v2/maksu/tila?status=%s",
      environment.getRequiredProperty("app.base-url.public-frontend"),
      status
    );

    return examSessionId != null ? statusUrl + "&id=" + examSessionId : statusUrl;
  }

  @Transactional
  public String createPaymentForRegistration(
    final Long registrationId,
    final Identity identity,
    final AppLocale appLocale
  ) {
    final Registration registration = registrationRepository
      .findById(registrationId)
      .orElseThrow(() -> new NotFoundException("Registration not found"));

    if (registration.getIdentity() == null || registration.getIdentity().getId() != identity.getId()) {
      throw new APIException(APIExceptionType.REGISTRATION_NOT_OWNED);
    }

    if (registration.getState() == RegistrationState.COMPLETED) {
      throw new APIException(APIExceptionType.REGISTRATION_ALREADY_PAID);
    }

    if (registration.getState() != RegistrationState.SUBMITTED) {
      throw new APIException(APIExceptionType.PAYMENT_INVALID_REGISTRATION_STATE);
    }

    final Optional<Payment> unfinishedPayment = paymentRepository.findFirstByRegistrationIdAndPaymentStatusOrderByIdDesc(
      registrationId,
      PaymentStatus.NEW
    );
    if (unfinishedPayment.isPresent()) {
      return unfinishedPayment.get().getPaymentUrl();
    }

    final ExamSession examSession = registration.getExamSession();
    final int amount = getExamFeeInCents(registration);
    final List<Item> itemList = List.of(
      Item
        .builder()
        .units(1)
        .unitPrice(amount)
        .vatPercentage(PaytrailConfig.VAT)
        .productCode(String.valueOf(examSession.getId()))
        .build()
    );
    final ObjectNode form = registration.getForm();
    final Customer customer = Customer
      .builder()
      .email(getCustomerField(form.path("email").asText(null), Customer.EMAIL_MAX_LENGTH))
      .phone(getCustomerField(form.path("phone_number").asText(null), Customer.PHONE_MAX_LENGTH))
      .firstName(getCustomerField(form.path("first_name").asText(null), Customer.FIRST_NAME_MAX_LENGTH))
      .lastName(getCustomerField(form.path("last_name").asText(null), Customer.LAST_NAME_MAX_LENGTH))
      .build();

    final Payment payment = new Payment();
    payment.setRegistration(registration);
    payment.setAmount(amount);
    paymentRepository.saveAndFlush(payment);

    final String paymentReference = String.join(
      "-",
      REFERENCE_PREFIX + examSession.getOrganizer().getId(),
      String.valueOf(examSession.getId()),
      String.valueOf(registration.getId()),
      uuidSource.getRandomNonce()
    );
    final PaytrailResponseDTO response = paymentProvider.createPayment(
      itemList,
      payment.getId(),
      paymentReference,
      customer,
      amount,
      appLocale
    );

    payment.setTransactionId(response.getTransactionId());
    payment.setReference(response.getReference());
    payment.setMerchantReference(paymentReference);
    payment.setPaymentUrl(response.getHref());
    payment.setPaymentStatus(PaymentStatus.NEW);
    paymentRepository.saveAndFlush(payment);

    return payment.getPaymentUrl();
  }

  private String getCustomerField(final String content, final int maxLength) {
    if (content == null) {
      return null;
    }

    return content.substring(0, Math.min(content.length(), maxLength));
  }
}
