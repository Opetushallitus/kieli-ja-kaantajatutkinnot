package fi.oph.yki.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;
import lombok.Builder;

@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public record OrganizationNameDTO(String oid, Map<String, String> nimi) {}
