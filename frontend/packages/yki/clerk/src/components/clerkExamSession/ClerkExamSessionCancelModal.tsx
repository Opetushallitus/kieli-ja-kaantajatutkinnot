import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useEffect } from 'react';
import { CustomModal } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RouteType } from 'interfaces/user';
import { H2, Text } from 'ophTheme/Text';
import {
  cancelOrganizerRegistration,
  cancelRegistration,
  resetCancel,
} from 'redux/reducers/clerkExamSession';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

type ClerkExamSessionCancelModalProps = {
  registrationId: number | null;
  onClose: () => void;
  examSessionId: number;
  route: RouteType;
  organizerOid: string;
};

export const ClerkExamSessionCancelModal = ({
  registrationId,
  onClose,
  examSessionId,
  route,
  organizerOid,
}: ClerkExamSessionCancelModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.modals',
  });
  const { t: tActions } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { cancelStatus } = useAppSelector(clerkExamSessionDetailsSelector);

  useEffect(() => {
    if (cancelStatus === APIResponseStatus.Success) {
      onClose();
    }
  }, [cancelStatus, onClose]);

  useEffect(() => {
    if (registrationId === null) {
      dispatch(resetCancel());
    }
  }, [registrationId, dispatch]);

  return (
    <CustomModal
      open={registrationId !== null}
      onCloseModal={onClose}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('cancel.title')}</H2>
          <CloseIcon
            color={Color.Inherit}
            aria-hidden={true}
            fontSize="large"
            onClick={onClose}
          />
        </Box>
      }
    >
      <div className="rows gapped">
        <Text className="margin-top">{t('cancel.subTitle')}</Text>
        <div className="columns gapped flex-end">
          <OphButton variant={Variant.Outlined} onClick={onClose}>
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            disabled={cancelStatus === APIResponseStatus.InProgress}
            onClick={() => {
              if (registrationId) {
                dispatch(
                  route === 'clerk'
                    ? cancelRegistration({
                        registrationId,
                        currentExamSessionId: examSessionId,
                      })
                    : cancelOrganizerRegistration({
                        registrationId,
                        currentExamSessionId: examSessionId,
                        organizerOid,
                      }),
                );
              }
            }}
          >
            {tActions('values.actions.cancel')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
