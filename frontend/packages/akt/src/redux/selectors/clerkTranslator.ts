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
        filterByAuthorisationStatus(
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
      filtered = filtered.filter((t) => filterByName(t, nameFilter));
    }

    filtered = filtered.filter((t) =>
      filterByAuthorisationCriteria(t, filters, currentDate, expiringSoonDate)
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

// Helpers
const filterByAuthorisationStatus = (
  translator: ClerkTranslator,
  status: AuthorisationStatus,
  currentDate: Dayjs,
  expiringSoonDate: Dayjs
) => {
  return translator.authorisations.find((a) =>
    matchesAuthorisationStatus(
      { authorisationStatus: status },
      currentDate,
      expiringSoonDate,
      a
    )
  );
};

const filterByAuthorisationCriteria = (
  translator: ClerkTranslator,
  filters: ClerkTranslatorFilter,
  currentDate: Dayjs,
  expiringSoonDate: Dayjs
) => {
  return translator.authorisations.find(
    (a) =>
      matchesFromLang(filters, a) &&
      matchesToLang(filters, a) &&
      matchesAuthorisationBasis(filters, a) &&
      matchesPermissionToPublish(filters, a) &&
      matchesAuthorisationStatus(filters, currentDate, expiringSoonDate, a)
  );
};

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

const trimAndLowerCase = (val: string) => val.trim().toLowerCase();

const filterByName = (translator: ClerkTranslator, name: string) => {
  const { firstName, lastName } = translator;
  const nameCombs = [
    `${firstName} ${lastName}`,
    `${lastName} ${firstName}`,
  ].map(trimAndLowerCase);

  return nameCombs.some((comb) => comb.includes(trimAndLowerCase(name)));
};
