package fi.oph.vkt.service;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.payment.Item;
import fi.oph.vkt.repository.EnrollmentRepository;
import fi.oph.vkt.repository.PaymentRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PaymentService {

  private final PaytrailService paytrailService;
  private final PaymentRepository paymentRepository;
  private final EnrollmentRepository enrollmentRepository;

  private Payment createNewPayment(Person person) {
    final Payment payment = new Payment();
    payment.setPerson(person);

    return paymentRepository.saveAndFlush(payment);
  }

  private List<Item> getItems(Enrollment enrollment) {
    final List<Item> itemList = new ArrayList<>();

    if (enrollment.isOralSkill()) {
      itemList.add(Item.builder().build());
    }

    return itemList;
  }

  public boolean createPayment(Long enrollmentId, Person person) {
    final Enrollment enrollment = enrollmentRepository
      .findById(enrollmentId)
      .orElseThrow(() -> new RuntimeException("Enrollment not found"));

    if (enrollment.getPerson() != person) {
      throw new RuntimeException("Person not valid");
    }

    Payment payment = createNewPayment(person);

    return paytrailService.createPayment(getItems(enrollment), payment.getPaymentId());
  }
}
