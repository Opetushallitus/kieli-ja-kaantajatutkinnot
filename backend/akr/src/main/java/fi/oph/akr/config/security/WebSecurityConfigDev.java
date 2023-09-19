package fi.oph.akr.config.security;

import fi.oph.akr.config.Constants;
import java.util.Collection;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.log.LogMessage;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.SpringSecurityCoreVersion;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsPasswordService;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.memory.UserAttribute;
import org.springframework.security.core.userdetails.memory.UserAttributeEditor;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.util.Assert;

@Profile("dev")
@Configuration
@EnableWebSecurity
public class WebSecurityConfigDev {

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
    final UserDetails user = User.withDefaultPasswordEncoder().username("user").password("user").roles("USER").build();

    final UserDetails clerk = User
      .withDefaultPasswordEncoder()
      .username("clerk")
      .password("clerk")
      .roles(Constants.APP_ROLE)
      .build();

    // AuditUtil resolves current username as Oid, and will throw exception if username is not Oid. Therefore, let
    // authenticated users to have Oid as username.
    return new InMemoryUserDetailsManager(user, clerk) {
      @Override
      public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
        final UserDetails user = this.users.get(username.toLowerCase());
        if (user == null) {
          throw new UsernameNotFoundException(username);
        }
        final String oid = Objects.equals("clerk", username)
          ? "1.2.246.562.10.00000000001"
          : "1.2.246.562.10.99999999991";
        return new User(
          oid,
          user.getPassword(),
          user.isEnabled(),
          user.isAccountNonExpired(),
          user.isCredentialsNonExpired(),
          user.isAccountNonLocked(),
          user.getAuthorities()
        );
      }
    };
  }

  /**
   * Below is copy paste of Spring InMemoryUserDetailsManager and related classes. Only change is that 'users' property is
   * changed from private to protected.
   */

  private static class InMemoryUserDetailsManager implements UserDetailsManager, UserDetailsPasswordService {

    protected final Log logger = LogFactory.getLog(getClass());

    protected final Map<String, MutableUserDetails> users = new HashMap<>();

    private AuthenticationManager authenticationManager;

    public InMemoryUserDetailsManager() {}

    public InMemoryUserDetailsManager(final Collection<UserDetails> users) {
      for (final UserDetails user : users) {
        createUser(user);
      }
    }

    public InMemoryUserDetailsManager(final UserDetails... users) {
      for (final UserDetails user : users) {
        createUser(user);
      }
    }

    public InMemoryUserDetailsManager(final Properties users) {
      final Enumeration<?> names = users.propertyNames();
      final UserAttributeEditor editor = new UserAttributeEditor();
      while (names.hasMoreElements()) {
        final String name = (String) names.nextElement();
        editor.setAsText(users.getProperty(name));
        final UserAttribute attr = (UserAttribute) editor.getValue();
        createUser(createUserDetails(name, attr));
      }
    }

    private User createUserDetails(final String name, final UserAttribute attr) {
      return new User(name, attr.getPassword(), attr.isEnabled(), true, true, true, attr.getAuthorities());
    }

    @Override
    public void createUser(final UserDetails user) {
      Assert.isTrue(!userExists(user.getUsername()), "user should not exist");
      this.users.put(user.getUsername().toLowerCase(), new MutableUser(user));
    }

    @Override
    public void deleteUser(final String username) {
      this.users.remove(username.toLowerCase());
    }

    @Override
    public void updateUser(final UserDetails user) {
      Assert.isTrue(userExists(user.getUsername()), "user should exist");
      this.users.put(user.getUsername().toLowerCase(), new MutableUser(user));
    }

    @Override
    public boolean userExists(final String username) {
      return this.users.containsKey(username.toLowerCase());
    }

    @Override
    public void changePassword(final String oldPassword, final String newPassword) {
      final Authentication currentUser = SecurityContextHolder.getContext().getAuthentication();
      if (currentUser == null) {
        // This would indicate bad coding somewhere
        throw new AccessDeniedException(
          "Can't change password as no Authentication object found in context " + "for current user."
        );
      }
      final String username = currentUser.getName();
      this.logger.debug(LogMessage.format("Changing password for user '%s'", username));
      // If an authentication manager has been set, re-authenticate the user with the
      // supplied password.
      if (this.authenticationManager != null) {
        this.logger.debug(LogMessage.format("Reauthenticating user '%s' for password change request.", username));
        this.authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, oldPassword));
      } else {
        this.logger.debug("No authentication manager set. Password won't be re-checked.");
      }
      final MutableUserDetails user = this.users.get(username);
      Assert.state(user != null, "Current user doesn't exist in database.");
      user.setPassword(newPassword);
    }

    @Override
    public UserDetails updatePassword(final UserDetails user, final String newPassword) {
      final String username = user.getUsername();
      final MutableUserDetails mutableUser = this.users.get(username.toLowerCase());
      mutableUser.setPassword(newPassword);
      return mutableUser;
    }

    @Override
    public UserDetails loadUserByUsername(final String username) throws UsernameNotFoundException {
      final UserDetails user = this.users.get(username.toLowerCase());
      if (user == null) {
        throw new UsernameNotFoundException(username);
      }
      return new User(
        user.getUsername(),
        user.getPassword(),
        user.isEnabled(),
        user.isAccountNonExpired(),
        user.isCredentialsNonExpired(),
        user.isAccountNonLocked(),
        user.getAuthorities()
      );
    }

    public void setAuthenticationManager(final AuthenticationManager authenticationManager) {
      this.authenticationManager = authenticationManager;
    }
  }

  private interface MutableUserDetails extends UserDetails {
    void setPassword(String password);
  }

  private static class MutableUser implements MutableUserDetails {

    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

    private String password;

    private final UserDetails delegate;

    MutableUser(final UserDetails user) {
      this.delegate = user;
      this.password = user.getPassword();
    }

    @Override
    public String getPassword() {
      return this.password;
    }

    @Override
    public void setPassword(final String password) {
      this.password = password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
      return this.delegate.getAuthorities();
    }

    @Override
    public String getUsername() {
      return this.delegate.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
      return this.delegate.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
      return this.delegate.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
      return this.delegate.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
      return this.delegate.isEnabled();
    }
  }
}
