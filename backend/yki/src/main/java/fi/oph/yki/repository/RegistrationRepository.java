package fi.oph.yki.repository;

import fi.oph.yki.model.Registration;
import jakarta.persistence.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    @Query(""" 
        SELECT ed.exam_date
        FROM registration r
        JOIN exam_session es ON r.exam_session_id = es.id
        JOIN exam_date ed ON es.exam_date_id = ed.id
        WHERE r.person_oid = ?1
        AND r.kind = 'ADMISSION'
        """ // .stripIndent()
    )
    List<Registration> getAdmissionsByPerson(String oid);

    // @Getter @Setter @Entity @Table(mitä tähän?)
    public class MyRegistration {
        @Column(name = "exam_date")
        LocalDate examDate;
    }
}

