package fi.oph.vkt.config.security;

import fi.oph.vkt.config.Constants;
import fi.oph.vkt.util.OpintopolkuCasAuthenticationFilter;
import fi.vm.sade.javautils.kayttooikeusclient.OphUserDetailsServiceImpl;
import java.util.Map;
import org.apereo.cas.client.session.HashMapBackedSessionMappingStorage;
import org.apereo.cas.client.session.SessionMappingStorage;
import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas20ProxyTicketValidator;
import org.apereo.cas.client.validation.TicketValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.cas.ServiceProperties;
import org.springframework.security.cas.authentication.CasAuthenticationProvider;
import org.springframework.security.cas.web.CasAuthenticationEntryPoint;
import org.springframework.security.cas.web.CasAuthenticationFilter;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.expression.WebExpressionAuthorizationManager;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Profile("!dev")
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  private final Environment environment;
  private final SessionMappingStorage sessionMappingStorage;

  @Autowired
  public WebSecurityConfig(final Environment environment, final SessionMappingStorage sessionMappingStorage) {
    this.environment = environment;
    this.sessionMappingStorage = sessionMappingStorage;
  }

  @Bean
  public ServiceProperties serviceProperties() {
    final ServiceProperties serviceProperties = new ServiceProperties();
    serviceProperties.setService(
      environment.getRequiredProperty("cas.service-url") + environment.getRequiredProperty("cas.login-path")
    );
    serviceProperties.setSendRenew(environment.getRequiredProperty("cas.send-renew", Boolean.class));
    serviceProperties.setAuthenticateAllArtifacts(false);
    return serviceProperties;
  }

  //
  // CAS authentication provider (authentication manager)
  //
  @Bean
  public CasAuthenticationProvider casAuthenticationProvider() {
    final CasAuthenticationProvider casAuthenticationProvider = new CasAuthenticationProvider();
    final String host = environment.getRequiredProperty("host.alb");

    casAuthenticationProvider.setUserDetailsService(new OphUserDetailsServiceImpl(host, Constants.CALLER_ID));

    casAuthenticationProvider.setServiceProperties(serviceProperties());
    casAuthenticationProvider.setTicketValidator(ticketValidator());
    casAuthenticationProvider.setKey(environment.getRequiredProperty("cas.key"));
    return casAuthenticationProvider;
  }

  @Bean
  public TicketValidator ticketValidator() {
    final Cas20ProxyTicketValidator ticketValidator = new Cas20ProxyTicketValidator(
      environment.getRequiredProperty("cas.url")
    );
    ticketValidator.setAcceptAnyProxy(true);
    return ticketValidator;
  }

  //
  // CAS filter
  //
  @Bean
  public CasAuthenticationFilter casAuthenticationFilter(final AuthenticationManager authenticationManager) {
    final OpintopolkuCasAuthenticationFilter casAuthenticationFilter = new OpintopolkuCasAuthenticationFilter(
      serviceProperties()
    );
    casAuthenticationFilter.setAuthenticationManager(authenticationManager);
    casAuthenticationFilter.setFilterProcessesUrl("/virkailija" + environment.getRequiredProperty("cas.login-path"));
    return casAuthenticationFilter;
  }

  @Bean
  public AuthenticationManager authenticationManager(final AuthenticationConfiguration authenticationConfiguration)
    throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }

  //
  // CAS single logout filter
  // requestSingleLogoutFilter is not configured because our users always sign out through CAS
  // logout (using virkailija-raamit
  // logout button) when CAS calls this filter if user has ticket to this service.
  //
  @Bean
  public SingleSignOutFilter singleSignOutFilter() {
    final SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
    singleSignOutFilter.setIgnoreInitConfiguration(true);
    singleSignOutFilter.setSessionMappingStorage(sessionMappingStorage);
    return singleSignOutFilter;
  }

  //
  // CAS entry point
  //
  @Bean
  public CasAuthenticationEntryPoint casAuthenticationEntryPoint() {
    final CasAuthenticationEntryPoint casAuthenticationEntryPoint = new CasAuthenticationEntryPoint();
    casAuthenticationEntryPoint.setLoginUrl(environment.getProperty("cas.login-url"));
    casAuthenticationEntryPoint.setServiceProperties(serviceProperties());
    return casAuthenticationEntryPoint;
  }

  @Bean
  public SecurityFilterChain filterChain(
    final HttpSecurity httpSecurity,
    final CasAuthenticationFilter casAuthenticationFilter
  ) throws Exception {
    return commonConfig(httpSecurity)
      .addFilter(casAuthenticationFilter)
      .authenticationProvider(casAuthenticationProvider())
      .exceptionHandling(exceptionHandlingConfigurer -> {
        try {
          exceptionHandlingConfigurer
            .accessDeniedHandler(CustomAccessDeniedHandler.create())
            .authenticationEntryPoint(casAuthenticationEntryPoint())
            .init(httpSecurity);
        } catch (final Exception e) {
          throw new RuntimeException(e);
        }
      })
      .logout(logoutConfigurer ->
        logoutConfigurer
          .logoutRequestMatcher(new AntPathRequestMatcher(environment.getRequiredProperty("cas.logout-path")))
          .logoutSuccessUrl(environment.getRequiredProperty("cas.logout-success-path"))
          .deleteCookies(environment.getRequiredProperty("cas.cookie-name"))
          .invalidateHttpSession(true)
          .init(httpSecurity)
      )
      .addFilterBefore(singleSignOutFilter(), CasAuthenticationFilter.class)
      .build();
  }

  private static boolean hasRole(final Authentication authentication, final String role) {
    return authentication
      .getAuthorities()
      .stream()
      .anyMatch((grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_" + role)));
  }

  public static HttpSecurity commonConfig(final HttpSecurity httpSecurity) throws Exception {
    final AuthorizationManager<RequestAuthorizationContext> examinerApiAuthorizationManager =
      (
        (authenticationSupplier, object) -> {
          Authentication authentication = authenticationSupplier.get();
          if (hasRole(authentication, Constants.APP_ROLE)) {
            return new AuthorizationDecision(true);
          } else if (hasRole(authentication, Constants.APP_TV_ROLE)) {
            final Map<String, String> requestVariables = object.getVariables();
            final String expectedOid = requestVariables.get("oid");
            if (expectedOid != null && expectedOid.equals(authentication.getName())) {
              return new AuthorizationDecision(true);
            }
          }
          return new AuthorizationDecision(false);
        }
      );

    return configCsrf(httpSecurity)
      .authorizeHttpRequests(registry ->
        registry
          .requestMatchers("/api/v1/clerk/**", "/virkailija/**", "/virkailija")
          .hasRole(Constants.APP_ROLE)
          .requestMatchers("/api/v1/tv/{oid}/**")
          .access(examinerApiAuthorizationManager)
          .requestMatchers("/api/v1/tv/**", "/tv/**", "/tv")
          .hasAnyRole(Constants.APP_ADMIN_ROLE, Constants.APP_TV_ROLE)
          .requestMatchers("/", "/**")
          .permitAll()
          .anyRequest()
          .authenticated()
      );
  }

  public static HttpSecurity configCsrf(final HttpSecurity httpSecurity) throws Exception {
    final CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
    csrfTokenRepository.setCookieName("CSRF");
    csrfTokenRepository.setHeaderName("CSRF");

    final CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
    requestHandler.setCsrfRequestAttributeName(null);

    return httpSecurity.csrf(configurer ->
      configurer
        .csrfTokenRepository(csrfTokenRepository)
        .csrfTokenRequestHandler(requestHandler)
        .ignoringRequestMatchers("/api/v1/auth/validate/*/*") // Required for public CAS logout callback
        .ignoringRequestMatchers("/vkt/virkailija/login/cas ") // Required for clerk CAS logout callback
    );
  }
}
