package fi.oph.akr.config;

import fi.oph.akr.service.email.sender.EmailSender;
import fi.oph.akr.service.email.sender.EmailSenderNoOp;
import fi.oph.akr.service.email.sender.EmailSenderViestintapalvelu;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;

@Configuration
public class AppConfig {

  private static final Logger LOG = LoggerFactory.getLogger(AppConfig.class);

  @Bean
  @ConditionalOnProperty(name = "akr.email.sending-enabled", havingValue = "false")
  public EmailSender emailSenderNoOp() {
    LOG.warn("EmailSenderNoOp in use");
    return new EmailSenderNoOp();
  }

  @Bean
  @ConditionalOnProperty(name = "akr.email.sending-enabled", havingValue = "true")
  public EmailSender emailSender(@Value("${akr.email.ryhmasahkoposti-service-url}") String emailServiceUrl) {
    LOG.info("emailServiceUrl:{}", emailServiceUrl);
    final WebClient webClient = webClientBuilderWithCallerId().baseUrl(emailServiceUrl).build();
    return new EmailSenderViestintapalvelu(webClient, Constants.SERVICENAME, Constants.EMAIL_SENDER_NAME);
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

  private static WebClient.Builder webClientBuilderWithCallerId() {
    return WebClient.builder().defaultHeader("Caller-Id", Constants.CALLER_ID);
  }
}
