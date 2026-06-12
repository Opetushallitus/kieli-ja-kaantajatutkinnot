package fi.oph.yki.kayttooikeus.dto;

import java.util.List;

public record KayttooikeusResponseDTO(
  String oidHenkilo,
  String username,
  String kayttajaTyyppi,
  List<OrganisaatioDTO> organisaatiot
) {}
