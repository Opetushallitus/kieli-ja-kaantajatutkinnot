package fi.oph.yki.onr;

import fi.oph.yki.config.Constants;
import fi.vm.sade.javautils.nio.cas.CasClient;
import fi.vm.sade.javautils.nio.cas.CasClientBuilder;
import fi.vm.sade.javautils.nio.cas.CasConfig;
import java.time.Duration;
import org.asynchttpclient.RequestBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;

@Configuration
public class OnrClientConfig {

  @Bean
  public CasClient casClient(
    @Value("${cas.onr-url}") final String onrServiceUrl,
    @Value("${cas.cas-url}") final String casUrl,
    @Value("${cas.onr.username}") final String casUsername,
    @Value("${cas.onr.password}") final String casPassword
  ) {
    return CasClientBuilder.build(
      CasConfig.SpringSessionCasConfig(
        casUsername,
        casPassword,
        casUrl,
        onrServiceUrl,
        Constants.CALLER_ID,
        Constants.CALLER_ID
      )
    );
  }

  @Bean("casRequestBuilder")
  public RequestBuilder requestBuilder() {
    return new RequestBuilder()
      .addHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
      .addHeader("Caller-Id", Constants.CALLER_ID)
      .setRequestTimeout(Duration.ofMinutes(2));
  }
}
