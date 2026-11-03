import { VisualStabilityDiagnosticReport } from '../components/ModularRoomCanvas';
import { triggerBinaryDownload } from '../three/RoomExportAndImportManager';
import {
  HANDOFF_PACKAGE_ID,
  PRODUCTION_FILENAMES,
  ZipEntryInput,
  buildSourceReadmeMarkdown,
  buildValidationReadmeMarkdown,
  computeSha256Hex,
  createZipArchive,
} from './AssetManifestBuilder';
import { IndependentRoundTripReportV1 } from './AssetValidation';
import {
  BackendCharacterExportPackResult,
  CEOCharacterExportPackResult,
  CharacterExportCandidatePackResult,
  DatabaseCharacterExportPackResult,
  FrontendCharacterExportPackResult,
  QACharacterExportPackResult,
  ResearchCharacterExportPackResult,
  UIUXCharacterExportPackResult,
} from './CharacterExporter';
import {
  CEORoomProductionAssetPackResult,
  EngineeringRoomProductionAssetPackResult,
  QADevOpsRoomProductionAssetPackResult,
  ResearchRoomProductionAssetPackResult,
  RoomProductionAssetPackResult,
  UIUXRoomProductionAssetPackResult,
  dataUrlToUint8Array,
} from './RoomExporter';
import {
  buildOfficeLayoutA3ExportJson,
  buildOfficeLayoutA3_1ExportJson,
  buildOfficeLayoutA3_2ExportJson,
} from '../domain/officeLayoutA3Spec';

// Vite statically resolves these glob imports into raw file strings at build time.
// Strictly excludes .env secrets while including all actual project source files.
const rawProjectFiles = import.meta.glob(
  [
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/index.html',
    '/metadata.json',
    '/.env.example',
    '/src/**/*.{ts,tsx,css}',
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  }
) as Record<string, string>;

export interface SourceProjectArchiveResult {
  zipBytes: Uint8Array;
  fileCount: number;
  includedFiles: string[];
  sha256: string;
}

/**
 * Packages the actual, complete Modular Room Lab source files into `modular-room-lab-source.zip`.
 * Zero placeholders or fake summaries — every file is the verbatim source from this repository.
 */
export async function buildModularRoomLabSourceZip(): Promise<SourceProjectArchiveResult> {
  const entries: ZipEntryInput[] = [];
  const includedFiles: string[] = [];

  const sortedPaths = Object.keys(rawProjectFiles).sort();
  for (const rawPath of sortedPaths) {
    const content = rawProjectFiles[rawPath];
    if (typeof content !== 'string') continue;
    const relPath = rawPath.replace(/^\/+/, '');
    entries.push({
      path: relPath,
      data: content,
    });
    includedFiles.push(relPath);
  }

  const readmeContent = buildSourceReadmeMarkdown(includedFiles.length);
  entries.push({
    path: 'README.md',
    data: readmeContent,
  });
  includedFiles.push('README.md');

  const zipBytes = createZipArchive(entries);
  const sha256 = await computeSha256Hex(zipBytes);

  return {
    zipBytes,
    fileCount: includedFiles.length,
    includedFiles,
    sha256,
  };
}

export async function downloadModularRoomLabSourceZip(): Promise<{
  filename: string;
  byteLength: number;
  fileCount: number;
  sha256: string;
}> {
  const res = await buildModularRoomLabSourceZip();
  const filename = PRODUCTION_FILENAMES.SOURCE_ZIP;
  triggerBinaryDownload(res.zipBytes.buffer as ArrayBuffer, filename, 'application/zip');
  return {
    filename,
    byteLength: res.zipBytes.byteLength,
    fileCount: res.fileCount,
    sha256: res.sha256,
  };
}

/**
 * Builds and downloads the complete logical package structure:
 * AI-OFFICE-PM-ROOM-HANDOFF-V1/
 *   production/office-layout-a3.json
 *   production/office-layout-a3.1.json
 *   production/office-layout-a3.2.json
 *   production/rooms/pm_strategy/...
 *   production/rooms/ceo_executive/...
 *   production/rooms/uiux_studio/...
 *   production/rooms/engineering_studio/...
 *   production/rooms/research_brain/...
 *   production/rooms/qa_devops_studio/...
 *   production/characters/boss_pm_room_native/...
 *   production/characters/ceo_executive_assistant/...
 *   production/characters/uiux_designer_agent/...
 *   production/characters/frontend_developer_agent/...
 *   production/characters/backend_developer_agent/...
 *   production/characters/database_developer_agent/...
 *   production/characters/research_professor_agent/...
 *   validation/roundtrip-report.json, visual-stability-report.json, README.md
 *   source/modular-room-lab-source.zip, README.md
 */
export async function downloadCompleteHandoffBundleZip(params: {
  roomPack: RoomProductionAssetPackResult;
  ceoPack?: CEORoomProductionAssetPackResult;
  uiuxPack?: UIUXRoomProductionAssetPackResult;
  engineeringPack?: EngineeringRoomProductionAssetPackResult;
  researchPack?: ResearchRoomProductionAssetPackResult;
  qaDevopsPack?: QADevOpsRoomProductionAssetPackResult;
  characterPack: CharacterExportCandidatePackResult;
  ceoCharacterPack?: CEOCharacterExportPackResult;
  uiuxCharacterPack?: UIUXCharacterExportPackResult;
  frontendCharacterPack?: FrontendCharacterExportPackResult;
  backendCharacterPack?: BackendCharacterExportPackResult;
  databaseCharacterPack?: DatabaseCharacterExportPackResult;
  researchCharacterPack?: ResearchCharacterExportPackResult;
  qaCharacterPack?: QACharacterExportPackResult;
  roundTripReport: IndependentRoundTripReportV1;
  stabilityReport: VisualStabilityDiagnosticReport;
}): Promise<{
  filename: string;
  byteLength: number;
  sourceFileCount: number;
  sha256: string;
}> {
  const {
    roomPack,
    ceoPack,
    uiuxPack,
    engineeringPack,
    researchPack,
    qaDevopsPack,
    characterPack,
    ceoCharacterPack,
    uiuxCharacterPack,
    frontendCharacterPack,
    backendCharacterPack,
    databaseCharacterPack,
    researchCharacterPack,
    qaCharacterPack,
    roundTripReport,
    stabilityReport,
  } = params;
  const sourceArchive = await buildModularRoomLabSourceZip();

  const root = HANDOFF_PACKAGE_ID;
  const roomDir = `${root}/production/rooms/pm_strategy`;
  const ceoDir = `${root}/production/rooms/ceo_executive`;
  const uiuxDir = `${root}/production/rooms/uiux_studio`;
  const engDir = `${root}/production/rooms/engineering_studio`;
  const researchDir = `${root}/production/rooms/research_brain`;
  const qaDevopsDir = `${root}/production/rooms/qa_devops_studio`;
  const charDir = `${root}/production/characters/boss_pm_room_native`;
  const ceoCharDir = `${root}/production/characters/ceo_executive_assistant`;
  const uiuxCharDir = `${root}/production/characters/uiux_designer_agent`;
  const frontendCharDir = `${root}/production/characters/frontend_developer_agent`;
  const backendCharDir = `${root}/production/characters/backend_developer_agent`;
  const databaseCharDir = `${root}/production/characters/database_developer_agent`;
  const researchCharDir = `${root}/production/characters/research_professor_agent`;
  const qaCharDir = `${root}/production/characters/qa_engineer_agent`;
  const valDir = `${root}/validation`;
  const srcDir = `${root}/source`;

  const entries: ZipEntryInput[] = [
    // Master Floor Plan A3, A3.1 & A3.2 Layout Contracts
    {
      path: `${root}/production/${PRODUCTION_FILENAMES.OFFICE_LAYOUT_A3}`,
      data: JSON.stringify(buildOfficeLayoutA3ExportJson(), null, 2),
    },
    {
      path: `${root}/production/${PRODUCTION_FILENAMES.OFFICE_LAYOUT_A3_1}`,
      data: JSON.stringify(buildOfficeLayoutA3_1ExportJson(), null, 2),
    },
    {
      path: `${root}/production/${PRODUCTION_FILENAMES.OFFICE_LAYOUT_A3_2}`,
      data: JSON.stringify(buildOfficeLayoutA3_2ExportJson(), null, 2),
    },
    // Deliverable A — PM Room Production Asset Pack
    {
      path: `${roomDir}/${PRODUCTION_FILENAMES.ROOM_GLB}`,
      data: roomPack.glbBuffer,
    },
    {
      path: `${roomDir}/${PRODUCTION_FILENAMES.ROOM_MANIFEST}`,
      data: JSON.stringify(roomPack.manifest, null, 2),
    },
    {
      path: `${roomDir}/${PRODUCTION_FILENAMES.ROOM_ANCHORS}`,
      data: JSON.stringify(roomPack.anchorsJson, null, 2),
    },
    {
      path: `${roomDir}/${PRODUCTION_FILENAMES.ROOM_README}`,
      data: roomPack.readmeMarkdown,
    },
    // Deliverable B — Room-Native Boss PM Export Candidate
    {
      path: `${charDir}/${PRODUCTION_FILENAMES.CHARACTER_GLB}`,
      data: characterPack.glbBuffer,
    },
    {
      path: `${charDir}/${PRODUCTION_FILENAMES.CHARACTER_MANIFEST}`,
      data: JSON.stringify(characterPack.manifest, null, 2),
    },
    {
      path: `${charDir}/${PRODUCTION_FILENAMES.CHARACTER_BEHAVIOR}`,
      data: JSON.stringify(characterPack.behaviorJson, null, 2),
    },
    {
      path: `${charDir}/${PRODUCTION_FILENAMES.CHARACTER_README}`,
      data: characterPack.readmeMarkdown,
    },
    // Validation Reports
    {
      path: `${valDir}/${PRODUCTION_FILENAMES.ROUNDTRIP_REPORT}`,
      data: JSON.stringify(roundTripReport, null, 2),
    },
    {
      path: `${valDir}/${PRODUCTION_FILENAMES.VISUAL_STABILITY_REPORT}`,
      data: JSON.stringify(stabilityReport, null, 2),
    },
    {
      path: `${valDir}/README.md`,
      data: buildValidationReadmeMarkdown(),
    },
    // Deliverable C — Full Source Project
    {
      path: `${srcDir}/${PRODUCTION_FILENAMES.SOURCE_ZIP}`,
      data: sourceArchive.zipBytes,
    },
    {
      path: `${srcDir}/README.md`,
      data: buildSourceReadmeMarkdown(sourceArchive.fileCount),
    },
  ];

  if (ceoPack) {
    entries.push(
      {
        path: `${ceoDir}/${PRODUCTION_FILENAMES.CEO_ROOM_GLB}`,
        data: ceoPack.glbBuffer,
      },
      {
        path: `${ceoDir}/${PRODUCTION_FILENAMES.CEO_ROOM_MANIFEST}`,
        data: JSON.stringify(ceoPack.manifest, null, 2),
      },
      {
        path: `${ceoDir}/${PRODUCTION_FILENAMES.CEO_ROOM_ANCHORS}`,
        data: JSON.stringify(ceoPack.anchorsJson, null, 2),
      },
      {
        path: `${ceoDir}/${PRODUCTION_FILENAMES.CEO_ROOM_BEHAVIOR}`,
        data: JSON.stringify(ceoPack.behaviorJson, null, 2),
      },
      {
        path: `${ceoDir}/${PRODUCTION_FILENAMES.CEO_ROOM_README}`,
        data: ceoPack.readmeMarkdown,
      }
    );
    if (ceoPack.previewDataUrl) {
      entries.push({
        path: `${ceoDir}/${PRODUCTION_FILENAMES.CEO_ROOM_PREVIEW}`,
        data: dataUrlToUint8Array(ceoPack.previewDataUrl),
      });
    }
  }

  if (uiuxPack) {
    entries.push(
      {
        path: `${uiuxDir}/${PRODUCTION_FILENAMES.UIUX_ROOM_GLB}`,
        data: uiuxPack.glbBuffer,
      },
      {
        path: `${uiuxDir}/${PRODUCTION_FILENAMES.UIUX_ROOM_MANIFEST}`,
        data: JSON.stringify(uiuxPack.manifest, null, 2),
      },
      {
        path: `${uiuxDir}/${PRODUCTION_FILENAMES.UIUX_ROOM_ANCHORS}`,
        data: JSON.stringify(uiuxPack.anchorsJson, null, 2),
      },
      {
        path: `${uiuxDir}/${PRODUCTION_FILENAMES.UIUX_ROOM_BEHAVIOR}`,
        data: JSON.stringify(uiuxPack.behaviorJson, null, 2),
      },
      {
        path: `${uiuxDir}/${PRODUCTION_FILENAMES.UIUX_ROOM_README}`,
        data: uiuxPack.readmeMarkdown,
      }
    );
    if (uiuxPack.previewDataUrl) {
      entries.push({
        path: `${uiuxDir}/${PRODUCTION_FILENAMES.UIUX_ROOM_PREVIEW}`,
        data: dataUrlToUint8Array(uiuxPack.previewDataUrl),
      });
    }
  }

  if (engineeringPack) {
    entries.push(
      {
        path: `${engDir}/${PRODUCTION_FILENAMES.ENGINEERING_ROOM_GLB}`,
        data: engineeringPack.glbBuffer,
      },
      {
        path: `${engDir}/${PRODUCTION_FILENAMES.ENGINEERING_ROOM_MANIFEST}`,
        data: JSON.stringify(engineeringPack.manifest, null, 2),
      },
      {
        path: `${engDir}/${PRODUCTION_FILENAMES.ENGINEERING_ROOM_ANCHORS}`,
        data: JSON.stringify(engineeringPack.anchorsJson, null, 2),
      },
      {
        path: `${engDir}/${PRODUCTION_FILENAMES.ENGINEERING_ROOM_BEHAVIOR}`,
        data: JSON.stringify(engineeringPack.behaviorJson, null, 2),
      },
      {
        path: `${engDir}/${PRODUCTION_FILENAMES.ENGINEERING_ROOM_README}`,
        data: engineeringPack.readmeMarkdown,
      }
    );
    if (engineeringPack.previewDataUrl) {
      entries.push({
        path: `${engDir}/${PRODUCTION_FILENAMES.ENGINEERING_ROOM_PREVIEW}`,
        data: dataUrlToUint8Array(engineeringPack.previewDataUrl),
      });
    }
  }

  if (researchPack) {
    entries.push(
      {
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB}`,
        data: researchPack.glbBuffer,
      },
      {
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_MANIFEST}`,
        data: JSON.stringify(researchPack.manifest, null, 2),
      },
      {
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_ANCHORS}`,
        data: JSON.stringify(researchPack.anchorsJson, null, 2),
      },
      {
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_DISPLAY_SLOTS}`,
        data: JSON.stringify(researchPack.displaySlotsJson, null, 2),
      },
      {
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_BEHAVIOR}`,
        data: JSON.stringify(researchPack.behaviorJson, null, 2),
      },
      {
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_README}`,
        data: researchPack.readmeMarkdown,
      }
    );
    if (researchPack.previewDataUrl) {
      entries.push({
        path: `${researchDir}/${PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW}`,
        data: dataUrlToUint8Array(researchPack.previewDataUrl),
      });
    }
  }

  if (qaDevopsPack) {
    entries.push(
      {
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB}`,
        data: qaDevopsPack.glbBuffer,
      },
      {
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_MANIFEST}`,
        data: JSON.stringify(qaDevopsPack.manifest, null, 2),
      },
      {
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_ANCHORS}`,
        data: JSON.stringify(qaDevopsPack.anchorsJson, null, 2),
      },
      {
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_DISPLAY_SLOTS}`,
        data: JSON.stringify(qaDevopsPack.displaySlotsJson, null, 2),
      },
      {
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_BEHAVIOR}`,
        data: JSON.stringify(qaDevopsPack.behaviorJson, null, 2),
      },
      {
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_README}`,
        data: qaDevopsPack.readmeMarkdown,
      }
    );
    if (qaDevopsPack.previewDataUrl) {
      entries.push({
        path: `${qaDevopsDir}/${PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PREVIEW}`,
        data: dataUrlToUint8Array(qaDevopsPack.previewDataUrl),
      });
    }
  }

  if (ceoCharacterPack) {
    entries.push(
      {
        path: `${ceoCharDir}/${PRODUCTION_FILENAMES.CEO_CHARACTER_GLB}`,
        data: ceoCharacterPack.glbBuffer,
      },
      {
        path: `${ceoCharDir}/${PRODUCTION_FILENAMES.CEO_CHARACTER_MANIFEST}`,
        data: JSON.stringify(ceoCharacterPack.manifest, null, 2),
      },
      {
        path: `${ceoCharDir}/${PRODUCTION_FILENAMES.CEO_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(ceoCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${ceoCharDir}/${PRODUCTION_FILENAMES.CEO_CHARACTER_README}`,
        data: ceoCharacterPack.readmeMarkdown,
      }
    );
    if (ceoCharacterPack.previewDataUrl) {
      entries.push({
        path: `${ceoCharDir}/${PRODUCTION_FILENAMES.CEO_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(ceoCharacterPack.previewDataUrl),
      });
    }
  }

  if (uiuxCharacterPack) {
    entries.push(
      {
        path: `${uiuxCharDir}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_GLB}`,
        data: uiuxCharacterPack.glbBuffer,
      },
      {
        path: `${uiuxCharDir}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_MANIFEST}`,
        data: JSON.stringify(uiuxCharacterPack.manifest, null, 2),
      },
      {
        path: `${uiuxCharDir}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(uiuxCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${uiuxCharDir}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_README}`,
        data: uiuxCharacterPack.readmeMarkdown,
      }
    );
    if (uiuxCharacterPack.previewDataUrl) {
      entries.push({
        path: `${uiuxCharDir}/${PRODUCTION_FILENAMES.UIUX_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(uiuxCharacterPack.previewDataUrl),
      });
    }
  }

  if (frontendCharacterPack) {
    entries.push(
      {
        path: `${frontendCharDir}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_GLB}`,
        data: frontendCharacterPack.glbBuffer,
      },
      {
        path: `${frontendCharDir}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_MANIFEST}`,
        data: JSON.stringify(frontendCharacterPack.manifest, null, 2),
      },
      {
        path: `${frontendCharDir}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(frontendCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${frontendCharDir}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_README}`,
        data: frontendCharacterPack.readmeMarkdown,
      }
    );
    if (frontendCharacterPack.previewDataUrl) {
      entries.push({
        path: `${frontendCharDir}/${PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(frontendCharacterPack.previewDataUrl),
      });
    }
  }

  if (backendCharacterPack) {
    entries.push(
      {
        path: `${backendCharDir}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_GLB}`,
        data: backendCharacterPack.glbBuffer,
      },
      {
        path: `${backendCharDir}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_MANIFEST}`,
        data: JSON.stringify(backendCharacterPack.manifest, null, 2),
      },
      {
        path: `${backendCharDir}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(backendCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${backendCharDir}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_README}`,
        data: backendCharacterPack.readmeMarkdown,
      }
    );
    if (backendCharacterPack.previewDataUrl) {
      entries.push({
        path: `${backendCharDir}/${PRODUCTION_FILENAMES.BACKEND_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(backendCharacterPack.previewDataUrl),
      });
    }
  }

  if (databaseCharacterPack) {
    entries.push(
      {
        path: `${databaseCharDir}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_GLB}`,
        data: databaseCharacterPack.glbBuffer,
      },
      {
        path: `${databaseCharDir}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_MANIFEST}`,
        data: JSON.stringify(databaseCharacterPack.manifest, null, 2),
      },
      {
        path: `${databaseCharDir}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(databaseCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${databaseCharDir}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_README}`,
        data: databaseCharacterPack.readmeMarkdown,
      }
    );
    if (databaseCharacterPack.previewDataUrl) {
      entries.push({
        path: `${databaseCharDir}/${PRODUCTION_FILENAMES.DATABASE_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(databaseCharacterPack.previewDataUrl),
      });
    }
  }

  if (researchCharacterPack) {
    entries.push(
      {
        path: `${researchCharDir}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_GLB}`,
        data: researchCharacterPack.glbBuffer,
      },
      {
        path: `${researchCharDir}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_MANIFEST}`,
        data: JSON.stringify(researchCharacterPack.manifest, null, 2),
      },
      {
        path: `${researchCharDir}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(researchCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${researchCharDir}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_README}`,
        data: researchCharacterPack.readmeMarkdown,
      }
    );
    if (researchCharacterPack.previewDataUrl) {
      entries.push({
        path: `${researchCharDir}/${PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(researchCharacterPack.previewDataUrl),
      });
    }
  }

  if (qaCharacterPack) {
    entries.push(
      {
        path: `${qaCharDir}/${PRODUCTION_FILENAMES.QA_CHARACTER_GLB}`,
        data: qaCharacterPack.glbBuffer,
      },
      {
        path: `${qaCharDir}/${PRODUCTION_FILENAMES.QA_CHARACTER_MANIFEST}`,
        data: JSON.stringify(qaCharacterPack.manifest, null, 2),
      },
      {
        path: `${qaCharDir}/${PRODUCTION_FILENAMES.QA_CHARACTER_BEHAVIOR}`,
        data: JSON.stringify(qaCharacterPack.behaviorJson, null, 2),
      },
      {
        path: `${qaCharDir}/${PRODUCTION_FILENAMES.QA_CHARACTER_README}`,
        data: qaCharacterPack.readmeMarkdown,
      }
    );
    if (qaCharacterPack.previewDataUrl) {
      entries.push({
        path: `${qaCharDir}/${PRODUCTION_FILENAMES.QA_CHARACTER_PREVIEW}`,
        data: dataUrlToUint8Array(qaCharacterPack.previewDataUrl),
      });
    }
  }

  if (roomPack.previewDataUrl) {
    entries.push({
      path: `${roomDir}/${PRODUCTION_FILENAMES.ROOM_PREVIEW}`,
      data: dataUrlToUint8Array(roomPack.previewDataUrl),
    });
  }

  if (characterPack.previewDataUrl) {
    entries.push({
      path: `${charDir}/${PRODUCTION_FILENAMES.CHARACTER_PREVIEW}`,
      data: dataUrlToUint8Array(characterPack.previewDataUrl),
    });
  }

  const bundleZipBytes = createZipArchive(entries);
  const sha256 = await computeSha256Hex(bundleZipBytes);
  const filename = PRODUCTION_FILENAMES.HANDOFF_BUNDLE_ZIP;
  triggerBinaryDownload(bundleZipBytes.buffer as ArrayBuffer, filename, 'application/zip');

  return {
    filename,
    byteLength: bundleZipBytes.byteLength,
    sourceFileCount: sourceArchive.fileCount,
    sha256,
  };
}

export function getBundledSourceFileList(): string[] {
  return [...Object.keys(rawProjectFiles).map((p) => p.replace(/^\/+/, '')).sort(), 'README.md'];
}
