package fi.oph.otr.api.dto.clerk;

import fi.oph.otr.model.Oikeustulkki.TutkintoTyyppi;

public enum ClerkLegalInterpreterExaminationTypeDTO {
  LEGAL_INTERPRETER_EXAM,
  OTHER;

  public static ClerkLegalInterpreterExaminationTypeDTO fromDbEnum(final TutkintoTyyppi tutkintoTyyppi) {
    switch (tutkintoTyyppi) {
      case OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO -> {
        return LEGAL_INTERPRETER_EXAM;
      }
      case MUU_KORKEAKOULUTUTKINTO -> {
        return OTHER;
      }
    }
    throw new IllegalStateException("Unknown db enum value:" + tutkintoTyyppi);
  }

  public TutkintoTyyppi toDbEnum() {
    switch (this) {
      case LEGAL_INTERPRETER_EXAM -> {
        return TutkintoTyyppi.OIKEUSTULKIN_ERIKOISAMMATTITUTKINTO;
      }
      case OTHER -> {
        return TutkintoTyyppi.MUU_KORKEAKOULUTUTKINTO;
      }
    }
    throw new IllegalStateException("Unknown enum value:" + this);
  }
}
