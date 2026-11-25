package fi.oph.yki.view;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.oph.yki.Factory;
import fi.oph.yki.audit.AuditService;
import fi.oph.yki.onr.OnrService;
import fi.oph.yki.onr.dto.PersonalDataDTO;
import fi.oph.yki.repository.ExamDateRepository;
import fi.oph.yki.repository.ExamSessionRepository;
import fi.oph.yki.repository.OrganizerRepository;
import fi.oph.yki.repository.RegistrationRepository;
import fi.oph.yki.service.ClerkExamSessionService;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ExamSessionXlsxViewTest {

  @Test
  void exportedWorkbookKeepsOnrSsnAndFormBirthdateInSeparateColumns() throws Exception {
    final var session = Factory.examSession(Factory.examDate());
    final var personalData = new ArrayList<PersonalDataDTO>();
    for (int i = 0; i < 5; i++) {
      final var person = Factory.person();
      person.setOid("1.2.3." + i);
      final var registration = Factory.registration(person);
      registration.setExamSession(session);
      if (i == 3) {
        registration.setForm(new ObjectMapper().createObjectNode().put("birthdate", "1980-12-31"));
      }
      session.getRegistrations().add(registration);
      final var data = new PersonalDataDTO();
      data.setOidHenkilo(person.getOid());
      if (i < 3) {
        registration.setForm(new ObjectMapper().createObjectNode().put("birthdate", "2002-05-02"));
      }
      if (i == 0) data.setIdentityNumber("020502E902X");
      if (i == 2) data.setIdentityNumber("");
      personalData.add(data);
    }
    final var sessions = mock(ExamSessionRepository.class);
    final var onr = mock(OnrService.class);
    when(sessions.getReferenceById(1L)).thenReturn(session);
    when(onr.listPersonDetails(personalData.stream().map(PersonalDataDTO::getOidHenkilo).toList()))
      .thenReturn(personalData);
    final var service = new ClerkExamSessionService(
      sessions,
      mock(RegistrationRepository.class),
      mock(ExamDateRepository.class),
      mock(OrganizerRepository.class),
      mock(AuditService.class),
      onr
    );
    final var response = new MockHttpServletResponse();
    service.getExamSessionExcel(1L).render(Map.of(), new MockHttpServletRequest(), response);

    try (final var workbook = new XSSFWorkbook(new ByteArrayInputStream(response.getContentAsByteArray()))) {
      final var sheet = workbook.getSheet("Tilaisuuden tiedot");
      final var formatter = new DataFormatter();
      assertEquals("Hetu", sheet.getRow(0).getCell(6).getStringCellValue());
      final var expected = List.of("020502E902X", "", "", "", "");
      final var birthdays = List.of("2002-05-02", "2002-05-02", "2002-05-02", "1980-12-31", "");
      assertEquals("Syntymäaika", sheet.getRow(0).getCell(7).getStringCellValue());
      for (int i = 0; i < expected.size(); i++) {
        assertEquals(expected.get(i), formatter.formatCellValue(sheet.getRow(i + 1).getCell(6)));
        assertEquals(birthdays.get(i), formatter.formatCellValue(sheet.getRow(i + 1).getCell(7)));
        assertEquals("1.2.3." + i, sheet.getRow(i + 1).getCell(0).getStringCellValue());
      }
      assertEquals(6, sheet.getPhysicalNumberOfRows());
      assertEquals(21, sheet.getRow(0).getPhysicalNumberOfCells());
    }
  }
}
