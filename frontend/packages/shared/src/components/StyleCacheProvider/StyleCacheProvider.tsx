import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

const readNonceFromMetaTag = () => {
  const metaElement = document.head.querySelector(
    'meta[name="csp-nonce"]'
  ) as HTMLMetaElement | null;

  return metaElement?.content;
};

interface StyleCacheProviderProps {
  appName: string;
  children: React.ReactNode;
}

export const StyleCacheProvider = ({
  appName,
  children,
}: StyleCacheProviderProps) => {
  const nonce = readNonceFromMetaTag();
  const cache = createCache({ key: appName, nonce });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};
