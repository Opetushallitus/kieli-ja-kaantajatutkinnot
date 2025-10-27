package fi.oph.yki.api.dto.clerk;

import java.util.Optional;

public record ClerkCustomerPastExamDTO(
        String examinationDate,
        ClerkCustomerPastExamDTO.Exam exam,
        ClerkCustomerPastExamDTO.Location examLocation,
        String state
) {
    public record Exam(
            String language, // ExamLanguage.FIN
            String level // ExamLevel.KESKI
    ) {}

    public record Location(
            String schoolName,
            String municipality
    ) {}
}

