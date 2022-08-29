import { createContext, ReactNode, useCallback, useState } from 'react';

import { Dialog, Toast } from '../../interfaces/notifier';

interface NotifierContextProviderProps {
  children?: ReactNode;
}

interface NotifierContextProps {
  toast: Toast | undefined;
  onToastShow: (toast: Toast) => void;
  onToastRemove: () => void;
  dialog: Dialog | undefined;
  onDialogShow: (toast: Dialog) => void;
  onDialogRemove: () => void;
}

export const NotifierContext = createContext<NotifierContextProps>(
  {} as NotifierContextProps
);

export const NotifierContextProvider = ({
  children,
}: NotifierContextProviderProps) => {
  const [toast, setToast] = useState<Toast | undefined>(undefined);
  const [dialog, setDialog] = useState<Dialog | undefined>(undefined);

  const handleDialogShow = useCallback((toast: Dialog) => setDialog(toast), []);
  const handleDialogRemove = useCallback(() => setDialog(undefined), []);

  const handleToastShow = useCallback((toast: Toast) => setToast(toast), []);
  const handleToastRemove = useCallback(() => setToast(undefined), []);

  return (
    <NotifierContext.Provider
      value={{
        toast,
        onToastShow: handleToastShow,
        onToastRemove: handleToastRemove,
        dialog,
        onDialogShow: handleDialogShow,
        onDialogRemove: handleDialogRemove,
      }}
    >
      {children}
    </NotifierContext.Provider>
  );
};
