package fi.oph.yki.service.keha.dto;

import lombok.Builder;

@Builder
public record YkiVastausDTO(Boolean ykiTutkintoOikeus, String virhe) {}
