package fi.oph.vkt.config;

public class Constants {

  public static final String CALLER_ID = "1.2.246.562.10.00000000001.vkt";
  public static final String EMAIL_SENDER_NAME = "Valtionhallinnon kielitutkinnot | Opetushallitus";
  public static final String SERVICENAME = "vkt";
  public static final String APP_ROLE = "APP_VKT";

  // Daily at 9:00
  public static final String CANCELED_UNFINISHED_ENROLLMENTS_DESTROYER_CRON = "0 0 9 * * *";
}
