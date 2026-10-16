package fi.oph.yki.repository;

import fi.oph.yki.model.ShedLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShedLockRepository extends JpaRepository<ShedLock, String> {
  // Computed by Postgres itself so staleness checks aren't thrown off by any mismatch between
  // the JVM's and the database's configured timezone (see ScheduledTaskMonitor). locked_at
  // (written via ShedLock's usingDbTime()) is a naive UTC timestamp, so CURRENT_TIMESTAMP
  // (timestamptz) is normalized to naive UTC too before subtracting - otherwise Postgres casts
  // the naive side using the reading session's timezone, silently reintroducing the same skew
  // one layer down. Null if the task has no row yet.
  @Query(
    value = "SELECT EXTRACT(EPOCH FROM ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC') - locked_at)) FROM shedlock WHERE name = :name",
    nativeQuery = true
  )
  Double findAgeInSeconds(@Param("name") String name);
}
