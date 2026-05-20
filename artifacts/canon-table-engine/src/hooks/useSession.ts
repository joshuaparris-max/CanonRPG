import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { SessionState } from "@/types";

const SCHEMA_VERSION = "2.0.0";

const DEFAULT_SESSION: SessionState = {
  campaignMode: "",
  adventureId: "",
  currentNodeId: "",
  sessionLog: [],
  dmNotes: "",
  lastSaved: 0,
  schemaVersion: SCHEMA_VERSION,
};

export function useSession() {
  const [session, setSession] = useLocalStorage<SessionState>(
    "cte_session",
    DEFAULT_SESSION
  );

  const updateSession = useCallback(
    (updates: Partial<SessionState>) => {
      setSession((prev) => ({
        ...prev,
        ...updates,
        lastSaved: Date.now(),
      }));
    },
    [setSession]
  );

  const appendLog = useCallback(
    (entry: string) => {
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSession((prev) => ({
        ...prev,
        sessionLog: [...prev.sessionLog, `[${timestamp}] ${entry}`],
        lastSaved: Date.now(),
      }));
    },
    [setSession]
  );

  const resetSession = useCallback(() => {
    setSession({ ...DEFAULT_SESSION, lastSaved: Date.now() });
  }, [setSession]);

  return { session, updateSession, appendLog, resetSession };
}
