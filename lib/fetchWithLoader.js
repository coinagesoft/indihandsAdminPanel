import { useLoader } from "../components/LoaderProvider";

export const useFetchWithLoader = () => {
  const { showLoader, hideLoader } = useLoader();

  const fetchWithLoader = async (url, options) => {
    try {
      showLoader();
      const res = await fetch(url, options);
      return res;
    } finally {
      hideLoader();
    }
  };

  return fetchWithLoader;
};