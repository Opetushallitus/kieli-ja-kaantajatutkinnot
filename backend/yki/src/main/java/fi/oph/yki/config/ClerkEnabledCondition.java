package fi.oph.yki.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

public class ClerkEnabledCondition implements Condition {

  @Override
  public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    final String clerkEnabled = context.getEnvironment().getProperty("clerk.enabled");
    if (clerkEnabled == null || clerkEnabled.isEmpty()) {
      return false;
    }
    return clerkEnabled.equals("true");
  }
}
