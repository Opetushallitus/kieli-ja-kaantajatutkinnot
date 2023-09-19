package fi.oph.akr.util;

import static java.util.Objects.requireNonNull;

import java.util.Comparator;
import java.util.List;

public class CustomOrderComparator<T> implements Comparator<T> {

  private final List<T> ordering;

  public CustomOrderComparator(final List<T> ordering) {
    this.ordering = requireNonNull(ordering);
  }

  @Override
  public int compare(final T o1, final T o2) {
    final boolean o1included = ordering.contains(o1);
    final boolean o2included = ordering.contains(o2);

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
