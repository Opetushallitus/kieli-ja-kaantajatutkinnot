package fi.oph.vkt.payment;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.apache.commons.codec.digest.HmacAlgorithms;
import org.apache.commons.codec.digest.HmacUtils;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class Crypto {

  public static String ComputeSha256Hash(String message, String secret) {
    String outMsg;
    var hmac = new HmacUtils(HmacAlgorithms.HMAC_SHA_256, secret);
    outMsg = hmac.hmacHex(message);
    return outMsg.replace("-", "").toLowerCase();
  }

  private static List<String> collectHeaders(Map<String, String> hParams) {
    return hParams
      .entrySet()
      .stream()
      .filter(item -> item.getKey().startsWith("checkout-"))
      .map(entry -> String.format("%s:%s", entry.getKey(), entry.getValue()))
      .collect(Collectors.toList());
  }

  public static String CalculateHmac(String secret, Map<String, String> hParams) {
    List<String> data = collectHeaders(hParams);

    String message = String.join("\n", data);
    return ComputeSha256Hash(message, secret);
  }

  public static String CalculateHmac(String secret, Map<String, String> hParams, String body) {
    List<String> data = collectHeaders(hParams);
    data.add(body);

    String message = String.join("\n", data);
    return ComputeSha256Hash(message, secret);
  }
}
