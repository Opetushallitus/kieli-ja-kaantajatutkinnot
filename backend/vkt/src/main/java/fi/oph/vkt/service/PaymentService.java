package fi.oph.vkt.service;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.payment.Item;
import fi.oph.vkt.payment.paytrail.PaytrailResponseDTO;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaytrailService paytrailService;
  private final PaymentRepository paymentRepository;
  private final EnrollmentRepository enrollmentRepository;

  @Transactional
  protected void updatePaymentDetails(
    final Payment payment,
    final String transactionId,
    final String reference,
    final String href
  ) {
    payment.setReference(reference);
    payment.setRedirectUrl(href);
    payment.setTransactionId(transactionId);

    paymentRepository.saveAndFlush(payment);
  }

  @Transactional
  protected Payment initializeNewPayment(final Person person, final Enrollment enrollment) {
    final Payment payment = new Payment();
    payment.setPerson(person);
    payment.setEnrollment(enrollment);

    return paymentRepository.saveAndFlush(payment);
  }

  private List<Item> getItems(final Enrollment enrollment) {
    final List<Item> itemList = new ArrayList<>();

    if (enrollment.isOralSkill()) {
      itemList.add(Item.builder().build());
    }

    return itemList;
  }

  public String createPayment(final Long enrollmentId, final Person person) {
    final Enrollment enrollment = enrollmentRepository
      .findById(enrollmentId)
      .orElseThrow(() -> new RuntimeException("Enrollment not found"));

    if (!enrollment.getPerson().equals(person)) {
      throw new APIException(APIExceptionType.RESERVATION_PERSON_SESSION_MISMATCH);
    }

    final Payment payment = initializeNewPayment(person, enrollment);
    final PaytrailResponseDTO response = paytrailService.createPayment(getItems(enrollment), payment.getPaymentId());
    final String transactionId = response.getTransactionId();
    final String reference = response.getReference();
    final String redirectHref = response.getHref();

    updatePaymentDetails(payment, transactionId, reference, redirectHref);

    return redirectHref;
  }
}
