package fi.oph.vkt.payment.paytrail;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Builder;
import lombok.NonNull;

@Builder
public record Customer(
  @NonNull @NotNull @Size(max = EMAIL_MAX_LENGTH) String email,
  @Size(max = PHONE_MAX_LENGTH) String phone,
  @Size(max = FIRST_NAME_MAX_LENGTH) String firstName,
  @Size(max = LAST_NAME_MAX_LENGTH) String lastName
) {
  public static final int EMAIL_MAX_LENGTH = 200;
  public static final int PHONE_MAX_LENGTH = 15;
  public static final int FIRST_NAME_MAX_LENGTH = 50;
  public static final int LAST_NAME_MAX_LENGTH = 50;
}
