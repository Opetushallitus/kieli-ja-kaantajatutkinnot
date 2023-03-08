package fi.oph.akr.scheduled;

import fi.oph.akr.config.CacheConfig;
import fi.oph.akr.config.Constants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CacheEvictScheduled {

  private static final Logger LOG = LoggerFactory.getLogger(CacheEvictScheduled.class);

  @Scheduled(cron = Constants.EVICT_PUBLIC_TRANSLATORS_CACHE_CRON)
  @CacheEvict(cacheNames = CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS, allEntries = true)
  public void evictPublicTranslatorsCache() {
    LOG.info("Evicting cache: " + CacheConfig.CACHE_NAME_PUBLIC_TRANSLATORS);
  }
}
