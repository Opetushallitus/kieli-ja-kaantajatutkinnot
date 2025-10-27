package fi.oph.yki.api.clerk;

import static org.springframework.http.MediaType.ALL_VALUE;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.yki.api.dto.clerk.*;
import io.swagger.v3.oas.annotations.Operation;
import lombok.Builder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(
        // value = "/yki/v2/api/clerk/customer",
        value = "/v2/api/clerk/customer",
        consumes = APPLICATION_JSON_VALUE,
        produces = APPLICATION_JSON_VALUE
)
public class ClerkCustomerDetailsController {
    private static final String TAG_CUSTOMER = "Clerk customer API";

    @GetMapping(path = "/{customerId:\\d+}", consumes = ALL_VALUE)
    @Operation(tags = TAG_CUSTOMER, summary = "Get customer details")
    public List<ClerkCustomerDetailsDTO> getCustomerDetails(@PathVariable int customerId) {
        return List.of(
                new ClerkCustomerDetailsDTO(
                        "1",
                        new ClerkCustomerPersonDTO(
                             "Aino",
                            "Osallistuja",
                            "010170-960F",
                            "1.2.246.562.24.82364099322",
                            "246",
                            "FI", // ServiceLanguage.FI,
                            "FI", // CertificateLanguage.FI,
                            "+358 401234567",
                            "Katuosoite 123, 33100 Tampere",
                            "aino.osallistuja@loremipsum.fi"
                        ),
                        // registrations
                        List.of(
                            // first
                            new ClerkCustomerRegistrationDTO(
                                "2025-09-01T00:00:00.000Z",
                                // ExamLanguage.FIN &  ExamLevel.KESKI,
                                new ClerkCustomerRegistrationDTO.Exam("FIN", "KESKI"),
                                new ClerkCustomerRegistrationDTO.Location("Testipaikan nimi", "Kajaani"),
                                //  RegistrationStates.Completed,
                                new ClerkCustomerRegistrationDTO.Status("COMPLETED", Optional.of("2025-05-01")),
                                "2025-05-06"
                            ),
                            // second
                            new ClerkCustomerRegistrationDTO(
                                "2025-10-23Z",
                                // ExamLanguage.DEU & ExamLevel.YLIN,
                                new ClerkCustomerRegistrationDTO.Exam("DEU", "YLIN"),
                                new ClerkCustomerRegistrationDTO.Location("Lassilan koulu", "Lassila"),
                                //  RegistrationStates.PaidAndCancelled,
                                new ClerkCustomerRegistrationDTO.Status("PAID_AND_CANCELLED", Optional.of("2025-05-01")),
                                "2025-05-06"
                            ),
                            // third
                            new ClerkCustomerRegistrationDTO(
                                "2025-11-30",
                                // ExamLanguage.SWE &  ExamLevel.PERUS,
                                new ClerkCustomerRegistrationDTO.Exam("SWE", "PERUS"),
                                new ClerkCustomerRegistrationDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                //  RegistrationStates.Cancelled,
                                new ClerkCustomerRegistrationDTO.Status("CANCELLED", Optional.empty()),
                                "2025-05-06"
                            ),
                            // fourth
                            new ClerkCustomerRegistrationDTO(
                                "2025-12-30",
                                // ExamLanguage.SWE & ExamLevel.YLIN,
                                new ClerkCustomerRegistrationDTO.Exam("SWE", "YLIN"),
                                new ClerkCustomerRegistrationDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                //  RegistrationStates.FreeRegistrationPending,
                                new ClerkCustomerRegistrationDTO.Status("FREE_REGISTRATION_PENDING", Optional.empty()),
                                "2025-05-06"
                            )
                        ),
                        // queuedExams
                        List.of(
                            new ClerkCustomerQueuedExamDTO(
                                "2025-09-05",
                                new ClerkCustomerQueuedExamDTO.Exam("FIN", "KESKI"),
                                new ClerkCustomerQueuedExamDTO.Location("Testipaikan nimi", "Kajaani"),
                                new ClerkCustomerQueuedExamDTO.Status("SUBMITTED", Optional.empty()),
                                "2025-05-06",
                                new ClerkCustomerQueuedExamDTO.QueueSpotOffered("OFFERED", Optional.of("2025-09-20"))
                            ),
                            new ClerkCustomerQueuedExamDTO(
                                "2025-10-18",
                                new ClerkCustomerQueuedExamDTO.Exam("DEU", "YLIN"),
                                new ClerkCustomerQueuedExamDTO.Location("Lassilan koulu", "Lassila"),
                                new ClerkCustomerQueuedExamDTO.Status("EXPIRED", Optional.empty()),
                                "2025-05-06",
                                new ClerkCustomerQueuedExamDTO.QueueSpotOffered("NOT_ACCEPTED", Optional.of("2025-08-04"))
                            ),
                            new ClerkCustomerQueuedExamDTO(
                                "2025-11-22",
                                new ClerkCustomerQueuedExamDTO.Exam("SWE", "PERUS"),
                                new ClerkCustomerQueuedExamDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                new ClerkCustomerQueuedExamDTO.Status("CANCELLED", Optional.empty()),
                                "2025-05-06",
                                new ClerkCustomerQueuedExamDTO.QueueSpotOffered("NOT_OFFERED", Optional.empty())
                            ),
                            new ClerkCustomerQueuedExamDTO(
                                "2025-11-22",
                                new ClerkCustomerQueuedExamDTO.Exam("SWE", "PERUS"),
                                new ClerkCustomerQueuedExamDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                new ClerkCustomerQueuedExamDTO.Status("FREE_REGISTRATION_PENDING", Optional.empty()),
                                "2025-05-06",
                                new ClerkCustomerQueuedExamDTO.QueueSpotOffered("NOT_OFFERED", Optional.empty())
                            )
                        ),
                        // pastExams
                        List.of(
                            new ClerkCustomerPastExamDTO(
                                "2025-07-20",
                                new ClerkCustomerPastExamDTO.Exam("FIN", "PERUS"),
                                new ClerkCustomerPastExamDTO.Location("Testipaikan nimi", "Kajaani"),
                                "REVIEWED"
                            ),
                            new ClerkCustomerPastExamDTO(
                                "2025-03-25",
                                new ClerkCustomerPastExamDTO.Exam("SWE", "KESKI"),
                                new ClerkCustomerPastExamDTO.Location("Lassilan koulu", "Lassila"),
                                "CANCELLED"
                            ),
                            new ClerkCustomerPastExamDTO(
                                "2025-03-25",
                                new ClerkCustomerPastExamDTO.Exam("SWE", "KESKI"),
                                new ClerkCustomerPastExamDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                "REGISTERED"
                            )
                        )
                )
        );
    }
}
