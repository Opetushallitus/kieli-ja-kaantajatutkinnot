package fi.oph.vkt.service.onr;

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

  @NonNull
  private String lastName;

  @NonNull
  private String firstName;

  @NonNull
  private String nickname;
}
