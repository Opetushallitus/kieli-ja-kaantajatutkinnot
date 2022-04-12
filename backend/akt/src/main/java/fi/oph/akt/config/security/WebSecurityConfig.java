package fi.oph.akt.config.security;

import fi.oph.akt.config.ConfigEnums;
import fi.oph.akt.config.CustomAccessDeniedHandler;
import fi.vm.sade.java_utils.security.OpintopolkuCasAuthenticationFilter;
import fi.vm.sade.javautils.kayttooikeusclient.OphUserDetailsServiceImpl;
import org.jasig.cas.client.session.HashMapBackedSessionMappingStorage;
import org.jasig.cas.client.session.SessionMappingStorage;
import org.jasig.cas.client.session.SingleSignOutFilter;
import org.jasig.cas.client.validation.Cas20ProxyTicketValidator;
import org.jasig.cas.client.validation.TicketValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Profile("!dev")
@Configuration
@EnableGlobalMethodSecurity(jsr250Enabled = false, prePostEnabled = true, securedEnabled = true)
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

  public static final String AKT_ROLE = "APP_AKT";

  private final Environment environment;
  private final SessionMappingStorage sessionMappingStorage = new HashMapBackedSessionMappingStorage();

  @Autowired
  public WebSecurityConfig(Environment environment) {
    this.environment = environment;
  }

  @Bean
  public ServiceProperties serviceProperties() {
    ServiceProperties serviceProperties = new ServiceProperties();
    serviceProperties.setService(
      environment.getRequiredProperty("cas.service") + environment.getRequiredProperty("cas.login-path")
    );
    serviceProperties.setSendRenew(environment.getRequiredProperty("cas.send-renew", Boolean.class));
    serviceProperties.setAuthenticateAllArtifacts(true);
    return serviceProperties;
  }

  //
  // CAS authentication provider (authentication manager)
  //
  @Bean
  public CasAuthenticationProvider casAuthenticationProvider() {
    CasAuthenticationProvider casAuthenticationProvider = new CasAuthenticationProvider();
    String host = environment.getProperty("host-alb", environment.getRequiredProperty("host-virkailija"));

    casAuthenticationProvider.setUserDetailsService(new OphUserDetailsServiceImpl(host, ConfigEnums.CALLER_ID.value()));

    casAuthenticationProvider.setServiceProperties(serviceProperties());
    casAuthenticationProvider.setTicketValidator(ticketValidator());
    casAuthenticationProvider.setKey(environment.getRequiredProperty("cas.key"));
    return casAuthenticationProvider;
  }

  @Bean
  public TicketValidator ticketValidator() {
    Cas20ProxyTicketValidator ticketValidator = new Cas20ProxyTicketValidator(
      environment.getRequiredProperty("cas.url")
    );
    ticketValidator.setAcceptAnyProxy(true);
    return ticketValidator;
  }

  //
  // CAS filter
  //
  @Bean
  public CasAuthenticationFilter casAuthenticationFilter() throws Exception {
    OpintopolkuCasAuthenticationFilter casAuthenticationFilter = new OpintopolkuCasAuthenticationFilter(
      serviceProperties()
    );
    casAuthenticationFilter.setAuthenticationManager(authenticationManager());
    casAuthenticationFilter.setFilterProcessesUrl("/virkailija" + environment.getRequiredProperty("cas.login-path"));
    return casAuthenticationFilter;
  }

  //
  // CAS single logout filter
  // requestSingleLogoutFilter is not configured because our users always sign out through CAS
  // logout (using virkailija-raamit
  // logout button) when CAS calls this filter if user has ticket to this service.
  //
  @Bean
  public SingleSignOutFilter singleSignOutFilter() {
    SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
    singleSignOutFilter.setIgnoreInitConfiguration(true);
    singleSignOutFilter.setSessionMappingStorage(sessionMappingStorage);
    return singleSignOutFilter;
  }

  //
  // CAS entry point
  //
  @Bean
  public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
    CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
    casAuthenticationEntryPoint.setLoginUrl(environment.getProperty("cas.login"));
    casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
    return casAuthenticationEntryPoint;
  }

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    commonConfig(http)
      .addFilter(casAuthenticationFilter())
      .exceptionHandling()
      .accessDeniedHandler(CustomAccessDeniedHandler.create())
      .authenticationEntryPoint(casAuthenticationEntryPoint())
      .and()
      .logout()
      .logoutRequestMatcher(new AntPathRequestMatcher(environment.getRequiredProperty("cas.logout-path")))
      .logoutSuccessUrl(environment.getRequiredProperty("cas.logout-success-path"))
      .deleteCookies(environment.getRequiredProperty("cas.cookie-name"))
      .invalidateHttpSession(true)
      .and()
      .addFilterBefore(singleSignOutFilter(), CasAuthenticationFilter.class);
  }

  public static HttpSecurity commonConfig(final HttpSecurity http) throws Exception {
    return configCsrf(http)
      .authorizeRequests()
      .mvcMatchers("/api/v1/clerk/**", "/virkailija/**", "/virkailija")
      .hasRole(AKT_ROLE)
      .antMatchers("/", "/**")
      .permitAll()
      .anyRequest()
      .authenticated()
      .and();
  }

  public static HttpSecurity configCsrf(final HttpSecurity http) throws Exception {
    final CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
    csrfTokenRepository.setCookieName("CSRF");
    csrfTokenRepository.setHeaderName("CSRF");
    return http.csrf().csrfTokenRepository(csrfTokenRepository).and();
  }

  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    auth.authenticationProvider(casAuthenticationProvider());
  }
}
