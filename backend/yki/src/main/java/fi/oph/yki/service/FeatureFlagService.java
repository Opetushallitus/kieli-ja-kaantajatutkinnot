package fi.oph.yki.service;

import fi.oph.yki.model.FeatureFlag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeatureFlagService {

  private final Environment environment;

  public boolean isEnabled(FeatureFlag featureFlag) {
    return Boolean.parseBoolean(environment.getProperty("app.featureFlags." + featureFlag.getPropertyKey()));
  }
}
