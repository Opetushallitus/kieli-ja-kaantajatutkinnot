package fi.oph.akr.config;

public class Constants {

  public static final String CALLER_ID = "1.2.246.562.10.00000000001.akr";
  public static final String EMAIL_SENDER_NAME = "AKR | Opetushallitus";
  public static final String SERVICENAME = "akr";
  public static final String APP_ROLE = "APP_AKT";

  // For now, no containers are run in untuva during nighttime
  // Daily at 9:00
  public static final String EVICT_PUBLIC_TRANSLATORS_CACHE_CRON = "0 0 9 * * *";
  // Daily at 9:30
  public static final String GENERATE_STATISTICS_CRON = "0 30 9 * * *";
  // Daily at 10:00
  public static final String CHECK_EXPIRING_AUTHORISATIONS_CRON = "0 0 10 * * *";
  // Daily at 10:30
  public static final String DESTROY_OBSOLETE_CONTACT_REQUESTS_CRON = "0 30 10 * * *";
}
