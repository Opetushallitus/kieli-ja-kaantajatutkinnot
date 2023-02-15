package fi.oph.vkt.util;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

public class TrimResolver implements HandlerMethodArgumentResolver {

    public boolean supportsParameter(MethodParameter parameter) {
        System.out.println("parameter is " + parameter.getParameterName());
        return parameter.getParameterAnnotation(Trim.class) != null;
    }

    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer, NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {
        Trim attr = parameter.getParameterAnnotation(Trim.class);
        System.out.println("trim value is ");
        return webRequest.getParameter(attr.value());
    }
}
