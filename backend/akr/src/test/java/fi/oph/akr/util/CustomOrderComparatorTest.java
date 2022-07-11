package fi.oph.akr.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.junit.jupiter.api.Test;

public class CustomOrderComparatorTest {

  private final Comparator<String> comparator = new CustomOrderComparator<>(List.of("3", "1", "4"));

  @Test
  public void compareReturnsNegativeValueIfFirstElementInOrderingIsBeforeSecond() {
    assertTrue(comparator.compare("3", "1") < 0);
  }

  @Test
  public void compareReturnsNegativeValueIfFirstElementIsInOrderingButSecondIsNot() {
    assertTrue(comparator.compare("4", "2") < 0);
  }

  @Test
  public void compareReturnsPositiveValueIfFirstElementInOrderingIsAfterSecond() {
    assertTrue(comparator.compare("1", "3") > 0);
  }

  @Test
  public void compareReturnsPositiveValueIfFirstElementIsNotInOrderingButSecondIs() {
    assertTrue(comparator.compare("2", "4") > 0);
  }

  @Test
  public void compareReturnsZeroIfNeitherOfTheElementsComparedAreInOrdering() {
    assertEquals(0, comparator.compare("2", "5"));
  }

  @Test
  public void comparatorCanBeUsedForSortingListsInAnExpectedWay() {
    List<String> immutableList = List.of("1", "3", "4", "6", "2", "5");
    List<String> list = new ArrayList<>(immutableList);

    list.sort(comparator);
    assertEquals(List.of("3", "1", "4", "6", "2", "5"), list);

    list.sort(comparator.thenComparing(Comparator.naturalOrder()));
    assertEquals(List.of("3", "1", "4", "2", "5", "6"), list);
  }
}
