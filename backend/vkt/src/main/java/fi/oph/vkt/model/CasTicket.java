package fi.oph.vkt.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cas_ticket")
public class CasTicket {

  @Id
  private Long id;

  @OneToOne
  @MapsId
  private Person person;

  @Column(name = "ticket", nullable = false, unique = true)
  private String ticket;
}
