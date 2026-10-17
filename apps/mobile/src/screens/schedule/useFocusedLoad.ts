import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { errorMessage } from "../../lib/errors";

export type Loadable<T> = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T };

// Runs `load` when the screen comes into view (e.g. back from saving an
// event) and whenever `key` changes. Earlier data stays on screen while a
// reload runs; a result that arrives after a newer request is dropped.
export function useFocusedLoad<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<Loadable<T>>({ status: "loading" });

  const run = useCallback(() => {
    let current = true;
    load()
      .then((data) => current && setState({ status: "ready", data }))
      .catch((err: unknown) => current && setState({ status: "error", message: errorMessage(err) }));
    return () => {
      current = false;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(run);

  const reload = useCallback(
    () =>
      load()
        .then((data) => setState({ status: "ready", data }))
        .catch((err: unknown) => setState({ status: "error", message: errorMessage(err) })),
    [key], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { state, reload };
}
