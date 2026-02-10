import { Dayjs } from 'dayjs';

import { ClerkOrganizer } from 'interfaces/clerkOrganizer';

type EmptyOObject = Record<string, never>;

type StringKeyStringValueObj = {
  [key: string]: string;
};

type YhteystietoBase = {
  kieli: string;
  yhteystietoOid: string;
  id: string;
  version: string;
};

type YhteystietoOsoite = YhteystietoBase & {
  osoiteTyyppi: 'kaynti' | 'posti';
  postinumeroUri: string;
  postitoimipaikka: string;
  osoite: string;
};

type YhteystietoEmail = YhteystietoBase & {
  email: string;
};

type YhteystietoPuhelin = YhteystietoBase & {
  numero: string;
  tyyppi: 'puhelin' | 'faksi';
};

type YhteystietoWww = YhteystietoBase & {
  www: string;
};

type Yhteystieto =
  | YhteystietoOsoite
  | YhteystietoEmail
  | YhteystietoPuhelin
  | YhteystietoWww;

interface MetadataYhteystieto {
  osoiteTyyppi: 'kaynti' | 'posti';
  version: string;
  kieli: string;
  postinumeroUri: string;
  yhteystietoOid: string;
  id: string;
  postitoimipaikka: string;
  osoite: string;
}

interface Metadata {
  hakutoimistonNimi: StringKeyStringValueObj;
  nimi: StringKeyStringValueObj | EmptyOObject;
  yhteystiedot: MetadataYhteystieto[];
  hakutoimistoEctsNimi: StringKeyStringValueObj;
  hakutoimistoEctsEmail: StringKeyStringValueObj;
  hakutoimistoEctsPuhelin: StringKeyStringValueObj;
  hakutoimistoEctsTehtavanimike: StringKeyStringValueObj;
  luontiPvm: number;
  muokkausPvm: number;
  data: {
    [key: string]: {
      [key: string]: string | EmptyOObject;
    };
  };
}

interface Osoite {
  postinumeroUri: string;
  osoiteTyyppi: 'kaynti' | 'posti';
  yhteystietoOid: string;
  postitoimipaikka: string;
  osoite: string;
}

interface NimiHistoria {
  nimi: StringKeyStringValueObj;
  alkuPvm: Dayjs;
  version: number;
}

export interface FindByOidsOrganization {
  oid: string;
  nimi: StringKeyStringValueObj;
  metadata?: Metadata;
  alkuPvm: Dayjs;
  parentOid: string;
  oppilaitosKoodi: string;
  yhteystiedot: Yhteystieto[];
  ryhmatyypit: string[];
  kayttoryhmat: string[];
  postiosoite: Osoite;
  kuvaus2: StringKeyStringValueObj;
  tyypit: string[];
  yhteystietoArvos: unknown[];
  nimet: NimiHistoria[];
  parentOidPath: string;
  vuosiluokat: string[];
  kayntiosoite: Osoite;
  oppilaitosTyyppiUri: string;
  toimipistekoodi: string;
  lisatiedot: unknown[];
  kieletUris: string[];
  maaUri: string;
  kotipaikkaUri: string;
  version: number;
  status: string;
  tarkastusPvm?: Dayjs;
}

interface NimiHistoriaResponse extends Omit<NimiHistoria, 'alkuPvm'> {
  alkuPvm: string;
}

export interface FindByOidsOrganizationResponse
  extends Omit<FindByOidsOrganization, 'nimet' | 'alkuPvm' | 'tarkastusPvm'> {
  nimet: NimiHistoriaResponse[];
  alkuPvm: string;
  tarkastusPvm?: number;
}

export interface ClerkOrganizerRegistry {
  organizer: ClerkOrganizer;
  organization: FindByOidsOrganization | undefined;
}
