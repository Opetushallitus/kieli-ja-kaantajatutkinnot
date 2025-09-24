package fi.oph.yki.config.security;

import fi.oph.yki.util.StringUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  private final Environment environment;

  @Autowired
  public WebSecurityConfig(final Environment environment) {
    this.environment = environment;
  }

  @Bean
  public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
    final String token = environment.getRequiredProperty("app.proxy-token");
    final AuthorizationManager<RequestAuthorizationContext> proxyApiAuthorizationManager =
      (
        (authenticationSupplier, object) -> {
          final HttpServletRequest request = object.getRequest();
          final String authorization = request.getHeader("Authorization");

          if (authorization == null || authorization.isEmpty()) {
            return new AuthorizationDecision(false);
          }

          final Map<String, String> auth = StringUtil.splitAuth(authorization);
          final String hash = StringUtil.sha256hex(auth.get("user") + token);

          return new AuthorizationDecision(hash.equals(auth.get("password")));
        }
      );

    return http
      .csrf()
      .disable()
      .authorizeHttpRequests(registry ->
        registry
          .requestMatchers("/api/v1/user/**")
          .access(proxyApiAuthorizationManager)
          .requestMatchers("/", "/**")
          .permitAll()
          .anyRequest()
          .authenticated()
      )
      .build();
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
