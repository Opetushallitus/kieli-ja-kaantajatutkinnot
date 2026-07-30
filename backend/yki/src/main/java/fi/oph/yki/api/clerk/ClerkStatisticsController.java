package fi.oph.yki.api.clerk;

import fi.oph.yki.api.dto.clerk.ClerkStatisticsRequestDTO;
import fi.oph.yki.api.dto.clerk.ClerkStatisticsRowDTO;
import fi.oph.yki.service.ClerkStatisticsService;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import fi.oph.yki.view.StatisticsXlsxView;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.context.annotation.Conditional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.document.AbstractXlsxView;

@RestController
@RequestMapping(value = "/v2/api/clerk/statistics")
public class ClerkStatisticsController {

  private static final String TAG = "Statistics API";

  @Resource
  private ClerkStatisticsService clerkStatisticsService;

  @GetMapping("/excel")
  @Operation(tags = TAG, summary = "Download registration statistics as Excel")
  public AbstractXlsxView getStatisticsExcel(@ModelAttribute @Valid final ClerkStatisticsRequestDTO request) {
    if (request.from() == null || request.to() == null) {
      throw new APIException(APIExceptionType.STATISTICS_MISSING_DATE_RANGE);
    }
    if (request.from().isAfter(request.to())) {
      throw new APIException(APIExceptionType.STATISTICS_INVALID_DATE_ORDER);
    }
    final List<ClerkStatisticsRowDTO> rows = clerkStatisticsService.getStatistics(request);
    return new StatisticsXlsxView(rows, request.from(), request.to());
  }
}
