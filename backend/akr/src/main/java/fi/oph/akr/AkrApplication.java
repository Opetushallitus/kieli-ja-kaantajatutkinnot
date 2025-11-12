package fi.oph.akr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AkrApplication {

  // Trigger CI. Remove this
  public static void main(final String[] args) {
    SpringApplication.run(AkrApplication.class, args);
  }
}
