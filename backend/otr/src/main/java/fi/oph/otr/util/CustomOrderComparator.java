package fi.oph.otr.util;

import static java.util.Objects.requireNonNull;

import java.util.Comparator;
import java.util.List;

public class CustomOrderComparator<T> implements Comparator<T> {

  private final List<T> ordering;

  public CustomOrderComparator(List<T> ordering) {
    this.ordering = requireNonNull(ordering);
  }

  @Override
  public int compare(T o1, T o2) {
    boolean o1included = ordering.contains(o1);
    boolean o2included = ordering.contains(o2);

    if (o1included && o2included) {
      return ordering.indexOf(o1) - ordering.indexOf(o2);
    } else if (o1included) {
      return -1;
    } else if (o2included) {
      return 1;
    }
    return 0;
  }
}
