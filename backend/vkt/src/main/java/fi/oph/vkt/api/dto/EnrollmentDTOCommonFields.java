package fi.oph.vkt.api.dto;

public interface EnrollmentDTOCommonFields {
  Boolean oralSkill();
  Boolean textualSkill();
  Boolean understandingSkill();
  Boolean speakingPartialExam();
  Boolean speechComprehensionPartialExam();
  Boolean writingPartialExam();
  Boolean readingComprehensionPartialExam();
  String previousEnrollment();
  Boolean digitalCertificateConsent();
  String email();
  String phoneNumber();
  String street();
  String postalCode();
  String town();
  String country();
}
