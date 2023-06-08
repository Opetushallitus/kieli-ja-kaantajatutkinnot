import { FC, PropsWithChildren, useRef, useEffect } from 'react';

import { CustomCircularProgress } from '../CustomCircularProgress/CustomCircularProgress';
import './LoadingProgressIndicator.scss';
import { useCommonTranslation } from 'configs/i18n';

const usePreviousValue = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

interface LoadingProgressIndicatorProps {
  isLoading: boolean;
  displayBlock?: boolean;
}

export const LoadingProgressIndicator: FC<
  PropsWithChildren<LoadingProgressIndicatorProps>
> = ({ isLoading, displayBlock, children }) => {
  const classSuffix = displayBlock ? '__block' : '__inline-flex';
  const prevIsLoading = usePreviousValue(isLoading);
  const translateCommon = useCommonTranslation();

  return (
    <div className={`loading-progress-indicator${classSuffix}`}>
      <div className={`loading-progress-indicator__container${classSuffix}`}>
        {children}
        <div className="loading-progress-indicator__container__spinner-box">
          {isLoading && (
            <CustomCircularProgress
              title={translateCommon('loadingContent')}
              aria-live="assertive"
              size={'3rem'}
              color={'secondary'}
            />
          )}
          {prevIsLoading && !isLoading && (
            <span title={translateCommon('loadingDone')} aria-live="assertive" />
          )}
        </div>
      </div>
    </div>
  );
};
