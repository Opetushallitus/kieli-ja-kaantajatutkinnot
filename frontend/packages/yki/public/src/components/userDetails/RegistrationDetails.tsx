import { DateUtils } from 'shared/utils';

import { Label, Text } from 'components/Text';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { RegistrationKind } from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';
import { ExamSessionUtils } from 'utils/examSession';

export const RegistrationDetails = ({
  registration,
}: {
  registration: PersonRegistrations;
}) => {
  const lang = getCurrentLang();
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations',
  });
  const location = ExamSessionUtils.getLocationInfo(registration, lang);

  return (
    <>
      <div>
        <Label>{t('partialExams.label')}</Label>
        <Text>
          {ExamSessionUtils.getPartialExamTypeText(
            registration.type,
            registration.partialExamType,
          )}
        </Text>
      </div>
      <div>
        <Label>{translateCommon('examDate')}</Label>
        <Text>{DateUtils.formatOptionalDate(registration.examDate, 'l')}</Text>
      </div>
      {registration.type !== 'FULL' && (
        <div>
          <Label>{translateCommon('partialExamTimeLabel')}</Label>
          <Text>
            {translateCommon('partialExamTime', {
              startTime:
                ExamSessionUtils.getStartTimeForPersonRegistrations(
                  registration,
                ),
            })}
          </Text>
        </div>
      )}
      {registration.kind === RegistrationKind.Queue && (
        <div>
          <Label>{translateCommon('registrationPeriod')}</Label>
          <Text>
            {DateUtils.formatOptionalDate(
              registration.registrationStartDate,
              'l',
            )}{' '}
            —{' '}
            {DateUtils.formatOptionalDate(
              registration.registrationEndDate,
              'l',
            )}
          </Text>
        </div>
      )}
      <div>
        <Label>{translateCommon('institution')}</Label>
        <Text>
          {location?.street_address}, {location?.post_office}
        </Text>
      </div>
    </>
  );
};
