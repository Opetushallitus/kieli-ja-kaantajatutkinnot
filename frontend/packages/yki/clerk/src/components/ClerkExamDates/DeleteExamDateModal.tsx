import { OphButton } from '@opetushallitus/oph-design-system';
import { Trans } from 'react-i18next';
import { CustomModal, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamDate } from 'interfaces/examDate';
import { H2, Text } from 'ophTheme/Text';
import {
  deleteExamDate,
  resetDeleteExamDateStatus,
} from 'redux/reducers/examDate';
import { examDateSelector } from 'redux/selectors/examDate';

type DeleteExamDateModalProps = {
  examDate: ExamDate | null;
  onClose: () => void;
};

export const DeleteExamDateModal = ({
  examDate,
  onClose,
}: DeleteExamDateModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates.deleteModal',
  });
  const dispatch = useAppDispatch();
  const { deleteStatus } = useAppSelector(examDateSelector);

  const isDeleting = deleteStatus === APIResponseStatus.InProgress;

  const handleClose = () => {
    dispatch(resetDeleteExamDateStatus());
    onClose();
  };

  const handleConfirm = () => {
    if (examDate) {
      dispatch(deleteExamDate(examDate.id));
    }
  };

  const formattedDate = examDate?.examDate.format('D.M.YYYY') ?? '';

  return (
    <CustomModal
      data-testid="delete-exam-date-modal"
      open={examDate !== null}
      onCloseModal={handleClose}
      aria-labelledby="delete-exam-date-modal-title"
      modalTitle={<H2>{t('title')}</H2>}
    >
      <div
        className="rows gapped-xl"
        style={{ width: '600px', maxWidth: '90vw' }}
      >
        <div>
          <Text>
            <Trans
              t={t}
              i18nKey="description"
              values={{ examDate: formattedDate }}
              components={{ bold: <strong /> }}
            />
          </Text>
        </div>
        <div className="columns gapped flex-end">
          <OphButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleClose}
          >
            {t('cancelButton')}
          </OphButton>
          <LoadingProgressIndicator isLoading={isDeleting}>
            <OphButton
              variant={Variant.Contained}
              color={Color.Primary}
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {t('confirmButton')}
            </OphButton>
          </LoadingProgressIndicator>
        </div>
      </div>
    </CustomModal>
  );
};
