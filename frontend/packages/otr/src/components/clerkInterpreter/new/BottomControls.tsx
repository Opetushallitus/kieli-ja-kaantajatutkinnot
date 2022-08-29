import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { ClerkNewInterpreter } from 'interfaces/clerkNewInterpreter';
import { saveClerkNewInterpreter } from 'redux/reducers/clerkNewInterpreter';

export const BottomControls = ({
  interpreter,
  status,
}: {
  interpreter: ClerkNewInterpreter;
  status: APIResponseStatus;
}) => {
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const isLoading = status === APIResponseStatus.InProgress;

  const onSave = () => {
    dispatch(saveClerkNewInterpreter(interpreter));
  };

  const isSaveButtonDisabled = () => {
    return (
      isLoading ||
      !interpreter.lastName ||
      !interpreter.firstName ||
      !interpreter.nickName ||
      !interpreter.email ||
      interpreter.qualifications.length < 1
    );
  };

  return (
    <div className="columns gapped flex-end">
      <LoadingProgressIndicator isLoading={isLoading}>
        <CustomButton
          data-testid="clerk-new-interpreter-page__save-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onSave}
          disabled={isSaveButtonDisabled()}
        >
          {translateCommon('save')}
        </CustomButton>
      </LoadingProgressIndicator>
    </div>
  );
};
