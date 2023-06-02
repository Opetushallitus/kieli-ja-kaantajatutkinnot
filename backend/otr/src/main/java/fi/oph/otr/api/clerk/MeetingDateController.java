package fi.oph.otr.api.clerk;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import fi.oph.otr.api.dto.clerk.MeetingDateDTO;
import fi.oph.otr.api.dto.clerk.modify.MeetingDateCreateDTO;
import fi.oph.otr.api.dto.clerk.modify.MeetingDateUpdateDTO;
import fi.oph.otr.service.MeetingDateService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.annotation.Resource;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/v1/clerk/meetingDate", produces = APPLICATION_JSON_VALUE)
public class MeetingDateController {

  private static final String TAG_MEETING_DATE = "Meeting date API";

  @Resource
  private final MeetingDateService meetingDateService;

  @Operation(tags = TAG_MEETING_DATE, summary = "List meeting dates")
  @GetMapping
  public List<MeetingDateDTO> listMeetingDates() {
    return meetingDateService.listMeetingDatesWithoutAudit();
  }

  @Operation(tags = TAG_MEETING_DATE, summary = "Create meeting date")
  @PostMapping(consumes = APPLICATION_JSON_VALUE)
  @ResponseStatus(HttpStatus.CREATED)
  public MeetingDateDTO createMeetingDate(@RequestBody @Valid final MeetingDateCreateDTO dto) {
    return meetingDateService.createMeetingDate(dto);
  }

  @ConditionalOnExpression(value = "false")
  @Operation(tags = TAG_MEETING_DATE, summary = "Update meeting date")
  @PutMapping(consumes = APPLICATION_JSON_VALUE)
  public MeetingDateDTO updateMeetingDate(@RequestBody @Valid final MeetingDateUpdateDTO dto) {
    return meetingDateService.updateMeetingDate(dto);
  }

  @Operation(tags = TAG_MEETING_DATE, summary = "Delete meeting date")
  @DeleteMapping(path = "/{meetingDateId:\\d+}")
  public void deleteMeetingDate(@PathVariable final long meetingDateId) {
    meetingDateService.deleteMeetingDate(meetingDateId);
  }
}
