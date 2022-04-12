import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import {
  PublicTranslator,
  PublicTranslatorFilter,
} from 'interfaces/publicTranslator';
import { StringUtils } from 'utils/string';

export const publicTranslatorsSelector = (state: RootState) =>
  state.publicTranslator;

export const selectFilteredPublicTranslators = createSelector(
  (state: RootState) => state.publicTranslator.translators,
  (state: RootState) => state.publicTranslator.filters,
  (translators, filters) => {
    const filteredArray = filterPublicTranslators(translators, filters);

    return filteredArray;
  }
);

export const selectFilteredPublicSelectedIds = createSelector(
  selectFilteredPublicTranslators,
  (state: RootState) => state.publicTranslator.selectedTranslators,
  (filteredTranslators, selectedTranslators) => {
    const filteredIds = new Set(filteredTranslators.map((t) => t.id));

    return selectedTranslators.filter((id) => filteredIds.has(id));
  }
);

export const selectedPublicTranslatorsForLanguagePair = createSelector(
  (state: RootState) => state.publicTranslator.selectedTranslators,
  (state: RootState) => state.publicTranslator.translators,
  (state: RootState) => state.publicTranslator.filters,
  (selectedTranslators, translators, filters) => {
    const selectedIds = new Set(selectedTranslators);
    const filtered = translators
      .filter(({ id }) => selectedIds.has(id))
      .filter((t) => filterByLanguagePair(t, filters));

    return filtered;
  }
);

// Helpers
export const filterPublicTranslators = (
  translators: Array<PublicTranslator>,
  filters: PublicTranslatorFilter
) => {
  const isNotBlank = (v: string) => !StringUtils.isBlankString(v);
  let filteredData = translators;
  // SearchFilter data only if the criteria are defined
  if (isNotBlank(filters.fromLang) && isNotBlank(filters.toLang)) {
    filteredData = filteredData.filter((t) => filterByLanguagePair(t, filters));
  }
  if (isNotBlank(filters.name)) {
    filteredData = filteredData.filter((t) => filterByName(t, filters));
  }
  if (isNotBlank(filters.town)) {
    filteredData = filteredData.filter((t) => filterByTown(t, filters));
  }

  return filteredData;
};

const filterByLanguagePair = (
  publicTranslator: PublicTranslator,
  filters: PublicTranslatorFilter
) => {
  return publicTranslator.languagePairs.find(
    (l) =>
      l.from.toLowerCase() === filters.fromLang.toLowerCase() &&
      l.to.toLowerCase() === filters.toLang.toLowerCase()
  );
};

const filterByName = (
  publicTranslator: PublicTranslator,
  filters: PublicTranslatorFilter
) => {
  const nameCombs = [
    `${publicTranslator.firstName} ${publicTranslator.lastName}`,
    `${publicTranslator.lastName} ${publicTranslator.firstName}`,
  ];
  const isNameIncluded = nameCombs.some((name) =>
    name.toLowerCase().includes(filters.name.toLowerCase().trim())
  );

  return isNameIncluded;
};

const filterByTown = (
  publicTranslator: PublicTranslator,
  filters: PublicTranslatorFilter
) => {
  return publicTranslator.town
    ?.toLowerCase()
    .includes(filters.town.toLowerCase());
};
