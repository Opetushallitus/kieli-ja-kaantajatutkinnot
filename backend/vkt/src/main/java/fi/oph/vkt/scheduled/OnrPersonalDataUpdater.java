package fi.oph.vkt.scheduled;

import fi.oph.vkt.service.ExaminerDetailsService;
import fi.oph.vkt.service.PublicPersonService;
import fi.oph.vkt.util.SchedulingUtil;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OnrPersonalDataUpdater {

  private static final Logger LOG = LoggerFactory.getLogger(OnrPersonalDataUpdater.class);
  private static final String INITIAL_DELAY_EXAMINER = "PT0S";
  private static final String INITIAL_DELAY_PERSON_OID = "PT0M";
  private static final String INITIAL_DELAY_PERSON_SYNC = "PT10M";
  private static final String FIXED_DELAY = "PT5M";
  private static final String FIXED_PERSON_OID_DELAY = "PT1H";
  private static final String FIXED_PERSON_SYNC_DELAY = "PT10M";
  private static final String LOCK_AT_LEAST = "PT0S";
  private static final String LOCK_AT_MOST = "PT3M";

  @Resource
  private final ExaminerDetailsService examinerDetailsService;

  @Resource
  private final PublicPersonService publicPersonService;

  @Scheduled(initialDelayString = INITIAL_DELAY_EXAMINER, fixedDelayString = FIXED_DELAY)
  @SchedulerLock(name = "updateExaminerDataFromOnr", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void updateExaminerOnrCache() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("updateExaminerDataFromOnr");
      examinerDetailsService.updateStoredPersonalData();
    });
  }

  @Scheduled(initialDelayString = INITIAL_DELAY_PERSON_OID, fixedDelayString = FIXED_PERSON_OID_DELAY)
  @SchedulerLock(name = "insertPersonsWithoutOid", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncPersonWithoutOidToOnr() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("syncPersonWithoutOidToOnr");
      publicPersonService.syncPersonOidData();
    });
  }

  @Scheduled(initialDelayString = INITIAL_DELAY_PERSON_SYNC, fixedDelayString = FIXED_PERSON_SYNC_DELAY)
  @SchedulerLock(name = "updatePersonDataFromOnr", lockAtLeastFor = LOCK_AT_LEAST, lockAtMostFor = LOCK_AT_MOST)
  public void syncPersonNamesToOnr() {
    SchedulingUtil.runWithScheduledUser(() -> {
      LOG.debug("syncPersonNamesToOnr");
      publicPersonService.syncPersonNameData();
    });
  }
}
