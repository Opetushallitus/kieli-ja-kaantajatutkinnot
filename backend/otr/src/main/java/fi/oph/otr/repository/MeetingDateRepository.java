package fi.oph.otr.repository;

import fi.oph.otr.model.MeetingDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingDateRepository extends JpaRepository<MeetingDate, Long> {
  List<MeetingDate> findAllByOrderByDateDesc();
}
