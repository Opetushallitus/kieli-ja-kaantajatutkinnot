package fi.oph.yki.config.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

  @Bean
  public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
    final AuthorizationManager<RequestAuthorizationContext> proxyApiAuthorizationManager =
      (
        (authenticationSupplier, object) -> {
          final HttpServletRequest request = object.getRequest();
          final String authorization = request.getHeader("Authorization");

          return new AuthorizationDecision(authorization != null && !authorization.isEmpty());
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
