import { ReactNode, useCallback, useState } from 'react';
import { StackableMobileAppBar } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';
import { MobileAppBarState } from 'shared/interfaces';

import { MemoizedPublicRegistrationTimer } from 'features/registration/components/PublicRegistrationTimerv2';

export const RegistrationControls = ({
  submit,
  cancel,
  deadline,
}: {
  submit: ReactNode;
  cancel: ReactNode;
  deadline: string | null;
}) => {
  const { isPhone } = useWindowProperties();
  const [appBarState, setAppBarState] = useState<MobileAppBarState>({});
  const setState = useCallback(
    (order: number, height: number) =>
      setAppBarState((prev) => ({ ...prev, [order]: height })),
    [],
  );

  return isPhone ? (
    <>
      <StackableMobileAppBar order={1} state={appBarState} setState={setState}>
        <div className="rows" style={{ width: '100%' }}>
          {deadline && <MemoizedPublicRegistrationTimer deadline={deadline} />}
        </div>
      </StackableMobileAppBar>
      <StackableMobileAppBar order={2} state={appBarState} setState={setState}>
        <div className="rows" style={{ width: '100%' }}>
          <div className="columns margin-top-lg space-between">
            {cancel}
            {submit}
          </div>
        </div>
      </StackableMobileAppBar>
    </>
  ) : (
    <div className="columns margin-top-lg justify-content-center">
      <div className="rows flex-end gapped margin-top-lg align-items-center">
        {submit}
        {cancel}
      </div>
    </div>
  );
};
