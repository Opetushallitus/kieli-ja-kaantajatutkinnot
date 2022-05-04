package fi.oph.otr.model;

import fi.oph.otr.model.feature.Mutable;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "interpreter")
public class Tulkki extends Mutable {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "interpreter_id", nullable = false)
  private long id;

  @Column(name = "onr_id", nullable = false, unique = true)
  @Size(max = 255)
  private String onrId;

  @Column(name = "permission_to_publish_email", nullable = false)
  private boolean permissionToPublishEmail;

  @Column(name = "permission_to_publish_phone", nullable = false)
  private boolean permissionToPublishPhone;

  @Column(name = "other_contact_information")
  private String otherContactInformation;

  @Column(name = "permission_to_publish_other_contact_information", nullable = false)
  private boolean permissionToPublishOtherContactInfo;

  @Column(name = "extra_information")
  private String extraInformation;

  @OneToMany(mappedBy = "interpreter")
  private List<Oikeustulkki> qualifications = new ArrayList<>();

  @OneToMany(mappedBy = "interpreter")
  private List<Sijainti> regions = new ArrayList<>();
}
