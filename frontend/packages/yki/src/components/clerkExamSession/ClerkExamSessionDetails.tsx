import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { APIResponseStatus } from 'shared/enums';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { Label } from 'ophTheme/Text';
import { loadNationalities } from 'redux/reducers/nationalities';
import { nationalitiesSelector } from 'redux/selectors/nationalities';

export const ClerkExamSessionDetails = ({
  examSessionDetails,
}: {
  examSessionDetails: ClerkExamSessionDetails | undefined;
}) => {
  const dispatch = useDispatch();
  const appLanguage = getCurrentLang();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });
  const { nationalities, status } = useAppSelector(nationalitiesSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadNationalities());
    }
  }, [dispatch, status]);

  if (!person) return <></>;

  return (
    <div className="rows gapped customer-details">
      <div className="columns gapped-xxl align-items-start">
        <div className="rows gapped-xs">
          <Label>{t('details.fields.ssn')}</Label>
          <Label>{t('details.fields.oid')}</Label>
          <Label>{t('details.fields.nationality')}</Label>
          <Label>{t('details.fields.phoneNumber')}</Label>
          <Label>{t('details.fields.streetAddress')}</Label>
          <Label>{t('details.fields.email')}</Label>
        </div>
        <div className="rows gapped-xs">
          <div>{person.ssn}</div>
          <div>{person.oid}</div>
          <div>
            {
              nationalities.find(
                ({ code, language }) =>
                  code == person.nationalityCode && language == appLanguage,
              )?.name
            }
          </div>
          <div>{person.phoneNumber}</div>
          <div>{person.streetAddress}</div>
          <div>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </div>
        </div>
      </div>
    </div>
  );
};
