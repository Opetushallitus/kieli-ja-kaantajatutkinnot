package fi.oph.akr.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/")
public class IndexController {

  @GetMapping("")
  public ModelAndView index() {
    return new ModelAndView("index.html");
  }

  // Map to everything which has no suffix, i.e. matches to "/foo/bar" but not to "/foo/bar.js"
  @GetMapping(
    path = {
      "{path:[^.]*}",
      "*/{path:[^.]*}",
      "*/*/{path:[^.]*}",
      "*/*/*/{path:[^.]*}",
      "*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/*/*/{path:[^.]*}",
      "*/*/*/*/*/*/*/*/*/*/*/{path:[^.]*}",
    }
  )
  public ModelAndView indexAllOtherPaths() {
    return new ModelAndView("index.html");
  }
}
