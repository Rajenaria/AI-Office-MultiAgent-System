import { PLAN_DOWNLOAD_NAME, serializePlanningBoard } from "./transfer.js";
import type { PlanningBoard } from "./model.js";

export type PlanDownloadPort = Readonly<{
  createURL(blob: Blob): string;
  request(url: string, filename: string): void;
  release(url: string): void;
}>;
// Resolved only on the user's Export click. No upload, backend or filesystem API.
const browserDownload: PlanDownloadPort = {
  createURL: blob => URL.createObjectURL(blob),
  request(url, filename) {
    const link = document.createElement("a"); link.href = url; link.download = filename;
    document.body.append(link); try { link.click(); } finally { link.remove(); }
  },
  release: url => { setTimeout(() => URL.revokeObjectURL(url), 1000); },
};
export function requestPlanDownload(text: string, port: PlanDownloadPort = browserDownload): void {
  const url = port.createURL(new Blob([text], { type: "application/json;charset=utf-8" }));
  try { port.request(url, PLAN_DOWNLOAD_NAME); } finally { port.release(url); }
}
export function exportPlanFile(board: PlanningBoard, port?: PlanDownloadPort): void {
  requestPlanDownload(serializePlanningBoard(board), port);
}
