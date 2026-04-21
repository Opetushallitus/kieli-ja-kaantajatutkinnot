package fi.oph.yki.api.dto.clerk;

/**
 * Clerk's verdict on a quarantine match.
 *
 * <p>
 *   {@code quarantined = true} means the clerk has confirmed the quarantine row
 *   applies to the matched registration; the registration will be cancelled.
 *   {@code quarantined = false} means the clerk has rejected the match; the
 *   registration is kept as-is.
 * </p>
 */
public record QuarantineReviewRequest(boolean quarantined) {}
