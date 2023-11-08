import { createSelector } from 'reselect';
import { StringUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import {
  PublicInterpreter,
  PublicInterpreterFilter,
} from 'interfaces/publicInterpreter';
import { QualificationUtils } from 'utils/qualifications';

export const publicInterpretersSelector = (state: RootState) =>
  state.publicInterpreter;

export const selectFilteredPublicInterpreters = createSelector(
  (state: RootState) => state.publicInterpreter.interpreters,
  (state: RootState) => state.publicInterpreter.filters,
  (interpreters, filters) => {
    return filterPublicInterpreters(interpreters, filters);
  },
);

// Helpers
export const filterPublicInterpreters = (
  interpreters: Array<PublicInterpreter>,
  filters: PublicInterpreterFilter,
) => {
  const isNotBlank = (v: string) => !StringUtils.isBlankString(v);
  let filteredData = interpreters;
  // SearchFilter data only if the criteria are defined
  if (isNotBlank(filters.fromLang) || isNotBlank(filters.toLang)) {
    filteredData = filteredData.filter((t) => filterByLanguagePair(t, filters));
  }
  if (isNotBlank(filters.name)) {
    filteredData = filteredData.filter((t) => filterByName(t, filters));
  }
  if (isNotBlank(filters.region)) {
    filteredData = filteredData.filter((t) => filterByRegion(t, filters));
  }

  return filteredData;
};

const filterByLanguagePair = (
  publicInterpreter: PublicInterpreter,
  filters: PublicInterpreterFilter,
) => {
  return publicInterpreter.languages.find((languagePair) =>
    QualificationUtils.languagePairMatchesLangFilters(
      languagePair,
      filters.fromLang,
      filters.toLang,
    ),
  );
};

const filterByName = (
  { firstName, lastName }: PublicInterpreter,
  filters: PublicInterpreterFilter,
) => {
  const nameCombs = [`${firstName} ${lastName}`, `${lastName} ${firstName}`];

  return nameCombs.some((comb) =>
    comb.toLowerCase().includes(filters.name.toLowerCase().trim()),
  );
};

const filterByRegion = (
  publicInterpreter: PublicInterpreter,
  filters: PublicInterpreterFilter,
) => {
  if (publicInterpreter.regions.length) {
    return publicInterpreter.regions.includes(filters.region);
  } else {
    // If no regions are defined for the interpreter,
    // we assume that they work anywhere within Finland.
    return true;
  }
};
