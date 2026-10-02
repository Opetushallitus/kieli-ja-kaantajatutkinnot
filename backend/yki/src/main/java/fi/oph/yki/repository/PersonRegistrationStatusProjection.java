package fi.oph.yki.repository;

public interface PersonRegistrationStatusProjection {
  Long getId();
  Boolean getCancellable();
  Boolean getTransferable();
  Long getPositionInQueue();
}
