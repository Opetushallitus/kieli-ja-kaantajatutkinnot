package fi.oph.otr.api.dto.clerk;

import lombok.Builder;
import lombok.NonNull;

@Builder
public record ClerkUserDTO(@NonNull String oid) {}
