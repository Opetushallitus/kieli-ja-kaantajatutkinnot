package fi.oph.vkt.model.type;

public enum EnrollmentSkill {
  ORAL("oral-skill"),
  TEXTUAL("textual-skill"),
  UNDERSTANDING("understanding-skill");

  private final String text;

  EnrollmentSkill(final String text) {
    this.text = text;
  }

  @Override
  public String toString() {
    return text;
  }
}
