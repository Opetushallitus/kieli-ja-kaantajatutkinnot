package fi.oph.vkt.util;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TrimAspect {
    @Around("@annotation(fi.oph.vkt.util.Trim)")
    public Object trim(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("value is ");
        return pjp.proceed();
    }
}
