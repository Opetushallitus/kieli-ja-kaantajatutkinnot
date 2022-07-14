package fi.oph.akr.api.dto;

import java.util.List;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record LanguagePairsDictDTO(@NonNull List<String> from, @NonNull List<String> to) {}
