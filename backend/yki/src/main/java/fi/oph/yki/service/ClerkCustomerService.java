package fi.oph.yki.service;

import fi.oph.yki.api.dto.clerk.*;
import fi.oph.yki.model.Person;
import fi.oph.yki.repository.CustomerRepository;
import fi.oph.yki.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClerkCustomerService {
    // private final CustomerRepository clerkCustomerRepository;
    private final PersonRepository personRepository;


    private ClerkCustomerPersonDTO getClerkCustomerPersonDTO(String oid) {
        Person person = personRepository.getByOid(oid);
        return new ClerkCustomerPersonDTO(
                person.getFirstName(),
                person.getLastName(),
                "010170-960F",
                person.getOid(),
                "246",
                "FI", // ServiceLanguage.FI,
                "FI", // CertificateLanguage.FI,
                person.getPhoneNumber(),
                person.getAddress(),
                person.getEmail()
            );
    }

    public List<ClerkCustomerDetailsDTO> getClerkCustomerDetails(String oid) {

        ClerkCustomerPersonDTO person = getClerkCustomerPersonDTO(oid);

        List<ClerkCustomerDetailsDTO> resp = List.of(
                new ClerkCustomerDetailsDTO(
                        person,
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
