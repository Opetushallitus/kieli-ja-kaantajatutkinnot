package fi.oph.vkt.service.aws;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.awscore.presigner.PresignedRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import tel.schich.awss3postobjectpresigner.Conditions;
import tel.schich.awss3postobjectpresigner.S3PostObjectPresigner;
import tel.schich.awss3postobjectpresigner.S3PostObjectRequest;

@Service
@RequiredArgsConstructor
public class S3Service {

  private final S3Presigner presigner;
  private final S3PostObjectPresigner postObjectPresigner;
  private final S3Config s3Config;
  private final AwsCredentialsProvider awsCredentialsProvider;

  private static final int MAX_SIZE_100_MB = 100 * 1024 * 1024;
  private static final String ACCEPTED_CONTENT_TYPES =
    "application/pdf,image/jpeg,image/png,image/heic,image/tiff,image/webp";
  private static final Duration POST_POLICY_VALID_FOR_ONE_MIN = Duration.ofMinutes(1);
  private static final Logger LOG = LoggerFactory.getLogger(S3Service.class);

  public String getPresignedUrl(String key) {
    GetObjectRequest request = GetObjectRequest.builder().bucket(s3Config.getBucketName()).key(key).build();
    GetObjectPresignRequest presignRequest = GetObjectPresignRequest
      .builder()
      .signatureDuration(Duration.ofHours(1))
      .getObjectRequest(request)
      .build();
    PresignedRequest presignedRequest = presigner.presignGetObject(presignRequest);

    return presignedRequest.url().toExternalForm();
  }

  public Map<String, String> getPresignedPostRequest(String key, LocalDate objectExpiry) {
    S3PostObjectRequest request = S3PostObjectRequest
      .builder()
      .bucket(s3Config.getBucketName())
      .expiration(POST_POLICY_VALID_FOR_ONE_MIN)
      .withCondition(Conditions.keyStartsWith(key))
      .withCondition(Conditions.contentLengthRange(0, MAX_SIZE_100_MB))
      .withCondition(Conditions.contentTypeHeaderEquals(ACCEPTED_CONTENT_TYPES))
      .withCondition(
        Conditions.expiresHeaderEquals(
          DateTimeFormatter.RFC_1123_DATE_TIME.format(objectExpiry.atStartOfDay(ZoneId.of("GMT")))
        )
      )
      .build();
    Map<String, String> presigned = postObjectPresigner.presignPost(request).constantFields();
    HashMap<String, String> presignedRequestWithKey = new HashMap<>(presigned);
    presignedRequestWithKey.put("key", key);
    presignedRequestWithKey.put("bucketURI", s3Config.getBucketURI());

    AwsCredentials credentials = awsCredentialsProvider.resolveCredentials();
    LOG.info("credentials: class {}", credentials.getClass().getName());
    if (credentials instanceof AwsSessionCredentials) {
      presignedRequestWithKey.put("x-amz-session-token", ((AwsSessionCredentials) credentials).sessionToken());
    }

    return presignedRequestWithKey;
  }
}
