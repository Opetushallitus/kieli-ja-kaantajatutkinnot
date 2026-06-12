package fi.oph.yki.model;

import fi.oph.yki.model.type.GenderCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "person")
public class Person {

  @Id
  @Size(max = 255)
  @Column(name = "oid", unique = true, nullable = false)
  private String oid;

  @Size(max = 255)
  @Column(name = "first_name")
  private String firstName;

  @Size(max = 255)
  @Column(name = "last_name")
  private String lastName;

  @Size(max = 255)
  @Column(name = "email")
  private String email;

  @Size(max = 255)
  @Column(name = "phone_number")
  private String phoneNumber;

  @Size(max = 100)
  @Column(name = "street_address")
  private String steetAddress;

  @Size(max = 50)
  @Column(name = "post_office")
  private String postOffice;

  @Size(max = 255)
  @Column(name = "zip")
  private String zip;

  @Column(name = "gender", columnDefinition = "gender_code")
  @Enumerated(value = EnumType.STRING)
  @JdbcType(PostgreSQLEnumJdbcType.class)
  private GenderCode gender;

  @Size(max = 255)
  @Column(name = "nationality_code")
  private String nationalityCode;

  @Size(max = 255)
  @Column(name = "country_code")
  private String countryCode;
}
