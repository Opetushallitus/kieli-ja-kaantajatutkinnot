import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

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
        <Text className="bold">{t('partialExams.label')}</Text>
        <Text>
          {ExamSessionUtils.getPartialExamTypeText(
            registration.type,
            registration.partialExamType,
          )}
        </Text>
      </div>
      <div>
        <Text className="bold">{translateCommon('examDate')}</Text>
        <Text>{DateUtils.formatOptionalDate(registration.examDate, 'l')}</Text>
      </div>
      {registration.type !== 'FULL' && (
        <div>
          <Text className="bold">
            {translateCommon('partialExamTimeLabel')}
          </Text>
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
          <Text className="bold">{translateCommon('registrationPeriod')}</Text>
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
        <Text className="bold">{translateCommon('institution')}</Text>
        <Text>
          {location?.street_address}, {location?.post_office}
        </Text>
      </div>
    </>
  );
};
