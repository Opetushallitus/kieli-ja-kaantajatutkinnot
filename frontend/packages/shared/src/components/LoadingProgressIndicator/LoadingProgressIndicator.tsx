import { FC, PropsWithChildren, useRef, useEffect } from 'react';

import { CustomCircularProgress } from '../CustomCircularProgress/CustomCircularProgress';
import './LoadingProgressIndicator.scss';

const usePreviousValue = (value: boolean) => {
  const ref = useRef<boolean>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

interface LoadingProgressIndicatorProps {
  isLoading: boolean;
  displayBlock?: boolean;
  translateCommon?: (t: string) => string
}

export const LoadingProgressIndicator: FC<
  PropsWithChildren<LoadingProgressIndicatorProps>
> = ({ isLoading, displayBlock, translateCommon, children }) => {
  const classSuffix = displayBlock ? '__block' : '__inline-flex';
  const prevIsLoading = usePreviousValue(isLoading);

  return (
    <div className={`loading-progress-indicator${classSuffix}`}>
      <div className={`loading-progress-indicator__container${classSuffix}`}>
        {children}
        <div className="loading-progress-indicator__container__spinner-box">
          {isLoading && (
            <CustomCircularProgress
              title={translateCommon && translateCommon('loadingContent')}
              aria-live="assertive"
              size={'3rem'}
              color={'secondary'}
            />
          )}
          {prevIsLoading && !isLoading && (
            <span title={translateCommon && translateCommon('loadingDone')} aria-live="assertive" />
          )}
        </div>
      </div>
    </div>
  );
};
