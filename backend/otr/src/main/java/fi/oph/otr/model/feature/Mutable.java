package fi.oph.otr.model.feature;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Version;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * User: tommiratamaa
 * Date: 30.5.2016
 * Time: 12.42
 */
@MappedSuperclass
public abstract class Mutable implements Creatable, Modifyable, Serializable {

  @Getter
  @Column(name = "luotu", nullable = false, updatable = false)
  private LocalDateTime luotu = LocalDateTime.now();

  @Getter
  @Setter
  @Column(name = "luoja", nullable = false, updatable = false)
  private String luoja;

  @Getter
  @Setter
  @Version
  @Column(name = "version", nullable = false)
  private Long version;

  @Getter
  @Setter
  @Column(name = "muokattu")
  private LocalDateTime muokattu;

  @Getter
  @Setter
  @Column(name = "muokkaaja")
  private String muokkaaja;

  @Getter
  @Column(name = "poistettu", nullable = false)
  private boolean poistettu;

  @Getter
  @Column(name = "poistaja")
  private String poistaja;

  @Getter
  @Column(name = "poistohetki")
  private LocalDateTime poistohetki;

  public void markPoistettu(String poistaja) {
    this.poistohetki = LocalDateTime.now();
    this.poistettu = true;
    this.poistaja = poistaja;
  }

  protected void setLuotu(LocalDateTime luotu) {
    this.luotu = luotu;
  }

  protected void setPoistettu(boolean poistettu) {
    this.poistettu = poistettu;
  }

  protected void setPoistaja(String poistaja) {
    this.poistaja = poistaja;
  }

  protected void setPoistohetki(LocalDateTime poistohetki) {
    this.poistohetki = poistohetki;
  }

  private String getCurrentUserId() {
    return SecurityContextHolder.getContext().getAuthentication().getName();
  }

  @PrePersist
  protected void prePersist() {
    final LocalDateTime now = LocalDateTime.now();
    setLuotu(now);
    setMuokattu(now);

    final String currentUser = getCurrentUserId();
    if (getLuoja() == null) {
      setLuoja(currentUser);
      setMuokkaaja(currentUser);
    }
  }

  @PreUpdate
  void preUpdate() {
    final LocalDateTime now = LocalDateTime.now();
    setMuokattu(now);

    final String currentUser = getCurrentUserId();
    setMuokkaaja(currentUser);
  }
}
