package fi.oph.yki.model.type;

import fi.oph.yki.api.dto.oauth2.KituEvaluationState;

public enum EvaluationState {
  EVALUATION_PENDING, // ARVIOITAVA
  EVALUATION_COMPLETE, // ARVIOITU
  REVIEW_PENDING, // TARKISTUSARVIOITAVA
  REVIEW_COMPLETE, // TARKISTUSARVIOITU
  RETAKE_PENDING, // UUSITTAVA
  NO_SHOW, // EI_SUORITUSTA
  ABORTED; // KESKEYTETTY

  public static EvaluationState fromKituEvaluationState(final KituEvaluationState state) {
    return switch (state) {
      case ARVIOITAVA -> EVALUATION_PENDING;
      case ARVIOITU -> EVALUATION_COMPLETE;
      case TARKISTUSARVIOITAVA -> REVIEW_PENDING;
      case TARKISTUSARVIOITU -> REVIEW_COMPLETE;
      case UUSITTAVA -> RETAKE_PENDING;
      case EI_SUORITUSTA -> NO_SHOW;
      case KESKEYTETTY -> ABORTED;
      default -> throw new RuntimeException("Unhandled state: " + state);
    };
  }
}
