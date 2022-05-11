package fi.oph.otr.util;

import java.util.Collections;
import java.util.List;

public class ListUtil {

  public static <T> List<T> getOrEmptyList(final List<T> list) {
    return list != null ? list : Collections.emptyList();
  }
}
