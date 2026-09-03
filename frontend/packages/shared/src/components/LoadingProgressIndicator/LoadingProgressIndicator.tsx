import { visuallyHidden } from '@mui/utils';
import { FC, PropsWithChildren } from 'react';

import { Color } from '../../enums';
import { CustomCircularProgress } from '../CustomCircularProgress/CustomCircularProgress';

import './LoadingProgressIndicator.scss';

interface LoadingProgressIndicatorProps {
  isLoading: boolean;
  displayBlock?: boolean;
  translateCommon?: (t: string) => string;
}

export const LoadingProgressIndicator: FC<
  PropsWithChildren<LoadingProgressIndicatorProps>
> = ({ isLoading, displayBlock, translateCommon, children }) => {
  const classSuffix = displayBlock ? '__block' : '__inline-flex';

  return (
    <div
      className={`loading-progress-indicator${classSuffix}`}
      aria-busy={isLoading}
    >
      <div className={`loading-progress-indicator__container${classSuffix}`}>
        {children}

        <div className="loading-progress-indicator__container__spinner-box">
          {isLoading && (
            <CustomCircularProgress
              title={translateCommon?.('loadingContent')}
              size="3rem"
              color={Color.Secondary}
            />
          )}

          <span role="status" style={visuallyHidden}>
            {isLoading
              ? translateCommon?.('loadingContent')
              : translateCommon?.('loadingDone')}
          </span>
        </div>
      </div>
    </div>
  );
};
