package fi.oph.otr.repository;

import fi.oph.otr.model.MeetingDate;
import java.util.List;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingDateRepository extends BaseRepository<MeetingDate> {
  List<MeetingDate> findAllByOrderByDateDesc();
}
