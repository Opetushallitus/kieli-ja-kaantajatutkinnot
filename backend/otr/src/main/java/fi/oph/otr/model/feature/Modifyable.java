package fi.oph.otr.model.feature;

import java.time.LocalDateTime;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 13.44
 */
public interface Modifyable {
  LocalDateTime getMuokattu();

  void setMuokattu(LocalDateTime at);

  String getMuokkaaja();

  void setMuokkaaja(String oid);
}
