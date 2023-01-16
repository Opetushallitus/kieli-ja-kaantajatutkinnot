package fi.oph.akr.repository;

import fi.oph.akr.api.dto.clerk.EmailStatisticsDTO;
import fi.oph.akr.model.EmailStatistic;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.tuple.Triple;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailStatisticRepository extends BaseRepository<EmailStatistic> {
  @Query("SELECT new org.apache.commons.lang3.tuple.ImmutableTriple(c.year, c.month, c.day) FROM EmailStatistic c")
  Set<Triple<Integer, Integer, Integer>> listExistingStatisticDates();

  @Query(
    "SELECT new fi.oph.akr.api.dto.clerk.EmailStatisticsDTO(c.year, c.month, c.day, c.emailType, c.count)" +
    " FROM EmailStatistic c" +
    " ORDER BY 1, 2, 3, 4"
  )
  List<EmailStatisticsDTO> calculateByDay();

  @Query(
    "SELECT new fi.oph.akr.api.dto.clerk.EmailStatisticsDTO(c.year, c.month, 1, c.emailType, SUM(c.count))" +
    " FROM EmailStatistic c" +
    " GROUP BY c.year, c.month, c.emailType" +
    " ORDER BY 1, 2, 3, 4"
  )
  List<EmailStatisticsDTO> calculateByMonth();

  @Query(
    "SELECT new fi.oph.akr.api.dto.clerk.EmailStatisticsDTO(c.year, 1, 1, c.emailType, SUM(c.count))" +
    " FROM EmailStatistic c" +
    " GROUP BY c.year, c.emailType" +
    " ORDER BY 1, 2, 3, 4"
  )
  List<EmailStatisticsDTO> calculateByYear();
}
