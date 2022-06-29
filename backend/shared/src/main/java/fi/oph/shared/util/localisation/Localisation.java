package fi.oph.shared.util.localisation;

import java.util.Optional;
import lombok.Builder;

@Builder
public record Localisation(Optional<String> fi, Optional<String> sv, Optional<String> en) {}
