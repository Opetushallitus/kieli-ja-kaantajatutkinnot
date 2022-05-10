package fi.oph.vkt;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.AbstractFileFilter;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.junit.jupiter.api.Test;

public class NoSystemOutOrErrTest {

  private static final String THIS_FILE = NoSystemOutOrErrTest.class.getSimpleName() + ".java";

  @Test
  public void testSystemOutOrErrShouldNotBeCalled() {
    final AbstractFileFilter fileFilter = new AbstractFileFilter() {
      @Override
      public boolean accept(final File dir, final String filename) {
        return filename.endsWith(".java") && !THIS_FILE.equals(filename);
      }
    };
    final Iterator<File> fileIterator = FileUtils.iterateFiles(new File("src"), fileFilter, TrueFileFilter.INSTANCE);

    final Set<String> foundFiles = new HashSet<>();

    fileIterator.forEachRemaining(file -> {
      try {
        Files
          .readAllLines(file.toPath())
          .stream()
          .filter(line -> line.contains("System.out") || line.contains("System.err"))
          .map(line -> file.getName())
          .forEach(foundFiles::add);
      } catch (IOException e) {
        e.printStackTrace();
      }
    });
    assertEquals(Set.of(), foundFiles, "Files contain System.out or System.err calls");
  }
}
