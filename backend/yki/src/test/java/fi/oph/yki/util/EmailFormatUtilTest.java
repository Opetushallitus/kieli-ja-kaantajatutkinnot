package fi.oph.yki.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class EmailFormatUtilTest {

  @Test
  public void testFormatDateWithDots() {
    assertEquals("24.06.2026", EmailFormatUtil.formatDateWithDots(LocalDate.of(2026, 6, 24)));
    assertEquals("01.01.2027", EmailFormatUtil.formatDateWithDots(LocalDate.of(2027, 1, 1)));
  }

  @Test
  public void testFormatPrice() {
    assertEquals("35,00", EmailFormatUtil.formatPrice(35.0));
    assertEquals("60,50", EmailFormatUtil.formatPrice(60.5));
    assertEquals("0,00", EmailFormatUtil.formatPrice(0.0));
  }
}
