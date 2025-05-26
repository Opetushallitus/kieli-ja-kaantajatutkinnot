package fi.oph.vkt.view;

import static fi.oph.vkt.util.LocalisationUtil.localeFI;

import fi.oph.vkt.model.EnrollmentCommon;
import fi.oph.vkt.model.ExamEventCommon;
import fi.oph.vkt.model.Examiner;
import fi.oph.vkt.model.Payment;
import fi.oph.vkt.model.Person;
import fi.oph.vkt.model.type.ExamLanguage;
import fi.oph.vkt.util.DateUtil;
import fi.oph.vkt.util.LocalisationUtil;
import java.util.List;

public class PaymentReportXlsxDataRowUtil {

  public static List<PaymentReportXslxData> createExcelData(final List<Payment> paymentList) {
    return paymentList
      .stream()
      .map(p -> {
        final EnrollmentCommon enrollmentCommon = p.getEnrollment() != null
          ? p.getEnrollment()
          : p.getEnrollmentAppointment();
        final Person person = enrollmentCommon.getPerson();
        final String examLevelKey = p.getEnrollment() != null ? "examLevel.excellent" : "examLevel.goodAndSatisfactory";
        final ExamEventCommon examEventCommon = p.getEnrollment() != null
          ? p.getEnrollment().getExamEvent()
          : p.getEnrollmentAppointment().getExaminerExamEvent();
        final String language = examEventCommon.getLanguage().equals(ExamLanguage.FI)
          ? LocalisationUtil.translate(localeFI, "lang.finnish")
          : LocalisationUtil.translate(localeFI, "lang.swedish");

        final String examiner = p.getEnrollment() != null
          ? "OPH"
          : getExaminerName(p.getEnrollmentAppointment().getExaminerExamEvent().getExaminer());

        return PaymentReportXslxData
          .builder()
          .merchantReference(p.getMerchantReference() != null ? p.getMerchantReference() : "")
          .paytrailReference(p.getReference())
          .lastName(person != null ? person.getLastName() : "")
          .firstName(person != null ? person.getFirstName() : "")
          .amount((double) p.getAmount() / 100)
          .level(LocalisationUtil.translate(localeFI, examLevelKey))
          .language(language)
          .date(DateUtil.formatDate(examEventCommon.getDate()))
          .textualSkill(boolToInt(enrollmentCommon.isTextualSkill()))
          .oralSkill(boolToInt(enrollmentCommon.isOralSkill()))
          .understandingSkill(boolToInt(enrollmentCommon.isUnderstandingSkill()))
          .examiner(examiner)
          .paymentCreatedAt(DateUtil.formatDatetime(p.getCreatedAt()))
          .build();
      })
      .toList();
  }

  private static String getExaminerName(final Examiner examiner) {
    return examiner.getFirstName() + " " + examiner.getLastName();
  }

  private static Integer boolToInt(final Boolean bool) {
    return bool ? 1 : 0;
  }
}
