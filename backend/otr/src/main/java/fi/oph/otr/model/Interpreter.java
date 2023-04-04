package fi.oph.otr.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "interpreter")
public class Interpreter extends BaseEntity {

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
  private List<Qualification> qualifications = new ArrayList<>();

  @OneToMany(mappedBy = "interpreter")
  private List<Region> regions = new ArrayList<>();
}
