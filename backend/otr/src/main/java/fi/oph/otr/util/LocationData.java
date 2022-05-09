package fi.oph.otr.util;

import fi.oph.otr.model.Sijainti;

public record LocationData(Sijainti.Tyyppi locationType, String code) {}
