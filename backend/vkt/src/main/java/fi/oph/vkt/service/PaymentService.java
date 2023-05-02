package fi.oph.vkt.service;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.EnrollmentStatus;
import fi.oph.vkt.model.type.PaymentStatus;
import fi.oph.vkt.payment.paytrail.Customer;
import fi.oph.vkt.payment.paytrail.Item;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import fi.oph.vkt.util.exception.NotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private static final int COST_SINGLE = 45400;
  private static final int COST_MULTIPLE = 22700;

  private final PaytrailService paytrailService;
  private final PaymentRepository paymentRepository;
  private final EnrollmentRepository enrollmentRepository;

  private Item getItem() {
    return Item
      .builder()
      .units(1)
      .unitPrice(COST_MULTIPLE)
      .vatPercentage(PaytrailConfig.VAT)
      .productCode("foo")
      .build();
  }

  private int getTotal(List<Item> itemList) {
    // TODO: Selvitä halutaanko jokainen taito omana rivinä vai yhtenä
    //    return itemList.size() > 1
    //            ? COST_MULTIPLE
    //            : COST_SINGLE;
    return itemList.stream().reduce(0, (subtotal, item) -> subtotal + item.unitPrice(), Integer::sum);
  }

  private List<Item> getItems(final Enrollment enrollment) {
    final List<Item> itemList = new ArrayList<>();

    // TODO: Selvitä halutaanko jokainen taito omana rivinä vai yhtenä
    if (enrollment.isOralSkill()) {
      itemList.add(getItem());
    }
    if (enrollment.isTextualSkill()) {
      itemList.add(getItem());
    }
    if (enrollment.isUnderstandingSkill()) {
      itemList.add(getItem());
    }

    return itemList;
  }

  private Enrollment updateEnrollmentStatus(final Payment payment, final PaymentStatus paymentStatus) {
    final Enrollment enrollment = payment.getEnrollment();

    switch (paymentStatus) {
      case NEW -> enrollment.setStatus(EnrollmentStatus.EXPECTING_PAYMENT);
      case OK -> enrollment.setStatus(EnrollmentStatus.PAID);
      case FAIL -> enrollment.setStatus(EnrollmentStatus.CANCELED);
    }

    return enrollment;
  }

  private boolean finalizePayment(final Long paymentId, final Map<String, String> paymentParams) {
    final Payment payment = paymentRepository
      .findById(paymentId)
      .orElseThrow(() -> new NotFoundException("Payment not found"));
    final PaymentStatus currentStatus = payment.getPaymentStatus();

    if (!paytrailService.validate(paymentParams)) {
      throw new RuntimeException("Invalid payload");
    }

    // TODO: voiko peruutetun maksun maksaa?
    if (currentStatus != null && currentStatus.equals(PaymentStatus.OK)) {
      throw new APIException(APIExceptionType.PAYMENT_ALREADY_PAID);
    }

    final PaymentStatus paymentStatus = PaymentStatus.fromString(paymentParams.get("checkout-status"));
    final Enrollment enrollment = updateEnrollmentStatus(payment, paymentStatus);
    payment.setPaymentStatus(paymentStatus);

    enrollmentRepository.saveAndFlush(enrollment);
    paymentRepository.saveAndFlush(payment);

    return true;
  }

  @Transactional
  public boolean success(final Long paymentId, final Map<String, String> paymentParams) {
    return finalizePayment(paymentId, paymentParams);
  }

  @Transactional
  public boolean cancel(final Long paymentId, final Map<String, String> paymentParams) {
    return finalizePayment(paymentId, paymentParams);
  }

  public String create(final Long enrollmentId, final Person person) {
    Enrollment enrollment = enrollmentRepository
      .findById(enrollmentId)
      .orElseThrow(() -> new NotFoundException("Enrollment not found"));

    if (enrollment.getPerson().getId() != person.getId()) {
      throw new APIException(APIExceptionType.PAYMENT_PERSON_SESSION_MISMATCH);
    }

    if (enrollment.getStatus() == EnrollmentStatus.PAID) {
      throw new APIException(APIExceptionType.ENROLLMENT_ALREADY_PAID);
    }

    final List<Item> itemList = getItems(enrollment);
    final Customer customer = Customer
      .builder()
      .email(enrollment.getEmail())
      .phone(enrollment.getPhoneNumber())
      .firstName(person.getFirstName())
      .lastName(person.getLastName())
      .build();

    final Payment payment = new Payment();
    payment.setPerson(person);
    payment.setEnrollment(enrollment);
    paymentRepository.saveAndFlush(payment);

    final int total = getTotal(itemList);
    final PaytrailResponseDTO response = paytrailService.createPayment(
      itemList,
      payment.getPaymentId(),
      customer,
      total
    );

    final String transactionId = response.getTransactionId();
    final String reference = response.getReference();
    final String paymentUrl = response.getHref();

    payment.setPaymentStatus(PaymentStatus.NEW);
    payment.setReference(reference);
    payment.setPaymentUrl(paymentUrl);
    payment.setTransactionId(transactionId);
    paymentRepository.saveAndFlush(payment);

    enrollment = updateEnrollmentStatus(payment, PaymentStatus.NEW);
    enrollmentRepository.saveAndFlush(enrollment);

    return paymentUrl;
  }
}
