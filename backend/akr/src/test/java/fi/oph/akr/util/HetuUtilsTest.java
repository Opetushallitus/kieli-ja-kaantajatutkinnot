package fi.oph.akr.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.stream.Stream;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

class HetuUtilsTest {

  private static Stream<Fixture> valid() {
    return Stream.concat(generated(), excel());
  }

  private static Stream<Fixture> generated() {
    // generated list: https://www.telepartikkeli.net/tunnusgeneraattori
    return Stream.of(
      new Fixture("140689V3161", LocalDate.of(1989, 6, 14), "2"),
      new Fixture("281166W6243", LocalDate.of(1966, 11, 28), "2"),
      new Fixture("120562V742P", LocalDate.of(1962, 5, 12), "2"),
      new Fixture("181003Y077X", LocalDate.of(1903, 10, 18), "1"),
      new Fixture("160879U111R", LocalDate.of(1979, 8, 16), "1"),
      new Fixture("170628W0388", LocalDate.of(1928, 6, 17), "2"),
      new Fixture("090537V2072", LocalDate.of(1937, 5, 9), "1"),
      new Fixture("170377Y133J", LocalDate.of(1977, 3, 17), "1"),
      new Fixture("090378X778E", LocalDate.of(1978, 3, 9), "2"),
      new Fixture("130569U166K", LocalDate.of(1969, 5, 13), "2"),
      new Fixture("220978U4171", LocalDate.of(1978, 9, 22), "1"),
      new Fixture("110209W741X", LocalDate.of(1909, 2, 11), "1"),
      new Fixture("161051Y281L", LocalDate.of(1951, 10, 16), "1"),
      new Fixture("171119X398K", LocalDate.of(1919, 11, 17), "2"),
      new Fixture("210582-368L", LocalDate.of(1982, 5, 21), "2"),
      new Fixture("060264Y6532", LocalDate.of(1964, 2, 6), "1"),
      new Fixture("211141V0996", LocalDate.of(1941, 11, 21), "1"),
      new Fixture("130482X592V", LocalDate.of(1982, 4, 13), "2"),
      new Fixture("050456U420E", LocalDate.of(1956, 4, 5), "2"),
      new Fixture("120574W8144", LocalDate.of(1974, 5, 12), "2"),
      new Fixture("221077V162B", LocalDate.of(1977, 10, 22), "2")
    );
  }

  private static Stream<Fixture> excel() {
    // Data from provided official test excel
    return Stream.of(
      new Fixture("010594Y9032", LocalDate.of(1994, 5, 1), "1"),
      new Fixture("010594Y9021", LocalDate.of(1994, 5, 1), "2"),
      new Fixture("020594X903P", LocalDate.of(1994, 5, 2), "1"),
      new Fixture("020594X902N", LocalDate.of(1994, 5, 2), "2"),
      new Fixture("030594W903B", LocalDate.of(1994, 5, 3), "1"),
      new Fixture("030694W9024", LocalDate.of(1994, 6, 3), "2"),
      new Fixture("040594V9030", LocalDate.of(1994, 5, 4), "1"),
      new Fixture("040594V902Y", LocalDate.of(1994, 5, 4), "2"),
      new Fixture("050594U903M", LocalDate.of(1994, 5, 5), "1"),
      new Fixture("050594U902L", LocalDate.of(1994, 5, 5), "2"),
      new Fixture("010516B903X", LocalDate.of(2016, 5, 1), "1"),
      new Fixture("010516B902W", LocalDate.of(2016, 5, 1), "2"),
      new Fixture("020516C903K", LocalDate.of(2016, 5, 2), "1"),
      new Fixture("020516C902J", LocalDate.of(2016, 5, 2), "2"),
      new Fixture("030516D9037", LocalDate.of(2016, 5, 3), "1"),
      new Fixture("030516D9026", LocalDate.of(2016, 5, 3), "2"),
      new Fixture("010501E9032", LocalDate.of(2001, 5, 1), "1"),
      new Fixture("020502E902X", LocalDate.of(2002, 5, 2), "2"),
      new Fixture("020503F9037", LocalDate.of(2003, 5, 2), "1"),
      new Fixture("020504A902E", LocalDate.of(2004, 5, 2), "2"),
      new Fixture("020504B904H", LocalDate.of(2004, 5, 2), "2")
    );
  }

  private static Stream<String> bogus() {
    return Stream.of(
      "123456+789", // wrong length
      "990101A1234", // unparseable date (totally wrong)
      "000101A1234", // unparseable date (slightly wrong)
      "320101A1234", // unparseable date (slightly wrong)
      "123456:7890" // wrong separator character
    );
  }

  @AfterEach
  public void reset() {
    // Make sure that HetuUtils is restored to default state
    HetuUtils.setAllowFake(HetuUtils.ALLOW_FAKE_DEFAULT);
  }

  @ParameterizedTest
  @MethodSource("valid")
  void testValid(Fixture fixture) {
    assertThat(HetuUtils.hetuIsValid(fixture.getHetu())).isTrue();
  }

  @ParameterizedTest
  @MethodSource("excel")
  void testDisallowFakes(Fixture fixture) {
    HetuUtils.setAllowFake(!HetuUtils.ALLOW_FAKE_DEFAULT);
    assertThat(HetuUtils.hetuIsValid(fixture.getHetu())).isFalse();
  }

  @ParameterizedTest
  @MethodSource("generated")
  void testDisallowFakesAcceptValid(Fixture fixture) {
    HetuUtils.setAllowFake(!HetuUtils.ALLOW_FAKE_DEFAULT);
    assertThat(HetuUtils.hetuIsValid(fixture.getHetu())).isTrue();
  }

  @ParameterizedTest
  @MethodSource("valid")
  void testInvalid(Fixture fixture) {
    // Replace checksum with "O" to be sure that hetu is invalid
    assertThat(HetuUtils.hetuIsValid(fixture.getHetu().substring(0, fixture.getHetu().length() - 1) + "O")).isFalse();
  }

  @ParameterizedTest
  @MethodSource("valid")
  void testYearExtraction(Fixture fixture) {
    assertThat(HetuUtils.dateFromHetu(fixture.getHetu())).isEqualTo(fixture.getDob());
  }

  @ParameterizedTest
  @MethodSource("valid")
  void testGenderExtraction(Fixture fixture) {
    assertThat(HetuUtils.sukupuoliFromHetu(fixture.getHetu())).isEqualTo(fixture.getGender());
  }

  @ParameterizedTest
  @MethodSource("bogus")
  void testBogus(String hetu) {
    assertThat(HetuUtils.hetuIsValid(hetu)).isFalse();
  }

  @Getter
  @AllArgsConstructor
  private static class Fixture {

    private String hetu;
    private LocalDate dob;
    private String gender;
  }
}
