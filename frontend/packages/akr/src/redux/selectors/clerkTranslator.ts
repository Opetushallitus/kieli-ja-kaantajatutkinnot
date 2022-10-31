import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { PermissionToPublish } from 'enums/app';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import {
  AuthorisationFilter,
  ClerkTranslator,
  ClerkTranslatorFilter,
} from 'interfaces/clerkTranslator';

export const clerkTranslatorsSelector = (state: RootState) =>
  state.clerkTranslator;

export const selectFilteredClerkTranslators = createSelector(
  (state: RootState) => state.clerkTranslator.translators,
  (state: RootState) => state.clerkTranslator.filters,
  (translators, filters) => {
    let filteredTranslators = translators;

    if (filters.name) {
      const nameFilter = filters.name;
      filteredTranslators = filteredTranslators.filter((t) =>
        translatorNameMatchesName(t, nameFilter)
      );
    }

    if (filters.hasNoEmailAddress) {
      filteredTranslators = filteredTranslators.filter((t) => !t.email);
    }

    return filteredTranslators.filter((t) =>
      hasAuthorisationsMatchingFilters(t, filters)
    );
  }
);

export const selectFilteredSelectedIds = createSelector(
  selectFilteredClerkTranslators,
  (state: RootState) => state.clerkTranslator.selectedTranslators,
  (filteredTranslators, selectedTranslators) => {
    const filteredIds = new Set(filteredTranslators.map((t) => t.id));

    return selectedTranslators.filter((id) => filteredIds.has(id));
  }
);

export const selectFilteredSelectedTranslators = createSelector(
  selectFilteredClerkTranslators,
  selectFilteredSelectedIds,
  (filtered, selectedIds) => {
    const ids = new Set(selectedIds);

    return filtered.filter(({ id }) => ids.has(id));
  }
);

// Translator level predicates

const translatorNameMatchesName = (
  { firstName, lastName }: ClerkTranslator,
  name: string
) => {
  const nameCombs = [`${firstName} ${lastName}`, `${lastName} ${firstName}`];

  return nameCombs.some((comb) =>
    comb.toLowerCase().includes(name.toLowerCase().trim())
  );
};

const hasAuthorisationsMatchingFilters = (
  { authorisations }: ClerkTranslator,
  filters: ClerkTranslatorFilter
) => {
  const matchesFilters = (authorisations: Array<Authorisation>) => {
    return authorisations.filter(
      (a) =>
        matchesFromLang(filters, a) &&
        matchesToLang(filters, a) &&
        matchesAuthorisationBasis(filters, a) &&
        matchesPermissionToPublish(filters, a)
    );
  };

  switch (filters.authorisationStatus) {
    case AuthorisationStatus.Effective:
      return matchesFilters(authorisations.effective).length > 0;
    case AuthorisationStatus.Expiring:
      return matchesFilters(authorisations.expiring).length > 0;
    case AuthorisationStatus.Expired:
      return matchesFilters(authorisations.expired).length > 0;
    case AuthorisationStatus.ExpiredDeduplicated:
      return matchesFilters(authorisations.expiredDeduplicated).length > 0;
    case AuthorisationStatus.FormerVir:
      return matchesFilters(authorisations.formerVir).length > 0;
  }
};

// Authorisation level predicates

const matchesFromLang = (
  { fromLang }: AuthorisationFilter,
  authorisation: Authorisation
) => (fromLang ? fromLang == authorisation.languagePair.from : true);

const matchesToLang = (
  { toLang }: AuthorisationFilter,
  authorisation: Authorisation
) => (toLang ? toLang == authorisation.languagePair.to : true);

const matchesAuthorisationBasis = (
  { authorisationBasis }: AuthorisationFilter,
  authorisation: Authorisation
) => (authorisationBasis ? authorisationBasis == authorisation.basis : true);

const matchesPermissionToPublish = (
  { permissionToPublish }: AuthorisationFilter,
  authorisation: Authorisation
) => {
  if (permissionToPublish) {
    const permission =
      permissionToPublish.toString() === PermissionToPublish.Yes;

    return authorisation.permissionToPublish === permission;
  }

  return true;
};
