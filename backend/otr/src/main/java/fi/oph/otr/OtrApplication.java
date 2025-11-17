package fi.oph.otr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OtrApplication {

  // Trigger CI. Remove this
  public static void main(String[] args) {
    SpringApplication.run(OtrApplication.class, args);
  }
}
