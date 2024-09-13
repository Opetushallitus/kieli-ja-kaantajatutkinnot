package fi.oph.vkt.service.aws;

import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoField;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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
  private static final Duration POST_POLICY_VALID_FOR_ONE_MIN = Duration.ofMinutes(1);
  private static final int OBJECT_EXPIRY_MONTHS = 3;

  private static String guessContentType(String extension) {
    if (extension == null) {
      throw new APIException(APIExceptionType.INVALID_ATTACHMENT);
    }
    return switch (extension.toLowerCase()) {
      case "pdf" -> "application/pdf";
      case "jpg", "jpeg" -> "image/jpeg";
      case "png" -> "image/png";
      case "heic" -> "image/heic";
      case "tiff" -> "image/tiff";
      case "webp" -> "image/webp";
      default -> throw new APIException(APIExceptionType.INVALID_ATTACHMENT);
    };
  }

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

  public Map<String, String> getPresignedPostRequest(String key, String extension) {
    final LocalDate objectExpiry = LocalDate.now().plusMonths(OBJECT_EXPIRY_MONTHS);
    final String contentType = guessContentType(extension);

    S3PostObjectRequest.Builder requestBuilder = S3PostObjectRequest
      .builder()
      .bucket(s3Config.getBucketName())
      .expiration(Instant.now().with(ChronoField.MICRO_OF_SECOND, 1).plus(POST_POLICY_VALID_FOR_ONE_MIN))
      .withCondition(Conditions.keyStartsWith(key))
      .withCondition(Conditions.contentLengthRange(0, MAX_SIZE_100_MB))
      .withCondition(Conditions.contentTypeHeaderEquals(contentType))
      .withCondition(
        Conditions.expiresHeaderEquals(
          DateTimeFormatter.RFC_1123_DATE_TIME.format(objectExpiry.atStartOfDay(ZoneId.of("GMT")))
        )
      );
    AwsCredentials credentials = awsCredentialsProvider.resolveCredentials();
    if (credentials instanceof AwsSessionCredentials) {
      String sessionToken = ((AwsSessionCredentials) credentials).sessionToken();
      requestBuilder = requestBuilder.withCondition(Conditions.amzHeaderEquals("security-token", sessionToken));
    }
    S3PostObjectRequest request = requestBuilder.build();
    Map<String, String> presigned = postObjectPresigner.presignPost(request).constantFields();
    HashMap<String, String> presignedRequestWithKey = new HashMap<>(presigned);
    presignedRequestWithKey.put("key", key);
    presignedRequestWithKey.put("bucketURI", s3Config.getBucketURI());

    return presignedRequestWithKey;
  }
}
