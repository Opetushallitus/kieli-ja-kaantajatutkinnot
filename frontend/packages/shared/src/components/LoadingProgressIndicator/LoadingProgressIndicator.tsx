import { FC, PropsWithChildren } from 'react';

import { CustomCircularProgress } from '../CustomCircularProgress/CustomCircularProgress';
import './LoadingProgressIndicator.scss';

interface LoadingProgressIndicatorProps {
  isLoading: boolean;
  displayBlock?: boolean;
}

export const LoadingProgressIndicator: FC<
  PropsWithChildren<LoadingProgressIndicatorProps>
> = ({ isLoading, displayBlock, children }) => {
  const classSuffix = displayBlock ? '__block' : '__inline-flex';

  return (
    <div className={`loading-progress-indicator${classSuffix}`}>
      <div className={`loading-progress-indicator__container${classSuffix}`}>
        {children}
        <div className="loading-progress-indicator__container__spinner-box">
          {isLoading && (
            <CustomCircularProgress size={'3rem'} color={'secondary'} />
          )}
        </div>
      </div>
    </div>
  );
};
