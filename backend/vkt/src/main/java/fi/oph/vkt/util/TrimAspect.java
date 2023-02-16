package fi.oph.vkt.util;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Aspect
@Configuration
public class TrimAspect {
    @Pointcut("@annotation(Trim)")
    public void callAt() { }

    @Around("callAt()")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        System.out.println("value is ");
        return pjp.proceed();
    }
}
