package fi.oph.akt.service.koodisto;

import java.util.Set;
import javax.annotation.PostConstruct;
import org.springframework.stereotype.Service;

@Service
public class PostalCodeService extends AbstractKoodistoService {

  @PostConstruct
  public void init() {
    init("koodisto/koodisto_postitoimipaikat.json", Set.of());
  }
}
