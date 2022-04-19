package fi.oph.akt.onr.model;

import fi.oph.akt.onr.model.contactDetails.ContactDetailsGroupDto;
import fi.oph.akt.onr.model.yksilointivirhe.YksilointiVirheDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Builder
@Getter
@Setter
public class HenkiloDto implements Serializable {

	private static final long serialVersionUID = -8509596443256973893L;

	private String oidHenkilo;

	private String hetu;

	private Set<String> kaikkiHetut;

	private boolean passivoitu;

	private String etunimet;

	private String kutsumanimi;

	private String sukunimi;

	private KielisyysDto aidinkieli;

	private KielisyysDto asiointiKieli;

	private Set<KansalaisuusDto> kansalaisuus;

	private String kasittelijaOid;

	private LocalDate syntymaaika;

	private String sukupuoli;

	private String kotikunta;

	private String oppijanumero;

	private Boolean turvakielto;

	private boolean eiSuomalaistaHetua;

	private boolean yksiloity;

	private boolean yksiloityVTJ;

	private boolean yksilointiYritetty;

	private boolean duplicate;

	private Date created;

	private Date modified;

	private Date vtjsynced;

	private Set<ContactDetailsGroupDto> yhteystiedotRyhma;

	private Set<YksilointiVirheDto> yksilointivirheet;

	@Deprecated
	public HenkiloTyyppi getHenkiloTyyppi() {
		return HenkiloTyyppi.OPPIJA;
	}

	@Deprecated
	public Set<KielisyysDto> getKielisyys() {
		return new HashSet<>();
	}

}
