package fi.oph.vkt.service.onr;

import fi.oph.vkt.model.Person;
import fi.oph.vkt.util.exception.APIException;
import fi.oph.vkt.util.exception.APIExceptionType;
import jakarta.annotation.Resource;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OnrService {

  private static final Logger LOG = LoggerFactory.getLogger(OnrService.class);

  @Resource
  private final OnrOperationApi api;

  public Map<String, PersonalData> getOnrPersonalData(final List<String> onrIds) {
    try {
      return api.fetchPersonalDatas(onrIds);
    } catch (final Exception e) {
      LOG.error("Fetching personal data from ONR failed", e);
      return Map.of();
    }
  }

  public String insertPersonalData(final Person person) {
    final PersonalData personData = PersonalData
      .builder()
      .lastName(person.getLastName())
      .firstName(person.getFirstName())
      .nickname(person.getFirstName())
      .ssn(person.getOtherIdentifier())
      .build();

    try {
      return api.insertPersonalData(personData);
    } catch (final Exception e) {
      LOG.error("Error inserting personal data to onr", e);
      throw new APIException(APIExceptionType.ONR_PERSON_INSERT_EXCEPTION);
    }
  }
}
