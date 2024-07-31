package fi.oph.vkt.api.dto;

import lombok.NonNull;

public record FreeEnrollmentDetails(@NonNull Long textualSkillCount, @NonNull Long oralSkillCount) {}
