import { FC, PropsWithChildren } from 'react';

import { CustomCircularProgress } from '../CustomCircularProgress/CustomCircularProgress';
import './LoadingProgressIndicator.scss';

interface LoadingProgressIndicatorProps {
  isLoading: boolean;
}

export const LoadingProgressIndicator: FC<
  PropsWithChildren<LoadingProgressIndicatorProps>
> = ({ isLoading, children }) => {
  return (
    <div className="loading-progress-indicator">
      <div className="loading-progress-indicator__container">
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
