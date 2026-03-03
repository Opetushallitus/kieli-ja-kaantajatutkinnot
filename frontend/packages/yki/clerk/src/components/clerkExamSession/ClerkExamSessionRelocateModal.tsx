import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphRadioGroupFormField,
} from '@opetushallitus/oph-design-system';
import { useEffect, useState } from 'react';
import { CustomModal } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2, Text } from 'ophTheme/Text';
import {
  loadRelocateExamSessions,
  relocateRegistration,
  resetRelocate,
} from 'redux/reducers/clerkExamSession';
import { clerkExamSessionDetailsSelector } from 'redux/selectors/clerkExamSessionDetailsSelector';

type ClerkExamSessionRelocateModalProps = {
  registrationId: number | null;
  onClose: () => void;
  examSessionId: number;
  language: string;
  level: string;
};

export const ClerkExamSessionRelocateModal = ({
  registrationId,
  onClose,
  examSessionId,
  language,
  level,
}: ClerkExamSessionRelocateModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.modals',
  });
  const { t: tActions } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { relocateExamSessions, relocateExamSessionsStatus, relocateStatus } =
    useAppSelector(clerkExamSessionDetailsSelector);

  const [selectedTargetExamSessionId, setSelectedTargetExamSessionId] =
    useState<string>('');

  useEffect(() => {
    if (registrationId !== null) {
      dispatch(loadRelocateExamSessions({ language, level }));
    } else {
      dispatch(resetRelocate());
      setSelectedTargetExamSessionId('');
    }
  }, [registrationId, dispatch, language, level]);

  useEffect(() => {
    if (relocateStatus === APIResponseStatus.Success) {
      onClose();
    }
  }, [relocateStatus, onClose]);

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
          <H2>{t('relocate.title')}</H2>
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
        <Text className="margin-top">{t('relocate.subTitle')}</Text>
        {relocateExamSessionsStatus === APIResponseStatus.Success && (
          <OphRadioGroupFormField
            label={t('relocate.selectExamSession')}
            value={selectedTargetExamSessionId}
            onChange={(e) =>
              setSelectedTargetExamSessionId(
                (e.target as HTMLInputElement).value,
              )
            }
            options={relocateExamSessions
              .filter((es) => es.id !== examSessionId)
              .map((es) => ({
                value: String(es.id),
                label: `${es.date} — ${translateCommon(
                  'languages.' + es.language,
                )} - ${translateCommon('languageLevel.' + es.level)}`,
              }))}
          />
        )}
        <div className="columns gapped flex-end">
          <OphButton variant={Variant.Outlined} onClick={onClose}>
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            disabled={
              !selectedTargetExamSessionId ||
              relocateStatus === APIResponseStatus.InProgress
            }
            onClick={() => {
              if (registrationId && selectedTargetExamSessionId) {
                dispatch(
                  relocateRegistration({
                    registrationId,
                    targetExamSessionId: Number(selectedTargetExamSessionId),
                    currentExamSessionId: examSessionId,
                  }),
                );
              }
            }}
          >
            {tActions('values.actions.relocate')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
