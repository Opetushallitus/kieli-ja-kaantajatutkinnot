package fi.oph.yki.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A switch that this backend and the legacy one must agree on at runtime. Values are free text,
 * so each backend acts only on its own exact value: a value neither recognises then stops both,
 * rather than letting both run.
 */
@Getter
@Setter
@Entity
@Table(name = "runtime_flag")
public class RuntimeFlag {

  public static final String REGISTRATION_QUEUE_HANDLER_OWNER = "registration_queue_handler.owner";
  public static final String OWNER_LEGACY = "LEGACY";
  public static final String OWNER_JAVA = "JAVA";

  @Id
  @Column(name = "name")
  private String name;

  @Column(name = "value", nullable = false)
  private String value;
}
