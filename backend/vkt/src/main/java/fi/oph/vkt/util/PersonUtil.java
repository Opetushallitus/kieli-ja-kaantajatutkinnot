package fi.oph.vkt.util;

import fi.oph.vkt.api.dto.PublicPersonDTO;
import fi.oph.vkt.api.dto.integration.RegistryPersonDTO;
import fi.oph.vkt.model.Person;

public class PersonUtil {

  public static PublicPersonDTO createPublicPersonDTO(final Person person) {
    return PublicPersonDTO
      .builder()
      .id(person.getId())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .build();
  }

  public static RegistryPersonDTO createRegistryPersonDTO(final Person person) {
    return RegistryPersonDTO
      .builder()
      .id(person.getId())
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .oid(person.getOid())
      .build();
  }
}
