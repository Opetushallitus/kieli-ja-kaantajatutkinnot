package fi.oph.otr.config;

public class Constants {

  public static final String CALLER_ID = "1.2.246.562.10.00000000001.otr";
  public static final String EMAIL_SENDER_NAME = "Oikeustulkkirekisteri | Opetushallitus";
  public static final String SERVICENAME = "otr";
  public static final String APP_ROLE = "APP_OIKEUSTULKKIREKISTERI_OIKEUSTULKKI_CRUD";

  // For now, no containers are run in untuva during nighttime
  // Daily at 10:00
  public static final String CHECK_EXPIRING_QUALIFICATIONS_CRON = "0 0 10 * * *";
}
