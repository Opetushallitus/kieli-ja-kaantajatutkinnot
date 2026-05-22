import * as React from 'react';

type VirkailijaRaamitProps = {
  scriptUrl: string;
};

export const VirkailijaRaamit = ({ scriptUrl }: VirkailijaRaamitProps) => {
  React.useEffect(() => {
    const showRaamit = !!scriptUrl;
    const raamitId = 'virkailija-raamit';
    let scriptElement: HTMLScriptElement;

    if (showRaamit && !document.getElementById(raamitId)) {
      scriptElement = document.createElement('script');
      scriptElement.src = scriptUrl;
      scriptElement.id = raamitId;

      document.body.appendChild(scriptElement);
    }

    return () => {
      scriptElement && document.body.removeChild(scriptElement);
    };
  }, [scriptUrl]);

  return null;
};
