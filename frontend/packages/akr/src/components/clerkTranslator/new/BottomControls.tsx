import { useEffect } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  resetNewClerkTranslatorDetails,
  resetNewClerkTranslatorRequestStatus,
  saveNewClerkTranslator,
} from 'redux/actions/clerkNewTranslator';
import { clerkNewTranslatorSelector } from 'redux/selectors/clerkNewTranslator';

export const BottomControls = () => {
  // i18n
  const translateCommon = useCommonTranslation();

  // Redux
  const { status, translator } = useAppSelector(clerkNewTranslatorSelector);
  const dispatch = useAppDispatch();

  const isLoading = status === APIResponseStatus.InProgress;

  useEffect(() => {
    return () => {
      dispatch(resetNewClerkTranslatorDetails);
      dispatch(resetNewClerkTranslatorRequestStatus);
    };
  }, [dispatch]);

  // Action handlers
  const onSave = () => {
    dispatch(saveNewClerkTranslator(translator));
  };

  const isSaveButtonDisabled = () => {
    if (
      isLoading ||
      !translator.firstName ||
      !translator.lastName ||
      translator.authorisations.length < 1
    ) {
      return true;
    }

    return false;
  };

  return (
    <div className="columns gapped flex-end">
      <LoadingProgressIndicator isLoading={isLoading}>
        <CustomButton
          data-testid="clerk-new-translator-page__save-button"
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
