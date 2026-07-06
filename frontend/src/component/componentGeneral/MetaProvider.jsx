import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import axios from "axios";
import ReactGA from "react-ga4";

const MetaProvider = () => {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiURL = import.meta.env.VITE_API_URL;
  const location = useLocation();

  // Fetch meta info (once)
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const { data } = await axios.get(`${apiURL}/meta`);
        setMeta(data.data);
      } catch (err) {
        console.error("Failed to fetch meta info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [apiURL]);

  // Track pageview on route change
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  if (loading || !meta) return null;

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords?.join(", ")} />
    </>
  );
};

export default MetaProvider;
