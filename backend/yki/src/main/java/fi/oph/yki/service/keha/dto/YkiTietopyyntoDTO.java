package fi.oph.yki.service.keha.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record YkiTietopyyntoDTO(@NonNull @NotNull String hetu, @NonNull @NotNull UUID kayttajaTunniste) {}
