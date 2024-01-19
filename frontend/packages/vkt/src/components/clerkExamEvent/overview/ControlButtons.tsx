import EditIcon from '@mui/icons-material/Edit';
import { FC } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { clerkExamEventOverviewSelector } from 'redux/selectors/clerkExamEventOverview';

interface ControlButtonsProps {
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  isViewMode: boolean;
  isValidExamEvent: boolean;
}

export const ControlButtons: FC<ControlButtonsProps> = ({
  onCancel,
  onEdit,
  onSave,
  isViewMode,
  isValidExamEvent,
}) => {
  const translateCommon = useCommonTranslation();
  const { examEventDetailsStatus } = useAppSelector(
    clerkExamEventOverviewSelector,
  );

  const isLoading = examEventDetailsStatus === APIResponseStatus.InProgress;

  if (isViewMode) {
    return (
      <CustomButton
        data-testid="clerk-exam-event-overview__exam-event-details__edit-button"
        variant={Variant.Contained}
        color={Color.Secondary}
        startIcon={<EditIcon />}
        onClick={onEdit}
      >
        {translateCommon('edit')}
      </CustomButton>
    );
  } else {
    return (
      <div className="columns gapped">
        <CustomButton
          data-testid="clerk-exam-event-overview__exam-event-details__cancel-button"
          variant={Variant.Text}
          color={Color.Secondary}
          onClick={onCancel}
          disabled={isLoading}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="clerk-exam-event-overview__exam-event-details__save-button"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={onSave}
            disabled={isLoading || !isValidExamEvent}
          >
            {translateCommon('save')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    );
  }
};
