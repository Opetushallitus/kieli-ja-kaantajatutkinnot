import dayjs, { Dayjs } from 'dayjs';
import { createSelector } from 'reselect';
import { StringUtils } from 'shared/utils';

import { RootState } from 'configs/redux';
import { QualificationStatus } from 'enums/clerkInterpreter';
import { PermissionToPublish } from 'enums/interpreter';
import {
  ClerkInterpreter,
  ClerkInterpreterFilters,
} from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { QualificationUtils } from 'utils/qualifications';

export const clerkInterpretersSelector = (state: RootState) =>
  state.clerkInterpreter;

export const selectClerkInterpretersByQualificationStatus = createSelector(
  (state: RootState) => state.clerkInterpreter.interpreters,
  (interpreters) => {
    const currentDate = dayjs();
    const [effective, expired, expiring] = Object.values(
      QualificationStatus
    ).map((qualificationStatus) =>
      interpreters.filter(({ qualifications }) =>
        qualifications.find((qualification) =>
          matchesQualificationStatus(
            { qualificationStatus },
            qualification,
            currentDate
          )
        )
      )
    );

    return { effective, expiring, expired };
  }
);

export const selectFilteredClerkInterpreters = createSelector(
  (state: RootState) => state.clerkInterpreter.interpreters,
  (state: RootState) => state.clerkInterpreter.filters,
  (interpreters, filters) => {
    let filtered = interpreters;

    if (StringUtils.isNonBlankString(filters.name)) {
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
  const currentDate = dayjs();

  return qualifications.find(
    (q) =>
      matchesLanguageFilters(filters, q) &&
      matchesExaminationType(filters, q) &&
      matchesPermissionToPublish(filters, q) &&
      matchesQualificationStatus(filters, q, currentDate)
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

const matchesQualificationStatus = (
  { qualificationStatus }: ClerkInterpreterFilters,
  qualification: Qualification,
  currentDate: Dayjs
) => {
  switch (qualificationStatus) {
    case QualificationStatus.Effective:
      return QualificationUtils.isQualificationEffective(
        qualification,
        currentDate
      );
    case QualificationStatus.Expiring:
      return QualificationUtils.isQualificationExpiring(
        qualification,
        currentDate
      );
    case QualificationStatus.Expired:
      return QualificationUtils.isQualificationExpired(
        qualification,
        currentDate
      );
  }
};

// Helpers

const filterByName = (interpreter: ClerkInterpreter, name: string) => {
  const nameCombs = [
    `${interpreter.nickName} ${interpreter.lastName}`,
    `${interpreter.lastName} ${interpreter.nickName}`,
  ];

  return nameCombs.some((comb) =>
    comb.toLowerCase().includes(name.toLowerCase().trim())
  );
};

const matchesLang = (
  filterLang: string | undefined,
  qualificationLang: string
) => (filterLang ? filterLang == qualificationLang : true);
