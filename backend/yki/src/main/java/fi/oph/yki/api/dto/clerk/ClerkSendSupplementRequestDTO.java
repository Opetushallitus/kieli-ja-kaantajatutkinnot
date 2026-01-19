package fi.oph.yki.api.dto.clerk;

import fi.oph.yki.util.StringUtil;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ClerkSendSupplementRequestDTO(@Size(max = 10240) String message, LocalDate dueDate) {
  public ClerkSendSupplementRequestDTO {
    message = StringUtil.sanitize(message);
  }
}
