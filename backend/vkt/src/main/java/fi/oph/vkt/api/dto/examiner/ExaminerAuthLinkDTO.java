package fi.oph.vkt.api.dto.examiner;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record ExaminerAuthLinkDTO(String url, LocalDateTime expiresAt, LocalDateTime sentAt) {}
