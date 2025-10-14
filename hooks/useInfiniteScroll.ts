import { useState } from "react";
import { useInView } from "react-intersection-observer";

export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  hasMore: boolean
) {
  const [isLoading, setIsLoading] = useState(false);

  const { ref } = useInView({
    threshold: 1,
    onChange: async (inView: boolean) => {
      if (inView && hasMore && !isLoading) {
        setIsLoading(true);
        await loadMore();
        setIsLoading(false);
      }
    },
  });

  return { ref, isLoading };
}
