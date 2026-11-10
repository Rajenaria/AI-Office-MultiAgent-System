import path from "node:path";
import { WorkspaceManager } from "./workspace/manager.js";
import { ProjectRegistry, type FaultHook } from "./workspace/registry.js";
import { WorkspaceFailure } from "./workspace/errors.js";
import { checkedDescendant, isWithin, validateRoot } from "./workspace/paths.js";
import { ProjectStateService } from "./state/service.js";
import type { StateFault } from "./state/storage.js";
import { HostWorkspaceRepositories, type FixtureWorkspaceRepositories, type RepositoryTestControl } from "./attempt-control/workspace-repositories.js";
import { verifyTestRoot } from "./attempt-control/test-storage.js";
import type { HostSQLiteConfig } from "./attempt-control/host-sqlite.js";
import { createHostPrincipalBoundary, type HostPrincipalConfiguration } from "./attempt-control/host-principal.js";
import { createExecutionAdmissionBoundary } from "./attempt-control/execution-admission.js";
import { createOutputPublicationBoundary } from "./attempt-control/output-publication.js";

export type BackendHostOptions = { dataRoot: string; fault?: FaultHook;
  fixtureState?: { root: string; demoHttp?: boolean; fault?: StateFault };
  identityVerification?: HostPrincipalConfiguration;
  fixtureRepositories?: FixtureWorkspaceRepositories; hostSQLite?: HostSQLiteConfig; repositoryTestControl?: RepositoryTestControl };
// Stop ingress first; always attempt owned-resource disposal, and retry only unfinished work.
export function createBackendShutdown(stopIngress: () => Promise<void>, stopHost: () => Promise<void>) {
  let ingressStopped = false, closing: Promise<void> | undefined;
  return (): Promise<void> => {
    if (closing) return closing;
    closing = (async () => {
      const errors: unknown[] = [];
      if (!ingressStopped) {
        try { await stopIngress(); ingressStopped = true; } catch (error) { errors.push(error); }
      }
      try { await stopHost(); } catch (error) { errors.push(error); }
      if (errors.length) throw new AggregateError(errors, "BACKEND_SHUTDOWN_INCOMPLETE");
    })().catch(error => { closing = undefined; throw error; });
    return closing;
  };
}
// Actual backend composition, import-safe and listener-free. Production storage/authentication are not inferred.
export async function composeBackendHost(options: BackendHostOptions) {
  // Reject unsupported identity configuration before registry acquisition or storage IO.
  const principalBoundary = createHostPrincipalBoundary(options.identityVerification);
  const admissionBoundary = createExecutionAdmissionBoundary(principalBoundary.api);
  const publicationBoundary = createOutputPublicationBoundary(principalBoundary.api);
  if (options.hostSQLite && options.fixtureRepositories)
    throw new WorkspaceFailure("ACCESS_DENIED", "AMBIGUOUS_REPOSITORY_CONFIGURATION", 403);
  if (options.repositoryTestControl && !options.fixtureRepositories && !options.hostSQLite)
    throw new WorkspaceFailure("ACCESS_DENIED", "REPOSITORY_FIXTURE_CONTROL_REQUIRES_CONFIGURATION", 403);
  if (options.fixtureRepositories) {
    const root = verifyTestRoot(options.fixtureRepositories.root);
    if (!isWithin(root.root, options.dataRoot) || root.root === options.dataRoot)
      throw new WorkspaceFailure("ACCESS_DENIED", "HOST_DATA_OUTSIDE_FIXTURE_OWNER", 403);
    await checkedDescendant(await validateRoot(root.root), path.relative(root.root, options.dataRoot).replaceAll("\\", "/"));
  }
  const registry = await ProjectRegistry.acquire(options.dataRoot, options.fault);
  let manager: WorkspaceManager | undefined, repositories: HostWorkspaceRepositories | undefined;
  try {
    const state = options.fixtureState ? await ProjectStateService.forFixtures(registry, options.fixtureState.root, options.fixtureState.fault) : undefined;
    manager = new WorkspaceManager(registry, options.fault, state, {
      invalidate: () => { publicationBoundary.invalidate(); admissionBoundary.invalidate(); principalBoundary.invalidate(); repositories?.invalidate(); },
      close: () => { publicationBoundary.close(); admissionBoundary.close(); principalBoundary.close(); return repositories?.close() ?? Promise.resolve(); },
    });
    if (options.fixtureRepositories)
      repositories = await HostWorkspaceRepositories.forFixtures(manager, registry, options.fixtureRepositories, options.repositoryTestControl);
    if (options.hostSQLite)
      repositories = HostWorkspaceRepositories.forHostSQLite(manager, registry, options.hostSQLite, options.repositoryTestControl);
    const ownedManager = manager;
    return Object.freeze({ manager, repositories, authentication: principalBoundary.api,
      admission: admissionBoundary.api,
      publication: publicationBoundary.api,
      close: () => { publicationBoundary.close(); admissionBoundary.close(); principalBoundary.close(); return ownedManager.close(); } });
  } catch (error) {
    publicationBoundary.close();
    admissionBoundary.close();
    principalBoundary.close();
    try { if (manager) await manager.close(); else await registry.close(); }
    catch (closeError) { throw new AggregateError([error, closeError], "BACKEND_HOST_COMPOSITION_AND_CLOSE_FAILED"); }
    throw error;
  }
}
