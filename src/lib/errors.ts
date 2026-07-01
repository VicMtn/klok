import { getT } from "../i18n";
import { useToastStore } from "../store/useToastStore";

/**
 * Surface a failed DB write to the user. Store write actions call this from
 * their catch block *after* rolling back the optimistic update, so a dropped
 * write is never silent. `context` is logged for debugging only.
 */
export function reportWriteError(context: string, err: unknown): void {
  console.error(context, err);
  useToastStore.getState().notify(getT().errors.saveFailed);
}
