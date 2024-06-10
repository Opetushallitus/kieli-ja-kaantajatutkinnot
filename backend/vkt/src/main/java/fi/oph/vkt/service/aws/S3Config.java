package fi.oph.vkt.service.aws;

import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class S3Config {

  private final Environment environment;

  public String getBucketURI() {
    final List<String> activeProfiles = Arrays.asList(environment.getActiveProfiles());
    if (activeProfiles.contains("dev")) {
      return "https://" + getBucketName() + ".s3.localhost.localstack.cloud:4566";
    } else {
      return "https://" + getBucketName() + ".s3.eu-west-1.amazonaws.com";
    }
  }

  public String getBucketName() {
    return environment.getRequiredProperty("app.aws.s3-bucket");
  }
}
