import { createSelector } from 'reselect';
import { StringUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import {
  PublicInterpreter,
  PublicInterpreterFilter,
} from 'interfaces/publicInterpreter';

export const publicInterpretersSelector = (state: RootState) =>
  state.publicInterpreter;

export const selectFilteredPublicInterpreters = createSelector(
  (state: RootState) => state.publicInterpreter.interpreters,
  (state: RootState) => state.publicInterpreter.filters,
  (interpreters, filters) => {
    const filteredArray = filterPublicInterpreters(interpreters, filters);

    return filteredArray;
  }
);

export const selectFilteredPublicSelectedIds = createSelector(
  selectFilteredPublicInterpreters,
  (state: RootState) => state.publicInterpreter.selectedInterpreters,
  (filteredTranslators, selectedInterpreters) => {
    const filteredIds = new Set(filteredTranslators.map((t) => t.id));

    return selectedInterpreters.filter((id) => filteredIds.has(id));
  }
);

export const selectedPublicInterpretersForLanguagePair = createSelector(
  (state: RootState) => state.publicInterpreter.selectedInterpreters,
  (state: RootState) => state.publicInterpreter.interpreters,
  (state: RootState) => state.publicInterpreter.filters,
  (selectedInterpreters, interpreters, filters) => {
    const selectedIds = new Set(selectedInterpreters);
    const filtered = interpreters
      .filter(({ id }) => selectedIds.has(id))
      .filter((t) => filterByLanguagePair(t, filters));

    return filtered;
  }
);

// Helpers
export const filterPublicInterpreters = (
  interpreters: Array<PublicInterpreter>,
  filters: PublicInterpreterFilter
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
  filters: PublicInterpreterFilter
) => {
  return publicInterpreter.languages.find((l) => {
    const fromLangCond =
      l.from.toLowerCase() === filters.fromLang.toLowerCase() ||
      l.from.toLowerCase() === filters.toLang.toLowerCase();

    const toLangCond =
      l.to.toLowerCase() === filters.fromLang.toLowerCase() ||
      l.to.toLowerCase() === filters.toLang.toLowerCase();

    return filters.fromLang && filters.toLang
      ? fromLangCond && toLangCond
      : fromLangCond || toLangCond;
  });
};

const filterByName = (
  publicInterpreter: PublicInterpreter,
  filters: PublicInterpreterFilter
) => {
  const nameCombs = [
    `${publicInterpreter.firstName} ${publicInterpreter.lastName}`,
    `${publicInterpreter.lastName} ${publicInterpreter.firstName}`,
  ];
  const isNameIncluded = nameCombs.some((name) =>
    name.toLowerCase().includes(filters.name.toLowerCase().trim())
  );

  return isNameIncluded;
};

const filterByRegion = (
  publicInterpreter: PublicInterpreter,
  filters: PublicInterpreterFilter
) => {
  return publicInterpreter.regions
    .map((r) => r.toLowerCase())
    .includes(filters.region.toLowerCase());
};
