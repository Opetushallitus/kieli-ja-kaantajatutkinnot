import { useCallback } from 'react';
import { Severity, Variant } from 'shared/enums';
import {
  useNavigationProtection as useCommonNavigationProtection,
  useDialog,
} from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { cancelRegistration } from 'redux/reducers/registration';

export const useRegistrationNavigationProtection = (when: boolean) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage.abortDialog',
  });
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();

  const showConfirmationDialog = useCallback(
    (confirmNavigation: () => void, cancelNavigation: () => void) => {
      showDialog({
        title: t('title'),
        severity: Severity.Info,
        description: t('description'),
        actions: [
          {
            title: t('actions.confirm'),
            variant: Variant.Outlined,
            action: () => {
              dispatch(cancelRegistration());
              confirmNavigation();
            },
          },
          {
            title: t('actions.cancel'),
            variant: Variant.Contained,
            action: cancelNavigation,
          },
        ],
        onClose: cancelNavigation,
      });
    },
    [dispatch, showDialog, t]
  );

  useCommonNavigationProtection(when, showConfirmationDialog);
};

export const useNavigationProtection = (when: boolean) => {
  const translateCommon = useCommonTranslation();
  const { showDialog } = useDialog();

  const showConfirmationDialog = useCallback(
    (confirmNavigation: () => void, cancelNavigation: () => void) => {
      showDialog({
        title: translateCommon('navigationProtection.header'),
        severity: Severity.Info,
        description: translateCommon('navigationProtection.description'),
        actions: [
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
        onClose: cancelNavigation,
      });
    },
    [showDialog, translateCommon]
  );

  useCommonNavigationProtection(when, showConfirmationDialog);
};
