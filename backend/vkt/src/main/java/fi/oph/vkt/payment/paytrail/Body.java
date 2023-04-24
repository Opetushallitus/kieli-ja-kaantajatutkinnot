package fi.oph.vkt.payment.paytrail;

import fi.oph.vkt.payment.Item;
import java.util.List;
import lombok.Builder;

@Builder
public record Body(String stamp, String reference, int amount, String currency, String language, List<Item> items) {}
