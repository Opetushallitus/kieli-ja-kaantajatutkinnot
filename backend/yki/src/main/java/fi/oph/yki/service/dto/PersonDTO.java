package fi.oph.yki.service.dto;

import lombok.Builder;
import lombok.With;

@With
@Builder
public record PersonDTO(String personOid, String firstName, String lastName, String personIdentifier) {}
