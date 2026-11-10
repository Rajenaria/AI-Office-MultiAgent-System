import type { DatabaseSync } from "node:sqlite";
import { requireAuthority } from "./contracts.js";
import { openTestConnection, type Settings } from "./test-storage.js";

export type RepositoryConnection = Readonly<{ db: DatabaseSync;
  ref: Readonly<{ projectId: string; authorityIncarnation: string }>; settings: Settings; close(): void }>;
export type OwnedFixtureConnection = Readonly<{ sourceClass: "LOCAL_TEST_FIXTURE" }>;
const pending = new WeakMap<object, RepositoryConnection>();
// Import-safe. Marker/file-key/PRAGMA/schema validation stays in the existing fixture adapter.
// Object provenance permits one ownership transfer; it does not authenticate a production host.
export function openOwnedFixtureConnection(ref: unknown, queryOnly = false): OwnedFixtureConnection {
  const raw = openTestConnection(ref);
  try {
    if (queryOnly) raw.db.exec("PRAGMA query_only=ON");
    let closed = false;
    const connection: RepositoryConnection = Object.freeze({ db: raw.db,
      ref: Object.freeze({ projectId: raw.ref.projectId, authorityIncarnation: raw.ref.authorityIncarnation }),
      settings: raw.settings, close() { if (!closed) { raw.close(); closed = true; } } });
    const token: OwnedFixtureConnection = Object.freeze({ sourceClass: "LOCAL_TEST_FIXTURE" });
    pending.set(token, connection); return token;
  } catch (error) { raw.close(); throw error; }
}
export function claimOwnedFixtureConnection(token: unknown): RepositoryConnection {
  const connection = typeof token === "object" && token !== null ? pending.get(token) : undefined;
  requireAuthority(connection, "AUTHORITY_INVALID");
  pending.delete(token as object); return connection;
}
export function discardUnclaimedFixtureConnection(token: OwnedFixtureConnection): void {
  const connection = pending.get(token);
  if (connection) { connection.close(); pending.delete(token); }
}
