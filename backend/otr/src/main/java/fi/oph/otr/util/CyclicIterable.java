package fi.oph.otr.util;

import java.util.Iterator;
import java.util.List;

public class CyclicIterable<T> implements Iterable<T> {

  private final List<T> coll;

  private int index = 0;

  public CyclicIterable(List<T> coll) {
    this.coll = coll;
  }

  public Iterator<T> iterator() {
    return new Iterator<>() {
      @Override
      public boolean hasNext() {
        return true;
      }

      @Override
      public T next() {
        if (index >= coll.size()) {
          index = 0;
        }
        return coll.get(index++);
      }

      @Override
      public void remove() {
        throw new UnsupportedOperationException();
      }
    };
  }
}
