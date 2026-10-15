package fi.oph.vkt.config;

public class Constants {

  public static final String CALLER_ID = "1.2.246.562.10.00000000001.vkt";
  public static final String EMAIL_SENDER_NAME = "Valtionhallinnon kielitutkinnot - Opetushallitus";
  public static final String EMAIL_SENDER_ADDRESS = "noreply@opintopolku.fi";
  // Allowed characters: a-z, A-Z, 0-9 and -_.
  public static final String EMAIL_ID_PREFIX = "vkt-";
  public static final Integer EMAIL_EXPIRATION_DAYS = 180;
  public static final String SERVICENAME = "vkt";
  public static final String APP_ADMIN_ROLE = "APP_VKT_PAAKAYTTAJA";
  public static final String APP_TV_ROLE = "APP_VKT_TUTKINNON_VASTAANOTTAJA";

  // For now, no containers are run in untuva during nighttime
  // Every minute
  public static final String CANCEL_UNFINISHED_ENROLLMENTS_CRON = "0 * * * * *";
  // Daily at 9:30
  public static final String DELETE_EXPIRED_RESERVATIONS_CRON = "0 30 9 * * *";
  // Daily at 10:00
  public static final String DELETE_OBSOLETE_PERSONS_CRON = "0 0 10 * * *";
  // Daily at 11:00
  public static final String DELETE_EXPIRED_TOKENS_CRON = "0 0 11 * * *";
}
