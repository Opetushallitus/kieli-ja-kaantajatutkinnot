package fi.oph.vkt.util;

import static java.util.UUID.randomUUID;

import org.springframework.stereotype.Component;

@Component
public class UUIDSource {

  public String getRandomNonce() {
    return randomUUID().toString();
  }
}
