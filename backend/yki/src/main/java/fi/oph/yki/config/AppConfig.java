package fi.oph.yki.config;

import fi.oph.yki.service.email.sender.EmailSender;
import fi.oph.yki.service.email.sender.EmailSenderNoOp;
import fi.oph.yki.service.email.sender.EmailSenderViestintapalvelu;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.ContainerCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;

@Configuration
public class AppConfig {

  private static final Logger LOG = LoggerFactory.getLogger(AppConfig.class);

  @Bean
  public WebClient koskiClient(final Environment environment) {
    return webClientBuilderWithCallerId("koski-connection-provider")
      .baseUrl(environment.getRequiredProperty("app.koski.url"))
      .defaultHeaders(headers -> {
        headers.setBasicAuth(
          environment.getRequiredProperty("app.koski.user"),
          environment.getRequiredProperty("app.koski.password")
        );
        headers.setContentType(MediaType.APPLICATION_JSON);
      })
      .build();
  }

  private static WebClient.Builder webClientBuilderWithCallerId(final String connectionProviderName) {
    final ConnectionProvider connectionProvider = ConnectionProvider
      .builder(connectionProviderName)
      .maxConnections(50)
      .maxIdleTime(Duration.ofSeconds(20))
      .maxLifeTime(Duration.ofSeconds(60))
      .pendingAcquireTimeout(Duration.ofSeconds(60))
      .evictInBackground(Duration.ofSeconds(120))
      .build();
    final HttpClient httpClient = HttpClient.create(connectionProvider);
    return WebClient
      .builder()
      .defaultHeader("Caller-Id", Constants.CALLER_ID)
      .clientConnector(new ReactorClientHttpConnector(httpClient));
  }

  @Bean
  @ConditionalOnProperty(name = "app.email.sending-enabled", havingValue = "false")
  public EmailSender emailSenderNoOp() {
    LOG.warn("EmailSenderNoOp in use");
    return new EmailSenderNoOp();
  }

  @Bean
  @ConditionalOnProperty(name = "app.email.sending-enabled", havingValue = "true")
  public EmailSender emailSender(@Value("${app.email.service-url}") String emailServiceUrl) {
    LOG.info("emailServiceUrl: {}", emailServiceUrl);
    final WebClient webClient = webClientBuilderWithCallerId("email-sender-connection-provider")
      .baseUrl(emailServiceUrl)
      .build();
    return new EmailSenderViestintapalvelu(webClient, Constants.SERVICENAME, Constants.EMAIL_SENDER_NAME);
  }

  @Bean
  @Profile("dev")
  public AwsCredentialsProvider localstackAwsCredentialsProvider(final Environment environment) {
    return StaticCredentialsProvider.create(
      AwsBasicCredentials.create(
        environment.getRequiredProperty("app.aws.localstack.access-key-id"),
        environment.getRequiredProperty("app.aws.localstack.secret-access-key")
      )
    );
  }

  @Bean
  @Profile("!dev")
  public AwsCredentialsProvider defaultAwsCredentialsProvider() {
    return ContainerCredentialsProvider.builder().build();
  }
}
