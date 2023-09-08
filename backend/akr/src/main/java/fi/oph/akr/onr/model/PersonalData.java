package fi.oph.akr.onr.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;

@Builder
@Getter
@Setter
public class PersonalData {

  // Always returned from ONR
  private String onrId;

  // Always returned from ONR
  private Boolean individualised;

  // Always exists for data returned from ONR
  private Boolean hasIndividualisedAddress;

  @NonNull
  private String lastName;

  @NonNull
  private String firstName;

  @NonNull
  private String nickName;

  @NonNull
  private String identityNumber;

  private String email;

  private String phoneNumber;

  private String street;

  private String postalCode;

  private String town;

  private String country;

  public boolean isOnrIdAndIndividualisedInformationConsistent() {
    return (
      isOnrIdAndIndividualisedInformationConsistentOnNewData() ||
      isOnrIdAndIndividualisedInformationConsistentOnExistingData()
    );
  }

  public boolean isOnrIdAndIndividualisedInformationConsistentOnNewData() {
    return this.onrId == null && this.individualised == null && this.hasIndividualisedAddress == null;
  }

  public boolean isOnrIdAndIndividualisedInformationConsistentOnExistingData() {
    return (
      this.onrId != null &&
      this.individualised != null &&
      this.hasIndividualisedAddress != null &&
      (this.individualised || !this.hasIndividualisedAddress)
    );
  }

  public void assertOnrUpdatePossible() {
    if (!isOnrIdAndIndividualisedInformationConsistentOnExistingData()) {
      throw new IllegalArgumentException("Invalid personal data on update");
    }
  }
}
