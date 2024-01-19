import { useCallback } from 'react';
import { Text } from 'shared/components';

import { useKoodistoLanguagesTranslation } from 'configs/i18n';
import { LanguagePair } from 'interfaces/languagePair';
import { AuthorisationUtils } from 'utils/authorisation';

export const PublicTranslatorListingRowLanguagePairs = ({
  fromLang,
  toLang,
  languagePairs,
}: {
  fromLang: string;
  toLang: string;
  languagePairs: Array<LanguagePair>;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();

  const sortAndRenderLanguagePairs = useCallback(
    (
      languagePairs: Array<LanguagePair>,
      classes: string,
      indexingStart: number,
      ariaHidden?: boolean,
    ) => {
      return languagePairs
        .map((lp) =>
          AuthorisationUtils.getLanguagePairLocalisation(lp, translateLanguage),
        )
        .sort()
        .map((localisation, i) => (
          <Text
            key={i + indexingStart}
            className={classes}
            aria-hidden={ariaHidden}
          >
            {localisation}
          </Text>
        ));
    },
    [translateLanguage],
  );

  const groupLanguagePairsByFilters = () => {
    if (fromLang && toLang) {
      const matches = languagePairs.filter(
        ({ from, to }) => from === fromLang && to === toLang,
      );
      const rest = languagePairs.filter(
        ({ from, to }) => from !== fromLang || to !== toLang,
      );

      return { matches, rest };
    } else {
      return { matches: [], rest: languagePairs };
    }
  };

  const { matches, rest } = groupLanguagePairsByFilters();

  return (
    <>
      {matches.length
        ? [
            ...sortAndRenderLanguagePairs(matches, 'bold', 0),
            ...sortAndRenderLanguagePairs(
              rest,
              'color-grey-600',
              matches.length,
              true,
            ),
          ]
        : [...sortAndRenderLanguagePairs(rest, '', 0)]}
    </>
  );
};
