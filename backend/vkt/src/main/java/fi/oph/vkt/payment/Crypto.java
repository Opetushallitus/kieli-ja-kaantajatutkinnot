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

  public static String computeSha256Hash(final String message, final String secret) {
    final HmacUtils hmac = new HmacUtils(HmacAlgorithms.HMAC_SHA_256, secret);

    return hmac.hmacHex(message).replace("-", "").toLowerCase();
  }

  public static List<String> collectHeaders(final Map<String, String> hParams) {
    return hParams
      .entrySet()
      .stream()
      .filter(item -> item.getKey().startsWith("checkout-"))
      .sorted(Map.Entry.comparingByKey())
      .map(entry -> String.format("%s:%s", entry.getKey(), entry.getValue()))
      .collect(Collectors.toList());
  }

  public static String calculateHmac(final String secret, final Map<String, String> hParams, final String body) {
    final List<String> data = collectHeaders(hParams);
    data.add(body);

    return computeSha256Hash(String.join("\n", data), secret);
  }
}
