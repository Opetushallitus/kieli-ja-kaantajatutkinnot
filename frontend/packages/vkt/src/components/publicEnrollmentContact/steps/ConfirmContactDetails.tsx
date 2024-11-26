import { ArrowForwardOutlined as ArrowForwardIcon } from '@mui/icons-material';
import { CustomButton, H2, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import {
  confirmContactDetails,
  rejectPreviousContactDetails,
} from 'redux/reducers/publicEnrollmentContact';

export const ConfirmContactDetails = ({
  enrollment,
}: {
  enrollment: PublicEnrollmentContact;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'vkt.component.publicEnrollmentContact.steps.confirmContactDetails',
  });
  const dispatch = useAppDispatch();
  const onConfirm = () => {
    dispatch(confirmContactDetails());
  };
  const onReject = () => {
    dispatch(rejectPreviousContactDetails());
  };

  return (
    <div className="rows gapped">
      <H2>{t('heading')}</H2>
      <Text>{t('information')}</Text>
      <div className="columns space-between">
        <Text>
          <b>{t('labels.firstName')}</b>
          <br />
          {enrollment.firstName}
        </Text>
        <Text>
          <b>{t('labels.lastName')}</b>
          <br />
          {enrollment.lastName}
        </Text>
        <Text>
          <b>{t('labels.email')}</b>
          <br />
          {enrollment.email}
        </Text>
        <Text>
          <b>{t('labels.phoneNumber')}</b>
          <br />
          {enrollment.phoneNumber}
        </Text>
      </div>
      <Text>
        <b>{t('prompt')}</b>
      </Text>
      <div className="columns gapped-xxl">
        <CustomButton
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onReject}
        >
          {t('buttons.no')}
        </CustomButton>
        <CustomButton
          endIcon={<ArrowForwardIcon />}
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onConfirm}
        >
          {t('buttons.yes')}
        </CustomButton>
      </div>
    </div>
  );
};
