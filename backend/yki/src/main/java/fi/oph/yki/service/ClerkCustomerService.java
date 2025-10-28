package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ClerkCustomerService {
    private final ClerkCustomerRepository clerkCustomerRepository;

    public List<ClerkCustomerDetailsDTO> getClerkCustomerDetails(int customerId) {
        List<ClerkCustomerDetailsDTO> resp = List.of(
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
                                        LocalDate.of(2025, 9, 1),
                                        // ExamLanguage.FIN &  ExamLevel.KESKI,
                                        new ClerkCustomerRegistrationDTO.Exam("FIN", "KESKI"),
                                        new ClerkCustomerRegistrationDTO.Location("Testipaikan nimi", "Kajaani"),
                                        //  RegistrationStates.Completed,
                                        new ClerkCustomerRegistrationDTO.Status("COMPLETED", Optional.of(LocalDate.of(2025, 5, 1))),
                                        LocalDate.of(2025, 5, 6)
                                ),
                                // second
                                new ClerkCustomerRegistrationDTO(
                                        LocalDate.of(2025, 10, 23),
                                        // ExamLanguage.DEU & ExamLevel.YLIN,
                                        new ClerkCustomerRegistrationDTO.Exam("DEU", "YLIN"),
                                        new ClerkCustomerRegistrationDTO.Location("Lassilan koulu", "Lassila"),
                                        //  RegistrationStates.PaidAndCancelled,
                                        new ClerkCustomerRegistrationDTO.Status("PAID_AND_CANCELLED", Optional.of(LocalDate.of(2025, 5, 1))),
                                        LocalDate.of(2025,5, 6)
                                ),
                                // third
                                new ClerkCustomerRegistrationDTO(
                                        LocalDate.of(2025, 11, 30),
                                        // ExamLanguage.SWE &  ExamLevel.PERUS,
                                        new ClerkCustomerRegistrationDTO.Exam("SWE", "PERUS"),
                                        new ClerkCustomerRegistrationDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                        //  RegistrationStates.Cancelled,
                                        new ClerkCustomerRegistrationDTO.Status("CANCELLED", Optional.empty()),
                                        LocalDate.of(2025, 5, 6)
                                ),
                                // fourth
                                new ClerkCustomerRegistrationDTO(
                                        LocalDate.of(2025, 12, 30),
                                        // ExamLanguage.SWE & ExamLevel.YLIN,
                                        new ClerkCustomerRegistrationDTO.Exam("SWE", "YLIN"),
                                        new ClerkCustomerRegistrationDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                        //  RegistrationStates.FreeRegistrationPending,
                                        new ClerkCustomerRegistrationDTO.Status("FREE_REGISTRATION_PENDING", Optional.empty()),
                                        LocalDate.of(2025, 5, 6)
                                )
                        ),
                        // queuedExams
                        List.of(
                                new ClerkCustomerQueuedExamDTO(
                                        LocalDate.of(2025, 9, 5),
                                        new ClerkCustomerQueuedExamDTO.Exam("FIN", "KESKI"),
                                        new ClerkCustomerQueuedExamDTO.Location("Testipaikan nimi", "Kajaani"),
                                        new ClerkCustomerQueuedExamDTO.Status("SUBMITTED", Optional.empty()),
                                        LocalDate.of(2025, 5, 6),
                                        new ClerkCustomerQueuedExamDTO.QueueSpotOffered("OFFERED", Optional.of(LocalDate.of(2025,9,20)))
                                ),
                                new ClerkCustomerQueuedExamDTO(
                                        LocalDate.of(2025, 10, 18),
                                        new ClerkCustomerQueuedExamDTO.Exam("DEU", "YLIN"),
                                        new ClerkCustomerQueuedExamDTO.Location("Lassilan koulu", "Lassila"),
                                        new ClerkCustomerQueuedExamDTO.Status("EXPIRED", Optional.empty()),
                                        LocalDate.of(2025, 5, 6),
                                        new ClerkCustomerQueuedExamDTO.QueueSpotOffered("NOT_ACCEPTED", Optional.of(LocalDate.of(2025,8,4)))
                                ),
                                new ClerkCustomerQueuedExamDTO(
                                        LocalDate.of(2025, 11, 22),
                                        new ClerkCustomerQueuedExamDTO.Exam("SWE", "PERUS"),
                                        new ClerkCustomerQueuedExamDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                        new ClerkCustomerQueuedExamDTO.Status("CANCELLED", Optional.empty()),
                                        LocalDate.of(2025, 5, 6),
                                        new ClerkCustomerQueuedExamDTO.QueueSpotOffered("NOT_OFFERED", Optional.empty())
                                ),
                                new ClerkCustomerQueuedExamDTO(
                                        LocalDate.of(2025, 11, 22),
                                        new ClerkCustomerQueuedExamDTO.Exam("SWE", "PERUS"),
                                        new ClerkCustomerQueuedExamDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                        new ClerkCustomerQueuedExamDTO.Status("FREE_REGISTRATION_PENDING", Optional.empty()),
                                        LocalDate.of(2025, 5, 6),
                                        new ClerkCustomerQueuedExamDTO.QueueSpotOffered("NOT_OFFERED", Optional.empty())
                                )
                        ),
                        // pastExams
                        List.of(
                                new ClerkCustomerPastExamDTO(
                                        LocalDate.of(2025, 7, 20),
                                        new ClerkCustomerPastExamDTO.Exam("FIN", "PERUS"),
                                        new ClerkCustomerPastExamDTO.Location("Testipaikan nimi", "Kajaani"),
                                        "REVIEWED"
                                ),
                                new ClerkCustomerPastExamDTO(
                                        LocalDate.of(2025, 3, 25),
                                        new ClerkCustomerPastExamDTO.Exam("SWE", "KESKI"),
                                        new ClerkCustomerPastExamDTO.Location("Lassilan koulu", "Lassila"),
                                        "CANCELLED"
                                ),
                                new ClerkCustomerPastExamDTO(
                                        LocalDate.of(2025, 3, 25),
                                        new ClerkCustomerPastExamDTO.Exam("SWE", "KESKI"),
                                        new ClerkCustomerPastExamDTO.Location("Lorem ipsum oppilaitos", "Helsinki"),
                                        "REGISTERED"
                                )
                        )
                )
        );

        return resp;
    }
}
