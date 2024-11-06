import { useMemo } from 'react';

import { useKoodistoMunicipalitiesTranslation } from 'configs/i18n';
import koodistoMunicipalitiesFI from 'public/i18n/fi-FI/koodisto_municipalities.json';

interface KoodistoMunicipalities {
  vkt: {
    koodisto: {
      municipalities: Map<string, string>;
    };
  };
}

const getCodes: () => Array<string> = () => {
  return Object.keys(
    (koodistoMunicipalitiesFI as KoodistoMunicipalities).vkt.koodisto
      .municipalities,
  );
};

export const useMunicipalityOptions = () => {
  const translate = useKoodistoMunicipalitiesTranslation();

  const sortedOptions = useMemo(() => {
    const options = getCodes().map((value) => ({
      value,
      label: translate(value),
    }));

    return options.sort((a, b) => a.label.localeCompare(b.label, 'fi-FI'));
  }, [translate]);

  return sortedOptions;
};
