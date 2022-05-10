import { useEffect } from 'react';
import { Severity, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { useCallbackPrompt } from 'hooks/navigation/useCallbackPrompt';
import { showNotifierDialog } from 'redux/actions/notifier';
import { NotifierUtils } from 'utils/notifier';

export const useNavigationProtection = (when: boolean) => {
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();

  const { showPrompt, confirmNavigation, cancelNavigation } =
    useCallbackPrompt(when);

  useEffect(() => {
    if (showPrompt) {
      const confirmNavigationDialog = NotifierUtils.createNotifierDialog(
        translateCommon('navigationProtection.header'),
        Severity.Info,
        translateCommon('navigationProtection.description'),
        [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
            action: cancelNavigation,
          },
          {
            title: translateCommon('yes'),
            variant: Variant.Contained,
            action: confirmNavigation,
          },
        ],
        undefined,
        cancelNavigation
      );
      dispatch(showNotifierDialog(confirmNavigationDialog));
    }
  }, [
    showPrompt,
    confirmNavigation,
    cancelNavigation,
    translateCommon,
    dispatch,
  ]);
};
