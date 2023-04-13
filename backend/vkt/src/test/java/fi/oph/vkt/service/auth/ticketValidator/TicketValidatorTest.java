package fi.oph.vkt.service.auth.ticketValidator;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.ctc.wstx.stax.WstxInputFactory;
import com.ctc.wstx.stax.WstxOutputFactory;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.xml.XmlFactory;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.junit.jupiter.api.Test;

public class TicketValidatorTest {

  private static final XmlFactory xf = XmlFactory
    .builder()
    .xmlInputFactory(new WstxInputFactory())
    .xmlOutputFactory(new WstxOutputFactory())
    .build();
  private static final XmlMapper XML_MAPPER = new XmlMapper(xf);

  /*
<cas:authenticationSuccess>
        <cas:user>suomi.fi,AAdzZWNyZXQxEFQWRo25htfoIsHzlWoaY2tF3pWY1LiPHphxFHC9Cc2tJQQXAzkLV9FWerPm967N6L3nmD2Cx9U//3+/Ql1CbQRwF+hLG9ryADvDR8i/udNikpk1+GZnUxSYmDRRbwx6sOP6x6NmqUj09Xn3r/TwadCxd5nOXPvvCaf/rZk5sg==</cas:user>
        <cas:attributes>
            <cas:firstName>Oliver Jack</cas:firstName>
            <cas:clientName>suomi.fi</cas:clientName>
            <cas:vtjVerified>false</cas:vtjVerified>
            <cas:familyName>Great Britain</cas:familyName>
            <cas:notOnOrAfter>2023-04-12T12:22:49.792Z</cas:notOnOrAfter>
            <cas:personIdentifier>UK/FI/Lorem0ipsum0dolor0sit0amet10consectetur0adipiscing0elit10sed0do0eiusmod0tempor0incididunt0ut0labore0et0dolore0magna0aliqua.0Ut0enim0ad0minim0veniam10quis0nostrud0exercitation0ullamco0laboris0nisi0ut0aliquip0ex0ea0commodo0consequat.0Duis0aute0irure0do</cas:personIdentifier>
            <cas:dateOfBirth>1981-02-04</cas:dateOfBirth>
            <cas:notBefore>2023-04-12T12:17:49.792Z</cas:notBefore>
            </cas:attributes>
    </cas:authenticationSuccess>
</cas:serviceResponse>
 */
  @Test
  public void testXmlParse() throws JsonProcessingException {
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
