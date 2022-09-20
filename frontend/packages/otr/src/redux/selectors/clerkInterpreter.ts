import { createSelector } from 'reselect';
import { StringUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { PermissionToPublish } from 'enums/interpreter';
import {
  ClerkInterpreter,
  ClerkInterpreterFilters,
  QualificationFilter,
} from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { QualificationUtils } from 'utils/qualifications';

export const clerkInterpretersSelector = (state: RootState) =>
  state.clerkInterpreter;

export const selectFilteredClerkInterpreters = createSelector(
  (state: RootState) => state.clerkInterpreter.interpreters,
  (state: RootState) => state.clerkInterpreter.filters,
  (interpreters, filters) => {
    let filteredInterpreters = interpreters;

    if (StringUtils.isNonBlankString(filters.name)) {
      filteredInterpreters = filteredInterpreters.filter((interpreter) =>
        interpreterNameMatchesName(interpreter, filters.name as string)
      );
    }

    return filteredInterpreters.filter((interpreter) =>
      hasQualificationsMatchingFilters(interpreter, filters)
    );
  }
);

// Interpreter level predicates

const interpreterNameMatchesName = (
  { lastName, nickName }: ClerkInterpreter,
  name: string
) => {
  const nameCombs = [`${nickName} ${lastName}`, `${lastName} ${nickName}`];

  return nameCombs.some((comb) =>
    comb.toLowerCase().includes(name.toLowerCase().trim())
  );
};

const hasQualificationsMatchingFilters = (
  { qualifications }: ClerkInterpreter,
  filters: ClerkInterpreterFilters
) => {
  const matchesFilters = (qualifications: Array<Qualification>) => {
    return qualifications.filter(
      (q) =>
        matchesLangFilters(filters, q) &&
        matchesExaminationType(filters, q) &&
        matchesPermissionToPublish(filters, q)
    );
  };

  switch (filters.qualificationStatus) {
    case QualificationStatus.Effective:
      return matchesFilters(qualifications.effective).length > 0;
    case QualificationStatus.Expiring:
      return matchesFilters(qualifications.expiring).length > 0;
    case QualificationStatus.Expired:
      return matchesFilters(qualifications.expired).length > 0;
    case QualificationStatus.ExpiredDeduplicated:
      return matchesFilters(qualifications.expiredDeduplicated).length > 0;
  }
};

// Qualification level predicates

const matchesLangFilters = (
  { fromLang, toLang }: QualificationFilter,
  qualification: Qualification
) =>
  QualificationUtils.languagePairMatchesLangFilters(
    {
      from: qualification.fromLang,
      to: qualification.toLang,
    },
    fromLang,
    toLang
  );

const matchesExaminationType = (
  { examinationType }: QualificationFilter,
  qualification: Qualification
) =>
  examinationType ? examinationType == qualification.examinationType : true;

const matchesPermissionToPublish = (
  { permissionToPublish }: QualificationFilter,
  qualification: Qualification
) => {
  if (!permissionToPublish) {
    return true;
  }

  switch (permissionToPublish) {
    case PermissionToPublish.Yes:
      return qualification.permissionToPublish;
    case PermissionToPublish.No:
      return !qualification.permissionToPublish;
  }
};
