package fi.oph.akr.repository;

import fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO;
import fi.oph.akr.model.ContactRequestStatistic;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.tuple.Triple;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ContactRequestStatisticRepository extends BaseRepository<ContactRequestStatistic> {
  @Query(
    "SELECT new org.apache.commons.lang3.tuple.ImmutableTriple(c.year, c.month, c.day) FROM ContactRequestStatistic c"
  )
  Set<Triple<Integer, Integer, Integer>> listExistingStatisticDates();

  @Query(
    "SELECT new fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO(c.year, c.month, c.day, c.fromLang, c.toLang, c.contactRequestCount, c.contactCount)" +
    " FROM ContactRequestStatistic c" +
    " ORDER BY 1, 2, 3, 4, 5"
  )
  List<ContactRequestStatisticsDTO> calculateByDay();

  @Query(
    "SELECT new fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO(c.year, c.month, 1, c.fromLang, c.toLang, SUM(c.contactRequestCount), SUM(c.contactCount))" +
    " FROM ContactRequestStatistic c" +
    " GROUP BY c.year, c.month, c.fromLang, c.toLang" +
    " ORDER BY 1, 2, 3, 4, 5"
  )
  List<ContactRequestStatisticsDTO> calculateByMonth();

  @Query(
    "SELECT new fi.oph.akr.api.dto.clerk.ContactRequestStatisticsDTO(c.year, 1, 1, c.fromLang, c.toLang, SUM(c.contactRequestCount), SUM(c.contactCount))" +
    " FROM ContactRequestStatistic c" +
    " GROUP BY c.year, c.fromLang, c.toLang" +
    " ORDER BY 1, 2, 3, 4, 5"
  )
  List<ContactRequestStatisticsDTO> calculateByYear();
}
