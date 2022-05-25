import { createSelector } from 'reselect';
import { StringUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import { PermissionToPublish } from 'enums/interpreter';
import {
  ClerkInterpreter,
  ClerkInterpreterFilters,
} from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';

export const clerkInterpretersSelector = (state: RootState) =>
  state.clerkInterpreter;

export const selectFilteredClerkInterpreters = createSelector(
  (state: RootState) => state.clerkInterpreter.interpreters,
  (state: RootState) => state.clerkInterpreter.filters,
  (interpreters, filters) => {
    let filtered = interpreters;

    const isNotBlank = (val?: string) =>
      StringUtils.isString(val) && !StringUtils.isBlankString(val);

    if (isNotBlank(filters.name)) {
      filtered = filtered.filter((interpreter) =>
        filterByName(interpreter, filters.name as string)
      );
    }

    filtered = filtered.filter((interpreter) =>
      filterByQualificationCriteria(interpreter, filters)
    );

    return filtered;
  }
);

const filterByQualificationCriteria = (
  { qualifications }: ClerkInterpreter,
  filters: ClerkInterpreterFilters
) => {
  return qualifications.find(
    (q) =>
      matchesLanguageFilters(filters, q) &&
      matchesExaminationType(filters, q) &&
      matchesPermissionToPublish(filters, q)
  );
};

// Qualification matchers

const matchesExaminationType = (
  { examinationType }: ClerkInterpreterFilters,
  qualification: Qualification
) =>
  examinationType ? examinationType == qualification.examinationType : true;

const matchesPermissionToPublish = (
  { permissionToPublish }: ClerkInterpreterFilters,
  qualification: Qualification
) => {
  if (!permissionToPublish) {
    return true;
  }

  return (
    (permissionToPublish == PermissionToPublish.No) !==
    qualification.permissionToPublish
  );
};

// Qualifications are bidirectional. A "from"/"to" filter
// should match either language of a qualification.

const matchesLanguageFilters = (
  { fromLang, toLang }: ClerkInterpreterFilters,
  qualification: Qualification
) => {
  return (
    (matchesLang(fromLang, qualification.fromLang) &&
      matchesLang(toLang, qualification.toLang)) ||
    (matchesLang(toLang, qualification.fromLang) &&
      matchesLang(fromLang, qualification.toLang))
  );
};

// Helpers

const trimAndLowerCase = (val: string) => val.trim().toLowerCase();

const filterByName = (interpreter: ClerkInterpreter, name: string) => {
  const { firstName, lastName } = interpreter;
  const nameCombs = [
    `${firstName} ${lastName}`,
    `${lastName} ${firstName}`,
  ].map(trimAndLowerCase);

  return nameCombs.some((comb) => comb.includes(trimAndLowerCase(name)));
};

const matchesLang = (
  filterLang: string | undefined,
  qualificationLang: string
) => (filterLang ? filterLang == qualificationLang : true);
