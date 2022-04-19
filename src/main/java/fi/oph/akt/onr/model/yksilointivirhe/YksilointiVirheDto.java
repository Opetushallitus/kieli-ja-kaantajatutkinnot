package fi.oph.akt.onr.model.yksilointivirhe;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
public class YksilointiVirheDto {

	private YksilointivirheTila yksilointivirheTila;

	private Date uudelleenyritysAikaleima;

}
