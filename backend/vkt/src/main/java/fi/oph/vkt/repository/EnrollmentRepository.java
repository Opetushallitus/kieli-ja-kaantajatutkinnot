package fi.oph.vkt.repository;

import fi.oph.vkt.model.Enrollment;
import fi.oph.vkt.model.ExamEvent;
import fi.oph.vkt.model.Person;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public interface EnrollmentRepository extends BaseRepository<Enrollment> {
  List<Enrollment> findByExamEvent(ExamEvent examEvent);
  Optional<Enrollment> findByExamEventAndPerson(ExamEvent examEvent, Person person);
}
