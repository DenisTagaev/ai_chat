import { watch, nextTick, type Ref } from "vue";

export function useAutoScroll(
  containerRef: Ref<HTMLElement | null>,
  source: () => number,
  options?: {
    threshold?: number;
    behavior?: ScrollBehavior;
  }
) {
  const threshold: number = options?.threshold ?? 120;
  const behavior: ScrollBehavior = options?.behavior ?? "smooth";

  const isNearBottom = (): boolean => {
    const el = containerRef.value;
    if (!el) return false;

    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  const scrollToBottom = async (): Promise<void> => {
    await nextTick();
    const el = containerRef.value;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  };

  watch(source, async (): Promise<void> => {
    if (isNearBottom()) {
      await scrollToBottom();
    }
  });
}
