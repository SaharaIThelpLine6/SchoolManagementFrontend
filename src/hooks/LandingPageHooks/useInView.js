import { useState, useRef, useCallback, useEffect } from 'react';

export default function useInView(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef(null);
  const nodeRef = useRef(null);

  // Callback ref — DOM node mount হওয়ার সাথে সাথেই observer attach হয়,
  // আলাদা effect pass-এর অপেক্ষা করতে হয় না (StrictMode double-invoke সমস্যা এড়াতে)
  const ref = useCallback(
    (node) => {
      // পুরনো observer থাকলে clean up করে দাও
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      nodeRef.current = node;

      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // একবার দেখা হয়ে গেলে আর observe করার দরকার নেই
          }
        },
        { threshold, rootMargin: '0px 0px -10% 0px' }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold]
  );

  // Safety net — কোনো কারণে observer fire না করলেও ১.২ সেকেন্ড পর
  // content আটকে না থেকে নিজে থেকেই visible হয়ে যাবে
  useEffect(() => {
    const t = setTimeout(() => setIsInView(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Component unmount হলে observer clean up
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [ref, isInView];
}
