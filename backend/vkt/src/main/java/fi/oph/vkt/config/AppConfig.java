package fi.oph.vkt.config;

import fi.oph.vkt.payment.PaymentProvider;
import fi.oph.vkt.payment.paytrail.PaytrailConfig;
import fi.oph.vkt.payment.paytrail.PaytrailPaymentProvider;
import fi.oph.vkt.repository.CasTicketRepository;
import fi.oph.vkt.service.auth.CasSessionMappingStorage;
import fi.oph.vkt.service.auth.ticketValidator.CasTicketValidator;
import fi.oph.vkt.service.email.sender.EmailSender;
import fi.oph.vkt.service.email.sender.EmailSenderNoOp;
import fi.oph.vkt.service.email.sender.EmailSenderViestintapalvelu;
import fi.oph.vkt.util.UUIDSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.session.FindByIndexNameSessionRepository;
import org.springframework.session.Session;
import org.springframework.web.reactive.function.client.WebClient;
import org.thymeleaf.spring6.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.ContainerCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;

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
  public EmailSender emailSender(@Value("${app.email.service-url}") String emailServiceUrl) {
    LOG.info("emailServiceUrl: {}", emailServiceUrl);
    final WebClient webClient = webClientBuilderWithCallerId().baseUrl(emailServiceUrl).build();
    return new EmailSenderViestintapalvelu(webClient, Constants.SERVICENAME, Constants.EMAIL_SENDER_NAME);
  }

  @Bean
  public PaymentProvider paytrailPaymentProvider(final Environment environment) {
    final PaytrailConfig paytrailConfig = PaytrailConfig
      .builder()
      .secret(environment.getRequiredProperty("app.payment.paytrail.secret"))
      .account(environment.getRequiredProperty("app.payment.paytrail.account"))
      .baseUrl(environment.getRequiredProperty("app.base-url.api"))
      .build();

    final WebClient webClient = webClientBuilderWithCallerId()
      .baseUrl(environment.getRequiredProperty("app.payment.paytrail.url"))
      .build();

    final UUIDSource uuidSource = new UUIDSource();

    return new PaytrailPaymentProvider(webClient, paytrailConfig, uuidSource);
  }

  @Bean
  public WebClient koskiClient(final Environment environment) {
    return webClientBuilderWithCallerId()
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

  @Bean
  public CasTicketValidator casTicketValidator(final Environment environment) {
    final WebClient webClient = webClientBuilderWithCallerId()
      .baseUrl(environment.getRequiredProperty("app.cas-oppija.validate-ticket-url"))
      .build();

    return new CasTicketValidator(environment, webClient);
  }

  @Bean
  public CasSessionMappingStorage sessionMappingStorage(
    final FindByIndexNameSessionRepository<? extends Session> sessions,
    final CasTicketRepository casTicketRepository
  ) {
    return new CasSessionMappingStorage(sessions, casTicketRepository);
  }

  @Bean
  public MessageSource messageSource() {
    final ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
    messageSource.setBasename("localisation");
    messageSource.setDefaultEncoding("utf-8");
    return messageSource;
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

  private static WebClient.Builder webClientBuilderWithCallerId() {
    return WebClient.builder().defaultHeader("Caller-Id", Constants.CALLER_ID);
  }
}
