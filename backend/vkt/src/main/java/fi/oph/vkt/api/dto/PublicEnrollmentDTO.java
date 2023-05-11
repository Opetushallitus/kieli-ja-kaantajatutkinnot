package fi.oph.vkt.api.dto;

import lombok.Builder;

@Builder
public record PublicEnrollmentDTO(
        Boolean oralSkill,
        Boolean textualSkill,
        Boolean understandingSkill,
        Boolean speakingPartialExam,
        Boolean speechComprehensionPartialExam,
        Boolean writingPartialExam,
        Boolean readingComprehensionPartialExam,
        String previousEnrollment,
        Boolean digitalCertificateConsent,
        String email,
        String phoneNumber,
        String street,
        String postalCode,
        String town,
        String country
) implements EnrollmentDTOCommonFields {
}
