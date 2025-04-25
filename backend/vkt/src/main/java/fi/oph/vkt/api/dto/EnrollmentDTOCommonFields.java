package fi.oph.vkt.api.dto;

public interface EnrollmentDTOCommonFields extends EnrollmentDTOSkillFields {
  String previousEnrollment();
  Boolean digitalCertificateConsent();
  String email();
  String phoneNumber();
  String street();
  String postalCode();
  String town();
  String country();
}
