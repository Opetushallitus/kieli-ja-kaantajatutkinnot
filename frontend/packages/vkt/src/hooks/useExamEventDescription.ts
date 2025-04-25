import { DateUtils } from 'shared/utils';

import {
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';

export const useExamEventDescription = () => {
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const describeExamEvent = ({
    language,
    date,
    examTime,
    municipality,
  }: ExaminerExamEvent) => {
    const dateStr = DateUtils.formatOptionalDate(date);

    return [
      translateCommon(`examLanguage.${language}`),
      examTime ? `${dateStr} ${examTime}` : dateStr,
      translateMunicipality(municipality.code),
    ].join(', ');
  };

  return describeExamEvent;
};
