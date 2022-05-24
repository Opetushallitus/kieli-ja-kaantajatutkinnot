package fi.oph.otr.config;

import fi.oph.otr.onr.OnrService;
import fi.oph.otr.onr.OnrServiceImpl;
import fi.oph.otr.onr.mock.OnrServiceMock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.spring5.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.templatemode.TemplateMode;

@Configuration
public class AppConfig {

  private static final Logger LOG = LoggerFactory.getLogger(AppConfig.class);

  @Bean
  @ConditionalOnProperty(name = "otr.onr.enabled", havingValue = "false")
  public OnrService onrServiceMock() {
    LOG.warn("OnrServiceMock in use");
    return new OnrServiceMock();
  }

  @Bean
  @ConditionalOnProperty(name = "otr.onr.enabled", havingValue = "true")
  public OnrService onrServiceImpl() {
    LOG.info("OnrServiceImpl in use");
    return new OnrServiceImpl();
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
}
