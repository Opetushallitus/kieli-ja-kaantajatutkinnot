package fi.oph.yki.kayttooikeus.dto;

import java.util.List;

public record OrganisaatioDTO(String organisaatioOid, List<KayttooikeusDTO> kayttooikeudet) {}
