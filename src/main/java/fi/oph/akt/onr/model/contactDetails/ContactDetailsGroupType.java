package fi.oph.akt.onr.model.contactDetails;

import java.util.List;

public class ContactDetailsGroupType {

	public static final String HOME_ADDRESS = "yhteystietotyyppi1";

	public static final String WORK_ADDRESS = "yhteystietotyyppi2";

	public static final String FREE_TIME_ADDRESS = "yhteystietotyyppi3";

	public static final String VTJ_REGULAR_DOMESTIC_ADDRESS = "yhteystietotyyppi4";

	public static final String VTJ_REGULAR_FOREIGN_ADDRESS = "yhteystietotyyppi5";

	public static final String CONTACT_DETAILS_FILLED_FOR_APPLICATION = "yhteystietotyyppi6";

	public static final String OTHER_ADDRESS = "yhteystietotyyppi7";

	public static final String VTJ_ELECTRONIC_ADDRESS = "yhteystietotyyppi8";

	public static final String VTJ_TEMPORARY_DOMESTIC_ADDRESS = "yhteystietotyyppi9";

	public static final String VTJ_TEMPORARY_FOREIGN_ADDRESS = "yhteystietotyyppi10";

	public static final String VTJ_DOMESTIC_POSTAL_ADDRESS = "yhteystietotyyppi11";

	public static final String VTJ_FOREIGN_POSTAL_ADDRESS = "yhteystietotyyppi12";

	public static final List<String> prioritisedOrdering = List.of(VTJ_TEMPORARY_DOMESTIC_ADDRESS,
			VTJ_TEMPORARY_FOREIGN_ADDRESS, VTJ_REGULAR_DOMESTIC_ADDRESS, VTJ_REGULAR_FOREIGN_ADDRESS,
			VTJ_DOMESTIC_POSTAL_ADDRESS, VTJ_FOREIGN_POSTAL_ADDRESS, VTJ_ELECTRONIC_ADDRESS);

}
