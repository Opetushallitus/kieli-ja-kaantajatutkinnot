package fi.oph.yki.api.dto.clerk;

import java.time.LocalDate;
import java.util.Optional;

public record ClerkCustomerQueuedExamDTO(

        LocalDate examinationDate,
        ClerkCustomerQueuedExamDTO.Exam exam,
        ClerkCustomerQueuedExamDTO.Location examLocation,
        ClerkCustomerQueuedExamDTO.Status registrationStatus,
        LocalDate registrationDate,
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
            Optional<LocalDate> paidAt
    ) {
    }

    public record QueueSpotOffered(
            String offered,
            Optional<LocalDate> dueDate
    ) {
    }
}

