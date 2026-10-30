package fi.oph.yki.service.dto;

import java.io.Serializable;
import lombok.Builder;

@Builder
public record OppijaLoginRedirectDTO(long examSessionId, long registrationId) implements Serializable {}
