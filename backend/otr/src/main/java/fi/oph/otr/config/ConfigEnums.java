package fi.oph.otr.config;

public enum ConfigEnums {
  CALLER_ID("1.2.246.562.10.00000000001.otr"),
  EMAIL_SENDER_NAME("Oikeustulkkirekisteri"),
  SERVICENAME("otr");

  private final String value;

  ConfigEnums(String v) {
    value = v;
  }

  public String value() {
    return value;
  }

  public static ConfigEnums fromValue(String v) {
    for (ConfigEnums c : ConfigEnums.values()) {
      if (c.value.equals(v)) {
        return c;
      }
    }
    throw new IllegalArgumentException(v);
  }
}
