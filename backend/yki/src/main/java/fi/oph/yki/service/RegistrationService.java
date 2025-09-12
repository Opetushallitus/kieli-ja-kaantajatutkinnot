package fi.oph.yki.service;

import fi.oph.yki.model.Registration;
import fi.oph.yki.util.exception.APIException;
import fi.oph.yki.util.exception.APIExceptionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class RegistrationService {

  public Registration findRegistration(long registrationId, String oid) {
    throw new APIException(APIExceptionType.NOT_FOUND);
  }
}
