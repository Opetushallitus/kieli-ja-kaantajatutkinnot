export const readNonceFromMetaTag = () => {
  const metaElement = document.head.querySelector(
    'meta[name="csp-nonce"]'
  ) as HTMLMetaElement | null;

  return metaElement?.content;
};
