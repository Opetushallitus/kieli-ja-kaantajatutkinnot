import { useEffect } from 'react';

const maxRunningId = 10000;
let runningId = 0;
const generateId = (prefix?: string) => {
  const idPrefix = prefix ? prefix + '-' : '';
  runningId = (runningId + 1) % maxRunningId;

  return '' + idPrefix + Date.now().toString(36) + runningId.toString(36);
};

type VirkailijaRaamitProps = {
  scriptUrl: string;
};

export const VirkailijaRaamit = ({ scriptUrl }: VirkailijaRaamitProps) => {
  useEffect(() => {
    const showRaamit = !!scriptUrl;
    const raamitId = generateId('virkailijaRaamit');
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
