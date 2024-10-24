package fi.oph.akr.config;

import fi.oph.akr.onr.OnrOperationApi;
import fi.oph.akr.onr.OnrOperationApiImpl;
import fi.oph.akr.onr.mock.OnrOperationApiMock;
import fi.oph.akr.service.email.sender.EmailSender;
import fi.oph.akr.service.email.sender.EmailSenderNoOp;
import fi.oph.akr.service.email.sender.EmailSenderViestintapalvelu;
import fi.vm.sade.javautils.nio.cas.CasClient;
import fi.vm.sade.javautils.nio.cas.CasClientBuilder;
import fi.vm.sade.javautils.nio.cas.CasConfig;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import org.thymeleaf.spring6.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

@Configuration
public class AppConfig {

  private static final Logger LOG = LoggerFactory.getLogger(AppConfig.class);

  @Bean
  @ConditionalOnProperty(name = "app.email.sending-enabled", havingValue = "false")
  public EmailSender emailSenderNoOp() {
    LOG.warn("EmailSenderNoOp in use");
    return new EmailSenderNoOp();
  }

  @Bean
  @ConditionalOnProperty(name = "app.email.sending-enabled", havingValue = "true")
  public EmailSender emailSender(@Value("${app.email.service-url}") final String emailServiceUrl) {
    LOG.info("emailServiceUrl: {}", emailServiceUrl);
    final WebClient webClient = webClientBuilderWithCallerId("email-sender-connection-provider")
      .baseUrl(emailServiceUrl)
      .build();
    return new EmailSenderViestintapalvelu(webClient, Constants.SERVICENAME, Constants.EMAIL_SENDER_NAME);
  }

  @Bean
  @ConditionalOnProperty(name = "app.onr.enabled", havingValue = "false")
  public OnrOperationApi onrOperationApiMock() {
    LOG.warn("OnrOperationApiMock in use");
    return new OnrOperationApiMock();
  }

  @Bean
  @ConditionalOnProperty(name = "app.onr.enabled", havingValue = "true")
  public OnrOperationApi onrOperationApiImpl(
    @Value("${app.onr.service-url}") final String onrServiceUrl,
    @Value("${cas.url}") final String casUrl,
    @Value("${app.onr.cas.username}") final String casUsername,
    @Value("${app.onr.cas.password}") final String casPassword
  ) {
    LOG.info("onrServiceUrl: {}", onrServiceUrl);
    final CasConfig casConfig = CasConfig.SpringSessionCasConfig(
      casUsername,
      casPassword,
      casUrl,
      onrServiceUrl,
      Constants.CALLER_ID,
      Constants.CALLER_ID
    );
    final CasClient casClient = CasClientBuilder.build(casConfig);
    return new OnrOperationApiImpl(casClient, onrServiceUrl);
  }

  @Bean
  public SpringResourceTemplateResolver emailTemplateResolver(final ApplicationContext applicationContext) {
    final SpringResourceTemplateResolver templateResolver = new SpringResourceTemplateResolver();
    templateResolver.setApplicationContext(applicationContext);
    templateResolver.setPrefix("classpath:/email-templates/");
    templateResolver.setSuffix(".html");
    templateResolver.setTemplateMode(TemplateMode.HTML);
    templateResolver.setOrder(2);
    return templateResolver;
  }

  private static WebClient.Builder webClientBuilderWithCallerId(final String connectionProviderName) {
    ConnectionProvider connectionProvider = ConnectionProvider
      .builder(connectionProviderName)
      .maxConnections(50)
      .maxIdleTime(Duration.ofSeconds(20))
      .maxLifeTime(Duration.ofSeconds(60))
      .pendingAcquireTimeout(Duration.ofSeconds(60))
      .evictInBackground(Duration.ofSeconds(120))
      .build();
    HttpClient httpClient = HttpClient.create(connectionProvider);
    return WebClient
      .builder()
      .defaultHeader("Caller-Id", Constants.CALLER_ID)
      .clientConnector(new ReactorClientHttpConnector(httpClient));
  }
}
