// TODO Consider removing Municipality interface
// At the moment, the localised name information per code is found in localisation files.
export interface Municipality {
  fi: string;
  sv: string;
}

export interface MunicipalityCode {
  code: string;
}
