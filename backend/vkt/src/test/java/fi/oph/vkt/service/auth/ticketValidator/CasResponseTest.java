package fi.oph.vkt.service.auth.ticketValidator;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.ctc.wstx.stax.WstxInputFactory;
import com.ctc.wstx.stax.WstxOutputFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.xml.XmlFactory;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.junit.jupiter.api.Test;

public class CasResponseTest {

  private static final XmlFactory XF = XmlFactory
    .builder()
    .xmlInputFactory(new WstxInputFactory())
    .xmlOutputFactory(new WstxOutputFactory())
    .build();

  private static final XmlMapper XML_MAPPER = new XmlMapper(XF);

  @Test
  public void testParseXmlToCasResponse() throws JsonProcessingException {
    final String xml =
      "<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>" +
      "<cas:authenticationSuccess>" +
      "<cas:user>suomi.fi,010280-952L</cas:user>" +
      "<cas:attributes>" +
      "<cas:firstName>Tessa</cas:firstName>" +
      "<cas:clientName>suomi.fi</cas:clientName>" +
      "<cas:displayName>Tessa Testilä</cas:displayName>" +
      "<cas:vtjVerified>true</cas:vtjVerified>" +
      "<cas:givenName>Tessa</cas:givenName>" +
      "<cas:notOnOrAfter>2023-03-23T05:18:32.713Z</cas:notOnOrAfter>" +
      "<cas:cn>Testilä Tessa</cas:cn>" +
      "<cas:sn>Testilä</cas:sn>" +
      "<cas:notBefore>2023-03-23T05:13:32.713Z</cas:notBefore>" +
      "<cas:nationalIdentificationNumber>010280-952L</cas:nationalIdentificationNumber>" +
      "<cas:personOid>1.2.246.562.24.40675408602</cas:personOid>" +
      "</cas:attributes>" +
      "</cas:authenticationSuccess>" +
      "</cas:serviceResponse>";

    final CasResponse casResponse = XML_MAPPER.readValue(xml, CasResponse.class);

    assertEquals(
      CasResponse
        .builder()
        .authenticationSuccess(
          CasAuthenticationSuccess
            .builder()
            .user("suomi.fi,010280-952L")
            .attributes(
              CasAttributes
                .builder()
                .firstName("Tessa")
                .clientName("suomi.fi")
                .displayName("Tessa Testilä")
                .vtjVerified(true)
                .givenName("Tessa")
                .notOnOrAfter("2023-03-23T05:18:32.713Z")
                .cn("Testilä Tessa")
                .sn("Testilä")
                .notBefore("2023-03-23T05:13:32.713Z")
                .nationalIdentificationNumber("010280-952L")
                .personOid("1.2.246.562.24.40675408602")
                .build()
            )
            .build()
        )
        .build(),
      casResponse
    );
  }
}