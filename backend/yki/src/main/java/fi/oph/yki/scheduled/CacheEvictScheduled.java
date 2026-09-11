package fi.oph.yki.scheduled;

import fi.oph.yki.config.CacheConfig;
import fi.oph.yki.config.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CacheEvictScheduled {

  private static final Logger LOG = LoggerFactory.getLogger(CacheEvictScheduled.class);

  @Scheduled(cron = Constants.KOODISTO_CACHE_CLEAR_CRON)
  @CacheEvict(cacheNames = CacheConfig.KOODISTO_CACHE, allEntries = true)
  public void evictKoodistoCache() {
    LOG.info("Evicting cache: " + CacheConfig.KOODISTO_CACHE);
  }
}
