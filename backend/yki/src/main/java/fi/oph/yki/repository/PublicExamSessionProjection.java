package fi.oph.yki.repository;

import java.time.LocalDate;

public interface PublicExamSessionProjection {
  Long getId();

  String getLanguageCode();

  String getLevelCode();

  LocalDate getSessionDate();

  Integer getMaxParticipants();

  Integer getMaxParticipantsReadListen();

  Integer getMaxParticipantsSpeakWrite();

  String getStartTime();

  String getStartTimeReadListen();

  String getStartTimeSpeakWrite();

  LocalDate getRegistrationStartDate();

  LocalDate getRegistrationEndDate();

  String getOfficeOid();

  String getPublishedAt();

  String getType();

  Long getQueue();

  Long getParticipants();

  Long getParticipantsReadListen();

  Long getParticipantsSpeakWrite();

  String getOrganizerOid();

  String getLocation();

  Boolean getOpen();

  Boolean getUpcomingAdmission();

  String getAllPartsRegistrationKind();

  String getReadListenRegistrationKind();

  String getSpeakWriteRegistrationKind();
}
