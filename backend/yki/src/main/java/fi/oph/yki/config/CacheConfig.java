package fi.oph.yki.config;

import java.util.concurrent.TimeUnit;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableCaching
@EnableScheduling
public class CacheConfig {

  public static final String PERMISSIONS_CACHE = "permissions";

  @Bean
  public CacheManager cacheManager() {
    return new ConcurrentMapCacheManager(PERMISSIONS_CACHE);
  }

  @Scheduled(fixedRate = 5, timeUnit = TimeUnit.MINUTES)
  public void evictVirkailijaCache() {
    final var cache = cacheManager().getCache(PERMISSIONS_CACHE);
    if (cache != null) {
      cache.clear();
    }
  }
}
