package fi.oph.yki.api.dto.clerk;

import java.util.Optional;

public record ClerkCustomerRegistrationDTO(
        String examinationDate,
        Exam exam,
        Location examLocation,
        Status registrationStatus,
        String registrationDate
) {
    public record Exam(
            String language, // ExamLanguage.FIN
            String level // ExamLevel.KESKI
    ) {}

    public record Location(
            String schoolName,
            String municipality
    ) {}

    public record Status(
            String state, // RegistrationStates.Completed,
            Optional<String> paidAt
    ) {}
}

