package fi.oph.yki.api;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/v2/virkailija/login")
public class LoginController {

  @GetMapping(value = "/cas", produces = MediaType.TEXT_HTML_VALUE)
  @ResponseBody
  public String index() {
    return "<html>\n" + "<header><title>Welcome</title></header>\n" +
            "<body>\n" + "Hello world\n" + "</body>\n" + "</html>";
  }
}
