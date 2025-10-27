package fi.oph.yki.api.dto.clerk;

import java.util.Optional;

public record ClerkCustomerQueuedExamDTO(

        String examinationDate,
        ClerkCustomerQueuedExamDTO.Exam exam,
        ClerkCustomerQueuedExamDTO.Location examLocation,
        ClerkCustomerQueuedExamDTO.Status registrationStatus,
        String registrationDate,
        QueueSpotOffered queueSpotOffered
) {
    public record Exam(
            String language, // ExamLanguage.FIN
            String level // ExamLevel.KESKI
    ) {
    }

    public record Location(
            String schoolName,
            String municipality
    ) {
    }

    public record Status(
            String state, // RegistrationStates.Completed,
            Optional<String> paidAt
    ) {
    }

    public record QueueSpotOffered(
            String offered,
            Optional<String> dueDate
    ) {
    }
}

