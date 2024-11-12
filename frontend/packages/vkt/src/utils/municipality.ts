import { MunicipalityCode } from 'interfaces/municipality';

export const municipalityToOption = (
  { code }: MunicipalityCode,
  translateMunicipality: (k: string) => string,
) => {
  return {
    label: translateMunicipality(code),
    value: code,
  };
};
