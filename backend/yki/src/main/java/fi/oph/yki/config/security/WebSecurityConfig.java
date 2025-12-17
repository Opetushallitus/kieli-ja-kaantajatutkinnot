package fi.oph.yki.config.security;

import fi.oph.yki.config.Constants;
import fi.oph.yki.util.StringUtil;
import fi.vm.sade.java_utils.security.OpintopolkuCasAuthenticationFilter;
import fi.vm.sade.javautils.kayttooikeusclient.OphUserDetailsServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apereo.cas.client.session.SingleSignOutFilter;
import org.apereo.cas.client.validation.Cas20ProxyTicketValidator;
import org.apereo.cas.client.validation.TicketValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AbstractAuthenticationToken;
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
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Profile("!dev")
@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  private final Environment environment;
  private static final Logger LOG = LoggerFactory.getLogger(WebSecurityConfig.class);

  @Autowired
  public WebSecurityConfig(final Environment environment) {
    this.environment = environment;
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
    casAuthenticationProvider.setAuthenticationUserDetailsService(new OphUserDetailsServiceImpl());

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
    casAuthenticationFilter.setFilterProcessesUrl("/v2/virkailija" + environment.getRequiredProperty("cas.login-path"));
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
    final SingleSignOutFilter singleSignOutFilter = new SingleSignOutFilter();
    singleSignOutFilter.setIgnoreInitConfiguration(true);
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

  // OAuth2
  Converter<Jwt, AbstractAuthenticationToken> oauth2JwtConverter() {
    return new Converter<Jwt, AbstractAuthenticationToken>() {
      final JwtGrantedAuthoritiesConverter delegate = new JwtGrantedAuthoritiesConverter();

      @Override
      public AbstractAuthenticationToken convert(Jwt source) {
        var authorityList = extractRoles(source);
        var delegateAuthorities = delegate.convert(source);
        authorityList.addAll(delegateAuthorities);
        return new JwtAuthenticationToken(source, authorityList);
      }

      private List<GrantedAuthority> extractRoles(Jwt jwt) {
        Map<String, List<String>> roleClaim = jwt.getClaims().get("roles") != null
          ? (Map<String, List<String>>) jwt.getClaims().get("roles")
          : Map.of();
        var roles = roleClaim
          .keySet()
          .stream()
          .map(oid -> {
            var orgRoles = roleClaim.get(oid);
            return orgRoles.stream().map(role -> List.of("ROLE_APP_" + role, "ROLE_APP_" + role + "_" + oid)).toList();
          })
          .flatMap(List::stream)
          .flatMap(List::stream)
          .map(SimpleGrantedAuthority::new)
          .collect(Collectors.<GrantedAuthority>toList());
        return roles;
      }
    };
  }

  @Bean
  @Order(1)
  public SecurityFilterChain oauth2SecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
    return configCsrf(httpSecurity)
      .securityMatcher("/v2/api/oauth2/**")
      .authorizeHttpRequests(auth ->
        auth
          .requestMatchers("/v2/api/oauth2/registration/admin")
          .hasRole(Constants.APP_ADMIN_ROLE)
          // TODO Enable role-based authorization once role is created and in use
          //.requestMatchers("/v2/api/oauth2/registration/evaluation")
          //.hasRole(Constants.APP_EVALUATION_UPDATER_ROLE)
          .anyRequest()
          .authenticated()
      )
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(oauth2JwtConverter())))
      .build();
  }

  @Bean
  @Order(2)
  public SecurityFilterChain casSecurityFilterChain(
    final HttpSecurity httpSecurity,
    final CasAuthenticationFilter casAuthenticationFilter
  ) throws Exception {
    return configCsrf(httpSecurity)
      .securityMatcher("/v2/api/clerk/**", "/v2/virkailija/**", "/v2/virkailija")
      .authorizeHttpRequests(registry -> registry.anyRequest().hasRole(Constants.APP_ADMIN_ROLE))
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

  @Bean
  @Order(3)
  public SecurityFilterChain proxyApiSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
    final String token = environment.getRequiredProperty("app.proxy-token");
    final AuthorizationManager<RequestAuthorizationContext> proxyApiAuthorizationManager =
      ((authenticationSupplier, object) -> validateToken(object.getRequest(), token));
    return configCsrf(httpSecurity)
      .securityMatcher("/api/public/**")
      .authorizeHttpRequests(registry -> registry.anyRequest().access(proxyApiAuthorizationManager))
      .build();
  }

  @Bean
  @Order(4)
  public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
    return configCsrf(httpSecurity)
      .authorizeHttpRequests(registry -> registry.requestMatchers("/", "/**").permitAll().anyRequest().authenticated())
      .build();
  }

  public static AuthorizationDecision validateToken(final HttpServletRequest request, final String token) {
    final String authorization = request.getHeader("Authorization");

    if (authorization == null || authorization.isEmpty()) {
      return new AuthorizationDecision(false);
    }

    final Map<String, String> auth = StringUtil.splitAuth(authorization);
    final String hash = StringUtil.sha256hex(auth.get("user") + token);

    return new AuthorizationDecision(hash.equals(auth.get("password")));
  }

  public static HttpSecurity configCsrf(final HttpSecurity httpSecurity) throws Exception {
    final CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
    csrfTokenRepository.setCookieName("CSRF");
    csrfTokenRepository.setHeaderName("CSRF");

    final CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
    requestHandler.setCsrfRequestAttributeName(null);

    return httpSecurity.csrf(configurer ->
      configurer.csrfTokenRepository(csrfTokenRepository).csrfTokenRequestHandler(requestHandler)
    );
  }

  @Bean
  public AuthenticationManager authenticationManager(final AuthenticationConfiguration authenticationConfiguration)
    throws Exception {
    return authenticationConfiguration.getAuthenticationManager();
  }
}
