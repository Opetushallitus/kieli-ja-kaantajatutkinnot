import { createContext, ReactNode, useState } from 'react';

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

  const handleDialogShow = (toast: Dialog) => setDialog(toast);
  const handleDialogRemove = () => setDialog(undefined);

  const handleToastShow = (toast: Toast) => setToast(toast);
  const handleToastRemove = () => setToast(undefined);

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
