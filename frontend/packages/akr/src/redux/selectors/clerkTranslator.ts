import dayjs, { Dayjs } from 'dayjs';
import { createSelector } from 'reselect';

import { RootState } from 'configs/redux';
import { PermissionToPublish } from 'enums/app';
import { AuthorisationStatus } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import {
  ClerkTranslator,
  ClerkTranslatorFilter,
} from 'interfaces/clerkTranslator';
import { AuthorisationUtils } from 'utils/authorisation';

export const clerkTranslatorsSelector = (state: RootState) =>
  state.clerkTranslator;

export const selectTranslatorsByAuthorisationStatus = createSelector(
  (state: RootState) => state.clerkTranslator.translators,
  (translators) => {
    // TODO Note that this has an *implicit* dependency on the current system time,
    // which we currently fail to take into account properly - the selectors should
    // somehow make the dependency on time explicit!
    const currentDate = dayjs();
    const expiringSoonDate =
      AuthorisationUtils.expiringSoonThreshold(currentDate);

    const [authorised, expiring, expired, formerVIR] = Object.values(
      AuthorisationStatus
    ).map((authorisationStatus) =>
      translators.filter((t) =>
        translatorMatchesAuthorisationStatus(
          t,
          authorisationStatus,
          currentDate,
          expiringSoonDate
        )
      )
    );

    return {
      authorised,
      expiring,
      expired,
      formerVIR,
    };
  }
);

export const selectFilteredClerkTranslators = createSelector(
  (state: RootState) => state.clerkTranslator.translators,
  (state: RootState) => state.clerkTranslator.filters,
  (translators, filters) => {
    const currentDate = dayjs();
    const expiringSoonDate =
      AuthorisationUtils.expiringSoonThreshold(currentDate);

    let filtered = translators;

    if (filters.name) {
      const nameFilter = filters.name;
      filtered = filtered.filter((t) => translatorMatchesName(t, nameFilter));
    }

    filtered = filtered.filter((t) =>
      translatorMatchesFilters(t, filters, currentDate, expiringSoonDate)
    );

    return filtered;
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

const translatorMatchesName = (translator: ClerkTranslator, name: string) => {
  const { firstName, lastName } = translator;
  const nameCombs = [
    `${firstName} ${lastName}`,
    `${lastName} ${firstName}`,
  ].map(trimAndLowerCase);

  return nameCombs.some((comb) => comb.includes(trimAndLowerCase(name)));
};

const translatorMatchesAuthorisationStatus = (
  translator: ClerkTranslator,
  status: AuthorisationStatus,
  currentDate: Dayjs,
  expiringSoonDate: Dayjs
) => {
  if (status === AuthorisationStatus.Expired) {
    // If selected AuthorisationStatus is Expired, we must search all expired authorisations to check
    // that there are no corresponding effective authorisations for the same language pair.
    return (
      filterAuthorisationsByStatus(
        translator.authorisations,
        status,
        currentDate,
        expiringSoonDate
      ).length > 0
    );
  } else {
    // Otherwise, we may short circuit the evaluation upon finding the first authorisation
    // matching the desired authorisation status.
    return translator.authorisations.find((a) =>
      matchesAuthorisationStatus(
        { authorisationStatus: status },
        currentDate,
        expiringSoonDate,
        a
      )
    );
  }
};

const translatorMatchesFilters = (
  translator: ClerkTranslator,
  filters: ClerkTranslatorFilter,
  currentDate: Dayjs,
  expiringSoonDate: Dayjs
) => {
  const candidates = filterAuthorisationsByStatus(
    translator.authorisations,
    filters.authorisationStatus,
    currentDate,
    expiringSoonDate
  );

  return candidates.find(
    (a) =>
      matchesFromLang(filters, a) &&
      matchesToLang(filters, a) &&
      matchesAuthorisationBasis(filters, a) &&
      matchesPermissionToPublish(filters, a) &&
      matchesAuthorisationStatus(filters, currentDate, expiringSoonDate, a)
  );
};

// Authorisation level predicates

const matchesFromLang = (
  { fromLang }: ClerkTranslatorFilter,
  authorisation: Authorisation
) => (fromLang ? fromLang == authorisation.languagePair.from : true);

const matchesToLang = (
  { toLang }: ClerkTranslatorFilter,
  authorisation: Authorisation
) => (toLang ? toLang == authorisation.languagePair.to : true);

const matchesAuthorisationBasis = (
  { authorisationBasis }: ClerkTranslatorFilter,
  authorisation: Authorisation
) => (authorisationBasis ? authorisationBasis == authorisation.basis : true);

const matchesPermissionToPublish = (
  { permissionToPublish }: ClerkTranslatorFilter,
  authorisation: Authorisation
) => {
  if (permissionToPublish) {
    const permission =
      permissionToPublish.toString() === PermissionToPublish.Yes;

    return authorisation.permissionToPublish === permission;
  }

  return true;
};

const matchesAuthorisationStatus = (
  { authorisationStatus }: ClerkTranslatorFilter,
  currentDate: Dayjs,
  expiringSoonThreshold: Dayjs,
  authorisation: Authorisation
) => {
  switch (authorisationStatus) {
    case AuthorisationStatus.Authorised:
      return AuthorisationUtils.isAuthorisationEffective(
        authorisation,
        currentDate
      );
    case AuthorisationStatus.Expiring:
      return AuthorisationUtils.isAuthorisationExpiring(
        authorisation,
        currentDate,
        expiringSoonThreshold
      );
    case AuthorisationStatus.Expired:
      return AuthorisationUtils.isAuthorisationExpired(
        authorisation,
        currentDate
      );
    case AuthorisationStatus.FormerVIR:
      return AuthorisationUtils.isAuthorisationForFormerVIR(authorisation);
  }
};

// Helpers

const filterAuthorisationsByStatus = (
  authorisations: Array<Authorisation>,
  status: AuthorisationStatus,
  currentDate: Dayjs,
  expiringSoonDate: Dayjs
) => {
  const candidates = authorisations.filter((a) =>
    matchesAuthorisationStatus(
      { authorisationStatus: status },
      currentDate,
      expiringSoonDate,
      a
    )
  );

  if (candidates.length > 0 && status === AuthorisationStatus.Expired) {
    // If a translator has an expired authorisation, we must also check that
    // they don't have an effective authorisation for the same language pair.
    const effectiveAuthorisations = authorisations.filter((a) =>
      matchesAuthorisationStatus(
        {
          authorisationStatus: AuthorisationStatus.Authorised,
        },
        currentDate,
        expiringSoonDate,
        a
      )
    );

    return candidates.filter(
      ({ languagePair: { from, to } }) =>
        !effectiveAuthorisations.find(
          ({ languagePair }) =>
            languagePair.from === from && languagePair.to === to
        )
    );
  } else {
    return candidates;
  }
};

const trimAndLowerCase = (val: string) => val.trim().toLowerCase();
