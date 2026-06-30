import { ref, readonly, type Ref } from "vue";

export interface UseAbortController {
  controller: Readonly<Ref<AbortController | undefined>>;
  create: () => void;
  abort: () => void;
}

export function useAbortController(): UseAbortController {
  const controller = ref<AbortController>();

  const create = (): void => {
    controller.value?.abort();
    controller.value = new AbortController();
  };

  const abort = (): void => {
    controller.value?.abort();
    controller.value = undefined;
  };

  return {
    controller: readonly(controller),
    create,
    abort,
  };
}
