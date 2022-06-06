package fi.oph.otr.onr;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class OnrCasInterceptor {

  private final String checkUrl;

  private final String username;
  // TODO: implement to mimic ProxyInterceptor of old oikeustulkkirekisteri app
}
