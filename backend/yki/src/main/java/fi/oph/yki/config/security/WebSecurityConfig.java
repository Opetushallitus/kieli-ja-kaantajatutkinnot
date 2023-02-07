package fi.oph.yki.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
    return configCsrf(http)
      .authorizeHttpRequests()
      .mvcMatchers("/", "/**")
      .permitAll()
      .anyRequest()
      .authenticated()
      .and()
      .build();
  }

  public static HttpSecurity configCsrf(final HttpSecurity http) throws Exception {
    final CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
    csrfTokenRepository.setCookieName("CSRF");
    csrfTokenRepository.setHeaderName("CSRF");
    return http.csrf().csrfTokenRepository(csrfTokenRepository).and();
  }
}
