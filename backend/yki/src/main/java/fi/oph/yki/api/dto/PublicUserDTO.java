package fi.oph.yki.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record PublicUserDTO(@JsonProperty("external-user-id") String externalUserId, String email) {}
