package fi.oph.akr.repository;

import fi.oph.akr.model.MeetingDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingDateRepository extends JpaRepository<MeetingDate, Long> {
  List<MeetingDate> findAllByOrderByDateAsc();
  List<MeetingDate> findAllByOrderByDateDesc();
}
