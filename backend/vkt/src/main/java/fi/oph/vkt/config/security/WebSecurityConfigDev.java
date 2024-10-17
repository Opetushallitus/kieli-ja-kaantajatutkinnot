package fi.oph.vkt.config.security;

import fi.oph.vkt.config.Constants;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Profile("dev")
@Configuration
@EnableWebSecurity
public class WebSecurityConfigDev {

  private final Map<String, String> usernameToOid = Map.of(
    "clerk",
    "1.2.246.562.10.00000000001",
    "user",
    "1.2.246.562.10.99999999991",
    "tv1",
    "1.2.246.562.10.10000000001",
    "tv2",
    "1.2.246.562.10.20000000002",
    "tv3",
    "1.2.246.562.10.30000000003",
    "tv4",
    "1.2.246.562.10.40000000004"
  );

  private static UserDetails getUserWithRole(final String username, final String role) {
    return User.withDefaultPasswordEncoder().username(username).password(username).roles(role).build();
  }

  private static final Logger LOG = LoggerFactory.getLogger(WebSecurityConfigDev.class);

  @Value("${dev.web.security.off:false}")
  private Boolean devWebSecurityOff;

  @Bean
  public SecurityFilterChain filterChain(final HttpSecurity httpSecurity) throws Exception {
    if (devWebSecurityOff) {
      LOG.warn("Web security is OFF");
      return WebSecurityConfig
        .configCsrf(httpSecurity)
        .authorizeHttpRequests(registry -> registry.requestMatchers("/", "/**").permitAll().anyRequest().authenticated()
        )
        .build();
    }
    return WebSecurityConfig
      .commonConfig(httpSecurity)
      // formLogin and httpBasic enabled for development, testing APIs manually is easier.
      .formLogin(formLoginConfigurer -> {
        try {
          formLoginConfigurer.init(httpSecurity);
        } catch (final Exception e) {
          throw new RuntimeException(e);
        }
      })
      .httpBasic(httpBasicConfigurer -> httpBasicConfigurer.init(httpSecurity))
      .exceptionHandling(exceptionHandlingConfigurer -> {
        try {
          exceptionHandlingConfigurer.accessDeniedHandler(CustomAccessDeniedHandler.create()).init(httpSecurity);
        } catch (final Exception e) {
          throw new RuntimeException(e);
        }
      })
      .build();
  }

  @Bean
  public UserDetailsService userDetailsService() {
    if (devWebSecurityOff) {
      return new InMemoryUserDetailsManager();
    }
    List<UserDetails> usersList = List.of(
      getUserWithRole("user", "USER"),
      getUserWithRole("clerk", Constants.APP_ROLE),
      getUserWithRole("tv1", Constants.APP_TV_ROLE),
      getUserWithRole("tv2", Constants.APP_TV_ROLE),
      getUserWithRole("tv3", Constants.APP_TV_ROLE),
      getUserWithRole("tv4", Constants.APP_TV_ROLE)
    );

    // AuditUtil resolves current username as Oid, and will throw exception if username is not Oid. Therefore, let
    // authenticated users have Oid as username.
    return new InMemoryUserDetailsManager(usersList) {
      @Override
      public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
        final Optional<UserDetails> user = usersList
          .stream()
          .filter(u -> u.getUsername().equals(username.toLowerCase()))
          .findFirst();
        if (user.isEmpty()) {
          throw new UsernameNotFoundException(username);
        } else {
          final UserDetails foundUser = user.get();
          final String oid = usernameToOid.get(foundUser.getUsername());
          return new User(
            oid,
            foundUser.getPassword(),
            foundUser.isEnabled(),
            foundUser.isAccountNonExpired(),
            foundUser.isCredentialsNonExpired(),
            foundUser.isAccountNonLocked(),
            foundUser.getAuthorities()
          );
        }
      }
    };
  }
}
