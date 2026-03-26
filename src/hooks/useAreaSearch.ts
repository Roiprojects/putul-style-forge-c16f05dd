import { useState, useEffect, useRef } from "react";

export interface PostOffice {
  Name: string;
  BranchType: string;
  District: string;
  State: string;
  Pincode: string;
}

interface ApiResponse {
  Message: string;
  Status: string;
  PostOffice: PostOffice[] | null;
}

// Debounced India Post API lookup by area/post office name
export const useAreaSearch = (query: string) => {
  const [results, setResults] = useState<PostOffice[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    // No debounce — instant search as requested
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/postoffice/${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        const data: ApiResponse[] = await res.json();
        if (data[0]?.Status === "Success" && data[0]?.PostOffice) {
          setResults(data[0].PostOffice.slice(0, 10));
        } else {
          setResults([]);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Small 150ms delay to avoid hammering API on every keystroke
    const timer = setTimeout(fetchData, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, loading };
};

// Pincode-based reverse lookup
export const usePincodeSearch = (pincode: string) => {
  const [results, setResults] = useState<PostOffice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
      .then(res => res.json())
      .then((data: ApiResponse[]) => {
        if (data[0]?.Status === "Success" && data[0]?.PostOffice) {
          setResults(data[0].PostOffice);
        } else {
          setResults([]);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [pincode]);

  return { results, loading };
};
