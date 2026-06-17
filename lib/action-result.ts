export type ActionResult =
  | { ok: true; redirectTo?: string; message?: string }
  | { ok: false; error: string };

export function actionError(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : 'Something went wrong';
  return { ok: false, error: message };
}
