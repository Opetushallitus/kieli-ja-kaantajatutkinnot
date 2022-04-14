package fi.oph.otr.model.embeddable;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 12.57
 */
@Embeddable
@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class Kieli {

  @Column(name = "koodi", nullable = false)
  private String koodi;
}
