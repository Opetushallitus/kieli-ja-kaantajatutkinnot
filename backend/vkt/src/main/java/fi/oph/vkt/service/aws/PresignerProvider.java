package fi.oph.vkt.service.aws;

import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import tel.schich.awss3postobjectpresigner.S3PostObjectPresigner;

@Component
@RequiredArgsConstructor
public class PresignerProvider {

  private final AwsCredentialsProvider credentialsProvider;

  @Profile("dev")
  @Bean
  public S3Presigner getLocalstackPresigner() {
    return S3Presigner
      .builder()
      .credentialsProvider(credentialsProvider)
      .region(Region.US_EAST_1)
      .endpointOverride(URI.create("https://s3.localhost.localstack.cloud:4566"))
      .build();
  }

  @Profile("!dev")
  @Bean
  public S3Presigner getCloudPresigner() {
    return S3Presigner.builder().credentialsProvider(credentialsProvider).region(Region.EU_WEST_1).build();
  }

  @Profile("dev")
  @Bean
  public S3PostObjectPresigner getLocalstackPostObjectPresigner() {
    return S3PostObjectPresigner
      .builder()
      .credentialsProvider(credentialsProvider)
      .region(Region.US_EAST_1)
      .endpointOverride(URI.create("https://s3.localhost.localstack.cloud:4566"))
      .build();
  }

  @Profile("!dev")
  @Bean
  public S3PostObjectPresigner getCloudPostObjectPresigner() {
    return S3PostObjectPresigner.builder().credentialsProvider(credentialsProvider).region(Region.EU_WEST_1).build();
  }
}
