package fi.oph.vkt.util;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class SanitiseAspect {
    @Around("@annotation(fi.oph.vkt.util.Sanitise)")
    public Object Sanitise(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("value is ");
        return pjp.proceed();
    }
}
