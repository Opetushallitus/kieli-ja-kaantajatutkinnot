package fi.oph.yki.service.dto;

import lombok.Builder;

@Builder
public record OrganizationDetailsDTO(
  String oid,
  String name,
  String streetAddress,
  String postalCode,
  String postOffice,
  String website
) {}
