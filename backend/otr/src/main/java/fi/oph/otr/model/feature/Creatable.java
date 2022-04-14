package fi.oph.otr.model.feature;

import java.time.LocalDateTime;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 13.42
 */
public interface Creatable {
  String getLuoja();

  void setLuoja(String oid);

  LocalDateTime getLuotu();
}
