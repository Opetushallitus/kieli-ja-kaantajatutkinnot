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
  examSessionDetails: ClerkExamSession | null;
}) => {
  const dispatch = useDispatch();
  const appLanguage = getCurrentLang();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });

  if (!examSessionDetails) {
    return <></>;
  }

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
          <div>{examSessionDetails.level}</div>
          <div>{examSessionDetails.language}</div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};
