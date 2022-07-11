package fi.oph.akr.config;

import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.web.access.AccessDeniedHandler;

public class CustomAccessDeniedHandler {

  private static final Logger LOG = LoggerFactory.getLogger(CustomAccessDeniedHandler.class);

  public static AccessDeniedHandler create() {
    return (request, response, ex) -> {
      LOG.error("AccessDeniedHandler", ex);
      if (!response.isCommitted()) {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      }
    };
  }
}
