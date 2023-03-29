package fi.oph.vkt.model;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "email_attachment")
public class EmailAttachment extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "email_attachment_id", nullable = false)
  private long id;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "content_type", nullable = false)
  private String contentType;

  @Basic(fetch = FetchType.LAZY)
  @Column(name = "data", nullable = false)
  private byte[] data;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "email_id", referencedColumnName = "email_id", nullable = false)
  private Email email;
}
