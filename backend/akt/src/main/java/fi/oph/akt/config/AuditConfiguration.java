package fi.oph.akt.config;

import fi.oph.akt.audit.LoggerImpl;
import fi.vm.sade.auditlog.ApplicationType;
import fi.vm.sade.auditlog.Audit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuditConfiguration {

  @Bean
  public Audit audit() {
    return new Audit(new LoggerImpl(), "akt", ApplicationType.VIRKAILIJA);
  }
}
