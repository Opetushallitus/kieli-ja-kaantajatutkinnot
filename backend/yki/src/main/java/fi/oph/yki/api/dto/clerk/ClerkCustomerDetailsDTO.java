package fi.oph.yki.api.dto.clerk;

import lombok.Builder;
import java.util.List;

@Builder
public record ClerkCustomerDetailsDTO(
        ClerkCustomerPersonDTO person,
        List<ClerkCustomerRegistrationDTO> registrations,
        List<ClerkCustomerQueuedExamDTO> queuedExams,
        List<ClerkCustomerPastExamDTO> pastExams
) {

}
