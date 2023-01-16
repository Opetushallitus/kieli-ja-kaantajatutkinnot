package fi.oph.akr.repository;

import fi.oph.akr.model.MeetingDate;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingDateRepository extends BaseRepository<MeetingDate> {
  List<MeetingDate> findAllByOrderByDateAsc();
  List<MeetingDate> findAllByOrderByDateDesc();
}
