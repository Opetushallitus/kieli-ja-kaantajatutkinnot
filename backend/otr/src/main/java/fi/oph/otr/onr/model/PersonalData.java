package fi.oph.otr.onr.model;

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

  public boolean isOnrIdAndIndividualisedConsistent() {
    return isOnrIdAndIndividualisedConsistentOnNewData() || isOnrIdAndIndividualisedConsistentOnExistingData();
  }

  private boolean isOnrIdAndIndividualisedConsistentOnNewData() {
    return this.onrId == null && this.individualised == null;
  }

  private boolean isOnrIdAndIndividualisedConsistentOnExistingData() {
    return this.onrId != null && this.individualised != null;
  }

  public void assertOnrUpdatePossible() {
    if (!isOnrIdAndIndividualisedConsistentOnExistingData()) {
      throw new IllegalArgumentException("Invalid personal data on update");
    }
  }
}
