package fi.oph.akt;

import liquibase.configuration.HubConfiguration;
import liquibase.configuration.LiquibaseConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AktApplication {

	public static void main(String[] args) {
		LiquibaseConfiguration.getInstance().getConfiguration(HubConfiguration.class).setLiquibaseHubMode("OFF");
		SpringApplication.run(AktApplication.class, args);
	}

}
