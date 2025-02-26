import { useState, useEffect } from "react";
import api from "../../store/axios";

function useFetchData(apiUrl) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiUrl) return; // Safety check

    const fetchData = async () => {
      try {
        const response = await api.get(apiUrl);
        const extractedData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        setData(extractedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  return { data, loading, error };
}

export default useFetchData;
