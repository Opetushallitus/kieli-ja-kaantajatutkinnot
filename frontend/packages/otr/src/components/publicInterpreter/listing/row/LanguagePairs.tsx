import { useCallback } from 'react';
import { Text } from 'shared/components';

import { useKoodistoLanguagesTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { LanguagePair } from 'interfaces/languagePair';
import { publicInterpretersSelector } from 'redux/selectors/publicInterpreter';
import { QualificationUtils } from 'utils/qualifications';

export const LanguagePairs = ({
  languagePairs,
}: {
  languagePairs: Array<LanguagePair>;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();

  const {
    filters: { fromLang, toLang },
  } = useAppSelector(publicInterpretersSelector);

  const sortAndRenderLanguagePairs = useCallback(
    (
      languagePairs: Array<LanguagePair>,
      classes: string,
      indexingStart: number,
      ariaHidden?: boolean,
    ) => {
      return languagePairs
        .map((lp) =>
          QualificationUtils.getLanguagePairLocalisation(lp, translateLanguage),
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
      const matches = languagePairs.filter((lp) =>
        QualificationUtils.languagePairMatchesLangFilters(lp, fromLang, toLang),
      );
      const rest = languagePairs.filter((lp) => !matches.includes(lp));

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
