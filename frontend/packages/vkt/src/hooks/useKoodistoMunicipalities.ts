import { useMemo } from 'react';
import { sortOptionsByLabels } from 'shared/components';

import { useKoodistoMunicipalitiesTranslation } from 'configs/i18n';
import koodistoMunicipalitiesFI from 'public/i18n/fi-FI/koodisto_municipalities.json';
import { municipalityToOption } from 'utils/municipality';

interface KoodistoMunicipalities {
  vkt: {
    koodisto: {
      municipalities: Record<string, string>;
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
    const options = getCodes().map((code) =>
      municipalityToOption({ code }, translate),
    );

    return sortOptionsByLabels(options);
  }, [translate]);

  return sortedOptions;
};
