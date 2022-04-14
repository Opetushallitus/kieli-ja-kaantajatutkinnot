package fi.oph.otr;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import org.springframework.core.io.ClassPathResource;

public class TestUtil {

  public static String readResourceAsString(final String resourceName) throws IOException {
    final File resource = new ClassPathResource(resourceName).getFile();
    return Files.readString(resource.toPath());
  }
}
