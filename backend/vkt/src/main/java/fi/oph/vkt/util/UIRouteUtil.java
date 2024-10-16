package fi.oph.vkt.util;

import fi.oph.vkt.util.exception.APIExceptionType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UIRouteUtil {

  private final Environment environment;

  public String getEnrollmentContactDetailsUrl(final long examEventId) {
    return String.format("%s/ilmoittaudu/%s/tiedot", getPublicBaseUrl(), examEventId);
  }

  public String getEnrollmentPreviewUrl(final long examEventId) {
    return String.format("%s/ilmoittaudu/%s/esikatsele", getPublicBaseUrl(), examEventId);
  }

  public String getPublicFrontPageUrlWithGenericError() {
    return String.format("%s/etusivu?error=generic", getPublicBaseUrl());
  }

  public String getPublicFrontPageUrlWithError(final APIExceptionType exceptionType) {
    return String.format("%s/etusivu?error=%s", getPublicBaseUrl(), exceptionType.getCode());
  }

  private String getPublicBaseUrl() {
    return environment.getRequiredProperty("app.base-url.public");
  }

  public String getEnrollmentAppointmentUrl(final long enrollmentAppointmentId) {
    return String.format("%s/markkinapaikka/%s/tunnistaudu", getPublicBaseUrl(), enrollmentAppointmentId);
  }

  public String getEnrollmentAppointmentContactDetailsUrl(final long enrollmentAppointmentId) {
    return String.format("%s/markkinapaikka/%s/tiedot", getPublicBaseUrl(), enrollmentAppointmentId);
  }
}
