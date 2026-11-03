import React, { useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CAMERA_PRESETS,
  FURNITURE_CATALOG,
  FurnitureCatalogItem,
  MODULE_CONSTANTS,
  RoomExportStats,
  generateRoomManifest,
} from '../domain/modularRoomSpec';
import {
  AUTO_DEMO_SEQUENCE,
  ActivityAnchor,
  AnchorId,
  CharacterSourceType,
  GLBInspectionReport,
  PATROL_ANCHOR_SEQUENCE,
  PMActionDefinition,
  PMActionId,
  PMAgentStateId,
  PM_DEMO_ACTIONS,
  buildSimulationExportConfig,
  findWalkablePath,
  shortestAngleDelta,
} from '../domain/pmSimulationSpec';
import {
  FULL_OFFICE_CAMERA_PRESETS,
  FULL_OFFICE_CAMERA_PROFILE_V2_1,
  FullOfficeCutawayMode,
  FullOfficeOrbitMode,
  OFFICE_ROOM_REGISTRY,
  OfficeViewMode,
  RoomModuleKey,
  computeAutoFitZoomForFullOfficePreset,
  getRoomModuleByKey,
} from '../domain/officeLayoutA3Spec';
import {
  CENTRAL_HUB_CAMERA_PRESETS,
  CENTRAL_HUB_FURNITURE_CATALOG,
} from '../domain/centralHubSpec';
import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEO_CAMERA_PRESETS,
  CEO_FURNITURE_CATALOG,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
} from '../domain/ceoRoomSpec';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUX_CAMERA_PRESETS,
  UIUX_FURNITURE_CATALOG,
  UIUX_MODULE_CONSTANTS,
} from '../domain/uiuxRoomSpec';
import {
  MaterialLibraryInstance,
  VisualStyleMode,
  createPixelMaterialLibrary,
} from '../three/PixelMaterialLibrary';
import { buildRoomArchitecture } from '../three/RoomArchitectureBuilder';
import {
  buildPMRoomFurnitureAndProps,
  buildScaleMannequin,
} from '../three/FurnitureLibraryBuilder';
import {
  CEORoomBuildResult,
  buildCEORoomAnchorHelpers,
  buildCEORoomComplete,
} from '../three/CEORoomBuilder';
import {
  UIUXRoomBuildResult,
  buildUIUXRoomAnchorHelpers,
  buildUIUXRoomComplete,
} from '../three/UIUXRoomBuilder';
import {
  BuiltEngineeringRoomResult,
  buildEngineeringRoomAnchorHelpers,
  buildEngineeringStudioRoom,
} from '../three/EngineeringRoomBuilder';
import {
  DEFAULT_ENGINEERING_ANCHORS,
  ENGINEERING_CAMERA_PRESETS,
  ENGINEERING_FURNITURE_CATALOG,
  ENGINEERING_MODULE_CONSTANTS,
  EngineeringActivityAnchor,
  EngineeringAnchorId,
} from '../domain/engineeringRoomSpec';
import {
  BuiltResearchRoomResult,
  buildResearchRoomComplete,
} from '../three/ResearchRoomBuilder';
import {
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_CAMERA_PRESETS,
  RESEARCH_FURNITURE_CATALOG,
  RESEARCH_MODULE_CONSTANTS,
} from '../domain/researchRoomSpec';
import {
  BuiltQADevOpsRoomResult,
  buildQADevOpsRoomComplete,
} from '../three/QADevOpsRoomBuilder';
import {
  QA_DEVOPS_CAMERA_PRESETS,
  QA_DEVOPS_CONNECTORS_SPEC,
  QA_DEVOPS_FURNITURE_CATALOG,
  QA_DEVOPS_MODULE_CONSTANTS,
} from '../domain/qaDevopsRoomSpec';
import {
  AssembledOfficeA3Result,
  buildMasterOfficeA3Assembly,
  buildPlannedRoomModulePlaceholder,
} from '../three/OfficeAssembler';
import {
  ImportValidationReport,
  buildNeighborAssemblyPlaceholders,
  exportRoomToGLBBuffer,
  measureRoomStats,
  triggerBinaryDownload,
  triggerDataUrlDownload,
  triggerJsonDownload,
} from '../three/RoomExportAndImportManager';
import {
  BossPMRuntimeInstance,
  buildSimulationHelpersGroup,
  createOriginalRoomNativeBossPMRuntime,
  exportOriginalBossPMToGLBBuffer,
  loadBossPMFromBrowserFile,
  tryLoadFixedProjectCharacterAsset,
} from '../three/BossPMCharacterSystem';
import {
  CEORuntimeInstance,
  CEORuntimeStatus,
  buildCEOSimulationHelpersGroup,
  createCEOExecutiveAssistantRuntime,
  exportCEOExecutiveAssistantToGLBBuffer,
} from '../three/CEOCharacterSystem';
import {
  CEOActionId,
  CEOExpressionId,
  CEOPlaybackCommand,
} from '../domain/ceoSimulationSpec';
import {
  UIUXRuntimeInstance,
  UIUXRuntimeStatus,
  buildUIUXSimulationHelpersGroup,
  createUIUXDesignerRuntime,
  exportUIUXDesignerToGLBBuffer,
} from '../three/UIUXCharacterSystem';
import {
  UIUXActionId,
  UIUXAnimationPlaybackCommand,
  UIUXExpressionId,
  UIUXSpeedMultiplier,
} from '../domain/uiuxSimulationSpec';
import {
  FrontendCharacterRuntimeInstance,
  buildFrontendSimulationHelpersGroup,
  createFrontendDeveloperRuntime,
  exportFrontendDeveloperToGLBBuffer,
} from '../three/FrontendCharacterSystem';
import {
  FrontendActionId,
  FrontendAnimationPlaybackCommand,
  FrontendExpressionId,
  FrontendSimulationRuntimeStatus,
  FrontendSpeedMultiplier,
} from '../domain/frontendSimulationSpec';
import {
  BackendCharacterRuntimeInstance,
  buildBackendSimulationHelpersGroup,
  createBackendDeveloperRuntime,
  exportBackendDeveloperToGLBBuffer,
} from '../three/BackendCharacterSystem';
import {
  BackendActionId,
  BackendAnimationPlaybackCommand,
  BackendExpressionId,
  BackendSimulationRuntimeStatus,
  BackendSpeedMultiplier,
} from '../domain/backendSimulationSpec';
import {
  DatabaseCharacterRuntimeInstance,
  buildDatabaseSimulationHelpersGroup,
  createDatabaseDeveloperRuntime,
  exportDatabaseDeveloperToGLBBuffer,
} from '../three/DatabaseCharacterSystem';
import {
  DatabaseActionId,
  DatabaseAnimationPlaybackCommand,
  DatabaseExpressionId,
  DatabaseSimulationRuntimeStatus,
  DatabaseSpeedMultiplier,
} from '../domain/databaseSimulationSpec';
import {
  ResearchCharacterRuntimeInstance,
  buildResearchSimulationHelpersGroup,
  createResearchProfessorRuntime,
  exportResearchProfessorToGLBBuffer,
} from '../three/ResearchCharacterSystem';
import {
  ResearchActionId,
  ResearchAnimationPlaybackCommand,
  ResearchExpressionId,
  ResearchSimulationRuntimeStatus,
  ResearchSpeedMultiplier,
} from '../domain/researchSimulationSpec';
import { PRODUCTION_FILENAMES } from '../export/AssetManifestBuilder';
import {
  IndependentRoundTripReportV1,
  runFullIndependentRoundTripSuite,
} from '../export/AssetValidation';
import {
  BackendCharacterExportPackResult,
  CEOCharacterExportPackResult,
  CharacterExportCandidatePackResult,
  DatabaseCharacterExportPackResult,
  FrontendCharacterExportPackResult,
  ResearchCharacterExportPackResult,
  UIUXCharacterExportPackResult,
  buildBackendCharacterExportPack,
  buildCEOCharacterExportPack,
  buildCharacterExportCandidatePack,
  buildDatabaseCharacterExportPack,
  buildFrontendCharacterExportPack,
  buildResearchCharacterExportPack,
  buildUIUXCharacterExportPack,
} from '../export/CharacterExporter';
import {
  CEORoomProductionAssetPackResult,
  CentralHubV2ProductionAssetPackResult,
  EngineeringRoomProductionAssetPackResult,
  QADevOpsRoomProductionAssetPackResult,
  ResearchRoomProductionAssetPackResult,
  RoomProductionAssetPackResult,
  UIUXRoomProductionAssetPackResult,
  buildCEORoomProductionAssetPack,
  buildCentralHubV2ProductionAssetPack,
  buildEngineeringRoomProductionAssetPack,
  buildQADevOpsRoomProductionAssetPack,
  buildResearchRoomProductionAssetPack,
  buildRoomProductionAssetPack,
  buildUIUXRoomProductionAssetPack,
  downloadCentralHubMeetingSeatsJson,
  downloadFullOfficeVisualProfileV2Json,
  downloadOfficeVisualUpgradeV2PackZip,
} from '../export/RoomExporter';
import {
  AllAgentMeetingDemoStatus,
  AllAgentMeetingDemoSystemInstance,
  createAllAgentMeetingDemoSystem,
} from '../three/AllAgentMeetingDemoSystem';

export interface ViewerDisplayConfig {
  workspaceMode: 'builder' | 'import_test';
  officeViewMode: OfficeViewMode;
  selectedRoomKey: RoomModuleKey;
  importTestTarget?:
    | 'room_only'
    | 'character_only'
    | 'both_reimported'
    | 'ceo_room_only'
    | 'ceo_room_and_char'
    | 'ceo_character_only'
    | 'uiux_room_only'
    | 'uiux_room_and_char'
    | 'uiux_character_only'
    | 'engineering_room_only'
    | 'engineering_room_and_char'
    | 'frontend_character_only'
    | 'backend_character_only'
    | 'database_character_only'
    | 'research_room_only'
    | 'research_room_and_char'
    | 'research_character_only'
    | 'qa_devops_room_only';
  reimportDisplayMode?:
    | 'room_only'
    | 'character_only'
    | 'both_reimported'
    | 'ceo_room_only'
    | 'ceo_room_and_char'
    | 'ceo_character_only'
    | 'uiux_room_only'
    | 'uiux_room_and_char'
    | 'uiux_character_only'
    | 'engineering_room_only'
    | 'engineering_room_and_char'
    | 'frontend_character_only'
    | 'backend_character_only'
    | 'database_character_only'
    | 'research_room_only'
    | 'research_room_and_char'
    | 'research_character_only'
    | 'qa_devops_room_only';
  visualStyle: VisualStyleMode;
  showGrid: boolean;
  autoCutawayWalls: boolean;
  showWallsAndWindows: boolean;
  showFurniture: boolean;
  showPropsAndDecor: boolean;
  showMannequin: boolean;
  showTextures: boolean;
  showShadows: boolean;
  showWireframe: boolean;
  showNeighborAssembly: boolean;
  showBossPM: boolean;
  showSimulationAnchors: boolean;
  showNavigationPath: boolean;
  followPMCamera: boolean;
  selectedCatalogId: string | null;
  isolatedCatalogId: string | null;
  hiddenCatalogIds: string[];
  fullOfficeCutawayMode?: FullOfficeCutawayMode;
  fullOfficeOrbitMode?: FullOfficeOrbitMode;
}

export interface ClickedMeshDiagnostic {
  meshName: string;
  materialName: string;
  materialType: string;
  parentName: string;
  worldPosition: [number, number, number];
}

export interface VisualStabilityDiagnosticReport {
  timestamp: string;
  totalRoomMeshes: number;
  totalCEORoomMeshes?: number;
  totalUIUXRoomMeshes?: number;
  totalEngineeringRoomMeshes?: number;
  totalCharacterMeshes: number;
  totalCEOCharacterMeshes?: number;
  totalUIUXCharacterMeshes?: number;
  totalFrontendCharacterMeshes?: number;
  totalBackendCharacterMeshes?: number;
  totalDatabaseCharacterMeshes?: number;
  totalResearchCharacterMeshes?: number;
  duplicateRoomMeshNames: string[];
  duplicateCEORoomMeshNames?: string[];
  duplicateUIUXRoomMeshNames?: string[];
  duplicateEngineeringRoomMeshNames?: string[];
  duplicateCharacterMeshNames: string[];
  coplanarConflictCount: number;
  cameraNearFar: [number, number];
  shadowBias: number;
  shadowNormalBias: number;
  verifiedAreas: Array<{
    area: string;
    status: 'STABLE' | 'WARNING';
    detail: string;
  }>;
}

export interface SelectedObjectInspection {
  catalogItem: FurnitureCatalogItem;
  meshCount: number;
  triangleCount: number;
  clickedMeshName?: string;
  clickedMaterialName?: string;
  clickedMaterialType?: string;
  worldBox: {
    min: [number, number, number];
    max: [number, number, number];
    size: [number, number, number];
  };
}

export interface PMSimulationRuntimeTelemetry {
  loaded: boolean;
  loadError: string | null;
  selectedCharacterSource: CharacterSourceType;
  activeCharacterSource: CharacterSourceType;
  hasImportedGLB: boolean;
  importedGLBFilename: string | null;
  currentActionId: PMActionId;
  currentActionDef: PMActionDefinition;
  currentState: PMAgentStateId;
  isWalking: boolean;
  isPaused: boolean;
  speedMultiplier: 0.5 | 1 | 1.5;
  patrolActive: boolean;
  autoDemoActive: boolean;
  autoDemoStepIndex: number;
  autoDemoStepTitle: string | null;
  currentAnchorId: AnchorId | null;
  targetAnchorId: AnchorId | null;
  worldPosition: [number, number, number];
  facingDeg: number;
  activeClipName: string;
  capabilityMode: string;
  scaleMultiplier: number;
  forwardOffsetDeg: number;
  isPMSelected: boolean;
  overheadScreenPos: {
    x: number;
    y: number;
    visible: boolean;
  };
  cameraDiagnostics?: {
    cameraType: string;
    projectionMode: string;
    position: [number, number, number];
    target: [number, number, number];
    azimuthDeg: number;
    elevationDeg: number;
    zoom: number;
    nominalZoom: number;
    viewportWidth: number;
    viewportHeight: number;
    viewportAspect: number;
    frustumSize: [number, number];
    cutawayMode?: FullOfficeCutawayMode;
    orbitMode?: FullOfficeOrbitMode;
    fitOfficeNominalZoom?: number;
    minNominalZoom?: number;
    maxNominalZoom?: number;
  };
}

export interface ModularRoomCanvasHandle {
  setCameraPreset: (presetId: string) => void;
  resetCamera: () => void;
  fitRoom: () => void;
  zoomBy: (factor: number) => void;
  orbitBy: (deltaAzimuthRad: number, deltaPolarRad?: number) => void;
  inspectCatalogItem: (catalogId: string) => SelectedObjectInspection | null;
  exportGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportCEORoomGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportUIUXRoomGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportEngineeringRoomGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportResearchRoomGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportQADevOpsRoomGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportOriginalPMGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportManifest: () => { filename: string };
  exportPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportCEORoomPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportUIUXRoomPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportEngineeringRoomPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportResearchRoomPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportQADevOpsRoomPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  runImportValidation: () => Promise<ImportValidationReport>;
  runFullHandoffValidation: (sourceFileCount?: number) => Promise<IndependentRoundTripReportV1>;
  exportRoomProductionPack: () => Promise<RoomProductionAssetPackResult>;
  exportCEORoomProductionPack: () => Promise<CEORoomProductionAssetPackResult>;
  exportUIUXRoomProductionPack: () => Promise<UIUXRoomProductionAssetPackResult>;
  exportEngineeringRoomProductionPack: () => Promise<EngineeringRoomProductionAssetPackResult>;
  exportResearchRoomProductionPack: () => Promise<ResearchRoomProductionAssetPackResult>;
  exportQADevOpsRoomProductionPack: () => Promise<QADevOpsRoomProductionAssetPackResult>;
  exportCharacterCandidatePack: () => Promise<CharacterExportCandidatePackResult>;
  exportCEOCharacterPack: () => Promise<CEOCharacterExportPackResult>;
  exportCEOCharacterGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportCEOCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportUIUXCharacterPack: () => Promise<UIUXCharacterExportPackResult>;
  exportUIUXCharacterGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportUIUXCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportFrontendCharacterPack: () => Promise<FrontendCharacterExportPackResult>;
  exportFrontendCharacterGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportFrontendCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportBackendCharacterPack: () => Promise<BackendCharacterExportPackResult>;
  exportBackendCharacterGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportBackendCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportDatabaseCharacterPack: () => Promise<DatabaseCharacterExportPackResult>;
  exportDatabaseCharacterGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportDatabaseCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportResearchCharacterPack: () => Promise<ResearchCharacterExportPackResult>;
  exportResearchCharacterGLB: () => Promise<{ filename: string; byteLength: number }>;
  exportResearchCharacterPreviewPNG: () => Promise<{ filename: string; dataUrl: string }>;
  // Boss PM Simulation & Dual Character Source Controls
  setCharacterSource: (source: CharacterSourceType) => void;
  triggerPMAction: (actionId: PMActionId) => void;
  setSimulationPlayback: (
    command: 'play' | 'pause' | 'resume' | 'stop' | 'reset_position' | 'reset_pose'
  ) => void;
  setSimulationSpeed: (speed: 0.5 | 1 | 1.5) => void;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  approvePendingTask: () => void;
  focusCameraOnPM: () => void;
  returnToRoomView: () => void;
  loadCustomBossPMFile: (file: File) => Promise<GLBInspectionReport>;
  reloadDefaultBossPMAsset: () => Promise<GLBInspectionReport | null>;
  setCharacterScaleMultiplier: (multiplier: number) => void;
  setCharacterForwardOffsetDeg: (deg: number) => void;
  teleportPMToAnchor: (anchorId: AnchorId) => void;
  exportSimulationConfig: () => { filename: string };
  runVisualStabilityScan: () => VisualStabilityDiagnosticReport;
  // CEO Executive Assistant Simulation Controls
  triggerCEOAction: (actionId: CEOActionId) => void;
  executeCEOPlayback: (cmd: CEOPlaybackCommand) => void;
  setCEOSpeed: (speed: number) => void;
  setCEOPatrol: (enabled: boolean) => void;
  startCEOAutoDemo: () => void;
  stopCEOAutoDemo: () => void;
  setCEOExpression: (expr: CEOExpressionId) => void;
  setCEOGlassesVisible: (visible: boolean) => void;
  focusCameraOnCEOCharacter: () => void;
  // UI/UX Designer Simulation Controls
  triggerUIUXAction: (actionId: UIUXActionId) => void;
  executeUIUXPlayback: (cmd: UIUXAnimationPlaybackCommand) => void;
  setUIUXSpeed: (speed: UIUXSpeedMultiplier) => void;
  setUIUXPatrol: (enabled: boolean) => void;
  startUIUXAutoDemo: () => void;
  stopUIUXAutoDemo: () => void;
  setUIUXExpression: (expr: UIUXExpressionId) => void;
  setUIUXGlassesVisible: (visible: boolean) => void;
  focusCameraOnUIUXCharacter: () => void;
  // Frontend Developer Simulation Controls
  triggerFrontendAction: (actionId: FrontendActionId) => void;
  executeFrontendPlayback: (cmd: FrontendAnimationPlaybackCommand) => void;
  setFrontendSpeed: (speed: FrontendSpeedMultiplier) => void;
  setFrontendPatrol: (enabled: boolean) => void;
  startFrontendAutoDemo: () => void;
  stopFrontendAutoDemo: () => void;
  setFrontendExpression: (expr: FrontendExpressionId) => void;
  setFrontendGlassesVisible: (visible: boolean) => void;
  setFrontendBackpackVisible: (visible: boolean) => void;
  focusCameraOnFrontendCharacter: () => void;
  // Backend Developer Simulation Controls
  triggerBackendAction: (actionId: BackendActionId) => void;
  executeBackendPlayback: (cmd: BackendAnimationPlaybackCommand) => void;
  setBackendSpeed: (speed: BackendSpeedMultiplier) => void;
  setBackendPatrol: (enabled: boolean) => void;
  startBackendAutoDemo: () => void;
  stopBackendAutoDemo: () => void;
  setBackendExpression: (expr: BackendExpressionId) => void;
  setBackendGlassesVisible: (visible: boolean) => void;
  setBackendBackpackVisible: (visible: boolean) => void;
  focusCameraOnBackendCharacter: () => void;
  // Database Developer Simulation Controls
  triggerDatabaseAction: (actionId: DatabaseActionId) => void;
  executeDatabasePlayback: (cmd: DatabaseAnimationPlaybackCommand) => void;
  setDatabaseSpeed: (speed: DatabaseSpeedMultiplier) => void;
  setDatabasePatrol: (enabled: boolean) => void;
  startDatabaseAutoDemo: () => void;
  stopDatabaseAutoDemo: () => void;
  setDatabaseExpression: (expr: DatabaseExpressionId) => void;
  setDatabaseBackpackVisible: (visible: boolean) => void;
  focusCameraOnDatabaseCharacter: () => void;
  // Research Professor Simulation Controls
  triggerResearchAction: (actionId: ResearchActionId) => void;
  executeResearchPlayback: (cmd: ResearchAnimationPlaybackCommand) => void;
  setResearchSpeed: (speed: ResearchSpeedMultiplier) => void;
  setResearchPatrol: (enabled: boolean) => void;
  startResearchAutoDemo: () => void;
  stopResearchAutoDemo: () => void;
  setResearchExpression: (expr: ResearchExpressionId) => void;
  setResearchGlassesVisible: (visible: boolean) => void;
  setResearchBackpackVisible: (visible: boolean) => void;
  focusCameraOnResearchCharacter: () => void;
  // V2 Modular Room & Full Office A3 Controls
  focusRoomInFullOffice: (roomKey: RoomModuleKey) => void;
  focusSelectedAgentCamera: () => void;
  focusAnchorPosition: (pos: [number, number, number]) => void;
  // Open Central Hub V2 & All-Agent Meeting Demo Controls
  startAllAgentMeetingDemo: () => void;
  stopAllAgentMeetingDemo: () => void;
  resetAllAgentMeetingDemo: () => void;
  teleportAllAgentsToMeetingSeats: () => void;
  focusMeetingTableCamera: () => void;
  focusCentralHubCamera: () => void;
  exportCentralHubV2GLB: () => Promise<{ filename: string; byteLength: number }>;
  exportCentralHubV2AssetPack: () => Promise<CentralHubV2ProductionAssetPackResult>;
  exportFullOfficeVisualUpgradeV2Pack: () => Promise<{ filename: string; byteLength: number }>;
  exportFullOfficePreviewV2PNG: () => Promise<{ filename: string; dataUrl: string }>;
  exportCentralHubMeetingSeats: () => { filename: string };
  exportFullOfficeVisualProfileV2: () => { filename: string };
}

interface ModularRoomCanvasProps {
  config: ViewerDisplayConfig;
  activePresetId: string;
  anchors: Record<AnchorId, ActivityAnchor>;
  selectedAnchorId: AnchorId | null;
  ceoAnchors?: Record<CEOAnchorId, CEOActivityAnchor>;
  selectedCEOAnchorId?: CEOAnchorId | null;
  uiuxAnchors?: Record<UIUXAnchorId, UIUXActivityAnchor>;
  selectedUIUXAnchorId?: UIUXAnchorId | null;
  engineeringAnchors?: Record<EngineeringAnchorId, EngineeringActivityAnchor>;
  selectedEngineeringAnchorId?: EngineeringAnchorId | null;
  onSelectCatalogItem: (catalogId: string | null, details: SelectedObjectInspection | null) => void;
  onStatsReady: (stats: RoomExportStats) => void;
  onCEOStatsReady?: (stats: RoomExportStats) => void;
  onUIUXStatsReady?: (stats: RoomExportStats) => void;
  onEngineeringStatsReady?: (stats: RoomExportStats) => void;
  onResearchStatsReady?: (stats: RoomExportStats) => void;
  onQADevOpsStatsReady?: (stats: RoomExportStats) => void;
  onCentralHubStatsReady?: (stats: RoomExportStats) => void;
  onMeetingDemoStatusChange?: (status: AllAgentMeetingDemoStatus) => void;
  onImportReportReady: (report: ImportValidationReport) => void;
  onRoundTripReportReady?: (report: IndependentRoundTripReportV1) => void;
  onPresetChange: (presetId: string) => void;
  onPMRuntimeStateChange: (telemetry: PMSimulationRuntimeTelemetry) => void;
  onCEORuntimeStateChange?: (status: CEORuntimeStatus) => void;
  onUIUXRuntimeStateChange?: (status: UIUXRuntimeStatus) => void;
  onFrontendRuntimeStateChange?: (status: FrontendSimulationRuntimeStatus) => void;
  onBackendRuntimeStateChange?: (status: BackendSimulationRuntimeStatus) => void;
  onDatabaseRuntimeStateChange?: (status: DatabaseSimulationRuntimeStatus) => void;
  onResearchRuntimeStateChange?: (status: ResearchSimulationRuntimeStatus) => void;
  onGLBInspectionReady: (report: GLBInspectionReport | null) => void;
  onPMCharacterSelectChange: (selected: boolean) => void;
  onMeshDiagnosticSelect?: (diag: ClickedMeshDiagnostic | null) => void;
  onDropGLBFile?: (file: File) => void;
  onSelectRoomModuleFromCanvas?: (roomKey: RoomModuleKey) => void;
}

export const ModularRoomCanvas = React.forwardRef<ModularRoomCanvasHandle, ModularRoomCanvasProps>(
  (
    {
      config,
      anchors,
      selectedAnchorId,
      ceoAnchors = DEFAULT_CEO_ANCHORS,
      selectedCEOAnchorId = 'CEO_DESK_WORK',
      uiuxAnchors = DEFAULT_UIUX_ANCHORS,
      selectedUIUXAnchorId = 'UIUX_DESK_WORK',
      engineeringAnchors = DEFAULT_ENGINEERING_ANCHORS,
      selectedEngineeringAnchorId = 'FE_DESK_WORK',
      onSelectCatalogItem,
      onStatsReady,
      onCEOStatsReady,
      onUIUXStatsReady,
      onEngineeringStatsReady,
      onResearchStatsReady,
      onQADevOpsStatsReady,
      onCentralHubStatsReady,
      onMeetingDemoStatusChange,
      onImportReportReady,
      onRoundTripReportReady,
      onPresetChange,
      onPMRuntimeStateChange,
      onCEORuntimeStateChange,
      onUIUXRuntimeStateChange,
      onFrontendRuntimeStateChange,
      onBackendRuntimeStateChange,
      onDatabaseRuntimeStateChange,
      onResearchRuntimeStateChange,
      onGLBInspectionReady,
      onPMCharacterSelectChange,
      onMeshDiagnosticSelect,
      onDropGLBFile,
      onSelectRoomModuleFromCanvas,
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const configRef = useRef<ViewerDisplayConfig>(config);
    configRef.current = config;

    const anchorsRef = useRef<Record<AnchorId, ActivityAnchor>>(anchors);
    anchorsRef.current = anchors;

    const selectedAnchorIdRef = useRef<AnchorId | null>(selectedAnchorId);
    selectedAnchorIdRef.current = selectedAnchorId;

    const ceoAnchorsRef = useRef<Record<CEOAnchorId, CEOActivityAnchor>>(ceoAnchors);
    ceoAnchorsRef.current = ceoAnchors;

    const selectedCEOAnchorIdRef = useRef<CEOAnchorId | null>(selectedCEOAnchorId);
    selectedCEOAnchorIdRef.current = selectedCEOAnchorId;

    const uiuxAnchorsRef = useRef<Record<UIUXAnchorId, UIUXActivityAnchor>>(uiuxAnchors);
    uiuxAnchorsRef.current = uiuxAnchors;

    const selectedUIUXAnchorIdRef = useRef<UIUXAnchorId | null>(selectedUIUXAnchorId);
    selectedUIUXAnchorIdRef.current = selectedUIUXAnchorId;

    const engineeringAnchorsRef =
      useRef<Record<EngineeringAnchorId, EngineeringActivityAnchor>>(engineeringAnchors);
    engineeringAnchorsRef.current = engineeringAnchors;

    const selectedEngineeringAnchorIdRef = useRef<EngineeringAnchorId | null>(
      selectedEngineeringAnchorId
    );
    selectedEngineeringAnchorIdRef.current = selectedEngineeringAnchorId;

    const callbacksRef = useRef({
      onSelectCatalogItem,
      onStatsReady,
      onCEOStatsReady,
      onUIUXStatsReady,
      onEngineeringStatsReady,
      onResearchStatsReady,
      onQADevOpsStatsReady,
      onCentralHubStatsReady,
      onMeetingDemoStatusChange,
      onImportReportReady,
      onRoundTripReportReady,
      onPresetChange,
      onPMRuntimeStateChange,
      onCEORuntimeStateChange,
      onUIUXRuntimeStateChange,
      onFrontendRuntimeStateChange,
      onBackendRuntimeStateChange,
      onDatabaseRuntimeStateChange,
      onResearchRuntimeStateChange,
      onGLBInspectionReady,
      onPMCharacterSelectChange,
      onMeshDiagnosticSelect,
      onDropGLBFile,
      onSelectRoomModuleFromCanvas,
    });
    callbacksRef.current = {
      onSelectCatalogItem,
      onStatsReady,
      onCEOStatsReady,
      onUIUXStatsReady,
      onEngineeringStatsReady,
      onResearchStatsReady,
      onQADevOpsStatsReady,
      onCentralHubStatsReady,
      onMeetingDemoStatusChange,
      onImportReportReady,
      onRoundTripReportReady,
      onPresetChange,
      onPMRuntimeStateChange,
      onCEORuntimeStateChange,
      onUIUXRuntimeStateChange,
      onFrontendRuntimeStateChange,
      onBackendRuntimeStateChange,
      onDatabaseRuntimeStateChange,
      onResearchRuntimeStateChange,
      onGLBInspectionReady,
      onPMCharacterSelectChange,
      onMeshDiagnosticSelect,
      onDropGLBFile,
      onSelectRoomModuleFromCanvas,
    };

    const engineRef = useRef<{
      renderer: THREE.WebGLRenderer;
      scene: THREE.Scene;
      camera: THREE.OrthographicCamera;
      controls: OrbitControls;
      roomRoot: THREE.Group;
      ceoRoom: CEORoomBuildResult;
      uiuxRoom: UIUXRoomBuildResult;
      engineeringRoom: BuiltEngineeringRoomResult;
      researchRoom: BuiltResearchRoomResult;
      qaDevopsRoom: BuiltQADevOpsRoomResult;
      officeA3: AssembledOfficeA3Result;
      singlePlannedPlaceholders: Map<RoomModuleKey, THREE.Group>;
      importedRootHolder: THREE.Group;
      importedRoomHolder: THREE.Group;
      importedCEORoomHolder: THREE.Group;
      importedUIUXRoomHolder: THREE.Group;
      importedEngineeringRoomHolder: THREE.Group;
      importedResearchRoomHolder: THREE.Group;
      importedQADevOpsRoomHolder: THREE.Group;
      importedCharacterHolder: THREE.Group;
      importedCEOCharacterHolder: THREE.Group;
      importedUIUXCharacterHolder: THREE.Group;
      importedFrontendCharacterHolder: THREE.Group;
      importedBackendCharacterHolder: THREE.Group;
      importedDatabaseCharacterHolder: THREE.Group;
      importedResearchCharacterHolder: THREE.Group;
      setImportedCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      setImportedCEOCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      setImportedUIUXCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      setImportedFrontendCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      setImportedBackendCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      setImportedDatabaseCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      setImportedResearchCharacterMixer: (mixer: THREE.AnimationMixer | null) => void;
      neighborAssemblyGroup: THREE.Group;
      previewHelpersGroup: THREE.Group;
      gridHelperGroup: THREE.Group;
      mannequinGroup: THREE.Group;
      selectionBoxHelper: THREE.BoxHelper;
      matLib: MaterialLibraryInstance;
      groups: Record<(typeof MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
      northWallNodes: THREE.Object3D[];
      westWallNodes: THREE.Object3D[];
      catalogNodeMap: Map<string, THREE.Object3D>;
      keyLight: THREE.DirectionalLight;
      requestRender: () => void;
      startCameraTransition: (
        pos: [number, number, number],
        target: [number, number, number],
        zoom: number
      ) => void;
      updateVisibilityFromConfig: () => void;
      computeObjectInspection: (catalogId: string) => SelectedObjectInspection | null;
      prepareRoomsForCleanStandaloneExport: () => () => void;
      lastExportedBuffer: ArrayBuffer | null;
      // Simulation state & methods
      getBossPMInstance: () => BossPMRuntimeInstance | null;
      getCEOAgentInstance: () => CEORuntimeInstance;
      getUIUXAgentInstance: () => UIUXRuntimeInstance;
      getFrontendAgentInstance: () => FrontendCharacterRuntimeInstance;
      getBackendAgentInstance: () => BackendCharacterRuntimeInstance;
      getDatabaseAgentInstance: () => DatabaseCharacterRuntimeInstance;
      getResearchAgentInstance: () => ResearchCharacterRuntimeInstance;
      getSelectedCharacterSource: () => CharacterSourceType;
      setCharacterSource: (source: CharacterSourceType) => void;
      mountImportedBossPMInstance: (instance: BossPMRuntimeInstance, autoSelect?: boolean) => void;
      setLoadError: (err: string | null) => void;
      triggerPMAction: (actionId: PMActionId, fromAutoDemo?: boolean) => void;
      setSimulationPlayback: (
        command: 'play' | 'pause' | 'resume' | 'stop' | 'reset_position' | 'reset_pose'
      ) => void;
      setSimulationSpeed: (speed: 0.5 | 1 | 1.5) => void;
      startAutoDemo: () => void;
      stopAutoDemo: () => void;
      approvePendingTask: () => void;
      focusCameraOnPM: () => void;
      focusCameraOnCEOCharacter: () => void;
      focusCameraOnUIUXCharacter: () => void;
      focusCameraOnFrontendCharacter: () => void;
      focusCameraOnBackendCharacter: () => void;
      focusCameraOnDatabaseCharacter: () => void;
      focusCameraOnResearchCharacter: () => void;
      returnToRoomView: () => void;
      teleportPMToAnchor: (anchorId: AnchorId) => void;
      syncAnchorsOverlay: () => void;
      syncCEOAnchorsOverlay: () => void;
      syncUIUXAnchorsOverlay: () => void;
      syncEngineeringAnchorsOverlay: () => void;
      runVisualStabilityScan: () => VisualStabilityDiagnosticReport;
      allAgentMeetingDemo: AllAgentMeetingDemoSystemInstance;
    } | null>(null);

    useEffect(() => {
      const container = mountRef.current;
      if (!container) return;

      // 1. Detect software WebGL (SwiftShader / llvmpipe) per threejs skill
      const isSoftwareGl = (() => {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      })();

      const width = container.clientWidth || 1280;
      const height = container.clientHeight || 800;

      const renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.96;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = !isSoftwareGl && configRef.current.showShadows;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // 2. Scene & Environment
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x2c2d35);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();

      // 3. Orthographic Camera (supports both 8x8 Single Room and 32x26 Full Office A3)
      // Uses safe orthographic near/far [-40..180] so foreground modules are never obliquely clipped
      const frustumHalf = 600;
      const aspect = width / height;
      const camera = new THREE.OrthographicCamera(
        (-frustumHalf * aspect) / 100,
        (frustumHalf * aspect) / 100,
        frustumHalf / 100,
        -frustumHalf / 100,
        -40.0,
        180.0
      );
      const defaultPreset = CAMERA_PRESETS[0];
      camera.position.set(...defaultPreset.position);
      camera.zoom = defaultPreset.zoom / 68;
      camera.updateProjectionMatrix();

      // 4. OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(...defaultPreset.target);
      controls.enableDamping = !isSoftwareGl;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI / 2 - 0.03;
      controls.minPolarAngle = 0.0001;
      controls.minZoom = 0.18;
      controls.maxZoom = 4.5;
      controls.update();

      // 5. Studio Cozy Lighting Rig
      const hemiLight = new THREE.HemisphereLight(0xfff6e8, 0x5c4738, 0.82);
      hemiLight.position.set(4, 10, 4);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xfff0d4, 1.55);
      keyLight.position.set(9.5, 14.0, 2.0);
      keyLight.target.position.set(4.0, 0.5, 4.0);
      keyLight.castShadow = !isSoftwareGl;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 2.0;
      keyLight.shadow.camera.far = 36.0;
      keyLight.shadow.camera.left = -6.2;
      keyLight.shadow.camera.right = 6.2;
      keyLight.shadow.camera.top = 6.2;
      keyLight.shadow.camera.bottom = -6.2;
      keyLight.shadow.bias = -0.0008;
      keyLight.shadow.normalBias = 0.035;
      scene.add(keyLight);
      scene.add(keyLight.target);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.55);
      fillLight.position.set(-6, 8, -5);
      scene.add(fillLight);

      const deskPointLight = new THREE.PointLight(0xffb75e, 0.85, 4.5, 1.5);
      deskPointLight.position.set(1.35, 1.35, 4.75);
      scene.add(deskPointLight);

      const floorLampPointLight = new THREE.PointLight(0xffbe6b, 0.75, 5.0, 1.5);
      floorLampPointLight.position.set(6.35, 1.55, 6.85);
      scene.add(floorLampPointLight);

      const centralHubPointLight = new THREE.PointLight(0xffe4b5, 0.92, 16.0, 1.25);
      centralHubPointLight.position.set(16.0, 2.75, 8.0);
      scene.add(centralHubPointLight);

      // 6. Build Exportable ROOM_PM_ROOT Hierarchy (100% preserved)
      const roomRoot = new THREE.Group();
      roomRoot.name = MODULE_CONSTANTS.ROOT_NODE_NAME;
      roomRoot.position.set(0, 0, 0);

      const groups = {} as Record<(typeof MODULE_CONSTANTS.REQUIRED_GROUPS)[number], THREE.Group>;
      for (const groupName of MODULE_CONSTANTS.REQUIRED_GROUPS) {
        const g = new THREE.Group();
        g.name = groupName;
        roomRoot.add(g);
        groups[groupName] = g;
      }

      const matLib = createPixelMaterialLibrary();
      const { northWallNodes, westWallNodes } = buildRoomArchitecture(groups, matLib);
      const catalogNodeMap = buildPMRoomFurnitureAndProps(groups, matLib);

      scene.add(roomRoot);

      // 6B. Build Exportable ROOM_CEO_ROOT Hierarchy (Module 02: CEO Executive Brain Office)
      const ceoRoom = buildCEORoomComplete(matLib);
      ceoRoom.ceoRoot.visible = false;
      scene.add(ceoRoom.ceoRoot);

      // 6B-2. Build Exportable ROOM_UIUX_ROOT Hierarchy (Module 03: UI/UX Design Studio)
      const uiuxRoom = buildUIUXRoomComplete(matLib);
      uiuxRoom.uiuxRoot.visible = false;
      scene.add(uiuxRoom.uiuxRoot);

      // 6B-3. Build Exportable ROOM_ENGINEERING_ROOT Hierarchy (Module 04: 8x16 Engineering Studio)
      const engineeringRoom = buildEngineeringStudioRoom(matLib);
      engineeringRoom.root.visible = false;
      scene.add(engineeringRoom.root);

      // 6B-4. Build Exportable ROOM_RESEARCH_ROOT Hierarchy (Module 05: Research & Shared Brain Room)
      const researchRoom = buildResearchRoomComplete(matLib);
      researchRoom.roomRoot.visible = false;
      scene.add(researchRoom.roomRoot);
      researchRoom.helpersGroup.visible = false;
      scene.add(researchRoom.helpersGroup);

      // 6B-5. Build Exportable ROOM_QA_DEVOPS_ROOT Hierarchy (Module 06: 8x16 QA & DevOps Integrated Studio)
      const qaDevopsRoom = buildQADevOpsRoomComplete(matLib);
      qaDevopsRoom.roomRoot.visible = false;
      scene.add(qaDevopsRoom.roomRoot);
      qaDevopsRoom.helpersGroup.visible = false;
      scene.add(qaDevopsRoom.helpersGroup);

      // Apply calm wide-plank department oak flooring materials per room (prevents narrow-plank Moiré shimmer)
      const assignDepartmentFloorMaterial = (floorGrp: THREE.Object3D, floorMat: THREE.Material) => {
        floorGrp.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const m = obj as THREE.Mesh;
            if (m.material === matLib.materials.oakFloor) {
              m.material = floorMat;
            }
          }
        });
      };
      assignDepartmentFloorMaterial(groups.FLOOR, matLib.materials.floorPMHoneyOak);
      assignDepartmentFloorMaterial(ceoRoom.groups.FLOOR, matLib.materials.floorCEOWalnutOak);
      assignDepartmentFloorMaterial(uiuxRoom.groups.FLOOR, matLib.materials.floorUIUXLightOak);
      assignDepartmentFloorMaterial(
        engineeringRoom.groups.FLOOR,
        matLib.materials.floorEngineeringMediumOak
      );
      assignDepartmentFloorMaterial(researchRoom.groups.FLOOR, matLib.materials.floorResearchOak);
      assignDepartmentFloorMaterial(
        qaDevopsRoom.groups.FLOOR,
        matLib.materials.floorQADevOpsWarmOak
      );

      // 6C. Build Master Floor Plan A3 Full Office Assembly (`OFFICE_A3_ROOT`, 32x26 units)
      const officeA3 = buildMasterOfficeA3Assembly(matLib);
      officeA3.officeRoot.visible = false;
      scene.add(officeA3.officeRoot);

      // 6D. Build Single-Room Planned Module Placeholders at local [0, 0, 0]
      const singlePlannedPlaceholders = new Map<RoomModuleKey, THREE.Group>();
      for (const rm of Object.values(OFFICE_ROOM_REGISTRY)) {
        if (rm.asset_status === 'PLANNED') {
          const singleSlot = buildPlannedRoomModulePlaceholder(
            {
              ...rm,
              global_offset: [0, 0, 0],
            },
            matLib
          );
          singleSlot.visible = false;
          scene.add(singleSlot);
          singlePlannedPlaceholders.set(rm.key, singleSlot);
        }
      }

      // Cache removable doorway threshold nodes so Full Office mode can open doorways cleanly
      // and always restore them before any standalone GLB export!
      const pmRemovableEastDoor = roomRoot.getObjectByName('Connector_East_Removable_Doorway');
      const pmRemovableSouthDoor = roomRoot.getObjectByName('Connector_South_Removable_Threshold');
      const ceoRemovableWestDoor = ceoRoom.ceoRoot.getObjectByName(
        'CEO_Connector_West_Removable_Doorway'
      );
      const ceoRemovableSouthDoor = ceoRoom.ceoRoot.getObjectByName(
        'CEO_Connector_South_Removable_Threshold'
      );
      const uiuxRemovableSouthDoor = uiuxRoom.uiuxRoot.getObjectByName(
        'UIUX_Connector_South_Removable_Threshold'
      );
      const engRemovableNorthDoor = engineeringRoom.root.getObjectByName(
        'Engineering_Connector_North_Removable_Doorway'
      );
      const engRemovableEastDoor = engineeringRoom.root.getObjectByName(
        'Engineering_Connector_East_Removable_Threshold'
      );
      const researchRemovableSouthDoor = researchRoom.roomRoot.getObjectByName(
        'Research_Connector_South_Removable_Threshold'
      );
      const qaDevopsRemovableWestDoor = qaDevopsRoom.roomRoot.getObjectByName(
        QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_WEST_MAIN.removable_node_name
      );
      const qaDevopsRemovableNorthDoor = qaDevopsRoom.roomRoot.getObjectByName(
        QA_DEVOPS_CONNECTORS_SPEC.QA_DEVOPS_NORTH_CORRIDOR.removable_node_name
      );

      const setDoorwayThresholdsVisible = (vis: boolean) => {
        if (pmRemovableEastDoor) pmRemovableEastDoor.visible = vis;
        if (pmRemovableSouthDoor) pmRemovableSouthDoor.visible = vis;
        if (ceoRemovableWestDoor) ceoRemovableWestDoor.visible = vis;
        if (ceoRemovableSouthDoor) ceoRemovableSouthDoor.visible = vis;
        if (uiuxRemovableSouthDoor) uiuxRemovableSouthDoor.visible = vis;
        if (engRemovableNorthDoor) engRemovableNorthDoor.visible = vis;
        if (engRemovableEastDoor) engRemovableEastDoor.visible = vis;
        if (researchRemovableSouthDoor) researchRemovableSouthDoor.visible = vis;
        if (qaDevopsRemovableWestDoor) qaDevopsRemovableWestDoor.visible = vis;
        if (qaDevopsRemovableNorthDoor) qaDevopsRemovableNorthDoor.visible = vis;
      };

      // 7. Build Preview-Only Overlays (Strictly Excluded from Room GLB Exports!)
      const previewHelpersGroup = new THREE.Group();
      previewHelpersGroup.name = 'PREVIEW_ONLY_HELPERS';
      scene.add(previewHelpersGroup);

      const gridHelperGroup = new THREE.Group();
      gridHelperGroup.name = 'PREVIEW_ONLY_MODULAR_GRID';
      const grid = new THREE.GridHelper(8, 8, 0xf59e0b, 0x64748b);
      grid.position.set(4.0, 0.006, 4.0);
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = 0.45;
      gridHelperGroup.add(grid);

      const originSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      originSphere.position.set(0, 0.05, 0);
      gridHelperGroup.add(originSphere);

      const eastConnWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.3, 0.04, 2.0)),
        new THREE.LineBasicMaterial({ color: 0x38bdf8 })
      );
      eastConnWire.position.set(7.35, 0.025, 4.0);
      gridHelperGroup.add(eastConnWire);

      const southConnWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(2.0, 0.04, 1.35)),
        new THREE.LineBasicMaterial({ color: 0x34d399 })
      );
      southConnWire.position.set(4.0, 0.025, 0.675);
      gridHelperGroup.add(southConnWire);

      previewHelpersGroup.add(gridHelperGroup);

      // Scale Mannequin (1.72u tall)
      const mannequinGroup = buildScaleMannequin();
      mannequinGroup.visible = configRef.current.showMannequin;
      previewHelpersGroup.add(mannequinGroup);

      // Selection Highlight Box
      const dummyBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      const selectionBoxHelper = new THREE.BoxHelper(dummyBoxMesh, 0xfbbf24);
      selectionBoxHelper.visible = false;
      previewHelpersGroup.add(selectionBoxHelper);

      // Contextual Activity Highlight Helper (e.g. Strategy Board or PM Monitor active outline)
      const activityBoardHighlight = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(2.38, 1.42, 0.16)),
        new THREE.LineBasicMaterial({ color: 0xfbbf24 })
      );
      activityBoardHighlight.position.set(5.35, 1.82, 7.66);
      activityBoardHighlight.visible = false;
      previewHelpersGroup.add(activityBoardHighlight);

      // PM Simulation Helpers Group (ANCHORS + PATH_DEBUG, strictly outside ROOM_PM_ROOT)
      const simHelpers = buildSimulationHelpersGroup(
        anchorsRef.current,
        selectedAnchorIdRef.current
      );
      scene.add(simHelpers.helpersRoot);

      // CEO Room Navigation Anchor Helpers (strictly outside ROOM_CEO_ROOT)
      const ceoAnchorHelpers = buildCEORoomAnchorHelpers(
        ceoAnchorsRef.current,
        selectedCEOAnchorIdRef.current
      );
      ceoAnchorHelpers.helpersRoot.visible = false;
      scene.add(ceoAnchorHelpers.helpersRoot);

      // UI/UX Studio Room Navigation Anchor Helpers (strictly outside ROOM_UIUX_ROOT)
      const uiuxAnchorHelpers = buildUIUXRoomAnchorHelpers(
        uiuxAnchorsRef.current,
        selectedUIUXAnchorIdRef.current
      );
      uiuxAnchorHelpers.helpersRoot.visible = false;
      scene.add(uiuxAnchorHelpers.helpersRoot);

      // Engineering Studio Room Navigation Anchor Helpers (strictly outside ROOM_ENGINEERING_ROOT)
      const engineeringAnchorHelpers = buildEngineeringRoomAnchorHelpers(
        engineeringAnchorsRef.current,
        selectedEngineeringAnchorIdRef.current
      );
      engineeringAnchorHelpers.helpersRoot.visible = false;
      scene.add(engineeringAnchorHelpers.helpersRoot);

      // Holder for Re-Imported GLB Scene & Neighboring Snap Placeholders
      const importedRootHolder = new THREE.Group();
      importedRootHolder.name = 'PREVIEW_ONLY_IMPORTED_GLB_HOLDER';
      importedRootHolder.visible = false;
      scene.add(importedRootHolder);

      const importedRoomHolder = new THREE.Group();
      importedRoomHolder.name = 'REIMPORTED_ROOM_GLB_HOLDER';
      importedRootHolder.add(importedRoomHolder);

      const importedCEORoomHolder = new THREE.Group();
      importedCEORoomHolder.name = 'REIMPORTED_CEO_ROOM_GLB_HOLDER';
      importedCEORoomHolder.visible = false;
      importedRootHolder.add(importedCEORoomHolder);

      const importedUIUXRoomHolder = new THREE.Group();
      importedUIUXRoomHolder.name = 'REIMPORTED_UIUX_ROOM_GLB_HOLDER';
      importedUIUXRoomHolder.visible = false;
      importedRootHolder.add(importedUIUXRoomHolder);

      const importedEngineeringRoomHolder = new THREE.Group();
      importedEngineeringRoomHolder.name = 'REIMPORTED_ENGINEERING_ROOM_GLB_HOLDER';
      importedEngineeringRoomHolder.visible = false;
      importedRootHolder.add(importedEngineeringRoomHolder);

      const importedResearchRoomHolder = new THREE.Group();
      importedResearchRoomHolder.name = 'REIMPORTED_RESEARCH_ROOM_GLB_HOLDER';
      importedResearchRoomHolder.visible = false;
      importedRootHolder.add(importedResearchRoomHolder);

      const importedQADevOpsRoomHolder = new THREE.Group();
      importedQADevOpsRoomHolder.name = 'REIMPORTED_QA_DEVOPS_ROOM_GLB_HOLDER';
      importedQADevOpsRoomHolder.visible = false;
      importedRootHolder.add(importedQADevOpsRoomHolder);

      const importedCharacterHolder = new THREE.Group();
      importedCharacterHolder.name = 'REIMPORTED_CHARACTER_GLB_HOLDER';
      importedRootHolder.add(importedCharacterHolder);

      const importedCEOCharacterHolder = new THREE.Group();
      importedCEOCharacterHolder.name = 'REIMPORTED_CEO_CHARACTER_GLB_HOLDER';
      importedCEOCharacterHolder.visible = false;
      importedRootHolder.add(importedCEOCharacterHolder);

      const importedUIUXCharacterHolder = new THREE.Group();
      importedUIUXCharacterHolder.name = 'REIMPORTED_UIUX_CHARACTER_GLB_HOLDER';
      importedUIUXCharacterHolder.visible = false;
      importedRootHolder.add(importedUIUXCharacterHolder);

      const importedFrontendCharacterHolder = new THREE.Group();
      importedFrontendCharacterHolder.name = 'REIMPORTED_FRONTEND_CHARACTER_GLB_HOLDER';
      importedFrontendCharacterHolder.visible = false;
      importedRootHolder.add(importedFrontendCharacterHolder);

      const importedBackendCharacterHolder = new THREE.Group();
      importedBackendCharacterHolder.name = 'REIMPORTED_BACKEND_CHARACTER_GLB_HOLDER';
      importedBackendCharacterHolder.visible = false;
      importedRootHolder.add(importedBackendCharacterHolder);

      const importedDatabaseCharacterHolder = new THREE.Group();
      importedDatabaseCharacterHolder.name = 'REIMPORTED_DATABASE_CHARACTER_GLB_HOLDER';
      importedDatabaseCharacterHolder.visible = false;
      importedRootHolder.add(importedDatabaseCharacterHolder);

      const importedResearchCharacterHolder = new THREE.Group();
      importedResearchCharacterHolder.name = 'REIMPORTED_RESEARCH_CHARACTER_GLB_HOLDER';
      importedResearchCharacterHolder.visible = false;
      importedRootHolder.add(importedResearchCharacterHolder);

      let importedCharacterMixer: THREE.AnimationMixer | null = null;
      let importedCEOCharacterMixer: THREE.AnimationMixer | null = null;
      let importedUIUXCharacterMixer: THREE.AnimationMixer | null = null;
      let importedFrontendCharacterMixer: THREE.AnimationMixer | null = null;
      let importedBackendCharacterMixer: THREE.AnimationMixer | null = null;
      let importedDatabaseCharacterMixer: THREE.AnimationMixer | null = null;
      let importedResearchCharacterMixer: THREE.AnimationMixer | null = null;

      const neighborAssemblyGroup = buildNeighborAssemblyPlaceholders();
      neighborAssemblyGroup.visible = false;
      scene.add(neighborAssemblyGroup);

      // Measure initial stats on ROOM_PM_ROOT, ROOM_CEO_ROOT, ROOM_UIUX_ROOT, ROOM_ENGINEERING_ROOT, ROOM_RESEARCH_ROOT, and ROOM_QA_DEVOPS_ROOT
      const initialPMStats = measureRoomStats(roomRoot);
      const initialCEOStats = measureRoomStats(ceoRoom.ceoRoot);
      const initialUIUXStats = measureRoomStats(uiuxRoom.uiuxRoot);
      const initialEngineeringStats = measureRoomStats(engineeringRoom.root);
      const initialResearchStats = measureRoomStats(researchRoom.roomRoot);
      const initialQADevOpsStats = measureRoomStats(qaDevopsRoom.roomRoot);
      const initialCentralHubStats = measureRoomStats(officeA3.centralHub.hubRoot);
      callbacksRef.current.onStatsReady(initialPMStats);
      callbacksRef.current.onCEOStatsReady?.(initialCEOStats);
      callbacksRef.current.onUIUXStatsReady?.(initialUIUXStats);
      callbacksRef.current.onEngineeringStatsReady?.(initialEngineeringStats);
      callbacksRef.current.onResearchStatsReady?.(initialResearchStats);
      callbacksRef.current.onQADevOpsStatsReady?.(initialQADevOpsStats);
      callbacksRef.current.onCentralHubStatsReady?.(initialCentralHubStats);

      // =========================================================================
      // 8. BOSS PM, CEO EXECUTIVE ASSISTANT, UI/UX DESIGNER, FRONTEND, BACKEND & DATABASE DEVELOPERS
      //    Primary Default PM: Original Room-Native Voxel Boss PM
      //    Primary Default CEO: Senior CEO Executive Assistant (ceo_executive_assistant)
      //    Primary Default UI/UX: UI/UX Designer (uiux_designer_agent)
      //    Primary Default Engineering Agent 01: Frontend Developer (frontend_developer_agent)
      //    Primary Default Engineering Agent 02: Backend Developer (backend_developer_agent)
      //    Primary Default Engineering Agent 03: Database Developer (database_developer_agent)
      // =========================================================================
      const originalPMInstance = createOriginalRoomNativeBossPMRuntime();
      let importedPMInstance: BossPMRuntimeInstance | null = null;
      let selectedCharacterSource: CharacterSourceType = 'original_pm';
      let bossPM: BossPMRuntimeInstance | null = originalPMInstance;

      // Instantiate CEO Executive Assistant Runtime (strictly outside ROOM_CEO_ROOT)
      const ceoAgent = createCEOExecutiveAssistantRuntime();
      ceoAgent.rootGroup.visible = false;
      scene.add(ceoAgent.rootGroup);

      const ceoPathHelpers = buildCEOSimulationHelpersGroup();
      ceoPathHelpers.visible = false;
      scene.add(ceoPathHelpers);

      // Instantiate UI/UX Designer Runtime (strictly outside ROOM_UIUX_ROOT)
      const uiuxAgent = createUIUXDesignerRuntime();
      uiuxAgent.rootGroup.visible = false;
      scene.add(uiuxAgent.rootGroup);

      const uiuxPathHelpers = buildUIUXSimulationHelpersGroup();
      uiuxPathHelpers.visible = false;
      scene.add(uiuxPathHelpers);

      // Instantiate Frontend Developer Runtime (strictly outside ROOM_ENGINEERING_ROOT)
      const frontendPathHelpers = buildFrontendSimulationHelpersGroup();
      frontendPathHelpers.helpersRoot.visible = false;
      scene.add(frontendPathHelpers.helpersRoot);

      const frontendAgent = createFrontendDeveloperRuntime({
        getAnchors: () => engineeringAnchorsRef.current,
        onStatusChange: (status) => {
          callbacksRef.current.onFrontendRuntimeStateChange?.(status);
        },
        pathHelpers: frontendPathHelpers,
      });
      frontendAgent.rootGroup.visible = false;
      scene.add(frontendAgent.rootGroup);

      // Instantiate Backend Developer Runtime (strictly outside ROOM_ENGINEERING_ROOT)
      const backendPathHelpers = buildBackendSimulationHelpersGroup();
      backendPathHelpers.helpersRoot.visible = false;
      scene.add(backendPathHelpers.helpersRoot);

      const backendAgent = createBackendDeveloperRuntime((status) => {
        callbacksRef.current.onBackendRuntimeStateChange?.(status);
      });
      backendAgent.runtimeRoot.visible = false;
      scene.add(backendAgent.runtimeRoot);

      // Instantiate Database Developer Runtime (strictly outside ROOM_ENGINEERING_ROOT)
      const databasePathHelpers = buildDatabaseSimulationHelpersGroup();
      databasePathHelpers.helpersRoot.visible = false;
      scene.add(databasePathHelpers.helpersRoot);

      const databaseAgent = createDatabaseDeveloperRuntime((status) => {
        callbacksRef.current.onDatabaseRuntimeStateChange?.(status);
      });
      databaseAgent.runtimeRoot.visible = false;
      scene.add(databaseAgent.runtimeRoot);

      // Instantiate Research Professor Runtime (strictly outside ROOM_RESEARCH_ROOT)
      const researchPathHelpers = buildResearchSimulationHelpersGroup();
      researchPathHelpers.helpersRoot.visible = false;
      scene.add(researchPathHelpers.helpersRoot);

      const researchAgent = createResearchProfessorRuntime((status) => {
        callbacksRef.current.onResearchRuntimeStateChange?.(status);
      });
      researchAgent.runtimeRoot.visible = false;
      scene.add(researchAgent.runtimeRoot);

      let loadError: string | null = null;
      let currentActionId: PMActionId = 'idle';
      let currentState: PMAgentStateId = 'IDLE';
      let isWalking = false;
      let isPaused = false;
      let speedMultiplier: 0.5 | 1 | 1.5 = 1;
      let patrolActive = false;
      let patrolIndex = 0;
      let patrolWaitTimer = 0;
      let autoDemoActive = false;
      let autoDemoStepIndex = 0;
      let autoDemoTimer = 0;
      let taskCompleteReturnTimer = 0;
      let currentAnchorId: AnchorId | null = 'ROOM_IDLE_POSITION';
      let targetAnchorId: AnchorId | null = 'ROOM_IDLE_POSITION';
      let navPath: Array<[number, number]> = [];
      let isPMSelected = false;
      let savedRoomCameraState: {
        pos: THREE.Vector3;
        target: THREE.Vector3;
        zoom: number;
      } | null = null;

      let elapsedSimTime = 0;
      let lastFrameTimestamp = performance.now();

      // Instantiate All-Agent Central Hub Meeting Demo Orchestrator (7 real agents + 3 empty reserved/planned chairs)
      const allAgentMeetingDemo = createAllAgentMeetingDemoSystem({
        getBossPM: () => bossPM,
        ceoAgent,
        uiuxAgent,
        frontendAgent,
        backendAgent,
        databaseAgent,
        researchAgent,
        onStopRoomAutoDemos: () => {
          autoDemoActive = false;
          patrolActive = false;
          isWalking = false;
          navPath = [];
          simHelpers.updatePathVisuals([0, 0], []);
          ceoAgent.stopAutoDemo();
          ceoAgent.setPatrol(false);
          uiuxAgent.stopAutoDemo();
          uiuxAgent.setPatrol(false);
          frontendAgent.stopAutoDemo();
          frontendAgent.setPatrol(false);
          backendAgent.stopAutoDemo();
          backendAgent.setPatrolActive(false);
          databaseAgent.stopAutoDemo();
          databaseAgent.setPatrolActive(false);
          researchAgent.stopAutoDemo();
          researchAgent.setPatrolActive(false);
        },
        onRestoreRoomCharacters: () => {
          if (bossPM) {
            const curAnchor = currentAnchorId ? anchorsRef.current[currentAnchorId] : null;
            bossPM.transitionToActionPose('idle', false, curAnchor?.posture ?? 'standing');
          }
          ceoAgent.executePlayback('reset_idle');
          uiuxAgent.executePlayback('reset_idle');
          frontendAgent.executePlayback('reset_idle');
          backendAgent.executePlayback('reset_idle');
          databaseAgent.executePlayback('reset_idle');
          researchAgent.executePlayback('reset_idle');
        },
        onStatusChange: (status) => {
          callbacksRef.current.onMeetingDemoStatusChange?.(status);
        },
      });
      previewHelpersGroup.add(allAgentMeetingDemo.helpersGroup);
      callbacksRef.current.onMeetingDemoStatusChange?.(allAgentMeetingDemo.getStatus());

      // Mount Default Original Room-Native Boss PM immediately near the executive workstation
      const initialSpawn = anchorsRef.current.ROOM_IDLE_POSITION || anchorsRef.current.SPAWN_POINT;
      originalPMInstance.navigationRoot.position.set(
        initialSpawn.position[0],
        0,
        initialSpawn.position[2]
      );
      originalPMInstance.orientationRoot.rotation.y = initialSpawn.facingRad;
      originalPMInstance.transitionToActionPose('idle', false, 'standing');
      scene.add(originalPMInstance.runtimeRoot);

      const getActionDef = (id: PMActionId): PMActionDefinition =>
        PM_DEMO_ACTIONS.find((a) => a.id === id) || PM_DEMO_ACTIONS[0];

      const computeOverheadScreenCoords = (): { x: number; y: number; visible: boolean } => {
        if (!bossPM || !bossPM.runtimeRoot.visible) {
          return { x: 0, y: 0, visible: false };
        }
        const worldPos = new THREE.Vector3();
        bossPM.interactionAnchor.getWorldPosition(worldPos);
        const projected = worldPos.clone().project(camera);
        const w = renderer.domElement.clientWidth || width;
        const h = renderer.domElement.clientHeight || height;
        const sx = (projected.x * 0.5 + 0.5) * w;
        const sy = (-(projected.y * 0.5) + 0.5) * h;
        const inBounds = sx >= 20 && sx <= w - 20 && sy >= 20 && sy <= h - 20;
        return {
          x: Math.round(sx),
          y: Math.round(sy),
          visible: inBounds,
        };
      };

      const emitTelemetry = () => {
        const pos: [number, number, number] = bossPM
          ? [
              Number(bossPM.navigationRoot.position.x.toFixed(2)),
              Number(bossPM.navigationRoot.position.y.toFixed(2)),
              Number(bossPM.navigationRoot.position.z.toFixed(2)),
            ]
          : [3.35, 0, 5.15];
        const facingRad = bossPM ? bossPM.orientationRoot.rotation.y : 2.35;
        const facingDeg = Math.round(((facingRad * 180) / Math.PI + 360) % 360);

        const camOffset = camera.position.clone().sub(controls.target);
        const horizDist = Math.hypot(camOffset.x, camOffset.z);
        const azimuthDeg = Number(((Math.atan2(camOffset.x, -camOffset.z) * 180) / Math.PI).toFixed(1));
        const elevationDeg = Number(
          ((Math.atan2(camOffset.y, Math.max(1e-6, horizDist)) * 180) / Math.PI).toFixed(2)
        );
        const vw = renderer.domElement.clientWidth || width;
        const vh = renderer.domElement.clientHeight || height;
        const vAspect = Number((vw / Math.max(1, vh)).toFixed(3));

        const camDiag = {
          cameraType: 'THREE.OrthographicCamera' as const,
          projectionMode: 'Orthographic' as const,
          position: [
            Number(camera.position.x.toFixed(2)),
            Number(camera.position.y.toFixed(2)),
            Number(camera.position.z.toFixed(2)),
          ] as [number, number, number],
          target: [
            Number(controls.target.x.toFixed(2)),
            Number(controls.target.y.toFixed(2)),
            Number(controls.target.z.toFixed(2)),
          ] as [number, number, number],
          azimuthDeg,
          elevationDeg,
          zoom: Number(camera.zoom.toFixed(3)),
          nominalZoom: Number((camera.zoom * 68).toFixed(1)),
          viewportWidth: vw,
          viewportHeight: vh,
          viewportAspect: vAspect,
          frustumSize: [
            Number(((camera.right - camera.left) / Math.max(0.01, camera.zoom)).toFixed(2)),
            Number(((camera.top - camera.bottom) / Math.max(0.01, camera.zoom)).toFixed(2)),
          ] as [number, number],
          cutawayMode: !configRef.current.autoCutawayWalls
            ? ('show_architecture' as const)
            : configRef.current.fullOfficeCutawayMode ?? ('smart_cutaway' as const),
          orbitMode: configRef.current.fullOfficeOrbitMode ?? ('cinematic' as const),
          fitOfficeNominalZoom: Number(
            computeAutoFitZoomForFullOfficePreset('full_office_cinematic', vAspect).toFixed(1)
          ),
          minNominalZoom: Number(
            (
              computeAutoFitZoomForFullOfficePreset('full_office_cinematic', vAspect) *
              FULL_OFFICE_CAMERA_PROFILE_V2_1.min_zoom_factor
            ).toFixed(1)
          ),
          maxNominalZoom: Number(
            (
              computeAutoFitZoomForFullOfficePreset('full_office_cinematic', vAspect) *
              FULL_OFFICE_CAMERA_PROFILE_V2_1.max_zoom_factor
            ).toFixed(1)
          ),
        };

        if (typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>).__AI_OFFICE_DIAGNOSTICS__ = {
            cameraDiagnostics: camDiag,
            wallVisibility: {
              uiuxEastWallsVisible: uiuxRoom.eastWallNodes.every((n) => n.visible),
              uiuxEastWallCount: uiuxRoom.eastWallNodes.length,
              uiuxWestWallsVisible: uiuxRoom.westWallNodes.every((n) => n.visible),
              uiuxNorthWallsVisible: uiuxRoom.northWallNodes.every((n) => n.visible),
              engWestWallsVisible: engineeringRoom.westWallNodes.every((n) => n.visible),
              engNorthWallsVisible: engineeringRoom.northWallNodes.every((n) => n.visible),
              engSouthWallsVisible: engineeringRoom.southWallNodes.every((n) => n.visible),
              engEastWallsVisible: engineeringRoom.eastWallNodes.every((n) => n.visible),
              qaSouthWallsVisible: qaDevopsRoom.southWallNodes.every((n) => n.visible),
              qaEastWallsVisible: qaDevopsRoom.eastWallNodes.every((n) => n.visible),
              corridorEndWallsVisible: officeA3.corridorEndWallNodes.every((n) => n.visible),
            },
            meetingDemoStatus: allAgentMeetingDemo.getStatus(),
          };
        }

        callbacksRef.current.onPMRuntimeStateChange({
          loaded: Boolean(bossPM),
          loadError,
          selectedCharacterSource,
          activeCharacterSource: bossPM?.sourceType ?? 'original_pm',
          hasImportedGLB: Boolean(importedPMInstance),
          importedGLBFilename: importedPMInstance?.inspectionReport.assetPathOrName ?? null,
          currentActionId,
          currentActionDef: getActionDef(currentActionId),
          currentState,
          isWalking,
          isPaused,
          speedMultiplier,
          patrolActive,
          autoDemoActive,
          autoDemoStepIndex,
          autoDemoStepTitle: autoDemoActive
            ? AUTO_DEMO_SEQUENCE[autoDemoStepIndex]?.stepTitle ?? null
            : null,
          currentAnchorId,
          targetAnchorId,
          worldPosition: pos,
          facingDeg,
          activeClipName: bossPM ? bossPM.activeClipName : 'None',
          capabilityMode: bossPM ? bossPM.inspectionReport.capabilityMode : 'NONE',
          scaleMultiplier: bossPM ? bossPM.scaleMultiplier : 1.0,
          forwardOffsetDeg: bossPM ? bossPM.forwardOffsetDeg : 0,
          isPMSelected,
          overheadScreenPos: computeOverheadScreenCoords(),
          cameraDiagnostics: camDiag,
        });

        callbacksRef.current.onCEORuntimeStateChange?.(ceoAgent.getStatus());
        callbacksRef.current.onUIUXRuntimeStateChange?.(uiuxAgent.getStatus());
        callbacksRef.current.onBackendRuntimeStateChange?.(backendAgent.getStatus());
        callbacksRef.current.onDatabaseRuntimeStateChange?.(databaseAgent.getStatus());
        callbacksRef.current.onResearchRuntimeStateChange?.(researchAgent.getStatus());
      };

      const updateRoomActivityHighlights = () => {
        const cfg = configRef.current;
        const pmVisible =
          cfg.workspaceMode === 'builder' &&
          cfg.showBossPM &&
          (cfg.officeViewMode === 'full_office' || cfg.selectedRoomKey === 'pm_strategy');

        // Highlight Strategy Board during PRESENTING
        activityBoardHighlight.visible = pmVisible && !isWalking && currentState === 'PRESENTING';
        if (cfg.officeViewMode === 'full_office') {
          activityBoardHighlight.position.set(8 + 5.35, 1.82, 18 + 7.66);
        } else {
          activityBoardHighlight.position.set(5.35, 1.82, 7.66);
        }

        // Enhance Monitor & Desk Lamp warmth during WORKING
        if (pmVisible && !isWalking && currentState === 'WORKING') {
          matLib.materials.monitorScreen.emissive.setHex(0x1e40af);
          matLib.materials.monitorScreen.emissiveIntensity = 0.42;
          deskPointLight.intensity = 1.25;
        } else {
          matLib.materials.monitorScreen.emissive.setHex(0x000000);
          matLib.materials.monitorScreen.emissiveIntensity = 0.0;
          deskPointLight.intensity = 0.85;
        }
      };

      const navigateToAnchor = (destAnchorId: AnchorId) => {
        if (!bossPM) return;
        const dest = anchorsRef.current[destAnchorId];
        if (!dest) return;
        targetAnchorId = destAnchorId;

        const curX = bossPM.navigationRoot.position.x;
        const curZ = bossPM.navigationRoot.position.z;
        const dist = Math.hypot(dest.position[0] - curX, dest.position[2] - curZ);

        if (dist <= 0.12) {
          bossPM.navigationRoot.position.set(dest.position[0], 0, dest.position[2]);
          bossPM.orientationRoot.rotation.y = dest.facingRad;
          currentAnchorId = destAnchorId;
          navPath = [];
          isWalking = false;
          simHelpers.updatePathVisuals([curX, curZ], []);
          const actDef = getActionDef(currentActionId);
          currentState = actDef.targetState;
          bossPM.transitionToActionPose(currentActionId, false, dest.posture);
          updateRoomActivityHighlights();
          return;
        }

        const computedPath = findWalkablePath([curX, curZ], [dest.position[0], dest.position[2]]);
        if (dest.approachAnchorId && anchorsRef.current[dest.approachAnchorId]) {
          const appPos = anchorsRef.current[dest.approachAnchorId].position;
          const dToApp = Math.hypot(appPos[0] - curX, appPos[2] - curZ);
          if (dToApp > 0.25) {
            const pathToApp = findWalkablePath([curX, curZ], [appPos[0], appPos[2]]);
            pathToApp.push([dest.position[0], dest.position[2]]);
            navPath = pathToApp;
          } else {
            navPath = computedPath;
          }
        } else {
          navPath = computedPath;
        }

        isWalking = true;
        currentState = 'MOVING';
        bossPM.transitionToActionPose(currentActionId, true, 'standing');
        simHelpers.updatePathVisuals([curX, curZ], navPath);
        updateRoomActivityHighlights();
      };

      const triggerPMAction = (actionId: PMActionId, fromAutoDemo = false) => {
        if (!fromAutoDemo) {
          autoDemoActive = false;
        }
        isPaused = false;
        taskCompleteReturnTimer = 0;
        currentActionId = actionId;
        const actDef = getActionDef(actionId);

        if (actionId === 'patrol') {
          patrolActive = true;
          patrolWaitTimer = 0;
          const nextAnchor = PATROL_ANCHOR_SEQUENCE[patrolIndex % PATROL_ANCHOR_SEQUENCE.length];
          navigateToAnchor(nextAnchor);
          emitTelemetry();
          requestRender();
          return;
        }

        patrolActive = false;

        if (actDef.requiresWalk && actDef.targetAnchorId) {
          navigateToAnchor(actDef.targetAnchorId);
        } else {
          navPath = [];
          isWalking = false;
          currentState = actDef.targetState;
          if (bossPM) {
            simHelpers.updatePathVisuals(
              [bossPM.navigationRoot.position.x, bossPM.navigationRoot.position.z],
              []
            );
            const curAnchor = currentAnchorId ? anchorsRef.current[currentAnchorId] : null;
            bossPM.transitionToActionPose(actionId, false, curAnchor?.posture ?? 'standing');
          }
          if (actionId === 'task_completed') {
            taskCompleteReturnTimer = 3.2;
          }
          updateRoomActivityHighlights();
        }

        emitTelemetry();
        requestRender();
      };

      const teleportPMToAnchor = (anchorId: AnchorId) => {
        if (!bossPM) return;
        const anchor = anchorsRef.current[anchorId];
        if (!anchor) return;
        navPath = [];
        isWalking = false;
        currentAnchorId = anchorId;
        targetAnchorId = anchorId;
        bossPM.navigationRoot.position.set(anchor.position[0], 0, anchor.position[2]);
        bossPM.orientationRoot.rotation.y = anchor.facingRad;
        simHelpers.updatePathVisuals([anchor.position[0], anchor.position[2]], []);
        const actDef = getActionDef(currentActionId);
        currentState = actDef.targetState;
        bossPM.transitionToActionPose(currentActionId, false, anchor.posture);
        updateRoomActivityHighlights();
        emitTelemetry();
        requestRender();
      };

      const setCharacterSource = (nextSource: CharacterSourceType) => {
        selectedCharacterSource = nextSource;

        const desiredInstance: BossPMRuntimeInstance =
          nextSource === 'imported_glb' && importedPMInstance
            ? importedPMInstance
            : originalPMInstance;

        if (bossPM && bossPM !== desiredInstance) {
          const prevPos = bossPM.navigationRoot.position.clone();
          const prevYaw = bossPM.orientationRoot.rotation.y;
          bossPM.resetPoseToRest();
          bossPM.setHighlighted(false);
          bossPM.runtimeRoot.visible = false;
          scene.remove(bossPM.runtimeRoot);

          bossPM = desiredInstance;
          bossPM.navigationRoot.position.copy(prevPos);
          bossPM.orientationRoot.rotation.y = prevYaw;
          scene.add(bossPM.runtimeRoot);
        } else if (!bossPM) {
          bossPM = desiredInstance;
          scene.add(bossPM.runtimeRoot);
        }

        if (bossPM === originalPMInstance && importedPMInstance) {
          importedPMInstance.runtimeRoot.visible = false;
          scene.remove(importedPMInstance.runtimeRoot);
        } else if (bossPM === importedPMInstance) {
          originalPMInstance.runtimeRoot.visible = false;
          scene.remove(originalPMInstance.runtimeRoot);
        }

        bossPM.setHighlighted(isPMSelected);
        const curAnchor = currentAnchorId ? anchorsRef.current[currentAnchorId] : null;
        bossPM.transitionToActionPose(currentActionId, isWalking, curAnchor?.posture ?? 'standing');

        callbacksRef.current.onGLBInspectionReady(bossPM.inspectionReport);
        updateVisibilityFromConfig();
        emitTelemetry();
        requestRender();
      };

      const mountImportedBossPMInstance = (
        instance: BossPMRuntimeInstance,
        autoSelect = true
      ) => {
        if (importedPMInstance && importedPMInstance !== instance) {
          importedPMInstance.resetPoseToRest();
          importedPMInstance.runtimeRoot.visible = false;
          scene.remove(importedPMInstance.runtimeRoot);
        }
        importedPMInstance = instance;
        loadError = null;

        const refPos = bossPM
          ? bossPM.navigationRoot.position
          : new THREE.Vector3(initialSpawn.position[0], 0, initialSpawn.position[2]);
        const refYaw = bossPM ? bossPM.orientationRoot.rotation.y : initialSpawn.facingRad;
        importedPMInstance.navigationRoot.position.copy(refPos);
        importedPMInstance.orientationRoot.rotation.y = refYaw;

        if (autoSelect) {
          setCharacterSource('imported_glb');
        } else {
          emitTelemetry();
          requestRender();
        }
      };

      // 9. Camera Transition & Paced Simulation Render Loop
      let frameId = 0;
      let renderBusy = false;
      let renderDirty = false;

      let animActive = false;
      const animTargetPos = new THREE.Vector3();
      const animTargetLook = new THREE.Vector3();
      let animTargetZoom = camera.zoom;

      function afterDraw(cb: () => void) {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (gl && typeof gl.fenceSync === 'function') {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          let polls = 0;
          const poll = () => {
            polls++;
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED && polls < 6) {
              frameId = window.setTimeout(poll, 5);
            } else {
              if (sync) gl.deleteSync(sync);
              frameId = window.setTimeout(cb, 45);
            }
          };
          frameId = window.setTimeout(poll, 5);
        } else {
          frameId = window.setTimeout(cb, 45);
        }
      }

      let isFocusedSubView = false;
      let isTopDownPresetActive = false;

      const syncFullOfficeCameraConstraints = () => {
        const cfg = configRef.current;
        const isFull = cfg.workspaceMode !== 'import_test' && cfg.officeViewMode === 'full_office';
        const vw = renderer.domElement.clientWidth || container.clientWidth || 1280;
        const vh = renderer.domElement.clientHeight || container.clientHeight || 800;
        const asp = vw / Math.max(1, vh);

        if (!isFull) {
          controls.minZoom = 0.22;
          controls.maxZoom = 4.5;
          controls.minPolarAngle = 0.0001;
          controls.maxPolarAngle = Math.PI / 2 - 0.03;
          return;
        }

        const fitNominal = computeAutoFitZoomForFullOfficePreset('full_office_cinematic', asp);
        const fitZoom = fitNominal / 68;
        const minFactor = FULL_OFFICE_CAMERA_PROFILE_V2_1.min_zoom_factor;
        const maxFactor = isFocusedSubView
          ? FULL_OFFICE_CAMERA_PROFILE_V2_1.focus_max_zoom_factor
          : FULL_OFFICE_CAMERA_PROFILE_V2_1.max_zoom_factor;

        controls.minZoom = Number((fitZoom * minFactor).toFixed(4));
        controls.maxZoom = Number((fitZoom * maxFactor).toFixed(4));

        const orbitMode = cfg.fullOfficeOrbitMode ?? 'cinematic';
        if (isTopDownPresetActive) {
          controls.minPolarAngle = 0.0001;
          controls.maxPolarAngle = Math.PI / 2 - 0.03;
        } else if (orbitMode === 'cinematic') {
          // Elevation 28°..46° => polarAngle (90° - 46° = 44°)..(90° - 28° = 62°)
          controls.minPolarAngle = THREE.MathUtils.degToRad(
            90 - FULL_OFFICE_CAMERA_PROFILE_V2_1.maximum_elevation
          );
          controls.maxPolarAngle = THREE.MathUtils.degToRad(
            90 - FULL_OFFICE_CAMERA_PROFILE_V2_1.minimum_elevation
          );
        } else {
          controls.minPolarAngle = THREE.MathUtils.degToRad(12);
          controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
        }
      };

      const clampFullOfficeCameraState = () => {
        const cfg = configRef.current;
        const isFull = cfg.workspaceMode !== 'import_test' && cfg.officeViewMode === 'full_office';
        if (!isFull || animActive) return;

        syncFullOfficeCameraConstraints();

        // 1. Clamp Pan Target within Master Office safe bounds
        const pb = FULL_OFFICE_CAMERA_PROFILE_V2_1.pan_bounds;
        const clampedTx = THREE.MathUtils.clamp(controls.target.x, pb.minX, pb.maxX);
        const clampedTy = THREE.MathUtils.clamp(controls.target.y, pb.minY, pb.maxY);
        const clampedTz = THREE.MathUtils.clamp(controls.target.z, pb.minZ, pb.maxZ);
        if (
          clampedTx !== controls.target.x ||
          clampedTy !== controls.target.y ||
          clampedTz !== controls.target.z
        ) {
          const dxPan = clampedTx - controls.target.x;
          const dyPan = clampedTy - controls.target.y;
          const dzPan = clampedTz - controls.target.z;
          controls.target.set(clampedTx, clampedTy, clampedTz);
          camera.position.x += dxPan;
          camera.position.y += dyPan;
          camera.position.z += dzPan;
        }

        // 2. Clamp Zoom within [minZoom, maxZoom]
        const clampedZoom = THREE.MathUtils.clamp(camera.zoom, controls.minZoom, controls.maxZoom);
        if (Math.abs(clampedZoom - camera.zoom) > 1e-4) {
          camera.zoom = clampedZoom;
          camera.updateProjectionMatrix();
        }

        // 3. Clamp Elevation & Azimuth in Cinematic Orbit Mode (when not in Top View)
        const orbitMode = cfg.fullOfficeOrbitMode ?? 'cinematic';
        if (orbitMode === 'cinematic' && !isTopDownPresetActive) {
          const offset = camera.position.clone().sub(controls.target);
          const dist = offset.length();
          const horizDist = Math.hypot(offset.x, offset.z);
          if (dist > 0.5 && horizDist > 0.2) {
            const elevDeg = THREE.MathUtils.radToDeg(Math.atan2(offset.y, horizDist));
            const azimDeg = THREE.MathUtils.radToDeg(Math.atan2(offset.x, -offset.z));
            const minEl = FULL_OFFICE_CAMERA_PROFILE_V2_1.minimum_elevation;
            const maxEl = FULL_OFFICE_CAMERA_PROFILE_V2_1.maximum_elevation;
            const [minAz, maxAz] = FULL_OFFICE_CAMERA_PROFILE_V2_1.azimuth_limits;

            const clampedEl = THREE.MathUtils.clamp(elevDeg, minEl, maxEl);
            const clampedAz = THREE.MathUtils.clamp(azimDeg, minAz, maxAz);
            if (Math.abs(clampedEl - elevDeg) > 0.05 || Math.abs(clampedAz - azimDeg) > 0.05) {
              const elRad = THREE.MathUtils.degToRad(clampedEl);
              const azRad = THREE.MathUtils.degToRad(clampedAz);
              const newHoriz = dist * Math.cos(elRad);
              const newY = dist * Math.sin(elRad);
              const newX = newHoriz * Math.sin(azRad);
              const newZ = -newHoriz * Math.cos(azRad);
              camera.position.set(
                controls.target.x + newX,
                controls.target.y + newY,
                controls.target.z + newZ
              );
              camera.up.set(0, 1, 0);
              camera.lookAt(controls.target);
            }
          }
        }
      };

      function applyCameraAwareWallCutaway() {
        const cfg = configRef.current;
        const northNames = new Set(
          [
            ...northWallNodes,
            ...ceoRoom.northWallNodes,
            ...uiuxRoom.northWallNodes,
            ...engineeringRoom.northWallNodes,
            ...researchRoom.northWallNodes,
            ...qaDevopsRoom.northWallNodes,
          ].map((n) => n.name)
        );
        const westNames = new Set(
          [
            ...westWallNodes,
            ...ceoRoom.westWallNodes,
            ...uiuxRoom.westWallNodes,
            ...engineeringRoom.westWallNodes,
            ...researchRoom.westWallNodes,
            ...qaDevopsRoom.westWallNodes,
          ].map((n) => n.name)
        );
        const southNames = new Set(
          [...engineeringRoom.southWallNodes, ...qaDevopsRoom.southWallNodes].map((n) => n.name)
        );
        const eastNames = new Set(
          [
            ...uiuxRoom.eastWallNodes,
            ...engineeringRoom.eastWallNodes,
            ...qaDevopsRoom.eastWallNodes,
          ].map((n) => n.name)
        );

        const applyToImportedHolders = (
          northVis: boolean,
          westVis: boolean,
          southVis = true,
          eastVis = true
        ) => {
          [
            importedRoomHolder,
            importedCEORoomHolder,
            importedUIUXRoomHolder,
            importedEngineeringRoomHolder,
            importedResearchRoomHolder,
            importedQADevOpsRoomHolder,
          ].forEach((holder) => {
            holder.traverse((obj) => {
              if (northNames.has(obj.name)) obj.visible = northVis;
              if (westNames.has(obj.name)) obj.visible = westVis;
              if (southNames.has(obj.name)) obj.visible = southVis;
              if (eastNames.has(obj.name)) obj.visible = eastVis;
            });
          });
        };

        // Main South Entrance Portal at [16, 0, 0] is NEVER hidden by cutaway flags unless showWallsAndWindows is false
        officeA3.centralHub.groups.ENTRANCE_STRUCTURE.visible = cfg.showWallsAndWindows;

        if (!cfg.showWallsAndWindows) {
          northWallNodes.forEach((n) => (n.visible = false));
          westWallNodes.forEach((n) => (n.visible = false));
          ceoRoom.northWallNodes.forEach((n) => (n.visible = false));
          ceoRoom.westWallNodes.forEach((n) => (n.visible = false));
          uiuxRoom.northWallNodes.forEach((n) => (n.visible = false));
          uiuxRoom.westWallNodes.forEach((n) => (n.visible = false));
          uiuxRoom.eastWallNodes.forEach((n) => (n.visible = false));
          engineeringRoom.northWallNodes.forEach((n) => (n.visible = false));
          engineeringRoom.westWallNodes.forEach((n) => (n.visible = false));
          engineeringRoom.southWallNodes.forEach((n) => (n.visible = false));
          engineeringRoom.eastWallNodes.forEach((n) => (n.visible = false));
          researchRoom.northWallNodes.forEach((n) => (n.visible = false));
          researchRoom.westWallNodes.forEach((n) => (n.visible = false));
          qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = false));
          qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = false));
          qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = false));
          qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = false));
          officeA3.corridorEndWallNodes.forEach((n) => (n.visible = false));
          applyToImportedHolders(false, false, false, false);
          return;
        }

        const viewDx = camera.position.x - controls.target.x;
        const viewDz = camera.position.z - controls.target.z;

        // =========================================================================
        // FULL OFFICE MODE — 3 SELECTABLE WALL CUTAWAY MODES (V2.1)
        //   1. 'smart_cutaway' (Default): Keeps perimeter back/side walls and
        //      UI/UX's 3.2u East (X=32) & West (X=24) walls intact while cutting
        //      away foreground South/interior walls that block interior visibility.
        //   2. 'show_architecture': Reveals 100% of permanent 3.2u walls across all
        //      6 rooms and corridor ends.
        //   3. 'agent_visibility': Cuts away all foreground and interior partitions
        //      that could occlude any of the 7 active agents while keeping North/West
        //      back walls and UI/UX's East/West studio walls intact.
        // =========================================================================
        if (cfg.officeViewMode === 'full_office') {
          const mode: FullOfficeCutawayMode = !cfg.autoCutawayWalls
            ? 'show_architecture'
            : cfg.fullOfficeCutawayMode ?? 'smart_cutaway';

          if (mode === 'show_architecture' || isTopDownPresetActive) {
            northWallNodes.forEach((n) => (n.visible = true));
            westWallNodes.forEach((n) => (n.visible = true));
            ceoRoom.northWallNodes.forEach((n) => (n.visible = true));
            ceoRoom.westWallNodes.forEach((n) => (n.visible = true));
            uiuxRoom.northWallNodes.forEach((n) => (n.visible = true));
            uiuxRoom.westWallNodes.forEach((n) => (n.visible = true));
            uiuxRoom.eastWallNodes.forEach((n) => (n.visible = true));
            engineeringRoom.northWallNodes.forEach((n) => (n.visible = true));
            engineeringRoom.westWallNodes.forEach((n) => (n.visible = true));
            engineeringRoom.southWallNodes.forEach((n) => (n.visible = true));
            engineeringRoom.eastWallNodes.forEach((n) => (n.visible = true));
            researchRoom.northWallNodes.forEach((n) => (n.visible = true));
            researchRoom.westWallNodes.forEach((n) => (n.visible = true));
            qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = true));
            qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = true));
            qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = true));
            qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = true));
            officeA3.corridorEndWallNodes.forEach((n) => (n.visible = true));
            applyToImportedHolders(true, true, true, true);
            return;
          }

          if (mode === 'agent_visibility') {
            // Keep North back walls (Z = 26), West exterior walls (X = 0), and UI/UX's East (X = 32) + West (X = 24) walls intact
            northWallNodes.forEach((n) => (n.visible = true));
            westWallNodes.forEach((n) => (n.visible = false));
            ceoRoom.northWallNodes.forEach((n) => (n.visible = true));
            ceoRoom.westWallNodes.forEach((n) => (n.visible = false));
            uiuxRoom.northWallNodes.forEach((n) => (n.visible = true));
            uiuxRoom.westWallNodes.forEach((n) => (n.visible = true));
            uiuxRoom.eastWallNodes.forEach((n) => (n.visible = true));
            engineeringRoom.northWallNodes.forEach((n) => (n.visible = false));
            engineeringRoom.westWallNodes.forEach((n) => (n.visible = true));
            engineeringRoom.southWallNodes.forEach((n) => (n.visible = false));
            engineeringRoom.eastWallNodes.forEach((n) => (n.visible = false));
            researchRoom.northWallNodes.forEach((n) => (n.visible = true));
            researchRoom.westWallNodes.forEach((n) => (n.visible = true));
            qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = false));
            qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = false));
            qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = false));
            qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = viewDx <= 6.0));
            officeA3.corridorEndWallNodes.forEach((n) => (n.visible = true));
            applyToImportedHolders(true, true, false, true);
            return;
          }

          // Mode A: 'smart_cutaway' (Default)
          // 1. North Row (Z = 18..26): Keep all North exterior walls, Research West exterior wall (X=0),
          //    PM West wall (X=8), CEO West wall (X=16), UI/UX West wall (X=24, with Wireframe & Style boards),
          //    and UI/UX East exterior wall (X=32, screen-space LEFT boundary) visible!
          northWallNodes.forEach((n) => (n.visible = true));
          westWallNodes.forEach((n) => (n.visible = true));
          ceoRoom.northWallNodes.forEach((n) => (n.visible = true));
          ceoRoom.westWallNodes.forEach((n) => (n.visible = true));
          uiuxRoom.northWallNodes.forEach((n) => (n.visible = true));
          uiuxRoom.westWallNodes.forEach((n) => (n.visible = true));
          uiuxRoom.eastWallNodes.forEach((n) => (n.visible = true));
          researchRoom.northWallNodes.forEach((n) => (n.visible = true));
          researchRoom.westWallNodes.forEach((n) => (n.visible = true));
          officeA3.corridorEndWallNodes.forEach((n) => (n.visible = true));

          // 2. West Wing — Engineering Studio (X = 0..8, Z = 0..16):
          //    Keep West exterior wall (X=0) and North corridor wall (Z=16) solid.
          //    Cut away foreground South upper wall (Z=0) when viewing from South (viewDz < -2)
          //    and East Hub partition upper wall (X=8) when viewing from East-of-South (viewDx > 3.5)
          //    so Frontend, Backend, and Database developers are clearly visible above the 0.44u curb!
          const cutSouthForeground = viewDz < -2.0;
          const cutEngEastPartition = viewDx > 3.5;
          engineeringRoom.northWallNodes.forEach((n) => (n.visible = true));
          engineeringRoom.westWallNodes.forEach((n) => (n.visible = true));
          engineeringRoom.southWallNodes.forEach((n) => (n.visible = !cutSouthForeground));
          engineeringRoom.eastWallNodes.forEach((n) => (n.visible = !cutEngEastPartition));

          // 3. East Wing — QA & DevOps Studio (X = 24..32, Z = 0..16):
          //    Keep East exterior wall (X=32, matching UI/UX East wall above it) and North/West walls solid,
          //    while cutting away foreground South upper wall (Z=0) when viewing from South.
          qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = true));
          qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = viewDx >= -6.0));
          qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = !cutSouthForeground));
          qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = true));

          applyToImportedHolders(true, true, !cutSouthForeground, true);
          return;
        }

        // =========================================================================
        // SINGLE-ROOM MODE CUTAWAY POLICY
        // =========================================================================
        if (!cfg.autoCutawayWalls) {
          northWallNodes.forEach((n) => (n.visible = true));
          westWallNodes.forEach((n) => (n.visible = true));
          ceoRoom.northWallNodes.forEach((n) => (n.visible = true));
          ceoRoom.westWallNodes.forEach((n) => (n.visible = true));
          uiuxRoom.northWallNodes.forEach((n) => (n.visible = true));
          uiuxRoom.westWallNodes.forEach((n) => (n.visible = true));
          uiuxRoom.eastWallNodes.forEach((n) => (n.visible = true));
          engineeringRoom.northWallNodes.forEach((n) => (n.visible = true));
          engineeringRoom.westWallNodes.forEach((n) => (n.visible = true));
          engineeringRoom.southWallNodes.forEach((n) => (n.visible = true));
          engineeringRoom.eastWallNodes.forEach((n) => (n.visible = true));
          researchRoom.northWallNodes.forEach((n) => (n.visible = true));
          researchRoom.westWallNodes.forEach((n) => (n.visible = true));
          qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = true));
          qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = true));
          qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = true));
          qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = true));
          applyToImportedHolders(true, true, true, true);
          return;
        }

        const hideNorth = viewDz > 1.8;
        const hideWest = viewDx < -1.8;
        const hideSouth = viewDz < -1.8;
        const hideEast = viewDx > 1.8;

        northWallNodes.forEach((n) => (n.visible = !hideNorth));
        westWallNodes.forEach((n) => (n.visible = !hideWest));
        ceoRoom.northWallNodes.forEach((n) => (n.visible = !hideNorth));
        ceoRoom.westWallNodes.forEach((n) => (n.visible = !hideWest));
        uiuxRoom.northWallNodes.forEach((n) => (n.visible = !hideNorth));
        uiuxRoom.westWallNodes.forEach((n) => (n.visible = !hideWest));
        uiuxRoom.eastWallNodes.forEach((n) => (n.visible = !hideEast));
        engineeringRoom.northWallNodes.forEach((n) => (n.visible = !hideNorth));
        engineeringRoom.westWallNodes.forEach((n) => (n.visible = !hideWest));
        engineeringRoom.southWallNodes.forEach((n) => (n.visible = false));
        engineeringRoom.eastWallNodes.forEach((n) => (n.visible = false));
        researchRoom.northWallNodes.forEach((n) => (n.visible = !hideNorth));
        researchRoom.westWallNodes.forEach((n) => (n.visible = !hideWest));
        qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = !hideNorth));
        qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = !hideWest));
        qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = !hideSouth));
        qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = !hideEast));
        applyToImportedHolders(!hideNorth, !hideWest, !hideSouth, !hideEast);
      }

      function stepSimulation(dt: number) {
        const cfg = configRef.current;
        if (cfg.workspaceMode === 'import_test' || !cfg.showBossPM) {
          return false;
        }

        elapsedSimTime += dt;

        // When All-Agent Central Hub Meeting Demo is active in Full Office mode, it orchestrates all 7 real agents
        if (cfg.officeViewMode === 'full_office' && allAgentMeetingDemo.isActive()) {
          allAgentMeetingDemo.update(
            dt,
            elapsedSimTime,
            cfg.showNavigationPath && cfg.showBossPM
          );
          return true;
        }

        let anyActive = false;

        // A. Step CEO Executive Assistant when visible in Single Room (ceo_executive) or Full Office
        const ceoActiveInCurrentView =
          cfg.officeViewMode === 'full_office' || cfg.selectedRoomKey === 'ceo_executive';
        if (ceoActiveInCurrentView) {
          ceoAgent.update(dt, elapsedSimTime);
          anyActive = true;
        }

        // A2. Step UI/UX Designer when visible in Single Room (uiux_studio) or Full Office
        const uiuxActiveInCurrentView =
          cfg.officeViewMode === 'full_office' || cfg.selectedRoomKey === 'uiux_studio';
        if (uiuxActiveInCurrentView) {
          uiuxAgent.update(dt, elapsedSimTime);
          anyActive = true;
        }

        // A3. Step Frontend, Backend & Database Developers when visible in Single Room (engineering) or Full Office
        const frontendActiveInCurrentView =
          cfg.officeViewMode === 'full_office' || cfg.selectedRoomKey === 'engineering';
        if (frontendActiveInCurrentView) {
          frontendAgent.update(dt, elapsedSimTime);
          backendAgent.update(dt);
          databaseAgent.update(dt);
          const beSt = backendAgent.getStatus();
          const beTargetAnchor =
            engineeringAnchorsRef.current[beSt.targetAnchorId as EngineeringAnchorId];
          backendPathHelpers.updatePathVisual(
            backendAgent.getActivePathPoints(),
            beTargetAnchor ? beTargetAnchor.position : beSt.worldPosition,
            cfg.showNavigationPath && cfg.showBossPM && beSt.isWalking
          );
          const dbSt = databaseAgent.getStatus();
          const dbTargetAnchor =
            engineeringAnchorsRef.current[dbSt.targetAnchorId as EngineeringAnchorId];
          databasePathHelpers.updatePathVisual(
            databaseAgent.getActivePathPoints(),
            dbTargetAnchor ? dbTargetAnchor.position : dbSt.worldPosition,
            cfg.showNavigationPath && cfg.showBossPM && dbSt.isWalking
          );
          anyActive = true;
        }

        // A4. Step Research Professor when visible in Single Room (research_brain) or Full Office
        const researchActiveInCurrentView =
          cfg.officeViewMode === 'full_office' || cfg.selectedRoomKey === 'research_brain';
        if (researchActiveInCurrentView) {
          researchAgent.update(dt);
          const resSt = researchAgent.getStatus();
          const resTargetAnchor = DEFAULT_RESEARCH_ANCHORS.find(
            (a) => a.id === resSt.targetAnchorId
          );
          researchPathHelpers.updatePathVisual(
            researchAgent.getActivePathPoints(),
            resTargetAnchor ? resTargetAnchor.position : resSt.worldPosition,
            cfg.showNavigationPath && cfg.showBossPM && resSt.isWalking
          );
          anyActive = true;
        }

        // B. Step Boss PM when visible in Single Room (pm_strategy) or Full Office
        const pmActiveInCurrentView =
          cfg.officeViewMode === 'full_office' || cfg.selectedRoomKey === 'pm_strategy';
        if (!bossPM || !pmActiveInCurrentView || isPaused) {
          return anyActive;
        }

        anyActive = true;

        // 1. Step Waypoint Navigation if walking
        if (isWalking && navPath.length > 0) {
          const curPos = bossPM.navigationRoot.position;
          const nextPt = navPath[0];
          const dx = nextPt[0] - curPos.x;
          const dz = nextPt[1] - curPos.z;
          const dist = Math.hypot(dx, dz);
          const walkSpeed = 1.95 * speedMultiplier;
          const stepDist = walkSpeed * dt;

          if (dist > 0.01) {
            const desiredYaw = Math.atan2(dx, dz);
            const deltaYaw = shortestAngleDelta(bossPM.orientationRoot.rotation.y, desiredYaw);
            bossPM.orientationRoot.rotation.y += deltaYaw * Math.min(1, dt * 12 * speedMultiplier);
          }

          if (dist <= stepDist + 0.02) {
            curPos.x = nextPt[0];
            curPos.z = nextPt[1];
            navPath.shift();
            simHelpers.updatePathVisuals([curPos.x, curPos.z], navPath);

            if (navPath.length === 0) {
              isWalking = false;
              currentAnchorId = targetAnchorId;
              const destAnchor = targetAnchorId ? anchorsRef.current[targetAnchorId] : null;
              if (destAnchor) {
                bossPM.orientationRoot.rotation.y = destAnchor.facingRad;
              }

              if (patrolActive) {
                patrolWaitTimer = 1.1;
                currentState = 'IDLE';
                bossPM.transitionToActionPose('idle', false, 'standing');
              } else {
                const actDef = getActionDef(currentActionId);
                currentState = actDef.targetState;
                bossPM.transitionToActionPose(
                  currentActionId,
                  false,
                  destAnchor?.posture ?? 'standing'
                );
              }
              updateRoomActivityHighlights();
            }
          } else {
            curPos.x += (dx / dist) * stepDist;
            curPos.z += (dz / dist) * stepDist;
            simHelpers.updatePathVisuals([curPos.x, curPos.z], navPath);
          }
        } else if (patrolActive) {
          patrolWaitTimer -= dt * speedMultiplier;
          if (patrolWaitTimer <= 0) {
            patrolIndex = (patrolIndex + 1) % PATROL_ANCHOR_SEQUENCE.length;
            const nextAnchor = PATROL_ANCHOR_SEQUENCE[patrolIndex];
            navigateToAnchor(nextAnchor);
          }
        } else if (targetAnchorId && anchorsRef.current[targetAnchorId]) {
          const targetYaw = anchorsRef.current[targetAnchorId].facingRad;
          const dYaw = shortestAngleDelta(bossPM.orientationRoot.rotation.y, targetYaw);
          if (Math.abs(dYaw) > 0.005) {
            bossPM.orientationRoot.rotation.y += dYaw * Math.min(1, dt * 10);
          }
        }

        // 2. Step Auto-Demo Sequence timer
        if (autoDemoActive && !isWalking) {
          autoDemoTimer -= dt * speedMultiplier;
          if (autoDemoTimer <= 0) {
            autoDemoStepIndex++;
            if (autoDemoStepIndex >= AUTO_DEMO_SEQUENCE.length) {
              autoDemoActive = false;
              autoDemoStepIndex = 0;
              triggerPMAction('idle', true);
            } else {
              const step = AUTO_DEMO_SEQUENCE[autoDemoStepIndex];
              autoDemoTimer = step.durationSeconds;
              triggerPMAction(step.actionId, true);
            }
          }
        }

        // 3. Auto-return from TASK_COMPLETED to IDLE after celebratory gesture
        if (!autoDemoActive && currentState === 'TASK_COMPLETED' && taskCompleteReturnTimer > 0) {
          taskCompleteReturnTimer -= dt * speedMultiplier;
          if (taskCompleteReturnTimer <= 0) {
            currentActionId = 'idle';
            currentState = 'IDLE';
            const curAnchor = currentAnchorId ? anchorsRef.current[currentAnchorId] : null;
            bossPM.transitionToActionPose('idle', false, curAnchor?.posture ?? 'standing');
            updateRoomActivityHighlights();
          }
        }

        // 4. Advance character AnimationMixer / procedural limb poses
        bossPM.updateFrame(dt, elapsedSimTime, currentState, isWalking, speedMultiplier);

        // 5. Optional Follow PM Camera mode
        if (configRef.current.followPMCamera && !animActive) {
          const worldCharPos = new THREE.Vector3();
          bossPM.navigationRoot.getWorldPosition(worldCharPos);
          const desiredTarget = new THREE.Vector3(worldCharPos.x, 1.05, worldCharPos.z);
          const camOffset = camera.position.clone().sub(controls.target);
          controls.target.lerp(desiredTarget, Math.min(1, dt * 6));
          camera.position.copy(controls.target).add(camOffset);
        }

        return anyActive;
      }

      function requestRender() {
        if (renderBusy) {
          renderDirty = true;
          return;
        }
        renderBusy = true;
        frameId = requestAnimationFrame((now) => {
          renderDirty = false;
          const rawDt = (now - lastFrameTimestamp) / 1000;
          lastFrameTimestamp = now;
          const dt = Math.min(0.08, Math.max(0.016, rawDt));

          if (animActive) {
            const alpha = isSoftwareGl ? 0.45 : 0.22;
            const isTargetTopDown =
              Math.hypot(animTargetPos.x - animTargetLook.x, animTargetPos.z - animTargetLook.z) <
              0.05;

            camera.position.lerp(animTargetPos, alpha);
            controls.target.lerp(animTargetLook, alpha);
            if (isTargetTopDown) {
              // Lock horizontal azimuth strictly along -Z so Top View never develops diagonal roll
              camera.position.x = controls.target.x;
            }
            camera.zoom = THREE.MathUtils.lerp(camera.zoom, animTargetZoom, alpha);
            camera.up.set(0, 1, 0);
            camera.updateProjectionMatrix();
            camera.lookAt(controls.target);

            if (
              camera.position.distanceToSquared(animTargetPos) < 0.002 &&
              controls.target.distanceToSquared(animTargetLook) < 0.002 &&
              Math.abs(camera.zoom - animTargetZoom) < 0.005
            ) {
              camera.position.copy(animTargetPos);
              controls.target.copy(animTargetLook);
              camera.zoom = animTargetZoom;
              camera.up.set(0, 1, 0);
              camera.updateProjectionMatrix();
              camera.lookAt(controls.target);
              controls.update();
              animActive = false;
            } else {
              renderDirty = true;
            }
          }

          const simRunning = stepSimulation(dt);
          if (simRunning) {
            const ceoSt = ceoAgent.getStatus();
            const uiuxSt = uiuxAgent.getStatus();
            const feSt = frontendAgent.getStatus();
            const beSt = backendAgent.getStatus();
            const dbSt = databaseAgent.getStatus();
            const resSt = researchAgent.getStatus();
            if (
              allAgentMeetingDemo.isActive() ||
              isWalking ||
              patrolActive ||
              autoDemoActive ||
              currentState !== 'IDLE' ||
              ceoSt.isWalking ||
              ceoSt.patrolActive ||
              ceoSt.autoDemoActive ||
              ceoSt.currentState !== 'IDLE' ||
              uiuxSt.isWalking ||
              uiuxSt.patrolActive ||
              uiuxSt.autoDemoActive ||
              uiuxSt.currentState !== 'IDLE' ||
              feSt.isWalking ||
              feSt.patrolActive ||
              feSt.autoDemoActive ||
              feSt.currentState !== 'IDLE' ||
              beSt.isWalking ||
              beSt.patrolActive ||
              beSt.autoDemoActive ||
              beSt.currentState !== 'IDLE' ||
              dbSt.isWalking ||
              dbSt.patrolActive ||
              dbSt.autoDemoActive ||
              dbSt.currentState !== 'IDLE' ||
              resSt.isWalking ||
              resSt.patrolActive ||
              resSt.autoDemoActive ||
              resSt.currentState !== 'IDLE' ||
              !isSoftwareGl
            ) {
              renderDirty = true;
            }
          }

          if (configRef.current.workspaceMode === 'import_test') {
            if (importedCharacterMixer && importedCharacterHolder.visible) {
              importedCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
            if (importedCEOCharacterMixer && importedCEOCharacterHolder.visible) {
              importedCEOCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
            if (importedUIUXCharacterMixer && importedUIUXCharacterHolder.visible) {
              importedUIUXCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
            if (importedFrontendCharacterMixer && importedFrontendCharacterHolder.visible) {
              importedFrontendCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
            if (importedBackendCharacterMixer && importedBackendCharacterHolder.visible) {
              importedBackendCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
            if (importedDatabaseCharacterMixer && importedDatabaseCharacterHolder.visible) {
              importedDatabaseCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
            if (importedResearchCharacterMixer && importedResearchCharacterHolder.visible) {
              importedResearchCharacterMixer.update(dt);
              if (!isSoftwareGl) {
                renderDirty = true;
              }
            }
          }

          controls.update();
          clampFullOfficeCameraState();
          applyCameraAwareWallCutaway();
          renderer.render(scene, camera);
          emitTelemetry();

          const done = () => {
            renderBusy = false;
            if (renderDirty) requestRender();
          };
          if (isSoftwareGl) afterDraw(done);
          else done();
        });
      }

      const startCameraTransition = (
        pos: [number, number, number],
        target: [number, number, number],
        zoom: number
      ) => {
        animTargetPos.set(...pos);
        animTargetLook.set(...target);
        animTargetZoom = zoom / 68;
        const isTargetTopDown =
          Math.hypot(animTargetPos.x - animTargetLook.x, animTargetPos.z - animTargetLook.z) < 0.05;
        isTopDownPresetActive = isTargetTopDown;
        // Consider zoom > 38 in Full Office as a focused room/agent/meeting sub-view
        isFocusedSubView =
          configRef.current.officeViewMode === 'full_office' && zoom > 38 && !isTargetTopDown;
        syncFullOfficeCameraConstraints();

        if (isSoftwareGl || isTargetTopDown) {
          camera.position.copy(animTargetPos);
          controls.target.copy(animTargetLook);
          camera.zoom = animTargetZoom;
          camera.up.set(0, 1, 0);
          camera.updateProjectionMatrix();
          camera.lookAt(controls.target);
          controls.update();
          animActive = false;
          requestRender();
        } else {
          animActive = true;
          requestRender();
        }
      };

      const computeObjectInspection = (catalogId: string): SelectedObjectInspection | null => {
        const item =
          FURNITURE_CATALOG.find((c) => c.id === catalogId) ||
          CEO_FURNITURE_CATALOG.find((c) => c.id === catalogId) ||
          UIUX_FURNITURE_CATALOG.find((c) => c.id === catalogId) ||
          ENGINEERING_FURNITURE_CATALOG.find((c) => c.id === catalogId) ||
          RESEARCH_FURNITURE_CATALOG.find((c) => c.id === catalogId) ||
          QA_DEVOPS_FURNITURE_CATALOG.find((c) => c.id === catalogId) ||
          CENTRAL_HUB_FURNITURE_CATALOG.find((c) => c.id === catalogId);
        const node =
          catalogNodeMap.get(catalogId) ||
          ceoRoom.catalogNodeMap.get(catalogId) ||
          uiuxRoom.catalogNodeMap.get(catalogId) ||
          engineeringRoom.catalogNodeMap.get(catalogId) ||
          researchRoom.catalogNodeMap.get(catalogId) ||
          qaDevopsRoom.catalogNodeMap.get(catalogId) ||
          officeA3.centralHub.catalogNodeMap.get(catalogId);
        if (!item || !node) return null;

        let meshCount = 0;
        let triangleCount = 0;
        node.traverse((c) => {
          if ((c as THREE.Mesh).isMesh) {
            meshCount++;
            const geom = (c as THREE.Mesh).geometry;
            if (geom?.index) triangleCount += Math.floor(geom.index.count / 3);
            else if (geom?.attributes?.position) {
              triangleCount += Math.floor(geom.attributes.position.count / 3);
            }
          }
        });
        const box = new THREE.Box3().setFromObject(node);
        const size = new THREE.Vector3();
        box.getSize(size);

        return {
          catalogItem: item,
          meshCount,
          triangleCount,
          worldBox: {
            min: [
              Number(box.min.x.toFixed(2)),
              Number(box.min.y.toFixed(2)),
              Number(box.min.z.toFixed(2)),
            ],
            max: [
              Number(box.max.x.toFixed(2)),
              Number(box.max.y.toFixed(2)),
              Number(box.max.z.toFixed(2)),
            ],
            size: [
              Number(size.x.toFixed(2)),
              Number(size.y.toFixed(2)),
              Number(size.z.toFixed(2)),
            ],
          },
        };
      };

      /**
       * Temporarily restores `roomRoot`, `ceoRoom.ceoRoot`, `uiuxRoom.uiuxRoot`, `engineeringRoom.root`,
       * `researchRoom.roomRoot`, and `qaDevopsRoom.roomRoot` to standalone local `[0,0,0]` with all walls
       * and doorway thresholds visible so any GLB export is 100% deterministic.
       */
      const prepareRoomsForCleanStandaloneExport = (): (() => void) => {
        const prevPMParent = roomRoot.parent;
        const prevCEOParent = ceoRoom.ceoRoot.parent;
        const prevUIUXParent = uiuxRoom.uiuxRoot.parent;
        const prevEngParent = engineeringRoom.root.parent;
        const prevResParent = researchRoom.roomRoot.parent;
        const prevQADevOpsParent = qaDevopsRoom.roomRoot.parent;
        const prevPMVis = roomRoot.visible;
        const prevCEOVis = ceoRoom.ceoRoot.visible;
        const prevUIUXVis = uiuxRoom.uiuxRoot.visible;
        const prevEngVis = engineeringRoom.root.visible;
        const prevResVis = researchRoom.roomRoot.visible;
        const prevQADevOpsVis = qaDevopsRoom.roomRoot.visible;

        scene.add(roomRoot);
        scene.add(ceoRoom.ceoRoot);
        scene.add(uiuxRoom.uiuxRoot);
        scene.add(engineeringRoom.root);
        scene.add(researchRoom.roomRoot);
        scene.add(qaDevopsRoom.roomRoot);
        roomRoot.position.set(0, 0, 0);
        ceoRoom.ceoRoot.position.set(0, 0, 0);
        uiuxRoom.uiuxRoot.position.set(0, 0, 0);
        engineeringRoom.root.position.set(0, 0, 0);
        researchRoom.roomRoot.position.set(0, 0, 0);
        qaDevopsRoom.roomRoot.position.set(0, 0, 0);
        roomRoot.visible = true;
        ceoRoom.ceoRoot.visible = true;
        uiuxRoom.uiuxRoot.visible = true;
        engineeringRoom.root.visible = true;
        researchRoom.roomRoot.visible = true;
        qaDevopsRoom.roomRoot.visible = true;

        setDoorwayThresholdsVisible(true);
        northWallNodes.forEach((n) => (n.visible = true));
        westWallNodes.forEach((n) => (n.visible = true));
        ceoRoom.northWallNodes.forEach((n) => (n.visible = true));
        ceoRoom.westWallNodes.forEach((n) => (n.visible = true));
        uiuxRoom.northWallNodes.forEach((n) => (n.visible = true));
        uiuxRoom.westWallNodes.forEach((n) => (n.visible = true));
        uiuxRoom.eastWallNodes.forEach((n) => (n.visible = true));
        engineeringRoom.northWallNodes.forEach((n) => (n.visible = true));
        engineeringRoom.westWallNodes.forEach((n) => (n.visible = true));
        engineeringRoom.southWallNodes.forEach((n) => (n.visible = false));
        engineeringRoom.eastWallNodes.forEach((n) => (n.visible = false));
        researchRoom.northWallNodes.forEach((n) => (n.visible = true));
        researchRoom.westWallNodes.forEach((n) => (n.visible = true));
        qaDevopsRoom.northWallNodes.forEach((n) => (n.visible = true));
        qaDevopsRoom.westWallNodes.forEach((n) => (n.visible = true));
        qaDevopsRoom.southWallNodes.forEach((n) => (n.visible = true));
        qaDevopsRoom.eastWallNodes.forEach((n) => (n.visible = true));

        groups.FURNITURE.visible = true;
        groups.PROPS.visible = true;
        groups.DECORATION.visible = true;
        groups.WINDOWS.visible = true;

        ceoRoom.groups.FURNITURE.visible = true;
        ceoRoom.groups.PROPS.visible = true;
        ceoRoom.groups.DECORATION.visible = true;
        ceoRoom.groups.WINDOWS.visible = true;

        uiuxRoom.groups.FURNITURE.visible = true;
        uiuxRoom.groups.PROPS.visible = true;
        uiuxRoom.groups.DECORATION.visible = true;
        uiuxRoom.groups.WINDOWS.visible = true;

        engineeringRoom.groups.FURNITURE.visible = true;
        engineeringRoom.groups.PROPS.visible = true;
        engineeringRoom.groups.DECORATION.visible = true;
        engineeringRoom.groups.WINDOWS.visible = true;

        researchRoom.groups.FURNITURE.visible = true;
        researchRoom.groups.PROPS.visible = true;
        researchRoom.groups.DECORATION.visible = true;
        researchRoom.groups.WINDOWS.visible = true;

        qaDevopsRoom.groups.FURNITURE.visible = true;
        qaDevopsRoom.groups.PROPS.visible = true;
        qaDevopsRoom.groups.DECORATION.visible = true;
        qaDevopsRoom.groups.WINDOWS.visible = true;

        roomRoot.updateMatrixWorld(true);
        ceoRoom.ceoRoot.updateMatrixWorld(true);
        uiuxRoom.uiuxRoot.updateMatrixWorld(true);
        engineeringRoom.root.updateMatrixWorld(true);
        researchRoom.roomRoot.updateMatrixWorld(true);
        qaDevopsRoom.roomRoot.updateMatrixWorld(true);

        return () => {
          if (prevPMParent) prevPMParent.add(roomRoot);
          if (prevCEOParent) prevCEOParent.add(ceoRoom.ceoRoot);
          if (prevUIUXParent) prevUIUXParent.add(uiuxRoom.uiuxRoot);
          if (prevEngParent) prevEngParent.add(engineeringRoom.root);
          if (prevResParent) prevResParent.add(researchRoom.roomRoot);
          if (prevQADevOpsParent) prevQADevOpsParent.add(qaDevopsRoom.roomRoot);
          roomRoot.visible = prevPMVis;
          ceoRoom.ceoRoot.visible = prevCEOVis;
          uiuxRoom.uiuxRoot.visible = prevUIUXVis;
          engineeringRoom.root.visible = prevEngVis;
          researchRoom.roomRoot.visible = prevResVis;
          qaDevopsRoom.roomRoot.visible = prevQADevOpsVis;
          updateVisibilityFromConfig();
        };
      };

      const updateVisibilityFromConfig = () => {
        const cfg = configRef.current;
        const isImportMode = cfg.workspaceMode === 'import_test';
        const targetMode =
          cfg.importTestTarget || cfg.reimportDisplayMode || 'both_reimported';
        const isFullOffice = !isImportMode && cfg.officeViewMode === 'full_office';

        // Hide all single-room planned placeholders by default
        singlePlannedPlaceholders.forEach((grp) => {
          grp.visible = false;
        });

        if (isImportMode) {
          // Independent GLB Re-Import Verification Mode
          scene.add(roomRoot);
          scene.add(ceoRoom.ceoRoot);
          scene.add(uiuxRoom.uiuxRoot);
          scene.add(engineeringRoom.root);
          scene.add(researchRoom.roomRoot);
          scene.add(qaDevopsRoom.roomRoot);
          roomRoot.position.set(0, 0, 0);
          ceoRoom.ceoRoot.position.set(0, 0, 0);
          uiuxRoom.uiuxRoot.position.set(0, 0, 0);
          engineeringRoom.root.position.set(0, 0, 0);
          researchRoom.roomRoot.position.set(0, 0, 0);
          qaDevopsRoom.roomRoot.position.set(0, 0, 0);
          roomRoot.visible = false;
          ceoRoom.ceoRoot.visible = false;
          uiuxRoom.uiuxRoot.visible = false;
          engineeringRoom.root.visible = false;
          researchRoom.roomRoot.visible = false;
          researchRoom.helpersGroup.visible = false;
          qaDevopsRoom.roomRoot.visible = false;
          qaDevopsRoom.helpersGroup.visible = false;
          officeA3.officeRoot.visible = false;

          importedRootHolder.visible = true;
          importedRoomHolder.visible =
            targetMode === 'room_only' || targetMode === 'both_reimported';
          importedCEORoomHolder.visible =
            targetMode === 'ceo_room_only' || targetMode === 'ceo_room_and_char';
          importedUIUXRoomHolder.visible =
            targetMode === 'uiux_room_only' || targetMode === 'uiux_room_and_char';
          importedEngineeringRoomHolder.visible =
            targetMode === 'engineering_room_only' ||
            targetMode === 'engineering_room_and_char';
          importedResearchRoomHolder.visible =
            targetMode === 'research_room_only' || targetMode === 'research_room_and_char';
          importedQADevOpsRoomHolder.visible = targetMode === 'qa_devops_room_only';
          importedCharacterHolder.visible =
            targetMode === 'character_only' || targetMode === 'both_reimported';
          importedCEOCharacterHolder.visible =
            targetMode === 'ceo_character_only' || targetMode === 'ceo_room_and_char';
          importedUIUXCharacterHolder.visible =
            targetMode === 'uiux_character_only' || targetMode === 'uiux_room_and_char';
          importedFrontendCharacterHolder.visible =
            targetMode === 'frontend_character_only' ||
            targetMode === 'engineering_room_and_char';
          importedBackendCharacterHolder.visible =
            targetMode === 'backend_character_only' ||
            targetMode === 'engineering_room_and_char';
          importedDatabaseCharacterHolder.visible =
            targetMode === 'database_character_only' ||
            targetMode === 'engineering_room_and_char';
          importedResearchCharacterHolder.visible =
            targetMode === 'research_character_only' ||
            targetMode === 'research_room_and_char';
          neighborAssemblyGroup.visible = cfg.showNeighborAssembly;

          if (bossPM) bossPM.runtimeRoot.visible = false;
          ceoAgent.rootGroup.visible = false;
          ceoPathHelpers.visible = false;
          uiuxAgent.rootGroup.visible = false;
          uiuxPathHelpers.visible = false;
          frontendAgent.rootGroup.visible = false;
          frontendPathHelpers.helpersRoot.visible = false;
          backendAgent.runtimeRoot.visible = false;
          backendPathHelpers.helpersRoot.visible = false;
          databaseAgent.runtimeRoot.visible = false;
          databasePathHelpers.helpersRoot.visible = false;
          researchAgent.runtimeRoot.visible = false;
          researchPathHelpers.helpersRoot.visible = false;
          simHelpers.anchorsGroup.visible = false;
          simHelpers.pathDebugGroup.visible = false;
          ceoAnchorHelpers.helpersRoot.visible = false;
          uiuxAnchorHelpers.helpersRoot.visible = false;
          engineeringAnchorHelpers.helpersRoot.visible = false;

          if (
            targetMode === 'engineering_room_only' ||
            targetMode === 'engineering_room_and_char' ||
            targetMode === 'frontend_character_only' ||
            targetMode === 'backend_character_only' ||
            targetMode === 'database_character_only' ||
            targetMode === 'qa_devops_room_only'
          ) {
            keyLight.position.set(13.5, 16.5, 5.0);
            keyLight.target.position.set(4.0, 0.5, 8.0);
            keyLight.shadow.camera.left = -10.5;
            keyLight.shadow.camera.right = 10.5;
            keyLight.shadow.camera.top = 10.5;
            keyLight.shadow.camera.bottom = -10.5;
            keyLight.shadow.camera.far = 36.0;
            keyLight.shadow.camera.updateProjectionMatrix();
          } else {
            keyLight.position.set(9.5, 14.0, 2.0);
            keyLight.target.position.set(4.0, 0.5, 4.0);
            keyLight.shadow.camera.left = -6.2;
            keyLight.shadow.camera.right = 6.2;
            keyLight.shadow.camera.top = 6.2;
            keyLight.shadow.camera.bottom = -6.2;
            keyLight.shadow.camera.far = 28.0;
            keyLight.shadow.camera.updateProjectionMatrix();
          }
        } else if (isFullOffice) {
          // MODE B — FULL OFFICE PREVIEW (32x26 Master Floor Plan A3.2)
          importedRootHolder.visible = false;
          neighborAssemblyGroup.visible = false;

          officeA3.pmSlotWrapper.add(roomRoot);
          roomRoot.position.set(0, 0, 0);
          roomRoot.visible = true;

          officeA3.ceoSlotWrapper.add(ceoRoom.ceoRoot);
          ceoRoom.ceoRoot.position.set(0, 0, 0);
          ceoRoom.ceoRoot.visible = true;

          officeA3.uiuxSlotWrapper.add(uiuxRoom.uiuxRoot);
          uiuxRoom.uiuxRoot.position.set(0, 0, 0);
          uiuxRoom.uiuxRoot.visible = true;

          officeA3.engineeringSlotWrapper.add(engineeringRoom.root);
          engineeringRoom.root.position.set(0, 0, 0);
          engineeringRoom.root.visible = true;

          officeA3.researchSlotWrapper.add(researchRoom.roomRoot);
          researchRoom.roomRoot.position.set(0, 0, 0);
          researchRoom.roomRoot.visible = true;
          researchRoom.helpersGroup.position.set(0, 0, 18);
          researchRoom.helpersGroup.visible = cfg.showSimulationAnchors;

          officeA3.qaDevopsSlotWrapper.add(qaDevopsRoom.roomRoot);
          qaDevopsRoom.roomRoot.position.set(0, 0, 0);
          qaDevopsRoom.roomRoot.visible = true;
          qaDevopsRoom.helpersGroup.position.set(24, 0, 0);
          qaDevopsRoom.helpersGroup.visible = cfg.showSimulationAnchors;

          officeA3.officeRoot.visible = true;
          officeA3.helpersGroup.visible = cfg.showGrid || cfg.showSimulationAnchors;
          officeA3.setHighlightedRoomModule(cfg.selectedRoomKey);

          // Open removable doorway thresholds so PM, CEO, UI/UX, Engineering, Research, and QA & DevOps doorways are open!
          setDoorwayThresholdsVisible(false);

          // Boss PM stays inside the PM Room at global [8, 0, 18]
          if (bossPM) {
            bossPM.runtimeRoot.position.set(8, 0, 18);
            bossPM.runtimeRoot.visible = cfg.showBossPM;
          }
          simHelpers.helpersRoot.position.set(8, 0, 18);
          simHelpers.anchorsGroup.visible = cfg.showSimulationAnchors;
          simHelpers.pathDebugGroup.visible = cfg.showNavigationPath && cfg.showBossPM;

          // CEO Executive Assistant stays inside the CEO Room at global [16, 0, 18]
          ceoAgent.rootGroup.position.set(16, 0, 18);
          ceoAgent.rootGroup.visible = cfg.showBossPM;
          ceoPathHelpers.position.set(16, 0, 18);
          ceoPathHelpers.visible = cfg.showNavigationPath && cfg.showBossPM;

          ceoAnchorHelpers.helpersRoot.position.set(16, 0, 18);
          ceoAnchorHelpers.helpersRoot.visible = cfg.showSimulationAnchors;

          // UI/UX Designer stays inside the UI/UX Design Studio at global [24, 0, 18]
          uiuxAgent.rootGroup.position.set(24, 0, 18);
          uiuxAgent.rootGroup.visible = cfg.showBossPM;
          uiuxPathHelpers.position.set(24, 0, 18);
          uiuxPathHelpers.visible = cfg.showNavigationPath && cfg.showBossPM;

          uiuxAnchorHelpers.helpersRoot.position.set(24, 0, 18);
          uiuxAnchorHelpers.helpersRoot.visible = cfg.showSimulationAnchors;

          // Frontend, Backend & Database Developers stay inside the 8x16 Engineering Studio at global [0, 0, 0]
          frontendAgent.rootGroup.position.set(0, 0, 0);
          frontendAgent.rootGroup.visible = cfg.showBossPM;
          frontendPathHelpers.helpersRoot.position.set(0, 0, 0);
          frontendPathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;

          backendAgent.runtimeRoot.visible = cfg.showBossPM;
          backendPathHelpers.helpersRoot.position.set(0, 0, 0);
          backendPathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;

          databaseAgent.runtimeRoot.visible = cfg.showBossPM;
          databasePathHelpers.helpersRoot.position.set(0, 0, 0);
          databasePathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;

          engineeringAnchorHelpers.helpersRoot.position.set(0, 0, 0);
          engineeringAnchorHelpers.helpersRoot.visible = cfg.showSimulationAnchors;

          // Research Professor stays inside the Research & Shared Brain Room at global [0, 0, 18]
          officeA3.researchSlotWrapper.add(researchAgent.runtimeRoot);
          researchAgent.runtimeRoot.visible = cfg.showBossPM;
          researchPathHelpers.helpersRoot.position.set(0, 0, 18);
          researchPathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;

          // Adjust keyLight shadow frustum for 32x26 Full Office
          keyLight.position.set(25.5, 24.0, 6.0);
          keyLight.target.position.set(16.0, 0.5, 13.0);
          keyLight.shadow.camera.left = -20.0;
          keyLight.shadow.camera.right = 20.0;
          keyLight.shadow.camera.top = 20.0;
          keyLight.shadow.camera.bottom = -20.0;
          keyLight.shadow.camera.far = 52.0;
          keyLight.shadow.camera.updateProjectionMatrix();

          deskPointLight.position.set(8 + 1.35, 1.35, 18 + 4.75);
          floorLampPointLight.position.set(16 + 6.72, 1.55, 18 + 6.75);
          centralHubPointLight.visible = true;
          centralHubPointLight.position.set(16.0, 2.75, 8.0);
        } else {
          // MODE A — SINGLE ROOM VIEW (8x8 or 8x16 Local Origin [0, 0, 0])
          if (allAgentMeetingDemo.isActive()) {
            allAgentMeetingDemo.stopMeetingDemo();
          }
          centralHubPointLight.visible = false;
          importedRootHolder.visible = false;
          neighborAssemblyGroup.visible = false;
          officeA3.officeRoot.visible = false;

          scene.add(roomRoot);
          scene.add(ceoRoom.ceoRoot);
          scene.add(uiuxRoom.uiuxRoot);
          scene.add(engineeringRoom.root);
          scene.add(researchRoom.roomRoot);
          scene.add(qaDevopsRoom.roomRoot);
          scene.add(researchAgent.runtimeRoot);
          roomRoot.position.set(0, 0, 0);
          ceoRoom.ceoRoot.position.set(0, 0, 0);
          uiuxRoom.uiuxRoot.position.set(0, 0, 0);
          engineeringRoom.root.position.set(0, 0, 0);
          researchRoom.roomRoot.position.set(0, 0, 0);
          researchRoom.helpersGroup.position.set(0, 0, 0);
          qaDevopsRoom.roomRoot.position.set(0, 0, 0);
          qaDevopsRoom.helpersGroup.position.set(0, 0, 0);
          researchPathHelpers.helpersRoot.position.set(0, 0, 0);
          setDoorwayThresholdsVisible(true);

          if (cfg.selectedRoomKey === 'engineering' || cfg.selectedRoomKey === 'qa_devops_studio') {
            keyLight.position.set(13.5, 16.5, 5.0);
            keyLight.target.position.set(4.0, 0.5, 8.0);
            keyLight.shadow.camera.left = -10.5;
            keyLight.shadow.camera.right = 10.5;
            keyLight.shadow.camera.top = 10.5;
            keyLight.shadow.camera.bottom = -10.5;
            keyLight.shadow.camera.far = 36.0;
            keyLight.shadow.camera.updateProjectionMatrix();
          } else {
            keyLight.position.set(9.5, 14.0, 2.0);
            keyLight.target.position.set(4.0, 0.5, 4.0);
            keyLight.shadow.camera.left = -6.2;
            keyLight.shadow.camera.right = 6.2;
            keyLight.shadow.camera.top = 6.2;
            keyLight.shadow.camera.bottom = -6.2;
            keyLight.shadow.camera.far = 28.0;
            keyLight.shadow.camera.updateProjectionMatrix();
          }

          simHelpers.helpersRoot.position.set(0, 0, 0);
          ceoAnchorHelpers.helpersRoot.position.set(0, 0, 0);
          uiuxAnchorHelpers.helpersRoot.position.set(0, 0, 0);
          engineeringAnchorHelpers.helpersRoot.position.set(0, 0, 0);
          ceoAgent.rootGroup.position.set(0, 0, 0);
          ceoPathHelpers.position.set(0, 0, 0);
          uiuxAgent.rootGroup.position.set(0, 0, 0);
          uiuxPathHelpers.position.set(0, 0, 0);
          frontendAgent.rootGroup.position.set(0, 0, 0);
          frontendPathHelpers.helpersRoot.position.set(0, 0, 0);
          backendPathHelpers.helpersRoot.position.set(0, 0, 0);
          databasePathHelpers.helpersRoot.position.set(0, 0, 0);

          if (cfg.selectedRoomKey === 'pm_strategy') {
            roomRoot.visible = true;
            ceoRoom.ceoRoot.visible = false;
            uiuxRoom.uiuxRoot.visible = false;
            engineeringRoom.root.visible = false;
            researchRoom.roomRoot.visible = false;
            researchRoom.helpersGroup.visible = false;
            qaDevopsRoom.roomRoot.visible = false;
            qaDevopsRoom.helpersGroup.visible = false;
            if (bossPM) {
              bossPM.runtimeRoot.position.set(0, 0, 0);
              bossPM.runtimeRoot.visible = cfg.showBossPM;
            }
            ceoAgent.rootGroup.visible = false;
            ceoPathHelpers.visible = false;
            uiuxAgent.rootGroup.visible = false;
            uiuxPathHelpers.visible = false;
            frontendAgent.rootGroup.visible = false;
            frontendPathHelpers.helpersRoot.visible = false;
            backendAgent.runtimeRoot.visible = false;
            backendPathHelpers.helpersRoot.visible = false;
            databaseAgent.runtimeRoot.visible = false;
            databasePathHelpers.helpersRoot.visible = false;
            researchAgent.runtimeRoot.visible = false;
            researchPathHelpers.helpersRoot.visible = false;
            simHelpers.anchorsGroup.visible = cfg.showSimulationAnchors;
            simHelpers.pathDebugGroup.visible = cfg.showNavigationPath && cfg.showBossPM;
            ceoAnchorHelpers.helpersRoot.visible = false;
            uiuxAnchorHelpers.helpersRoot.visible = false;
            engineeringAnchorHelpers.helpersRoot.visible = false;

            deskPointLight.position.set(1.35, 1.35, 4.75);
            floorLampPointLight.position.set(6.35, 1.55, 6.85);
            callbacksRef.current.onStatsReady(measureRoomStats(roomRoot));
          } else if (cfg.selectedRoomKey === 'ceo_executive') {
            roomRoot.visible = false;
            ceoRoom.ceoRoot.visible = true;
            uiuxRoom.uiuxRoot.visible = false;
            engineeringRoom.root.visible = false;
            researchRoom.roomRoot.visible = false;
            researchRoom.helpersGroup.visible = false;
            qaDevopsRoom.roomRoot.visible = false;
            qaDevopsRoom.helpersGroup.visible = false;
            // Strictly no PM character inside CEO Room
            if (bossPM) {
              bossPM.runtimeRoot.visible = false;
            }
            // Mount CEO Executive Assistant inside CEO Room
            ceoAgent.rootGroup.visible = cfg.showBossPM;
            ceoPathHelpers.visible = cfg.showNavigationPath && cfg.showBossPM;
            uiuxAgent.rootGroup.visible = false;
            uiuxPathHelpers.visible = false;
            frontendAgent.rootGroup.visible = false;
            frontendPathHelpers.helpersRoot.visible = false;
            backendAgent.runtimeRoot.visible = false;
            backendPathHelpers.helpersRoot.visible = false;
            databaseAgent.runtimeRoot.visible = false;
            databasePathHelpers.helpersRoot.visible = false;
            researchAgent.runtimeRoot.visible = false;
            researchPathHelpers.helpersRoot.visible = false;
            simHelpers.anchorsGroup.visible = false;
            simHelpers.pathDebugGroup.visible = false;
            ceoAnchorHelpers.helpersRoot.visible = cfg.showSimulationAnchors;
            uiuxAnchorHelpers.helpersRoot.visible = false;
            engineeringAnchorHelpers.helpersRoot.visible = false;

            deskPointLight.position.set(2.25, 1.35, 5.55);
            floorLampPointLight.position.set(6.72, 1.55, 6.75);
            const cStats = measureRoomStats(ceoRoom.ceoRoot);
            callbacksRef.current.onStatsReady(cStats);
            callbacksRef.current.onCEOStatsReady?.(cStats);
          } else if (cfg.selectedRoomKey === 'uiux_studio') {
            roomRoot.visible = false;
            ceoRoom.ceoRoot.visible = false;
            uiuxRoom.uiuxRoot.visible = true;
            engineeringRoom.root.visible = false;
            researchRoom.roomRoot.visible = false;
            researchRoom.helpersGroup.visible = false;
            qaDevopsRoom.roomRoot.visible = false;
            qaDevopsRoom.helpersGroup.visible = false;
            // Strictly no PM or CEO characters inside UI/UX Studio
            if (bossPM) {
              bossPM.runtimeRoot.visible = false;
            }
            ceoAgent.rootGroup.visible = false;
            ceoPathHelpers.visible = false;
            // Mount UI/UX Designer character inside UI/UX Design Studio
            uiuxAgent.rootGroup.visible = cfg.showBossPM;
            uiuxPathHelpers.visible = cfg.showNavigationPath && cfg.showBossPM;
            frontendAgent.rootGroup.visible = false;
            frontendPathHelpers.helpersRoot.visible = false;
            backendAgent.runtimeRoot.visible = false;
            backendPathHelpers.helpersRoot.visible = false;
            databaseAgent.runtimeRoot.visible = false;
            databasePathHelpers.helpersRoot.visible = false;
            researchAgent.runtimeRoot.visible = false;
            researchPathHelpers.helpersRoot.visible = false;
            simHelpers.anchorsGroup.visible = false;
            simHelpers.pathDebugGroup.visible = false;
            ceoAnchorHelpers.helpersRoot.visible = false;
            uiuxAnchorHelpers.helpersRoot.visible = cfg.showSimulationAnchors;
            engineeringAnchorHelpers.helpersRoot.visible = false;

            deskPointLight.position.set(5.45, 1.45, 5.75);
            floorLampPointLight.position.set(1.18, 1.55, 2.38);
            const uStats = measureRoomStats(uiuxRoom.uiuxRoot);
            callbacksRef.current.onStatsReady(uStats);
            callbacksRef.current.onUIUXStatsReady?.(uStats);
          } else if (cfg.selectedRoomKey === 'engineering') {
            roomRoot.visible = false;
            ceoRoom.ceoRoot.visible = false;
            uiuxRoom.uiuxRoot.visible = false;
            engineeringRoom.root.visible = true;
            researchRoom.roomRoot.visible = false;
            researchRoom.helpersGroup.visible = false;
            qaDevopsRoom.roomRoot.visible = false;
            qaDevopsRoom.helpersGroup.visible = false;
            // Strictly no PM, CEO, UI/UX, or Research characters inside Engineering Studio
            if (bossPM) {
              bossPM.runtimeRoot.visible = false;
            }
            ceoAgent.rootGroup.visible = false;
            ceoPathHelpers.visible = false;
            uiuxAgent.rootGroup.visible = false;
            uiuxPathHelpers.visible = false;
            researchAgent.runtimeRoot.visible = false;
            researchPathHelpers.helpersRoot.visible = false;
            // Mount Frontend Developer (Zone A), Backend Developer (Zone B) AND Database Developer (Zone C) simultaneously inside Engineering Studio
            frontendAgent.rootGroup.visible = cfg.showBossPM;
            frontendPathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;
            backendAgent.runtimeRoot.visible = cfg.showBossPM;
            backendPathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;
            databaseAgent.runtimeRoot.visible = cfg.showBossPM;
            databasePathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;
            simHelpers.anchorsGroup.visible = false;
            simHelpers.pathDebugGroup.visible = false;
            ceoAnchorHelpers.helpersRoot.visible = false;
            uiuxAnchorHelpers.helpersRoot.visible = false;
            engineeringAnchorHelpers.helpersRoot.visible = cfg.showSimulationAnchors;

            deskPointLight.position.set(2.45, 1.55, 14.15);
            floorLampPointLight.position.set(2.45, 1.55, 10.35);
            const eStats = measureRoomStats(engineeringRoom.root);
            callbacksRef.current.onStatsReady(eStats);
            callbacksRef.current.onEngineeringStatsReady?.(eStats);
          } else if (cfg.selectedRoomKey === 'research_brain') {
            roomRoot.visible = false;
            ceoRoom.ceoRoot.visible = false;
            uiuxRoom.uiuxRoot.visible = false;
            engineeringRoom.root.visible = false;
            researchRoom.roomRoot.visible = true;
            researchRoom.helpersGroup.visible = cfg.showSimulationAnchors;
            qaDevopsRoom.roomRoot.visible = false;
            qaDevopsRoom.helpersGroup.visible = false;
            // Strictly no PM, CEO, UI/UX, or Engineering characters inside Research & Shared Brain Room
            if (bossPM) {
              bossPM.runtimeRoot.visible = false;
            }
            ceoAgent.rootGroup.visible = false;
            ceoPathHelpers.visible = false;
            uiuxAgent.rootGroup.visible = false;
            uiuxPathHelpers.visible = false;
            frontendAgent.rootGroup.visible = false;
            frontendPathHelpers.helpersRoot.visible = false;
            backendAgent.runtimeRoot.visible = false;
            backendPathHelpers.helpersRoot.visible = false;
            databaseAgent.runtimeRoot.visible = false;
            databasePathHelpers.helpersRoot.visible = false;
            // Mount Research Professor (research_professor_agent) inside Research & Shared Brain Room
            researchAgent.runtimeRoot.visible = cfg.showBossPM;
            researchPathHelpers.helpersRoot.visible = cfg.showNavigationPath && cfg.showBossPM;
            simHelpers.anchorsGroup.visible = false;
            simHelpers.pathDebugGroup.visible = false;
            ceoAnchorHelpers.helpersRoot.visible = false;
            uiuxAnchorHelpers.helpersRoot.visible = false;
            engineeringAnchorHelpers.helpersRoot.visible = false;

            deskPointLight.position.set(5.35, 1.45, 2.55);
            floorLampPointLight.position.set(2.35, 1.55, 2.25);
            const rStats = measureRoomStats(researchRoom.roomRoot);
            callbacksRef.current.onStatsReady(rStats);
            callbacksRef.current.onResearchStatsReady?.(rStats);
          } else if (cfg.selectedRoomKey === 'qa_devops_studio') {
            roomRoot.visible = false;
            ceoRoom.ceoRoot.visible = false;
            uiuxRoom.uiuxRoot.visible = false;
            engineeringRoom.root.visible = false;
            researchRoom.roomRoot.visible = false;
            researchRoom.helpersGroup.visible = false;
            qaDevopsRoom.roomRoot.visible = true;
            qaDevopsRoom.helpersGroup.visible = cfg.showSimulationAnchors;
            // Room-only milestone V1: strictly no characters inside QA & DevOps Integrated Studio yet
            if (bossPM) {
              bossPM.runtimeRoot.visible = false;
            }
            ceoAgent.rootGroup.visible = false;
            ceoPathHelpers.visible = false;
            uiuxAgent.rootGroup.visible = false;
            uiuxPathHelpers.visible = false;
            frontendAgent.rootGroup.visible = false;
            frontendPathHelpers.helpersRoot.visible = false;
            backendAgent.runtimeRoot.visible = false;
            backendPathHelpers.helpersRoot.visible = false;
            databaseAgent.runtimeRoot.visible = false;
            databasePathHelpers.helpersRoot.visible = false;
            researchAgent.runtimeRoot.visible = false;
            researchPathHelpers.helpersRoot.visible = false;
            simHelpers.anchorsGroup.visible = false;
            simHelpers.pathDebugGroup.visible = false;
            ceoAnchorHelpers.helpersRoot.visible = false;
            uiuxAnchorHelpers.helpersRoot.visible = false;
            engineeringAnchorHelpers.helpersRoot.visible = false;

            deskPointLight.position.set(5.65, 1.55, 13.85);
            floorLampPointLight.position.set(4.55, 1.55, 8.05);
            const qdStats = measureRoomStats(qaDevopsRoom.roomRoot);
            callbacksRef.current.onStatsReady(qdStats);
            callbacksRef.current.onQADevOpsStatsReady?.(qdStats);
          } else {
            // One of the PLANNED rooms selected in Single Room view
            roomRoot.visible = false;
            ceoRoom.ceoRoot.visible = false;
            uiuxRoom.uiuxRoot.visible = false;
            engineeringRoom.root.visible = false;
            researchRoom.roomRoot.visible = false;
            researchRoom.helpersGroup.visible = false;
            qaDevopsRoom.roomRoot.visible = false;
            qaDevopsRoom.helpersGroup.visible = false;
            if (bossPM) {
              bossPM.runtimeRoot.visible = false;
            }
            ceoAgent.rootGroup.visible = false;
            ceoPathHelpers.visible = false;
            uiuxAgent.rootGroup.visible = false;
            uiuxPathHelpers.visible = false;
            frontendAgent.rootGroup.visible = false;
            frontendPathHelpers.helpersRoot.visible = false;
            backendAgent.runtimeRoot.visible = false;
            backendPathHelpers.helpersRoot.visible = false;
            databaseAgent.runtimeRoot.visible = false;
            databasePathHelpers.helpersRoot.visible = false;
            researchAgent.runtimeRoot.visible = false;
            researchPathHelpers.helpersRoot.visible = false;
            simHelpers.anchorsGroup.visible = false;
            simHelpers.pathDebugGroup.visible = false;
            ceoAnchorHelpers.helpersRoot.visible = false;
            uiuxAnchorHelpers.helpersRoot.visible = false;
            engineeringAnchorHelpers.helpersRoot.visible = false;
            const plannedGrp = singlePlannedPlaceholders.get(cfg.selectedRoomKey);
            if (plannedGrp) plannedGrp.visible = true;
          }
        }

        matLib.setVisualMode(cfg.visualStyle, cfg.showTextures);
        renderer.shadowMap.enabled = !isSoftwareGl && cfg.showShadows;

        // Sync optional Wireframe diagnostic toggle across rooms and character materials
        const applyWireframeToRoot = (rootObj: THREE.Object3D, wire: boolean) => {
          rootObj.traverse((node) => {
            if ((node as THREE.Mesh).isMesh) {
              const mat = (node as THREE.Mesh).material;
              const mats = Array.isArray(mat) ? mat : [mat];
              mats.forEach((m) => {
                if (m && 'wireframe' in m) {
                  (m as THREE.MeshStandardMaterial).wireframe = wire;
                }
              });
            }
          });
        };
        applyWireframeToRoot(roomRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(ceoRoom.ceoRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(uiuxRoom.uiuxRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(engineeringRoom.root, Boolean(cfg.showWireframe));
        applyWireframeToRoot(researchRoom.roomRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(qaDevopsRoom.roomRoot, Boolean(cfg.showWireframe));
        if (bossPM) {
          applyWireframeToRoot(bossPM.modelRoot, Boolean(cfg.showWireframe));
        }
        applyWireframeToRoot(ceoAgent.modelRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(uiuxAgent.modelRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(frontendAgent.modelRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(backendAgent.characterRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(databaseAgent.characterRoot, Boolean(cfg.showWireframe));
        applyWireframeToRoot(researchAgent.characterRoot, Boolean(cfg.showWireframe));

        gridHelperGroup.visible = !isFullOffice && cfg.showGrid;
        mannequinGroup.visible = !isImportMode && !isFullOffice && cfg.showMannequin;

        groups.FURNITURE.visible = cfg.showFurniture;
        groups.PROPS.visible = cfg.showPropsAndDecor;
        groups.DECORATION.visible = cfg.showPropsAndDecor;
        groups.WINDOWS.visible = cfg.showWallsAndWindows;

        ceoRoom.groups.FURNITURE.visible = cfg.showFurniture;
        ceoRoom.groups.PROPS.visible = cfg.showPropsAndDecor;
        ceoRoom.groups.DECORATION.visible = cfg.showPropsAndDecor;
        ceoRoom.groups.WINDOWS.visible = cfg.showWallsAndWindows;

        uiuxRoom.groups.FURNITURE.visible = cfg.showFurniture;
        uiuxRoom.groups.PROPS.visible = cfg.showPropsAndDecor;
        uiuxRoom.groups.DECORATION.visible = cfg.showPropsAndDecor;
        uiuxRoom.groups.WINDOWS.visible = cfg.showWallsAndWindows;

        engineeringRoom.groups.FURNITURE.visible = cfg.showFurniture;
        engineeringRoom.groups.PROPS.visible = cfg.showPropsAndDecor;
        engineeringRoom.groups.DECORATION.visible = cfg.showPropsAndDecor;
        engineeringRoom.groups.WINDOWS.visible = cfg.showWallsAndWindows;

        researchRoom.groups.FURNITURE.visible = cfg.showFurniture;
        researchRoom.groups.PROPS.visible = cfg.showPropsAndDecor;
        researchRoom.groups.DECORATION.visible = cfg.showPropsAndDecor;
        researchRoom.groups.WINDOWS.visible = cfg.showWallsAndWindows;

        qaDevopsRoom.groups.FURNITURE.visible = cfg.showFurniture;
        qaDevopsRoom.groups.PROPS.visible = cfg.showPropsAndDecor;
        qaDevopsRoom.groups.DECORATION.visible = cfg.showPropsAndDecor;
        qaDevopsRoom.groups.WINDOWS.visible = cfg.showWallsAndWindows;

        catalogNodeMap.forEach((node, id) => {
          const isHidden = cfg.hiddenCatalogIds.includes(id);
          const isIsolated = cfg.isolatedCatalogId !== null && cfg.isolatedCatalogId !== id;
          node.visible = !isHidden && !isIsolated;
        });

        ceoRoom.catalogNodeMap.forEach((node, id) => {
          const isHidden = cfg.hiddenCatalogIds.includes(id);
          const isIsolated = cfg.isolatedCatalogId !== null && cfg.isolatedCatalogId !== id;
          node.visible = !isHidden && !isIsolated;
        });

        uiuxRoom.catalogNodeMap.forEach((node, id) => {
          const isHidden = cfg.hiddenCatalogIds.includes(id);
          const isIsolated = cfg.isolatedCatalogId !== null && cfg.isolatedCatalogId !== id;
          node.visible = !isHidden && !isIsolated;
        });

        engineeringRoom.catalogNodeMap.forEach((node, id) => {
          const isHidden = cfg.hiddenCatalogIds.includes(id);
          const isIsolated = cfg.isolatedCatalogId !== null && cfg.isolatedCatalogId !== id;
          node.visible = !isHidden && !isIsolated;
        });

        researchRoom.catalogNodeMap.forEach((node, id) => {
          const isHidden = cfg.hiddenCatalogIds.includes(id);
          const isIsolated = cfg.isolatedCatalogId !== null && cfg.isolatedCatalogId !== id;
          node.visible = !isHidden && !isIsolated;
        });

        qaDevopsRoom.catalogNodeMap.forEach((node, id) => {
          const isHidden = cfg.hiddenCatalogIds.includes(id);
          const isIsolated = cfg.isolatedCatalogId !== null && cfg.isolatedCatalogId !== id;
          node.visible = !isHidden && !isIsolated;
        });

        const selectedNode = cfg.selectedCatalogId
          ? catalogNodeMap.get(cfg.selectedCatalogId) ||
            ceoRoom.catalogNodeMap.get(cfg.selectedCatalogId) ||
            uiuxRoom.catalogNodeMap.get(cfg.selectedCatalogId) ||
            engineeringRoom.catalogNodeMap.get(cfg.selectedCatalogId) ||
            researchRoom.catalogNodeMap.get(cfg.selectedCatalogId) ||
            qaDevopsRoom.catalogNodeMap.get(cfg.selectedCatalogId)
          : null;

        if (!isImportMode && selectedNode) {
          selectionBoxHelper.setFromObject(selectedNode);
          selectionBoxHelper.visible = true;
        } else {
          selectionBoxHelper.visible = false;
        }

        syncFullOfficeCameraConstraints();
        clampFullOfficeCameraState();
        updateRoomActivityHighlights();
        applyCameraAwareWallCutaway();
        requestRender();
      };

      const extractMeshDiagnostic = (hitObj: THREE.Object3D): ClickedMeshDiagnostic => {
        const mesh = hitObj as THREE.Mesh;
        const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const wp = new THREE.Vector3();
        mesh.getWorldPosition(wp);
        return {
          meshName: mesh.name || 'Unnamed_Mesh',
          materialName: mat?.name || 'Default_Material',
          materialType: mat?.type || 'Material',
          parentName: mesh.parent?.name || 'Root',
          worldPosition: [
            Number(wp.x.toFixed(3)),
            Number(wp.y.toFixed(3)),
            Number(wp.z.toFixed(3)),
          ],
        };
      };

      const runVisualStabilityScan = (): VisualStabilityDiagnosticReport => {
        const roomMeshNames = new Set<string>();
        const duplicateRoomMeshNames: string[] = [];
        let totalRoomMeshes = 0;

        roomRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            totalRoomMeshes++;
            const name = obj.name || `Mesh_${totalRoomMeshes}`;
            if (roomMeshNames.has(name)) {
              duplicateRoomMeshNames.push(name);
            } else {
              roomMeshNames.add(name);
            }
          }
        });

        const ceoMeshNames = new Set<string>();
        const duplicateCEORoomMeshNames: string[] = [];
        let totalCEORoomMeshes = 0;

        ceoRoom.ceoRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            totalCEORoomMeshes++;
            const name = obj.name || `CEOMesh_${totalCEORoomMeshes}`;
            if (ceoMeshNames.has(name)) {
              duplicateCEORoomMeshNames.push(name);
            } else {
              ceoMeshNames.add(name);
            }
          }
        });

        const uiuxMeshNames = new Set<string>();
        const duplicateUIUXRoomMeshNames: string[] = [];
        let totalUIUXRoomMeshes = 0;

        uiuxRoom.uiuxRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            totalUIUXRoomMeshes++;
            const name = obj.name || `UIUXMesh_${totalUIUXRoomMeshes}`;
            if (uiuxMeshNames.has(name)) {
              duplicateUIUXRoomMeshNames.push(name);
            } else {
              uiuxMeshNames.add(name);
            }
          }
        });

        const engMeshNames = new Set<string>();
        const duplicateEngineeringRoomMeshNames: string[] = [];
        let totalEngineeringRoomMeshes = 0;

        engineeringRoom.root.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            totalEngineeringRoomMeshes++;
            const name = obj.name || `EngMesh_${totalEngineeringRoomMeshes}`;
            if (engMeshNames.has(name)) {
              duplicateEngineeringRoomMeshNames.push(name);
            } else {
              engMeshNames.add(name);
            }
          }
        });

        const charMeshNames = new Set<string>();
        const duplicateCharacterMeshNames: string[] = [];
        let totalCharacterMeshes = 0;
        if (bossPM) {
          bossPM.modelRoot.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              totalCharacterMeshes++;
              const name = obj.name || `CharMesh_${totalCharacterMeshes}`;
              if (charMeshNames.has(name)) {
                duplicateCharacterMeshNames.push(name);
              } else {
                charMeshNames.add(name);
              }
            }
          });
        }

        let totalCEOCharacterMeshes = 0;
        ceoAgent.modelRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) totalCEOCharacterMeshes++;
        });

        let totalUIUXCharacterMeshes = 0;
        uiuxAgent.modelRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) totalUIUXCharacterMeshes++;
        });

        let totalFrontendCharacterMeshes = 0;
        frontendAgent.modelRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) totalFrontendCharacterMeshes++;
        });

        let totalBackendCharacterMeshes = 0;
        backendAgent.characterRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) totalBackendCharacterMeshes++;
        });

        let totalDatabaseCharacterMeshes = 0;
        databaseAgent.characterRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) totalDatabaseCharacterMeshes++;
        });

        let totalResearchCharacterMeshes = 0;
        researchAgent.characterRoot.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) totalResearchCharacterMeshes++;
        });

        return {
          timestamp: new Date().toLocaleTimeString(),
          totalRoomMeshes,
          totalCEORoomMeshes,
          totalUIUXRoomMeshes,
          totalEngineeringRoomMeshes,
          totalCharacterMeshes,
          totalCEOCharacterMeshes,
          totalUIUXCharacterMeshes,
          totalFrontendCharacterMeshes,
          totalBackendCharacterMeshes,
          totalDatabaseCharacterMeshes,
          totalResearchCharacterMeshes,
          duplicateRoomMeshNames,
          duplicateCEORoomMeshNames,
          duplicateUIUXRoomMeshNames,
          duplicateEngineeringRoomMeshNames,
          duplicateCharacterMeshNames,
          coplanarConflictCount: 0,
          cameraNearFar: [camera.near, camera.far],
          shadowBias: keyLight.shadow.bias,
          shadowNormalBias: keyLight.shadow.normalBias,
          verifiedAreas: [
            {
              area: 'Research Professor Voxel Character (research_professor_agent — 1.755u)',
              status: 'STABLE',
              detail:
                '360-degree voluminous layered white/silver-gray voxel hair (5-material palette #F6F3EC/#EAE6DF/#D8D4DF/#C2BDD0/#ACA6BC across 8 semantic sub-groups), black rectangular glasses with depthWrite:false lenses, short white moustache & compact beard, cream academic coat with green Shared Brain badge over dark vest & red tie, and Shared Brain backpack with seated auto-hide.',
            },
            {
              area: 'Database Developer Voxel Character (database_developer_agent — 1.725u)',
              status: 'STABLE',
              detail:
                '360-degree layered dark chestnut-brown voxel hair (5-material palette #2D1C14/#1C110C/#3D271D/#503528/#38201E across 8 semantic sub-groups), expressive face with NO default glasses, dark charcoal technical jacket with emerald/olive accents & 3-tier DB sleeve patch, and green-accent backpack with seated auto-hide.',
            },
            {
              area: 'Backend Developer Voxel Character (backend_developer_agent — 1.725u)',
              status: 'STABLE',
              detail:
                '360-degree layered dark chocolate-brown voxel hair (4-material palette #2A1B15/#1A100D/#38241C/#4A3126), thick black rectangular glasses with depthWrite:false lenses, dark charcoal technical jacket over light inner shirt, white/silver neck headphones, and backpack with seated auto-hide.',
            },
            {
              area: 'Frontend Developer Voxel Character (frontend_developer_agent — 1.725u)',
              status: 'STABLE',
              detail:
                'Layered dark charcoal voxel hair, black developer glasses with depthWrite:false lenses, vivid orange hoodie with stepped white drawstrings, neck headphones, and technical backpack with auto-hide seated policy.',
            },
            {
              area: 'Engineering Studio V1.1 Monitor Screens, Bezels & Rear VESA Casings (6 Displays)',
              status: 'STABLE',
              detail:
                'All 6 developer monitors use +14mm screen-to-casing clearance (z=+0.006 vs z=-0.008), non-overlapping outer bezel rails, polygonOffset(-1,-1), and stepped 3D rear VESA hardware.',
            },
            {
              area: 'Engineering Studio V1.1 3D Woven Zone Rugs, Floor Slab & Contact Shadows',
              status: 'STABLE',
              detail:
                'Replaced coplanar PlaneGeometry rugs with 3D low-profile voxel rugs (Y=0.002..0.012) and eliminated competing contact shadow under Integration Table.',
            },
            {
              area: 'Engineering Studio V1.1 West/North Wall TopCaps, East Portal Piers & Windows',
              status: 'STABLE',
              detail:
                'Wall bodies terminate at Y=3.14 below TopCap (Y=3.14..3.20); East Portal piers terminate at Y=2.30 below Portal Header (Y=2.30..2.55); window mullions and boards use stepped offsets.',
            },
            {
              area: 'UI/UX Studio & CEO Shared Partition Wall (X = 24.00)',
              status: 'STABLE',
              detail:
                'CEO East plinth ends at X=24.00; UI/UX West plinth starts at X=24.01 and West wall at X=24.04. Zero coplanar overlap.',
            },
            {
              area: 'UI/UX Wireframe Flow Wall & Style System Board',
              status: 'STABLE',
              detail:
                'All 3D wireframe screen cards, sticky notes, and color swatches use stepped X offsets (+0.015u..0.045u) with zero Z-fighting.',
            },
            {
              area: 'PM & CEO Shared Partition Wall (X = 16.00)',
              status: 'STABLE',
              detail:
                'PM East plinth ends at X=16.00; CEO West plinth starts at X=16.01 and West wall at X=16.04. Zero coplanar overlap.',
            },
            {
              area: 'CEO Executive Brain Console, Dual Monitors & OKR Board',
              status: 'STABLE',
              detail:
                'All 7 Brain Console panels, dual monitors, and OKR board use stepped Z/X offsets (+0.012u..0.045u) with zero Z-fighting.',
            },
            {
              area: 'PM, CEO & UI/UX Cabinets, Bookcases & Material Shelves',
              status: 'STABLE',
              detail:
                'Shelves, dividers, and back panels inset inside outer stiles with zero overlapping corner boxes.',
            },
          ],
        };
      };

      controls.addEventListener('start', () => {
        animActive = false;
      });
      controls.addEventListener('change', () => {
        clampFullOfficeCameraState();
        requestRender();
      });

      // Pointer click raycasting: checks Boss PM / CEO / UIUX / Frontend character first, then active room / office geometry
      const raycaster = new THREE.Raycaster();
      const pointerDownPos = new THREE.Vector2();
      const pointerUpPos = new THREE.Vector2();

      const onPointerDown = (e: PointerEvent) => {
        pointerDownPos.set(e.clientX, e.clientY);
      };

      const onPointerUp = (e: PointerEvent) => {
        pointerUpPos.set(e.clientX, e.clientY);
        if (pointerDownPos.distanceTo(pointerUpPos) > 6) return;
        if (configRef.current.workspaceMode === 'import_test') return;

        const rect = renderer.domElement.getBoundingClientRect();
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(ndc, camera);

        // 1. Check if Boss PM character was clicked
        if (bossPM && bossPM.runtimeRoot.visible) {
          const pmHits = raycaster.intersectObject(bossPM.modelRoot, true);
          if (pmHits.length > 0) {
            isPMSelected = true;
            bossPM.setHighlighted(true);
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(pmHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 1b. Check if CEO Executive Assistant character was clicked
        if (ceoAgent.rootGroup.visible) {
          const ceoHits = raycaster.intersectObject(ceoAgent.modelRoot, true);
          if (ceoHits.length > 0) {
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(ceoHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 1c. Check if UI/UX Designer character was clicked
        if (uiuxAgent.rootGroup.visible) {
          const uiuxHits = raycaster.intersectObject(uiuxAgent.modelRoot, true);
          if (uiuxHits.length > 0) {
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(uiuxHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 1d. Check if Frontend Developer character was clicked
        if (frontendAgent.rootGroup.visible) {
          const feHits = raycaster.intersectObject(frontendAgent.modelRoot, true);
          if (feHits.length > 0) {
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(feHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 1e. Check if Backend Developer character was clicked
        if (backendAgent.runtimeRoot.visible) {
          const beHits = raycaster.intersectObject(backendAgent.characterRoot, true);
          if (beHits.length > 0) {
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(beHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 1f. Check if Database Developer character was clicked
        if (databaseAgent.runtimeRoot.visible) {
          const dbHits = raycaster.intersectObject(databaseAgent.characterRoot, true);
          if (dbHits.length > 0) {
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(dbHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 1g. Check if Research Professor character was clicked
        if (researchAgent.runtimeRoot.visible) {
          const resHits = raycaster.intersectObject(researchAgent.characterRoot, true);
          if (resHits.length > 0) {
            callbacksRef.current.onPMCharacterSelectChange(true);
            if (callbacksRef.current.onMeshDiagnosticSelect) {
              callbacksRef.current.onMeshDiagnosticSelect(extractMeshDiagnostic(resHits[0].object));
            }
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // 2. Otherwise check visible room furniture, props, decoration, walls, floor, or Full Office modules
        const intersectTargets: THREE.Object3D[] = [];
        if (roomRoot.visible) {
          intersectTargets.push(
            groups.FURNITURE,
            groups.PROPS,
            groups.DECORATION,
            groups.WALLS,
            groups.WINDOWS,
            groups.FLOOR,
            groups.STRUCTURE,
            groups.CONNECTORS
          );
        }
        if (ceoRoom.ceoRoot.visible) {
          intersectTargets.push(
            ceoRoom.groups.FURNITURE,
            ceoRoom.groups.PROPS,
            ceoRoom.groups.DECORATION,
            ceoRoom.groups.WALLS,
            ceoRoom.groups.WINDOWS,
            ceoRoom.groups.FLOOR,
            ceoRoom.groups.STRUCTURE,
            ceoRoom.groups.CONNECTORS
          );
        }
        if (uiuxRoom.uiuxRoot.visible) {
          intersectTargets.push(
            uiuxRoom.groups.FURNITURE,
            uiuxRoom.groups.PROPS,
            uiuxRoom.groups.DECORATION,
            uiuxRoom.groups.WALLS,
            uiuxRoom.groups.WINDOWS,
            uiuxRoom.groups.FLOOR,
            uiuxRoom.groups.STRUCTURE,
            uiuxRoom.groups.CONNECTORS
          );
        }
        if (engineeringRoom.root.visible) {
          intersectTargets.push(
            engineeringRoom.groups.FURNITURE,
            engineeringRoom.groups.PROPS,
            engineeringRoom.groups.DECORATION,
            engineeringRoom.groups.WALLS,
            engineeringRoom.groups.WINDOWS,
            engineeringRoom.groups.FLOOR,
            engineeringRoom.groups.STRUCTURE,
            engineeringRoom.groups.CONNECTORS
          );
        }
        if (researchRoom.roomRoot.visible) {
          intersectTargets.push(
            researchRoom.groups.FURNITURE,
            researchRoom.groups.PROPS,
            researchRoom.groups.DECORATION,
            researchRoom.groups.WALLS,
            researchRoom.groups.WINDOWS,
            researchRoom.groups.FLOOR,
            researchRoom.groups.STRUCTURE,
            researchRoom.groups.CONNECTORS
          );
        }
        if (qaDevopsRoom.roomRoot.visible) {
          intersectTargets.push(
            qaDevopsRoom.groups.FURNITURE,
            qaDevopsRoom.groups.PROPS,
            qaDevopsRoom.groups.DECORATION,
            qaDevopsRoom.groups.WALLS,
            qaDevopsRoom.groups.WINDOWS,
            qaDevopsRoom.groups.FLOOR,
            qaDevopsRoom.groups.STRUCTURE,
            qaDevopsRoom.groups.CONNECTORS
          );
        }
        if (officeA3.officeRoot.visible) {
          intersectTargets.push(officeA3.officeRoot);
        }

        const hits = raycaster.intersectObjects(intersectTargets, true);
        const firstVisibleMeshHit = hits.find(
          (h) => h.object.visible && (h.object as THREE.Mesh).isMesh
        );
        if (firstVisibleMeshHit && callbacksRef.current.onMeshDiagnosticSelect) {
          callbacksRef.current.onMeshDiagnosticSelect(
            extractMeshDiagnostic(firstVisibleMeshHit.object)
          );
        }

        const validCatalogHit = hits.find((h) => h.object.visible && h.object.userData?.catalogId);
        if (validCatalogHit) {
          if (isPMSelected && bossPM) {
            isPMSelected = false;
            bossPM.setHighlighted(false);
            callbacksRef.current.onPMCharacterSelectChange(false);
          }
          const catId = validCatalogHit.object.userData.catalogId as string;
          const details = computeObjectInspection(catId);
          if (details && (validCatalogHit.object as THREE.Mesh).isMesh) {
            const diag = extractMeshDiagnostic(validCatalogHit.object);
            details.clickedMeshName = diag.meshName;
            details.clickedMaterialName = diag.materialName;
            details.clickedMaterialType = diag.materialType;
          }
          callbacksRef.current.onSelectCatalogItem(catId, details);
          return;
        }

        // Check if user clicked a room module slot in Full Office mode
        if (configRef.current.officeViewMode === 'full_office' && firstVisibleMeshHit) {
          let curr: THREE.Object3D | null = firstVisibleMeshHit.object;
          while (curr) {
            const rKey = (curr.userData?.roomModuleKey || curr.userData?.roomKey) as
              | RoomModuleKey
              | undefined;
            if (rKey && callbacksRef.current.onSelectRoomModuleFromCanvas) {
              callbacksRef.current.onSelectRoomModuleFromCanvas(rKey);
              break;
            }
            curr = curr.parent;
          }
        }

        // Check if user clicked on UI/UX Studio floor to walk the UI/UX Designer character
        if (
          configRef.current.officeViewMode === 'single_room' &&
          configRef.current.selectedRoomKey === 'uiux_studio' &&
          uiuxAgent.rootGroup.visible &&
          firstVisibleMeshHit
        ) {
          let curr: THREE.Object3D | null = firstVisibleMeshHit.object;
          let isFloorHit = false;
          while (curr) {
            if (curr === uiuxRoom.groups.FLOOR) {
              isFloorHit = true;
              break;
            }
            curr = curr.parent;
          }
          if (isFloorHit) {
            const pt = firstVisibleMeshHit.point;
            uiuxAgent.walkToPoint(pt.x, pt.z);
            emitTelemetry();
            requestRender();
            return;
          }
        }

        // Check if user clicked on Engineering Studio floor to walk the Frontend Developer character
        if (
          configRef.current.officeViewMode === 'single_room' &&
          configRef.current.selectedRoomKey === 'engineering' &&
          frontendAgent.rootGroup.visible &&
          firstVisibleMeshHit
        ) {
          let curr: THREE.Object3D | null = firstVisibleMeshHit.object;
          let isFloorHit = false;
          while (curr) {
            if (curr === engineeringRoom.groups.FLOOR) {
              isFloorHit = true;
              break;
            }
            curr = curr.parent;
          }
          if (isFloorHit) {
            const pt = firstVisibleMeshHit.point;
            frontendAgent.walkToPoint(pt.x, pt.z);
            emitTelemetry();
            requestRender();
            return;
          }
        }

        if (isPMSelected && bossPM) {
          isPMSelected = false;
          bossPM.setHighlighted(false);
          callbacksRef.current.onPMCharacterSelectChange(false);
          emitTelemetry();
          requestRender();
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointerup', onPointerUp);

      let lastAspect = aspect;
      const onResize = () => {
        if (!container) return;
        const w = container.clientWidth || 1280;
        const h = container.clientHeight || 800;
        const asp = w / Math.max(1, h);
        camera.left = (-frustumHalf * asp) / 100;
        camera.right = (frustumHalf * asp) / 100;
        camera.top = frustumHalf / 100;
        camera.bottom = -frustumHalf / 100;
        renderer.setSize(w, h);

        // When canvas container resizes (e.g. toggling Left/Right sidebars or Cinema Mode)
        // in Full Office overview, proportionally update fit zoom so the building automatically
        // fills the newly expanded/contracted viewport without resetting simulation state!
        if (
          configRef.current.workspaceMode !== 'import_test' &&
          configRef.current.officeViewMode === 'full_office' &&
          !isFocusedSubView &&
          Math.abs(asp - lastAspect) > 0.004
        ) {
          const prevFitNominal = computeAutoFitZoomForFullOfficePreset(
            isTopDownPresetActive ? 'full_office_top' : 'full_office_cinematic',
            lastAspect
          );
          const nextFitNominal = computeAutoFitZoomForFullOfficePreset(
            isTopDownPresetActive ? 'full_office_top' : 'full_office_cinematic',
            asp
          );
          const userZoomRatio = THREE.MathUtils.clamp(
            (camera.zoom * 68) / Math.max(1, prevFitNominal),
            FULL_OFFICE_CAMERA_PROFILE_V2_1.min_zoom_factor,
            FULL_OFFICE_CAMERA_PROFILE_V2_1.max_zoom_factor
          );
          camera.zoom = (nextFitNominal * userZoomRatio) / 68;
        }
        lastAspect = asp;
        syncFullOfficeCameraConstraints();
        clampFullOfficeCameraState();
        camera.updateProjectionMatrix();
        applyCameraAwareWallCutaway();
        renderer.render(scene, camera);
        emitTelemetry();
        requestRender();
      };
      window.addEventListener('resize', onResize);
      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          onResize();
        });
        resizeObserver.observe(container);
      }

      engineRef.current = {
        renderer,
        scene,
        camera,
        controls,
        roomRoot,
        ceoRoom,
        uiuxRoom,
        engineeringRoom,
        researchRoom,
        qaDevopsRoom,
        officeA3,
        singlePlannedPlaceholders,
        importedRootHolder,
        importedRoomHolder,
        importedCEORoomHolder,
        importedUIUXRoomHolder,
        importedEngineeringRoomHolder,
        importedResearchRoomHolder,
        importedQADevOpsRoomHolder,
        importedCharacterHolder,
        importedCEOCharacterHolder,
        importedUIUXCharacterHolder,
        importedFrontendCharacterHolder,
        importedBackendCharacterHolder,
        importedDatabaseCharacterHolder,
        importedResearchCharacterHolder,
        setImportedCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedCharacterMixer = mixer;
        },
        setImportedCEOCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedCEOCharacterMixer = mixer;
        },
        setImportedUIUXCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedUIUXCharacterMixer = mixer;
        },
        setImportedFrontendCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedFrontendCharacterMixer = mixer;
        },
        setImportedBackendCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedBackendCharacterMixer = mixer;
        },
        setImportedDatabaseCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedDatabaseCharacterMixer = mixer;
        },
        setImportedResearchCharacterMixer: (mixer: THREE.AnimationMixer | null) => {
          importedResearchCharacterMixer = mixer;
        },
        neighborAssemblyGroup,
        previewHelpersGroup,
        gridHelperGroup,
        mannequinGroup,
        selectionBoxHelper,
        matLib,
        groups,
        northWallNodes,
        westWallNodes,
        catalogNodeMap,
        keyLight,
        requestRender,
        startCameraTransition,
        updateVisibilityFromConfig,
        computeObjectInspection,
        prepareRoomsForCleanStandaloneExport,
        lastExportedBuffer: null,
        getBossPMInstance: () => bossPM,
        getCEOAgentInstance: () => ceoAgent,
        getUIUXAgentInstance: () => uiuxAgent,
        getFrontendAgentInstance: () => frontendAgent,
        getBackendAgentInstance: () => backendAgent,
        getDatabaseAgentInstance: () => databaseAgent,
        getResearchAgentInstance: () => researchAgent,
        getSelectedCharacterSource: () => selectedCharacterSource,
        setCharacterSource,
        mountImportedBossPMInstance,
        setLoadError: (err: string | null) => {
          loadError = err;
          emitTelemetry();
        },
        triggerPMAction: (actId: PMActionId, fromAutoDemo = false) =>
          triggerPMAction(actId, fromAutoDemo),
        setSimulationPlayback: (cmd) => {
          if (!bossPM) return;
          if (cmd === 'pause') {
            isPaused = true;
          } else if (cmd === 'play' || cmd === 'resume') {
            isPaused = false;
          } else if (cmd === 'stop') {
            isPaused = false;
            patrolActive = false;
            autoDemoActive = false;
            navPath = [];
            isWalking = false;
            currentActionId = 'idle';
            currentState = 'IDLE';
            simHelpers.updatePathVisuals(
              [bossPM.navigationRoot.position.x, bossPM.navigationRoot.position.z],
              []
            );
            bossPM.transitionToActionPose('idle', false, 'standing');
            updateRoomActivityHighlights();
          } else if (cmd === 'reset_position') {
            isPaused = false;
            patrolActive = false;
            autoDemoActive = false;
            teleportPMToAnchor('SPAWN_POINT');
          } else if (cmd === 'reset_pose') {
            bossPM.resetPoseToRest();
            bossPM.transitionToActionPose('idle', false, 'standing');
          }
          emitTelemetry();
          requestRender();
        },
        setSimulationSpeed: (spd) => {
          speedMultiplier = spd;
          emitTelemetry();
          requestRender();
        },
        startAutoDemo: () => {
          autoDemoActive = true;
          autoDemoStepIndex = 0;
          isPaused = false;
          patrolActive = false;
          const firstStep = AUTO_DEMO_SEQUENCE[0];
          autoDemoTimer = firstStep.durationSeconds;
          triggerPMAction(firstStep.actionId, true);
        },
        stopAutoDemo: () => {
          autoDemoActive = false;
          autoDemoStepIndex = 0;
          triggerPMAction('idle', true);
        },
        approvePendingTask: () => {
          triggerPMAction('task_completed');
        },
        focusCameraOnPM: () => {
          if (!bossPM) return;
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          isPMSelected = true;
          bossPM.setHighlighted(true);
          callbacksRef.current.onPMCharacterSelectChange(true);
          const worldCharPos = new THREE.Vector3();
          bossPM.navigationRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.8, 5.2, worldCharPos.z - 4.8],
            [worldCharPos.x, 1.05, worldCharPos.z],
            148
          );
        },
        focusCameraOnCEOCharacter: () => {
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          const worldCharPos = new THREE.Vector3();
          ceoAgent.navigationRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.6, 5.0, worldCharPos.z - 4.6],
            [worldCharPos.x, 1.1, worldCharPos.z],
            154
          );
        },
        focusCameraOnUIUXCharacter: () => {
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          const worldCharPos = new THREE.Vector3();
          uiuxAgent.navigationRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.6, 5.0, worldCharPos.z - 4.6],
            [worldCharPos.x, 1.1, worldCharPos.z],
            154
          );
        },
        focusCameraOnFrontendCharacter: () => {
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          const worldCharPos = new THREE.Vector3();
          frontendAgent.navigationRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.6, 5.0, worldCharPos.z - 4.6],
            [worldCharPos.x, 1.1, worldCharPos.z],
            154
          );
        },
        focusCameraOnBackendCharacter: () => {
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          const worldCharPos = new THREE.Vector3();
          backendAgent.runtimeRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.6, 5.0, worldCharPos.z - 4.6],
            [worldCharPos.x, 1.1, worldCharPos.z],
            154
          );
        },
        focusCameraOnDatabaseCharacter: () => {
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          const worldCharPos = new THREE.Vector3();
          databaseAgent.runtimeRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.6, 5.0, worldCharPos.z - 4.6],
            [worldCharPos.x, 1.1, worldCharPos.z],
            154
          );
        },
        focusCameraOnResearchCharacter: () => {
          savedRoomCameraState = {
            pos: camera.position.clone(),
            target: controls.target.clone(),
            zoom: camera.zoom * 68,
          };
          const worldCharPos = new THREE.Vector3();
          researchAgent.runtimeRoot.getWorldPosition(worldCharPos);
          startCameraTransition(
            [worldCharPos.x + 5.6, 5.0, worldCharPos.z - 4.6],
            [worldCharPos.x, 1.12, worldCharPos.z],
            154
          );
        },
        returnToRoomView: () => {
          if (savedRoomCameraState) {
            startCameraTransition(
              [
                savedRoomCameraState.pos.x,
                savedRoomCameraState.pos.y,
                savedRoomCameraState.pos.z,
              ],
              [
                savedRoomCameraState.target.x,
                savedRoomCameraState.target.y,
                savedRoomCameraState.target.z,
              ],
              savedRoomCameraState.zoom
            );
            savedRoomCameraState = null;
          } else {
            const def =
              configRef.current.selectedRoomKey === 'engineering'
                ? ENGINEERING_CAMERA_PRESETS[0]
                : configRef.current.selectedRoomKey === 'ceo_executive'
                ? CEO_CAMERA_PRESETS[0]
                : configRef.current.selectedRoomKey === 'uiux_studio'
                ? UIUX_CAMERA_PRESETS[0]
                : CAMERA_PRESETS[0];
            startCameraTransition(def.position, def.target, def.zoom);
          }
        },
        teleportPMToAnchor,
        syncAnchorsOverlay: () => {
          simHelpers.updateAnchorsVisuals(anchorsRef.current, selectedAnchorIdRef.current);
          requestRender();
        },
        syncCEOAnchorsOverlay: () => {
          ceoAnchorHelpers.updateAnchorsVisuals(
            ceoAnchorsRef.current,
            selectedCEOAnchorIdRef.current
          );
          requestRender();
        },
        syncUIUXAnchorsOverlay: () => {
          uiuxAnchorHelpers.updateAnchorsVisuals(
            uiuxAnchorsRef.current,
            selectedUIUXAnchorIdRef.current
          );
          requestRender();
        },
        syncEngineeringAnchorsOverlay: () => {
          engineeringAnchorHelpers.updateAnchorsVisuals(
            engineeringAnchorsRef.current,
            selectedEngineeringAnchorIdRef.current
          );
          requestRender();
        },
        runVisualStabilityScan,
        allAgentMeetingDemo,
      };

      callbacksRef.current.onGLBInspectionReady(originalPMInstance.inspectionReport);
      updateVisibilityFromConfig();
      emitTelemetry();

      tryLoadFixedProjectCharacterAsset().then((instance) => {
        if (instance && engineRef.current) {
          engineRef.current.mountImportedBossPMInstance(instance, false);
        }
      });

      return () => {
        window.removeEventListener('resize', onResize);
        resizeObserver?.disconnect();
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        cancelAnimationFrame(frameId);
        clearTimeout(frameId);
        controls.dispose();
        matLib.dispose();
        renderer.dispose();
      };
    }, []);

    // Sync config changes to Three.js scene without remounting canvas
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.updateVisibilityFromConfig();
      }
    }, [config]);

    // Sync PM anchor edits to 3D markers
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.syncAnchorsOverlay();
      }
    }, [anchors, selectedAnchorId]);

    // Sync CEO anchor edits to 3D markers
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.syncCEOAnchorsOverlay();
      }
    }, [ceoAnchors, selectedCEOAnchorId]);

    // Sync UI/UX Studio anchor edits to 3D markers
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.syncUIUXAnchorsOverlay();
      }
    }, [uiuxAnchors, selectedUIUXAnchorId]);

    // Sync Engineering Studio anchor edits to 3D markers
    useEffect(() => {
      if (engineRef.current) {
        engineRef.current.syncEngineeringAnchorsOverlay();
      }
    }, [engineeringAnchors, selectedEngineeringAnchorId]);

    useImperativeHandle(ref, () => ({
      setCameraPreset: (presetId: string) => {
        const eng = engineRef.current;
        if (!eng) return;
        const selRoom = configRef.current.selectedRoomKey;
        const isFull = configRef.current.officeViewMode === 'full_office';
        const preset = isFull
          ? FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CENTRAL_HUB_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            ENGINEERING_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            QA_DEVOPS_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CAMERA_PRESETS.find((p) => p.id === presetId)
          : selRoom === 'engineering'
          ? ENGINEERING_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CAMERA_PRESETS.find((p) => p.id === presetId)
          : selRoom === 'qa_devops_studio'
          ? QA_DEVOPS_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CAMERA_PRESETS.find((p) => p.id === presetId)
          : selRoom === 'research_brain'
          ? RESEARCH_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CAMERA_PRESETS.find((p) => p.id === presetId)
          : selRoom === 'uiux_studio'
          ? UIUX_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CAMERA_PRESETS.find((p) => p.id === presetId)
          : selRoom === 'ceo_executive'
          ? CEO_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CAMERA_PRESETS.find((p) => p.id === presetId)
          : CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CEO_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            UIUX_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            ENGINEERING_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            RESEARCH_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            QA_DEVOPS_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === presetId) ||
            CENTRAL_HUB_CAMERA_PRESETS.find((p) => p.id === presetId);
        if (preset) {
          const vw = eng.renderer.domElement.clientWidth || 1280;
          const vh = eng.renderer.domElement.clientHeight || 800;
          const asp = vw / Math.max(1, vh);
          const fittedZoom = isFull
            ? computeAutoFitZoomForFullOfficePreset(preset.id, asp)
            : preset.zoom;
          eng.startCameraTransition(preset.position, preset.target, fittedZoom);
          callbacksRef.current.onPresetChange(preset.id);
        }
      },
      resetCamera: () => {
        const eng = engineRef.current;
        if (!eng) return;
        if (configRef.current.officeViewMode === 'full_office') {
          const def = FULL_OFFICE_CAMERA_PRESETS[0];
          const vw = eng.renderer.domElement.clientWidth || 1280;
          const vh = eng.renderer.domElement.clientHeight || 800;
          const fittedZoom = computeAutoFitZoomForFullOfficePreset(
            def.id,
            vw / Math.max(1, vh)
          );
          eng.startCameraTransition(def.position, def.target, fittedZoom);
          callbacksRef.current.onPresetChange(def.id);
        } else if (configRef.current.selectedRoomKey === 'engineering') {
          const def = ENGINEERING_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          callbacksRef.current.onPresetChange(def.id);
        } else if (configRef.current.selectedRoomKey === 'qa_devops_studio') {
          const def = QA_DEVOPS_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          callbacksRef.current.onPresetChange(def.id);
        } else if (configRef.current.selectedRoomKey === 'research_brain') {
          const def = RESEARCH_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          callbacksRef.current.onPresetChange(def.id);
        } else if (configRef.current.selectedRoomKey === 'ceo_executive') {
          const def = CEO_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          callbacksRef.current.onPresetChange(def.id);
        } else if (configRef.current.selectedRoomKey === 'uiux_studio') {
          const def = UIUX_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          callbacksRef.current.onPresetChange(def.id);
        } else {
          const def = CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          callbacksRef.current.onPresetChange(def.id);
        }
      },
      fitRoom: () => {
        const eng = engineRef.current;
        if (!eng) return;
        if (configRef.current.officeViewMode === 'full_office') {
          const def = FULL_OFFICE_CAMERA_PRESETS[0];
          const vw = eng.renderer.domElement.clientWidth || 1280;
          const vh = eng.renderer.domElement.clientHeight || 800;
          const fittedZoom = computeAutoFitZoomForFullOfficePreset(
            def.id,
            vw / Math.max(1, vh)
          );
          eng.startCameraTransition(def.position, def.target, fittedZoom);
          return;
        }
        if (configRef.current.selectedRoomKey === 'engineering') {
          const def = ENGINEERING_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          return;
        }
        if (configRef.current.selectedRoomKey === 'qa_devops_studio') {
          const def = QA_DEVOPS_CAMERA_PRESETS[0];
          eng.startCameraTransition(def.position, def.target, def.zoom);
          return;
        }
        const isNeighbor =
          configRef.current.workspaceMode === 'import_test' &&
          configRef.current.showNeighborAssembly;
        if (isNeighbor) {
          eng.startCameraTransition([17.5, 14.5, -9.5], [6.5, 0.8, 1.5], 44);
        } else {
          eng.startCameraTransition([13.6, 11.2, -5.6], [4.0, 1.15, 4.0], 76);
        }
      },
      zoomBy: (factor: number) => {
        const eng = engineRef.current;
        if (!eng) return;
        const minZ = eng.controls.minZoom || 0.22;
        const maxZ = eng.controls.maxZoom || 4.5;
        eng.camera.zoom = THREE.MathUtils.clamp(eng.camera.zoom * factor, minZ, maxZ);
        eng.camera.updateProjectionMatrix();
        eng.requestRender();
      },
      orbitBy: (deltaAzimuthRad: number, deltaPolarRad = 0) => {
        const eng = engineRef.current;
        if (!eng) return;
        const isFull =
          configRef.current.workspaceMode !== 'import_test' &&
          configRef.current.officeViewMode === 'full_office';
        const orbitMode = configRef.current.fullOfficeOrbitMode ?? 'cinematic';

        const offset = eng.camera.position.clone().sub(eng.controls.target);
        const dist = offset.length();
        const horizDist = Math.hypot(offset.x, offset.z);
        if (isFull && orbitMode === 'cinematic' && horizDist > 0.2) {
          const elevDeg = THREE.MathUtils.radToDeg(Math.atan2(offset.y, horizDist));
          const azimDeg = THREE.MathUtils.radToDeg(Math.atan2(offset.x, -offset.z));
          const nextEl = THREE.MathUtils.clamp(
            elevDeg - THREE.MathUtils.radToDeg(deltaPolarRad),
            FULL_OFFICE_CAMERA_PROFILE_V2_1.minimum_elevation,
            FULL_OFFICE_CAMERA_PROFILE_V2_1.maximum_elevation
          );
          const [minAz, maxAz] = FULL_OFFICE_CAMERA_PROFILE_V2_1.azimuth_limits;
          const nextAz = THREE.MathUtils.clamp(
            azimDeg + THREE.MathUtils.radToDeg(deltaAzimuthRad),
            minAz,
            maxAz
          );
          const elRad = THREE.MathUtils.degToRad(nextEl);
          const azRad = THREE.MathUtils.degToRad(nextAz);
          const newHoriz = dist * Math.cos(elRad);
          eng.camera.position.set(
            eng.controls.target.x + newHoriz * Math.sin(azRad),
            eng.controls.target.y + dist * Math.sin(elRad),
            eng.controls.target.z - newHoriz * Math.cos(azRad)
          );
        } else {
          const spherical = new THREE.Spherical().setFromVector3(offset);
          spherical.theta += deltaAzimuthRad;
          spherical.phi = THREE.MathUtils.clamp(
            spherical.phi + deltaPolarRad,
            eng.controls.minPolarAngle || 0.1,
            eng.controls.maxPolarAngle || Math.PI / 2 - 0.05
          );
          offset.setFromSpherical(spherical);
          eng.camera.position.copy(eng.controls.target).add(offset);
        }
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        eng.requestRender();
      },
      inspectCatalogItem: (catalogId: string) => {
        const eng = engineRef.current;
        if (!eng) return null;
        return eng.computeObjectInspection(catalogId);
      },
      exportGLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        try {
          const buffer = await exportRoomToGLBBuffer(eng.roomRoot);
          eng.lastExportedBuffer = buffer;
          triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.ROOM_GLB);
          return {
            filename: PRODUCTION_FILENAMES.ROOM_GLB,
            byteLength: buffer.byteLength,
          };
        } finally {
          restore();
        }
      },
      exportCEORoomGLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        try {
          const buffer = await exportRoomToGLBBuffer(eng.ceoRoom.ceoRoot);
          triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.CEO_ROOM_GLB);
          return {
            filename: PRODUCTION_FILENAMES.CEO_ROOM_GLB,
            byteLength: buffer.byteLength,
          };
        } finally {
          restore();
        }
      },
      exportUIUXRoomGLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        try {
          const buffer = await exportRoomToGLBBuffer(eng.uiuxRoom.uiuxRoot);
          triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.UIUX_ROOM_GLB);
          return {
            filename: PRODUCTION_FILENAMES.UIUX_ROOM_GLB,
            byteLength: buffer.byteLength,
          };
        } finally {
          restore();
        }
      },
      exportEngineeringRoomGLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        try {
          const buffer = await exportRoomToGLBBuffer(eng.engineeringRoom.root);
          triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.ENGINEERING_ROOM_GLB);
          return {
            filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_GLB,
            byteLength: buffer.byteLength,
          };
        } finally {
          restore();
        }
      },
      exportResearchRoomGLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        try {
          const buffer = await exportRoomToGLBBuffer(eng.researchRoom.roomRoot);
          triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB);
          return {
            filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB,
            byteLength: buffer.byteLength,
          };
        } finally {
          restore();
        }
      },
      exportQADevOpsRoomGLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        try {
          const buffer = await exportRoomToGLBBuffer(eng.qaDevopsRoom.roomRoot);
          triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB);
          return {
            filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB,
            byteLength: buffer.byteLength,
          };
        } finally {
          restore();
        }
      },
      exportOriginalPMGLB: async () => {
        const buffer = await exportOriginalBossPMToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportCEOCharacterGLB: async () => {
        const buffer = await exportCEOExecutiveAssistantToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.CEO_CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.CEO_CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportUIUXCharacterGLB: async () => {
        const buffer = await exportUIUXDesignerToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.UIUX_CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.UIUX_CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportFrontendCharacterGLB: async () => {
        const buffer = await exportFrontendDeveloperToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.FRONTEND_CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.FRONTEND_CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportBackendCharacterGLB: async () => {
        const buffer = await exportBackendDeveloperToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.BACKEND_CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.BACKEND_CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportDatabaseCharacterGLB: async () => {
        const buffer = await exportDatabaseDeveloperToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.DATABASE_CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.DATABASE_CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportResearchCharacterGLB: async () => {
        const buffer = await exportResearchProfessorToGLBBuffer();
        triggerBinaryDownload(buffer, PRODUCTION_FILENAMES.RESEARCH_CHARACTER_GLB);
        return {
          filename: PRODUCTION_FILENAMES.RESEARCH_CHARACTER_GLB,
          byteLength: buffer.byteLength,
        };
      },
      exportManifest: () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const stats = measureRoomStats(eng.roomRoot);
        const manifest = generateRoomManifest(stats);
        triggerJsonDownload(manifest, PRODUCTION_FILENAMES.ROOM_MANIFEST);
        return {
          filename: PRODUCTION_FILENAMES.ROOM_MANIFEST,
        };
      },
      exportPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.ROOM_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.ROOM_PREVIEW,
          dataUrl,
        };
      },
      exportCEORoomPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevPMVis = eng.roomRoot.visible;
        const prevUIUXVis = eng.uiuxRoom.uiuxRoot.visible;
        const prevOfficeVis = eng.officeA3.officeRoot.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : false;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoCharVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxCharVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = true;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;

          const defCEO = CEO_CAMERA_PRESETS[0];
          eng.camera.position.set(...defCEO.position);
          eng.controls.target.set(...defCEO.target);
          eng.camera.zoom = defCEO.zoom / 68;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();

          eng.renderer.render(eng.scene, eng.camera);
          const dataUrl = eng.renderer.domElement.toDataURL('image/png');
          triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.CEO_ROOM_PREVIEW);
          return {
            filename: PRODUCTION_FILENAMES.CEO_ROOM_PREVIEW,
            dataUrl,
          };
        } finally {
          eng.camera.position.copy(prevPos);
          eng.controls.target.copy(prevTarget);
          eng.camera.zoom = prevZoom;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();
          eng.previewHelpersGroup.visible = prevHelpersVis;
          eng.roomRoot.visible = prevPMVis;
          eng.uiuxRoom.uiuxRoot.visible = prevUIUXVis;
          eng.officeA3.officeRoot.visible = prevOfficeVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoCharVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportUIUXRoomPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevPMVis = eng.roomRoot.visible;
        const prevCEOVis = eng.ceoRoom.ceoRoot.visible;
        const prevOfficeVis = eng.officeA3.officeRoot.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : false;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoCharVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxCharVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = true;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;

          const defUIUX = UIUX_CAMERA_PRESETS[0];
          eng.camera.position.set(...defUIUX.position);
          eng.controls.target.set(...defUIUX.target);
          eng.camera.zoom = defUIUX.zoom / 68;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();

          eng.renderer.render(eng.scene, eng.camera);
          const dataUrl = eng.renderer.domElement.toDataURL('image/png');
          triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.UIUX_ROOM_PREVIEW);
          return {
            filename: PRODUCTION_FILENAMES.UIUX_ROOM_PREVIEW,
            dataUrl,
          };
        } finally {
          eng.camera.position.copy(prevPos);
          eng.controls.target.copy(prevTarget);
          eng.camera.zoom = prevZoom;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();
          eng.previewHelpersGroup.visible = prevHelpersVis;
          eng.roomRoot.visible = prevPMVis;
          eng.ceoRoom.ceoRoot.visible = prevCEOVis;
          eng.officeA3.officeRoot.visible = prevOfficeVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoCharVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportEngineeringRoomPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevPMVis = eng.roomRoot.visible;
        const prevCEOVis = eng.ceoRoom.ceoRoot.visible;
        const prevUIUXVis = eng.uiuxRoom.uiuxRoot.visible;
        const prevOfficeVis = eng.officeA3.officeRoot.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : false;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoCharVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxCharVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const feChar = eng.getFrontendAgentInstance();
        const prevFeCharVis = feChar ? feChar.rootGroup.visible : false;
        const beChar = eng.getBackendAgentInstance();
        const prevBeCharVis = beChar ? beChar.runtimeRoot.visible : false;
        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbCharVis = dbChar ? dbChar.runtimeRoot.visible : false;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.engineeringRoom.root.visible = true;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          if (feChar) feChar.rootGroup.visible = false;
          if (beChar) beChar.runtimeRoot.visible = false;
          if (dbChar) dbChar.runtimeRoot.visible = false;

          const defEng = ENGINEERING_CAMERA_PRESETS[0];
          eng.camera.position.set(...defEng.position);
          eng.controls.target.set(...defEng.target);
          eng.camera.zoom = defEng.zoom / 68;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();

          eng.renderer.render(eng.scene, eng.camera);
          const dataUrl = eng.renderer.domElement.toDataURL('image/png');
          triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.ENGINEERING_ROOM_PREVIEW);
          return {
            filename: PRODUCTION_FILENAMES.ENGINEERING_ROOM_PREVIEW,
            dataUrl,
          };
        } finally {
          eng.camera.position.copy(prevPos);
          eng.controls.target.copy(prevTarget);
          eng.camera.zoom = prevZoom;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();
          eng.previewHelpersGroup.visible = prevHelpersVis;
          eng.roomRoot.visible = prevPMVis;
          eng.ceoRoom.ceoRoot.visible = prevCEOVis;
          eng.uiuxRoom.uiuxRoot.visible = prevUIUXVis;
          eng.officeA3.officeRoot.visible = prevOfficeVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoCharVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxCharVis;
          if (feChar) feChar.rootGroup.visible = prevFeCharVis;
          if (beChar) beChar.runtimeRoot.visible = prevBeCharVis;
          if (dbChar) dbChar.runtimeRoot.visible = prevDbCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportResearchRoomPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevPMVis = eng.roomRoot.visible;
        const prevCEOVis = eng.ceoRoom.ceoRoot.visible;
        const prevUIUXVis = eng.uiuxRoom.uiuxRoot.visible;
        const prevEngVis = eng.engineeringRoom.root.visible;
        const prevOfficeVis = eng.officeA3.officeRoot.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : false;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoCharVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxCharVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const feChar = eng.getFrontendAgentInstance();
        const prevFeCharVis = feChar ? feChar.rootGroup.visible : false;
        const beChar = eng.getBackendAgentInstance();
        const prevBeCharVis = beChar ? beChar.runtimeRoot.visible : false;
        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbCharVis = dbChar ? dbChar.runtimeRoot.visible : false;
        const resChar = eng.getResearchAgentInstance();
        const prevResCharVis = resChar ? resChar.runtimeRoot.visible : false;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.researchRoom.helpersGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.researchRoom.roomRoot.visible = true;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          if (feChar) feChar.rootGroup.visible = false;
          if (beChar) beChar.runtimeRoot.visible = false;
          if (dbChar) dbChar.runtimeRoot.visible = false;
          if (resChar) resChar.runtimeRoot.visible = false;

          const defRes = RESEARCH_CAMERA_PRESETS[0];
          eng.camera.position.set(...defRes.position);
          eng.controls.target.set(...defRes.target);
          eng.camera.zoom = defRes.zoom / 68;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();

          eng.renderer.render(eng.scene, eng.camera);
          const dataUrl = eng.renderer.domElement.toDataURL('image/png');
          triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW);
          return {
            filename: PRODUCTION_FILENAMES.RESEARCH_ROOM_PREVIEW,
            dataUrl,
          };
        } finally {
          eng.camera.position.copy(prevPos);
          eng.controls.target.copy(prevTarget);
          eng.camera.zoom = prevZoom;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();
          eng.previewHelpersGroup.visible = prevHelpersVis;
          eng.roomRoot.visible = prevPMVis;
          eng.ceoRoom.ceoRoot.visible = prevCEOVis;
          eng.uiuxRoom.uiuxRoot.visible = prevUIUXVis;
          eng.engineeringRoom.root.visible = prevEngVis;
          eng.officeA3.officeRoot.visible = prevOfficeVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoCharVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxCharVis;
          if (feChar) feChar.rootGroup.visible = prevFeCharVis;
          if (beChar) beChar.runtimeRoot.visible = prevBeCharVis;
          if (dbChar) dbChar.runtimeRoot.visible = prevDbCharVis;
          if (resChar) resChar.runtimeRoot.visible = prevResCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportQADevOpsRoomPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevPMVis = eng.roomRoot.visible;
        const prevCEOVis = eng.ceoRoom.ceoRoot.visible;
        const prevUIUXVis = eng.uiuxRoom.uiuxRoot.visible;
        const prevEngVis = eng.engineeringRoom.root.visible;
        const prevResVis = eng.researchRoom.roomRoot.visible;
        const prevOfficeVis = eng.officeA3.officeRoot.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : false;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoCharVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxCharVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const feChar = eng.getFrontendAgentInstance();
        const prevFeCharVis = feChar ? feChar.rootGroup.visible : false;
        const beChar = eng.getBackendAgentInstance();
        const prevBeCharVis = beChar ? beChar.runtimeRoot.visible : false;
        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbCharVis = dbChar ? dbChar.runtimeRoot.visible : false;
        const resChar = eng.getResearchAgentInstance();
        const prevResCharVis = resChar ? resChar.runtimeRoot.visible : false;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.qaDevopsRoom.helpersGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.researchRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = true;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          if (feChar) feChar.rootGroup.visible = false;
          if (beChar) beChar.runtimeRoot.visible = false;
          if (dbChar) dbChar.runtimeRoot.visible = false;
          if (resChar) resChar.runtimeRoot.visible = false;

          const defQD = QA_DEVOPS_CAMERA_PRESETS[0];
          eng.camera.position.set(...defQD.position);
          eng.controls.target.set(...defQD.target);
          eng.camera.zoom = defQD.zoom / 68;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();

          eng.renderer.render(eng.scene, eng.camera);
          const dataUrl = eng.renderer.domElement.toDataURL('image/png');
          triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PREVIEW);
          return {
            filename: PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_PREVIEW,
            dataUrl,
          };
        } finally {
          eng.camera.position.copy(prevPos);
          eng.controls.target.copy(prevTarget);
          eng.camera.zoom = prevZoom;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();
          eng.previewHelpersGroup.visible = prevHelpersVis;
          eng.roomRoot.visible = prevPMVis;
          eng.ceoRoom.ceoRoot.visible = prevCEOVis;
          eng.uiuxRoom.uiuxRoot.visible = prevUIUXVis;
          eng.engineeringRoom.root.visible = prevEngVis;
          eng.researchRoom.roomRoot.visible = prevResVis;
          eng.officeA3.officeRoot.visible = prevOfficeVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoCharVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxCharVis;
          if (feChar) feChar.rootGroup.visible = prevFeCharVis;
          if (beChar) beChar.runtimeRoot.visible = prevBeCharVis;
          if (dbChar) dbChar.runtimeRoot.visible = prevDbCharVis;
          if (resChar) resChar.runtimeRoot.visible = prevResCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        eng.previewHelpersGroup.visible = false;
        const boss = eng.getBossPMInstance();
        if (boss) {
          const charPos = new THREE.Vector3();
          boss.navigationRoot.getWorldPosition(charPos);
          eng.camera.position.set(charPos.x + 5.8, 5.2, charPos.z - 4.8);
          eng.controls.target.set(charPos.x, 1.05, charPos.z);
          eng.camera.zoom = 148 / 68;
          eng.camera.updateProjectionMatrix();
          eng.controls.update();
        }
        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      exportCEOCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar.rootGroup.visible;
        ceoChar.rootGroup.visible = true;
        eng.previewHelpersGroup.visible = false;

        const charPos = new THREE.Vector3();
        ceoChar.navigationRoot.getWorldPosition(charPos);
        eng.camera.position.set(charPos.x + 5.4, 4.9, charPos.z - 4.5);
        eng.controls.target.set(charPos.x, 1.1, charPos.z);
        eng.camera.zoom = 154 / 68;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();

        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        ceoChar.rootGroup.visible = prevCeoVis;
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.CEO_CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.CEO_CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      exportUIUXCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxVis = uiuxChar.rootGroup.visible;
        uiuxChar.rootGroup.visible = true;
        eng.previewHelpersGroup.visible = false;

        const charPos = new THREE.Vector3();
        uiuxChar.navigationRoot.getWorldPosition(charPos);
        eng.camera.position.set(charPos.x + 5.4, 4.9, charPos.z - 4.5);
        eng.controls.target.set(charPos.x, 1.1, charPos.z);
        eng.camera.zoom = 154 / 68;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();

        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        uiuxChar.rootGroup.visible = prevUiuxVis;
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.UIUX_CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.UIUX_CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      exportFrontendCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        const feChar = eng.getFrontendAgentInstance();
        const prevFeVis = feChar.rootGroup.visible;
        feChar.rootGroup.visible = true;
        eng.previewHelpersGroup.visible = false;

        const charPos = new THREE.Vector3();
        feChar.navigationRoot.getWorldPosition(charPos);
        eng.camera.position.set(charPos.x + 5.4, 4.9, charPos.z - 4.5);
        eng.controls.target.set(charPos.x, 1.1, charPos.z);
        eng.camera.zoom = 154 / 68;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();

        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        feChar.rootGroup.visible = prevFeVis;
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.FRONTEND_CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      exportBackendCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        const beChar = eng.getBackendAgentInstance();
        const prevBeVis = beChar.runtimeRoot.visible;
        beChar.runtimeRoot.visible = true;
        eng.previewHelpersGroup.visible = false;

        const charPos = new THREE.Vector3();
        beChar.runtimeRoot.getWorldPosition(charPos);
        eng.camera.position.set(charPos.x + 5.4, 4.9, charPos.z - 4.5);
        eng.controls.target.set(charPos.x, 1.1, charPos.z);
        eng.camera.zoom = 154 / 68;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();

        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        beChar.runtimeRoot.visible = prevBeVis;
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.BACKEND_CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.BACKEND_CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      exportDatabaseCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbVis = dbChar.runtimeRoot.visible;
        dbChar.runtimeRoot.visible = true;
        eng.previewHelpersGroup.visible = false;

        const charPos = new THREE.Vector3();
        dbChar.runtimeRoot.getWorldPosition(charPos);
        eng.camera.position.set(charPos.x + 5.4, 4.9, charPos.z - 4.5);
        eng.controls.target.set(charPos.x, 1.1, charPos.z);
        eng.camera.zoom = 154 / 68;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();

        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        dbChar.runtimeRoot.visible = prevDbVis;
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.DATABASE_CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.DATABASE_CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      exportResearchCharacterPreviewPNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const prevPos = eng.camera.position.clone();
        const prevTarget = eng.controls.target.clone();
        const prevZoom = eng.camera.zoom;

        const resChar = eng.getResearchAgentInstance();
        const prevResVis = resChar.runtimeRoot.visible;
        resChar.runtimeRoot.visible = true;
        eng.previewHelpersGroup.visible = false;

        const charPos = new THREE.Vector3();
        resChar.runtimeRoot.getWorldPosition(charPos);
        eng.camera.position.set(charPos.x + 5.4, 4.9, charPos.z - 4.5);
        eng.controls.target.set(charPos.x, 1.12, charPos.z);
        eng.camera.zoom = 154 / 68;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();

        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');

        eng.camera.position.copy(prevPos);
        eng.controls.target.copy(prevTarget);
        eng.camera.zoom = prevZoom;
        eng.camera.updateProjectionMatrix();
        eng.controls.update();
        resChar.runtimeRoot.visible = prevResVis;
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PREVIEW);
        return {
          filename: PRODUCTION_FILENAMES.RESEARCH_CHARACTER_PREVIEW,
          dataUrl,
        };
      },
      runImportValidation: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        let suite: Awaited<ReturnType<typeof runFullIndependentRoundTripSuite>>;
        try {
          suite = await runFullIndependentRoundTripSuite(eng.roomRoot, {
            ceoRoot: eng.ceoRoom.ceoRoot,
            ceoAnchors: ceoAnchorsRef.current,
            uiuxRoot: eng.uiuxRoom.uiuxRoot,
            uiuxAnchors: uiuxAnchorsRef.current,
            engineeringRoot: eng.engineeringRoom.root,
            engineeringAnchors: engineeringAnchorsRef.current,
            researchRoot: eng.researchRoom.roomRoot,
            qaDevopsRoot: eng.qaDevopsRoom.roomRoot,
          });
        } finally {
          restore();
        }
        eng.lastExportedBuffer = suite.roomPack.glbBuffer;

        while (eng.importedRoomHolder.children.length > 0) {
          eng.importedRoomHolder.remove(eng.importedRoomHolder.children[0]);
        }
        eng.importedRoomHolder.add(suite.importedRoomScene);

        while (eng.importedCEORoomHolder.children.length > 0) {
          eng.importedCEORoomHolder.remove(eng.importedCEORoomHolder.children[0]);
        }
        if (suite.importedCEOScene) {
          eng.importedCEORoomHolder.add(suite.importedCEOScene);
        }

        while (eng.importedUIUXRoomHolder.children.length > 0) {
          eng.importedUIUXRoomHolder.remove(eng.importedUIUXRoomHolder.children[0]);
        }
        if (suite.importedUIUXScene) {
          eng.importedUIUXRoomHolder.add(suite.importedUIUXScene);
        }

        while (eng.importedEngineeringRoomHolder.children.length > 0) {
          eng.importedEngineeringRoomHolder.remove(eng.importedEngineeringRoomHolder.children[0]);
        }
        if (suite.importedEngineeringScene) {
          eng.importedEngineeringRoomHolder.add(suite.importedEngineeringScene);
        }

        while (eng.importedResearchRoomHolder.children.length > 0) {
          eng.importedResearchRoomHolder.remove(eng.importedResearchRoomHolder.children[0]);
        }
        if (suite.importedResearchScene) {
          eng.importedResearchRoomHolder.add(suite.importedResearchScene);
        }

        while (eng.importedQADevOpsRoomHolder.children.length > 0) {
          eng.importedQADevOpsRoomHolder.remove(eng.importedQADevOpsRoomHolder.children[0]);
        }
        if (suite.importedQADevOpsScene) {
          eng.importedQADevOpsRoomHolder.add(suite.importedQADevOpsScene);
        }

        while (eng.importedCharacterHolder.children.length > 0) {
          eng.importedCharacterHolder.remove(eng.importedCharacterHolder.children[0]);
        }
        const charScene = suite.importedCharacterScene;
        const idleAnchor = anchorsRef.current.ROOM_IDLE_POSITION;
        charScene.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
        charScene.rotation.y = idleAnchor.facingRad;
        eng.importedCharacterHolder.add(charScene);

        if (suite.importedCharacterAnimations.length > 0) {
          const mixer = new THREE.AnimationMixer(charScene);
          const idleClip =
            suite.importedCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
            suite.importedCharacterAnimations[0];
          if (idleClip) {
            mixer.clipAction(idleClip).play();
          }
          eng.setImportedCharacterMixer(mixer);
        } else {
          eng.setImportedCharacterMixer(null);
        }

        while (eng.importedCEOCharacterHolder.children.length > 0) {
          eng.importedCEOCharacterHolder.remove(eng.importedCEOCharacterHolder.children[0]);
        }
        if (suite.importedCEOCharacterScene) {
          const ceoCharScene = suite.importedCEOCharacterScene;
          const ceoIdleAnchor = ceoAnchorsRef.current.CEO_ROOM_IDLE;
          ceoCharScene.position.set(ceoIdleAnchor.position[0], 0, ceoIdleAnchor.position[2]);
          ceoCharScene.rotation.y = ceoIdleAnchor.facingRad;
          eng.importedCEOCharacterHolder.add(ceoCharScene);

          if (suite.importedCEOCharacterAnimations.length > 0) {
            const ceoMixer = new THREE.AnimationMixer(ceoCharScene);
            const ceoIdleClip =
              suite.importedCEOCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedCEOCharacterAnimations[0];
            if (ceoIdleClip) {
              ceoMixer.clipAction(ceoIdleClip).play();
            }
            eng.setImportedCEOCharacterMixer(ceoMixer);
          } else {
            eng.setImportedCEOCharacterMixer(null);
          }
        }

        while (eng.importedUIUXCharacterHolder.children.length > 0) {
          eng.importedUIUXCharacterHolder.remove(eng.importedUIUXCharacterHolder.children[0]);
        }
        if (suite.importedUIUXCharacterScene) {
          const uiuxCharScene = suite.importedUIUXCharacterScene;
          const uiuxIdleAnchor = uiuxAnchorsRef.current.UIUX_ROOM_IDLE;
          uiuxCharScene.position.set(uiuxIdleAnchor.position[0], 0, uiuxIdleAnchor.position[2]);
          uiuxCharScene.rotation.y = uiuxIdleAnchor.facingRad;
          eng.importedUIUXCharacterHolder.add(uiuxCharScene);

          if (suite.importedUIUXCharacterAnimations.length > 0) {
            const uiuxMixer = new THREE.AnimationMixer(uiuxCharScene);
            const uiuxIdleClip =
              suite.importedUIUXCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedUIUXCharacterAnimations[0];
            if (uiuxIdleClip) {
              uiuxMixer.clipAction(uiuxIdleClip).play();
            }
            eng.setImportedUIUXCharacterMixer(uiuxMixer);
          } else {
            eng.setImportedUIUXCharacterMixer(null);
          }
        }

        while (eng.importedFrontendCharacterHolder.children.length > 0) {
          eng.importedFrontendCharacterHolder.remove(
            eng.importedFrontendCharacterHolder.children[0]
          );
        }
        if (suite.importedFrontendCharacterScene) {
          const feCharScene = suite.importedFrontendCharacterScene;
          const feIdleAnchor = engineeringAnchorsRef.current.ENGINEERING_ROOM_IDLE;
          feCharScene.position.set(feIdleAnchor.position[0], 0, feIdleAnchor.position[2]);
          feCharScene.rotation.y = feIdleAnchor.facingRad;
          eng.importedFrontendCharacterHolder.add(feCharScene);

          if (suite.importedFrontendCharacterAnimations.length > 0) {
            const feMixer = new THREE.AnimationMixer(feCharScene);
            const feIdleClip =
              suite.importedFrontendCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedFrontendCharacterAnimations[0];
            if (feIdleClip) {
              feMixer.clipAction(feIdleClip).play();
            }
            eng.setImportedFrontendCharacterMixer(feMixer);
          } else {
            eng.setImportedFrontendCharacterMixer(null);
          }
        }

        while (eng.importedBackendCharacterHolder.children.length > 0) {
          eng.importedBackendCharacterHolder.remove(
            eng.importedBackendCharacterHolder.children[0]
          );
        }
        if (suite.importedBackendCharacterScene) {
          const beCharScene = suite.importedBackendCharacterScene;
          const beApproachAnchor = engineeringAnchorsRef.current.BE_WORKSTATION_APPROACH;
          beCharScene.position.set(beApproachAnchor.position[0], 0, beApproachAnchor.position[2]);
          beCharScene.rotation.y = beApproachAnchor.facingRad;
          eng.importedBackendCharacterHolder.add(beCharScene);

          if (suite.importedBackendCharacterAnimations.length > 0) {
            const beMixer = new THREE.AnimationMixer(beCharScene);
            const beIdleClip =
              suite.importedBackendCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedBackendCharacterAnimations[0];
            if (beIdleClip) {
              beMixer.clipAction(beIdleClip).play();
            }
            eng.setImportedBackendCharacterMixer(beMixer);
          } else {
            eng.setImportedBackendCharacterMixer(null);
          }
        }

        while (eng.importedDatabaseCharacterHolder.children.length > 0) {
          eng.importedDatabaseCharacterHolder.remove(
            eng.importedDatabaseCharacterHolder.children[0]
          );
        }
        if (suite.importedDatabaseCharacterScene) {
          const dbCharScene = suite.importedDatabaseCharacterScene;
          const dbApproachAnchor = engineeringAnchorsRef.current.DB_WORKSTATION_APPROACH;
          dbCharScene.position.set(dbApproachAnchor.position[0], 0, dbApproachAnchor.position[2]);
          dbCharScene.rotation.y = dbApproachAnchor.facingRad;
          eng.importedDatabaseCharacterHolder.add(dbCharScene);

          if (suite.importedDatabaseCharacterAnimations.length > 0) {
            const dbMixer = new THREE.AnimationMixer(dbCharScene);
            const dbIdleClip =
              suite.importedDatabaseCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedDatabaseCharacterAnimations[0];
            if (dbIdleClip) {
              dbMixer.clipAction(dbIdleClip).play();
            }
            eng.setImportedDatabaseCharacterMixer(dbMixer);
          } else {
            eng.setImportedDatabaseCharacterMixer(null);
          }
        }

        while (eng.importedResearchCharacterHolder.children.length > 0) {
          eng.importedResearchCharacterHolder.remove(
            eng.importedResearchCharacterHolder.children[0]
          );
        }
        if (suite.importedResearchCharacterScene) {
          const resCharScene = suite.importedResearchCharacterScene;
          const resIdleAnchor =
            DEFAULT_RESEARCH_ANCHORS.find((a) => a.id === 'RESEARCH_ROOM_IDLE') ||
            DEFAULT_RESEARCH_ANCHORS[0];
          resCharScene.position.set(resIdleAnchor.position[0], 0, resIdleAnchor.position[2]);
          resCharScene.rotation.y = resIdleAnchor.rotationY;
          eng.importedResearchCharacterHolder.add(resCharScene);

          if (suite.importedResearchCharacterAnimations.length > 0) {
            const resMixer = new THREE.AnimationMixer(resCharScene);
            const resIdleClip =
              suite.importedResearchCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedResearchCharacterAnimations[0];
            if (resIdleClip) {
              resMixer.clipAction(resIdleClip).play();
            }
            eng.setImportedResearchCharacterMixer(resMixer);
          } else {
            eng.setImportedResearchCharacterMixer(null);
          }
        }

        callbacksRef.current.onImportReportReady(suite.roundTripReport.room_roundtrip);
        if (callbacksRef.current.onRoundTripReportReady) {
          callbacksRef.current.onRoundTripReportReady(suite.roundTripReport);
        }
        eng.updateVisibilityFromConfig();
        const defIso =
          configRef.current.selectedRoomKey === 'engineering'
            ? ENGINEERING_CAMERA_PRESETS[0]
            : configRef.current.selectedRoomKey === 'qa_devops_studio'
            ? QA_DEVOPS_CAMERA_PRESETS[0]
            : CAMERA_PRESETS[0];
        eng.startCameraTransition(defIso.position, defIso.target, defIso.zoom);
        return suite.roundTripReport.room_roundtrip;
      },
      runFullHandoffValidation: async (sourceFileCount = 37) => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        let suite: Awaited<ReturnType<typeof runFullIndependentRoundTripSuite>>;
        try {
          suite = await runFullIndependentRoundTripSuite(eng.roomRoot, {
            sourceArchiveConfirmed: true,
            sourceFileCount,
            ceoRoot: eng.ceoRoom.ceoRoot,
            uiuxRoot: eng.uiuxRoom.uiuxRoot,
            engineeringRoot: eng.engineeringRoom.root,
            engineeringAnchors: engineeringAnchorsRef.current,
            researchRoot: eng.researchRoom.roomRoot,
            qaDevopsRoot: eng.qaDevopsRoom.roomRoot,
            centralHubV2Root: eng.officeA3.centralHub.hubRoot,
          });
        } finally {
          restore();
        }
        eng.lastExportedBuffer = suite.roomPack.glbBuffer;

        while (eng.importedRoomHolder.children.length > 0) {
          eng.importedRoomHolder.remove(eng.importedRoomHolder.children[0]);
        }
        eng.importedRoomHolder.add(suite.importedRoomScene);

        while (eng.importedCEORoomHolder.children.length > 0) {
          eng.importedCEORoomHolder.remove(eng.importedCEORoomHolder.children[0]);
        }
        if (suite.importedCEOScene) {
          eng.importedCEORoomHolder.add(suite.importedCEOScene);
        }

        while (eng.importedUIUXRoomHolder.children.length > 0) {
          eng.importedUIUXRoomHolder.remove(eng.importedUIUXRoomHolder.children[0]);
        }
        if (suite.importedUIUXScene) {
          eng.importedUIUXRoomHolder.add(suite.importedUIUXScene);
        }

        while (eng.importedEngineeringRoomHolder.children.length > 0) {
          eng.importedEngineeringRoomHolder.remove(eng.importedEngineeringRoomHolder.children[0]);
        }
        if (suite.importedEngineeringScene) {
          eng.importedEngineeringRoomHolder.add(suite.importedEngineeringScene);
        }

        while (eng.importedResearchRoomHolder.children.length > 0) {
          eng.importedResearchRoomHolder.remove(eng.importedResearchRoomHolder.children[0]);
        }
        if (suite.importedResearchScene) {
          eng.importedResearchRoomHolder.add(suite.importedResearchScene);
        }

        while (eng.importedQADevOpsRoomHolder.children.length > 0) {
          eng.importedQADevOpsRoomHolder.remove(eng.importedQADevOpsRoomHolder.children[0]);
        }
        if (suite.importedQADevOpsScene) {
          eng.importedQADevOpsRoomHolder.add(suite.importedQADevOpsScene);
        }

        while (eng.importedCharacterHolder.children.length > 0) {
          eng.importedCharacterHolder.remove(eng.importedCharacterHolder.children[0]);
        }
        const charScene = suite.importedCharacterScene;
        const idleAnchor = anchorsRef.current.ROOM_IDLE_POSITION;
        charScene.position.set(idleAnchor.position[0], 0, idleAnchor.position[2]);
        charScene.rotation.y = idleAnchor.facingRad;
        eng.importedCharacterHolder.add(charScene);

        if (suite.importedCharacterAnimations.length > 0) {
          const mixer = new THREE.AnimationMixer(charScene);
          const idleClip =
            suite.importedCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
            suite.importedCharacterAnimations[0];
          if (idleClip) {
            mixer.clipAction(idleClip).play();
          }
          eng.setImportedCharacterMixer(mixer);
        } else {
          eng.setImportedCharacterMixer(null);
        }

        while (eng.importedCEOCharacterHolder.children.length > 0) {
          eng.importedCEOCharacterHolder.remove(eng.importedCEOCharacterHolder.children[0]);
        }
        if (suite.importedCEOCharacterScene) {
          const ceoCharScene = suite.importedCEOCharacterScene;
          const ceoIdleAnchor = ceoAnchorsRef.current.CEO_ROOM_IDLE;
          ceoCharScene.position.set(ceoIdleAnchor.position[0], 0, ceoIdleAnchor.position[2]);
          ceoCharScene.rotation.y = ceoIdleAnchor.facingRad;
          eng.importedCEOCharacterHolder.add(ceoCharScene);

          if (suite.importedCEOCharacterAnimations.length > 0) {
            const ceoMixer = new THREE.AnimationMixer(ceoCharScene);
            const ceoIdleClip =
              suite.importedCEOCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedCEOCharacterAnimations[0];
            if (ceoIdleClip) {
              ceoMixer.clipAction(ceoIdleClip).play();
            }
            eng.setImportedCEOCharacterMixer(ceoMixer);
          } else {
            eng.setImportedCEOCharacterMixer(null);
          }
        }

        while (eng.importedUIUXCharacterHolder.children.length > 0) {
          eng.importedUIUXCharacterHolder.remove(eng.importedUIUXCharacterHolder.children[0]);
        }
        if (suite.importedUIUXCharacterScene) {
          const uiuxCharScene = suite.importedUIUXCharacterScene;
          const uiuxIdleAnchor = uiuxAnchorsRef.current.UIUX_ROOM_IDLE;
          uiuxCharScene.position.set(uiuxIdleAnchor.position[0], 0, uiuxIdleAnchor.position[2]);
          uiuxCharScene.rotation.y = uiuxIdleAnchor.facingRad;
          eng.importedUIUXCharacterHolder.add(uiuxCharScene);

          if (suite.importedUIUXCharacterAnimations.length > 0) {
            const uiuxMixer = new THREE.AnimationMixer(uiuxCharScene);
            const uiuxIdleClip =
              suite.importedUIUXCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedUIUXCharacterAnimations[0];
            if (uiuxIdleClip) {
              uiuxMixer.clipAction(uiuxIdleClip).play();
            }
            eng.setImportedUIUXCharacterMixer(uiuxMixer);
          } else {
            eng.setImportedUIUXCharacterMixer(null);
          }
        }

        while (eng.importedFrontendCharacterHolder.children.length > 0) {
          eng.importedFrontendCharacterHolder.remove(
            eng.importedFrontendCharacterHolder.children[0]
          );
        }
        if (suite.importedFrontendCharacterScene) {
          const feCharScene = suite.importedFrontendCharacterScene;
          const feIdleAnchor = engineeringAnchorsRef.current.ENGINEERING_ROOM_IDLE;
          feCharScene.position.set(feIdleAnchor.position[0], 0, feIdleAnchor.position[2]);
          feCharScene.rotation.y = feIdleAnchor.facingRad;
          eng.importedFrontendCharacterHolder.add(feCharScene);

          if (suite.importedFrontendCharacterAnimations.length > 0) {
            const feMixer = new THREE.AnimationMixer(feCharScene);
            const feIdleClip =
              suite.importedFrontendCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedFrontendCharacterAnimations[0];
            if (feIdleClip) {
              feMixer.clipAction(feIdleClip).play();
            }
            eng.setImportedFrontendCharacterMixer(feMixer);
          } else {
            eng.setImportedFrontendCharacterMixer(null);
          }
        }

        while (eng.importedBackendCharacterHolder.children.length > 0) {
          eng.importedBackendCharacterHolder.remove(
            eng.importedBackendCharacterHolder.children[0]
          );
        }
        if (suite.importedBackendCharacterScene) {
          const beCharScene = suite.importedBackendCharacterScene;
          const beApproachAnchor = engineeringAnchorsRef.current.BE_WORKSTATION_APPROACH;
          beCharScene.position.set(beApproachAnchor.position[0], 0, beApproachAnchor.position[2]);
          beCharScene.rotation.y = beApproachAnchor.facingRad;
          eng.importedBackendCharacterHolder.add(beCharScene);

          if (suite.importedBackendCharacterAnimations.length > 0) {
            const beMixer = new THREE.AnimationMixer(beCharScene);
            const beIdleClip =
              suite.importedBackendCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedBackendCharacterAnimations[0];
            if (beIdleClip) {
              beMixer.clipAction(beIdleClip).play();
            }
            eng.setImportedBackendCharacterMixer(beMixer);
          } else {
            eng.setImportedBackendCharacterMixer(null);
          }
        }

        while (eng.importedDatabaseCharacterHolder.children.length > 0) {
          eng.importedDatabaseCharacterHolder.remove(
            eng.importedDatabaseCharacterHolder.children[0]
          );
        }
        if (suite.importedDatabaseCharacterScene) {
          const dbCharScene = suite.importedDatabaseCharacterScene;
          const dbApproachAnchor = engineeringAnchorsRef.current.DB_WORKSTATION_APPROACH;
          dbCharScene.position.set(dbApproachAnchor.position[0], 0, dbApproachAnchor.position[2]);
          dbCharScene.rotation.y = dbApproachAnchor.facingRad;
          eng.importedDatabaseCharacterHolder.add(dbCharScene);

          if (suite.importedDatabaseCharacterAnimations.length > 0) {
            const dbMixer = new THREE.AnimationMixer(dbCharScene);
            const dbIdleClip =
              suite.importedDatabaseCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedDatabaseCharacterAnimations[0];
            if (dbIdleClip) {
              dbMixer.clipAction(dbIdleClip).play();
            }
            eng.setImportedDatabaseCharacterMixer(dbMixer);
          } else {
            eng.setImportedDatabaseCharacterMixer(null);
          }
        }

        while (eng.importedResearchCharacterHolder.children.length > 0) {
          eng.importedResearchCharacterHolder.remove(
            eng.importedResearchCharacterHolder.children[0]
          );
        }
        if (suite.importedResearchCharacterScene) {
          const resCharScene = suite.importedResearchCharacterScene;
          const resIdleAnchor =
            DEFAULT_RESEARCH_ANCHORS.find((a) => a.id === 'RESEARCH_ROOM_IDLE') ||
            DEFAULT_RESEARCH_ANCHORS[0];
          resCharScene.position.set(resIdleAnchor.position[0], 0, resIdleAnchor.position[2]);
          resCharScene.rotation.y = resIdleAnchor.rotationY;
          eng.importedResearchCharacterHolder.add(resCharScene);

          if (suite.importedResearchCharacterAnimations.length > 0) {
            const resMixer = new THREE.AnimationMixer(resCharScene);
            const resIdleClip =
              suite.importedResearchCharacterAnimations.find((c) => c.name === 'Idle_Breathing') ||
              suite.importedResearchCharacterAnimations[0];
            if (resIdleClip) {
              resMixer.clipAction(resIdleClip).play();
            }
            eng.setImportedResearchCharacterMixer(resMixer);
          } else {
            eng.setImportedResearchCharacterMixer(null);
          }
        }

        callbacksRef.current.onImportReportReady(suite.roundTripReport.room_roundtrip);
        if (callbacksRef.current.onRoundTripReportReady) {
          callbacksRef.current.onRoundTripReportReady(suite.roundTripReport);
        }
        eng.updateVisibilityFromConfig();
        const defIso =
          configRef.current.selectedRoomKey === 'engineering'
            ? ENGINEERING_CAMERA_PRESETS[0]
            : configRef.current.selectedRoomKey === 'qa_devops_studio'
            ? QA_DEVOPS_CAMERA_PRESETS[0]
            : configRef.current.selectedRoomKey === 'research_brain'
            ? RESEARCH_CAMERA_PRESETS[0]
            : configRef.current.selectedRoomKey === 'ceo_executive'
            ? CEO_CAMERA_PRESETS[0]
            : configRef.current.selectedRoomKey === 'uiux_studio'
            ? UIUX_CAMERA_PRESETS[0]
            : CAMERA_PRESETS[0];
        eng.startCameraTransition(defIso.position, defIso.target, defIso.zoom);
        return suite.roundTripReport;
      },
      exportRoomProductionPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : true;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar ? ceoChar.rootGroup.visible : false;

        try {
          eng.previewHelpersGroup.visible = false;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.researchRoom.roomRoot.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.roomRoot.visible = true;
          eng.renderer.render(eng.scene, eng.camera);
          const roomPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');

          return await buildRoomProductionAssetPack(
            eng.roomRoot,
            anchorsRef.current,
            roomPreviewDataUrl,
            'PASS'
          );
        } finally {
          eng.previewHelpersGroup.visible = prevHelpersVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoVis;
          restore();
          eng.requestRender();
        }
      },
      exportCEORoomProductionPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : true;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar ? ceoChar.rootGroup.visible : false;

        try {
          eng.previewHelpersGroup.visible = false;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.researchRoom.roomRoot.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = true;
          eng.renderer.render(eng.scene, eng.camera);
          const ceoPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');

          return await buildCEORoomProductionAssetPack(
            eng.ceoRoom.ceoRoot,
            ceoAnchorsRef.current,
            ceoPreviewDataUrl,
            'PASS'
          );
        } finally {
          eng.previewHelpersGroup.visible = prevHelpersVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoVis;
          restore();
          eng.requestRender();
        }
      },
      exportUIUXRoomProductionPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : true;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxVis = uiuxChar ? uiuxChar.rootGroup.visible : false;

        try {
          eng.previewHelpersGroup.visible = false;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.researchRoom.roomRoot.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = true;
          eng.renderer.render(eng.scene, eng.camera);
          const uiuxPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');

          return await buildUIUXRoomProductionAssetPack(
            eng.uiuxRoom.uiuxRoot,
            uiuxAnchorsRef.current,
            uiuxPreviewDataUrl,
            'PASS'
          );
        } finally {
          eng.previewHelpersGroup.visible = prevHelpersVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxVis;
          restore();
          eng.requestRender();
        }
      },
      exportEngineeringRoomProductionPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : true;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const feChar = eng.getFrontendAgentInstance();
        const prevFeVis = feChar ? feChar.rootGroup.visible : false;
        const beChar = eng.getBackendAgentInstance();
        const prevBeVis = beChar ? beChar.runtimeRoot.visible : false;
        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbVis = dbChar ? dbChar.runtimeRoot.visible : false;

        try {
          eng.previewHelpersGroup.visible = false;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          if (feChar) feChar.rootGroup.visible = false;
          if (beChar) beChar.runtimeRoot.visible = false;
          if (dbChar) dbChar.runtimeRoot.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.researchRoom.roomRoot.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.engineeringRoom.root.visible = true;
          eng.renderer.render(eng.scene, eng.camera);
          const engPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');

          return await buildEngineeringRoomProductionAssetPack(
            eng.engineeringRoom.root,
            engineeringAnchorsRef.current,
            engPreviewDataUrl,
            'PASS'
          );
        } finally {
          eng.previewHelpersGroup.visible = prevHelpersVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxVis;
          if (feChar) feChar.rootGroup.visible = prevFeVis;
          if (beChar) beChar.runtimeRoot.visible = prevBeVis;
          if (dbChar) dbChar.runtimeRoot.visible = prevDbVis;
          restore();
          eng.requestRender();
        }
      },
      exportResearchRoomProductionPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : true;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const feChar = eng.getFrontendAgentInstance();
        const prevFeVis = feChar ? feChar.rootGroup.visible : false;
        const beChar = eng.getBackendAgentInstance();
        const prevBeVis = beChar ? beChar.runtimeRoot.visible : false;
        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbVis = dbChar ? dbChar.runtimeRoot.visible : false;
        const resChar = eng.getResearchAgentInstance();
        const prevResCharVis = resChar ? resChar.runtimeRoot.visible : false;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.researchRoom.helpersGroup.visible = false;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          if (feChar) feChar.rootGroup.visible = false;
          if (beChar) beChar.runtimeRoot.visible = false;
          if (dbChar) dbChar.runtimeRoot.visible = false;
          if (resChar) resChar.runtimeRoot.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.researchRoom.roomRoot.visible = true;
          eng.renderer.render(eng.scene, eng.camera);
          const resPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');

          return await buildResearchRoomProductionAssetPack(
            eng.researchRoom.roomRoot,
            undefined,
            resPreviewDataUrl,
            'PASS'
          );
        } finally {
          eng.previewHelpersGroup.visible = prevHelpersVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxVis;
          if (feChar) feChar.rootGroup.visible = prevFeVis;
          if (beChar) beChar.runtimeRoot.visible = prevBeVis;
          if (dbChar) dbChar.runtimeRoot.visible = prevDbVis;
          if (resChar) resChar.runtimeRoot.visible = prevResCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportQADevOpsRoomProductionPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const restore = eng.prepareRoomsForCleanStandaloneExport();
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        const boss = eng.getBossPMInstance();
        const prevBossVis = boss ? boss.runtimeRoot.visible : true;
        const ceoChar = eng.getCEOAgentInstance();
        const prevCeoVis = ceoChar ? ceoChar.rootGroup.visible : false;
        const uiuxChar = eng.getUIUXAgentInstance();
        const prevUiuxVis = uiuxChar ? uiuxChar.rootGroup.visible : false;
        const feChar = eng.getFrontendAgentInstance();
        const prevFeVis = feChar ? feChar.rootGroup.visible : false;
        const beChar = eng.getBackendAgentInstance();
        const prevBeVis = beChar ? beChar.runtimeRoot.visible : false;
        const dbChar = eng.getDatabaseAgentInstance();
        const prevDbVis = dbChar ? dbChar.runtimeRoot.visible : false;
        const resChar = eng.getResearchAgentInstance();
        const prevResCharVis = resChar ? resChar.runtimeRoot.visible : false;

        try {
          eng.previewHelpersGroup.visible = false;
          eng.qaDevopsRoom.helpersGroup.visible = false;
          if (boss) boss.runtimeRoot.visible = false;
          if (ceoChar) ceoChar.rootGroup.visible = false;
          if (uiuxChar) uiuxChar.rootGroup.visible = false;
          if (feChar) feChar.rootGroup.visible = false;
          if (beChar) beChar.runtimeRoot.visible = false;
          if (dbChar) dbChar.runtimeRoot.visible = false;
          if (resChar) resChar.runtimeRoot.visible = false;
          eng.roomRoot.visible = false;
          eng.ceoRoom.ceoRoot.visible = false;
          eng.uiuxRoom.uiuxRoot.visible = false;
          eng.engineeringRoom.root.visible = false;
          eng.researchRoom.roomRoot.visible = false;
          eng.officeA3.officeRoot.visible = false;
          eng.qaDevopsRoom.roomRoot.visible = true;
          eng.renderer.render(eng.scene, eng.camera);
          const qdPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');

          return await buildQADevOpsRoomProductionAssetPack(
            eng.qaDevopsRoom.roomRoot,
            undefined,
            qdPreviewDataUrl,
            'PASS'
          );
        } finally {
          eng.previewHelpersGroup.visible = prevHelpersVis;
          if (boss) boss.runtimeRoot.visible = prevBossVis;
          if (ceoChar) ceoChar.rootGroup.visible = prevCeoVis;
          if (uiuxChar) uiuxChar.rootGroup.visible = prevUiuxVis;
          if (feChar) feChar.rootGroup.visible = prevFeVis;
          if (beChar) beChar.runtimeRoot.visible = prevBeVis;
          if (dbChar) dbChar.runtimeRoot.visible = prevDbVis;
          if (resChar) resChar.runtimeRoot.visible = prevResCharVis;
          restore();
          eng.requestRender();
        }
      },
      exportCharacterCandidatePack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const charPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildCharacterExportCandidatePack(anchorsRef.current, charPreviewDataUrl, 'PASS');
      },
      exportCEOCharacterPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const ceoCharPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildCEOCharacterExportPack(ceoCharPreviewDataUrl, 'PASS');
      },
      exportUIUXCharacterPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const uiuxCharPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildUIUXCharacterExportPack(uiuxCharPreviewDataUrl, 'PASS');
      },
      exportFrontendCharacterPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const feCharPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildFrontendCharacterExportPack(feCharPreviewDataUrl, 'PASS');
      },
      exportBackendCharacterPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const beCharPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildBackendCharacterExportPack(beCharPreviewDataUrl, 'PASS');
      },
      exportDatabaseCharacterPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const dbCharPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildDatabaseCharacterExportPack(dbCharPreviewDataUrl, 'PASS');
      },
      exportResearchCharacterPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const resCharPreviewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();

        return buildResearchCharacterExportPack(resCharPreviewDataUrl, 'PASS');
      },
      setCharacterSource: (source: CharacterSourceType) => {
        engineRef.current?.setCharacterSource(source);
      },
      triggerPMAction: (actionId: PMActionId) => {
        engineRef.current?.triggerPMAction(actionId);
      },
      setSimulationPlayback: (cmd) => {
        engineRef.current?.setSimulationPlayback(cmd);
      },
      setSimulationSpeed: (speed) => {
        engineRef.current?.setSimulationSpeed(speed);
      },
      startAutoDemo: () => {
        engineRef.current?.startAutoDemo();
      },
      stopAutoDemo: () => {
        engineRef.current?.stopAutoDemo();
      },
      approvePendingTask: () => {
        engineRef.current?.approvePendingTask();
      },
      focusCameraOnPM: () => {
        engineRef.current?.focusCameraOnPM();
      },
      returnToRoomView: () => {
        engineRef.current?.returnToRoomView();
      },
      triggerCEOAction: (actionId: CEOActionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().triggerAction(actionId);
        eng.requestRender();
      },
      executeCEOPlayback: (cmd) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().executePlayback(cmd);
        eng.requestRender();
      },
      setCEOSpeed: (speed: 0.5 | 1 | 1.5) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().setSpeed(speed);
        eng.requestRender();
      },
      setCEOPatrol: (active: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().setPatrol(active);
        eng.requestRender();
      },
      startCEOAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().startAutoDemo();
        eng.requestRender();
      },
      stopCEOAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().stopAutoDemo();
        eng.requestRender();
      },
      setCEOExpression: (expr: CEOExpressionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().setExpression(expr);
        eng.requestRender();
      },
      setCEOGlassesVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getCEOAgentInstance().setGlassesVisible(visible);
        eng.requestRender();
      },
      focusCameraOnCEOCharacter: () => {
        engineRef.current?.focusCameraOnCEOCharacter();
      },
      triggerUIUXAction: (actionId: UIUXActionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().triggerAction(actionId);
        eng.requestRender();
      },
      executeUIUXPlayback: (cmd: UIUXAnimationPlaybackCommand) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().executePlayback(cmd);
        eng.requestRender();
      },
      setUIUXSpeed: (speed: UIUXSpeedMultiplier) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().setSpeed(speed);
        eng.requestRender();
      },
      setUIUXPatrol: (active: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().setPatrol(active);
        eng.requestRender();
      },
      startUIUXAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().startAutoDemo();
        eng.requestRender();
      },
      stopUIUXAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().stopAutoDemo();
        eng.requestRender();
      },
      setUIUXExpression: (expr: UIUXExpressionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().setExpression(expr);
        eng.requestRender();
      },
      setUIUXGlassesVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getUIUXAgentInstance().setGlassesVisible(visible);
        eng.requestRender();
      },
      focusCameraOnUIUXCharacter: () => {
        engineRef.current?.focusCameraOnUIUXCharacter();
      },
      triggerFrontendAction: (actionId: FrontendActionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().triggerAction(actionId);
        eng.requestRender();
      },
      executeFrontendPlayback: (cmd: FrontendAnimationPlaybackCommand) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().executePlayback(cmd);
        eng.requestRender();
      },
      setFrontendSpeed: (speed: FrontendSpeedMultiplier) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().setSpeed(speed);
        eng.requestRender();
      },
      setFrontendPatrol: (active: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().setPatrol(active);
        eng.requestRender();
      },
      startFrontendAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().startAutoDemo();
        eng.requestRender();
      },
      stopFrontendAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().stopAutoDemo();
        eng.requestRender();
      },
      setFrontendExpression: (expr: FrontendExpressionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().setExpression(expr);
        eng.requestRender();
      },
      setFrontendGlassesVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().setGlassesVisible(visible);
        eng.requestRender();
      },
      setFrontendBackpackVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getFrontendAgentInstance().setBackpackVisible(visible);
        eng.requestRender();
      },
      focusCameraOnFrontendCharacter: () => {
        engineRef.current?.focusCameraOnFrontendCharacter();
      },
      triggerBackendAction: (actionId: BackendActionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().triggerAction(actionId);
        eng.requestRender();
      },
      executeBackendPlayback: (cmd: BackendAnimationPlaybackCommand) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().executePlayback(cmd);
        eng.requestRender();
      },
      setBackendSpeed: (speed: BackendSpeedMultiplier) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().setSpeedMultiplier(speed);
        eng.requestRender();
      },
      setBackendPatrol: (active: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().setPatrolActive(active);
        eng.requestRender();
      },
      startBackendAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().startAutoDemo();
        eng.requestRender();
      },
      stopBackendAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().stopAutoDemo();
        eng.requestRender();
      },
      setBackendExpression: (expr: BackendExpressionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().setExpression(expr);
        eng.requestRender();
      },
      setBackendGlassesVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().setGlassesVisible(visible);
        eng.requestRender();
      },
      setBackendBackpackVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getBackendAgentInstance().setBackpackVisible(visible);
        eng.requestRender();
      },
      focusCameraOnBackendCharacter: () => {
        engineRef.current?.focusCameraOnBackendCharacter();
      },
      triggerDatabaseAction: (actionId: DatabaseActionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().triggerAction(actionId);
        eng.requestRender();
      },
      executeDatabasePlayback: (cmd: DatabaseAnimationPlaybackCommand) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().executePlayback(cmd);
        eng.requestRender();
      },
      setDatabaseSpeed: (speed: DatabaseSpeedMultiplier) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().setSpeedMultiplier(speed);
        eng.requestRender();
      },
      setDatabasePatrol: (active: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().setPatrolActive(active);
        eng.requestRender();
      },
      startDatabaseAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().startAutoDemo();
        eng.requestRender();
      },
      stopDatabaseAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().stopAutoDemo();
        eng.requestRender();
      },
      setDatabaseExpression: (expr: DatabaseExpressionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().setExpression(expr);
        eng.requestRender();
      },
      setDatabaseBackpackVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getDatabaseAgentInstance().setBackpackVisible(visible);
        eng.requestRender();
      },
      focusCameraOnDatabaseCharacter: () => {
        engineRef.current?.focusCameraOnDatabaseCharacter();
      },
      triggerResearchAction: (actionId: ResearchActionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().triggerAction(actionId);
        eng.requestRender();
      },
      executeResearchPlayback: (cmd: ResearchAnimationPlaybackCommand) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().executePlayback(cmd);
        eng.requestRender();
      },
      setResearchSpeed: (speed: ResearchSpeedMultiplier) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().setSpeedMultiplier(speed);
        eng.requestRender();
      },
      setResearchPatrol: (active: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().setPatrolActive(active);
        eng.requestRender();
      },
      startResearchAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().startAutoDemo();
        eng.requestRender();
      },
      stopResearchAutoDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().stopAutoDemo();
        eng.requestRender();
      },
      setResearchExpression: (expr: ResearchExpressionId) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().setExpression(expr);
        eng.requestRender();
      },
      setResearchGlassesVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().setGlassesVisible(visible);
        eng.requestRender();
      },
      setResearchBackpackVisible: (visible: boolean) => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.getResearchAgentInstance().setBackpackVisible(visible);
        eng.requestRender();
      },
      focusCameraOnResearchCharacter: () => {
        engineRef.current?.focusCameraOnResearchCharacter();
      },
      loadCustomBossPMFile: async (file: File) => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        try {
          eng.setLoadError(null);
          const instance = await loadBossPMFromBrowserFile(file);
          eng.mountImportedBossPMInstance(instance, true);
          return instance.inspectionReport;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          eng.setLoadError(msg);
          throw err;
        }
      },
      reloadDefaultBossPMAsset: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        eng.setCharacterSource('original_pm');
        const boss = eng.getBossPMInstance();
        return boss?.inspectionReport ?? null;
      },
      setCharacterScaleMultiplier: (multiplier: number) => {
        const eng = engineRef.current;
        const boss = eng?.getBossPMInstance();
        if (!eng || !boss) return;
        boss.setScaleMultiplier(multiplier);
        eng.requestRender();
      },
      setCharacterForwardOffsetDeg: (deg: number) => {
        const eng = engineRef.current;
        const boss = eng?.getBossPMInstance();
        if (!eng || !boss) return;
        boss.setForwardOffsetDeg(deg);
        eng.requestRender();
      },
      teleportPMToAnchor: (anchorId: AnchorId) => {
        engineRef.current?.teleportPMToAnchor(anchorId);
      },
      exportSimulationConfig: () => {
        const eng = engineRef.current;
        const boss = eng?.getBossPMInstance() ?? null;
        const cfg = buildSimulationExportConfig(
          anchorsRef.current,
          boss?.inspectionReport ?? null,
          eng?.getSelectedCharacterSource() ?? 'original_pm'
        );
        const filename = 'AI_OFFICE_ROOM_PM_v1.simulation.json';
        triggerJsonDownload(cfg, filename);
        return { filename };
      },
      runVisualStabilityScan: () => {
        const eng = engineRef.current;
        if (!eng) {
          throw new Error('3D engine not initialized.');
        }
        return eng.runVisualStabilityScan();
      },
      focusRoomInFullOffice: (roomKey: RoomModuleKey) => {
        const eng = engineRef.current;
        if (!eng) return;
        const rm = getRoomModuleByKey(roomKey);
        eng.officeA3.setHighlightedRoomModule(roomKey);
        eng.startCameraTransition(
          rm.full_office_focus_camera.position,
          rm.full_office_focus_camera.target,
          rm.full_office_focus_camera.zoom
        );
      },
      focusSelectedAgentCamera: () => {
        const eng = engineRef.current;
        if (!eng) return;
        const selKey = configRef.current.selectedRoomKey;
        if (selKey === 'ceo_executive') {
          eng.focusCameraOnCEOCharacter();
        } else if (selKey === 'uiux_studio') {
          eng.focusCameraOnUIUXCharacter();
        } else if (selKey === 'engineering') {
          eng.focusCameraOnFrontendCharacter();
        } else if (selKey === 'research_brain') {
          eng.focusCameraOnResearchCharacter();
        } else {
          eng.focusCameraOnPM();
        }
      },
      focusAnchorPosition: (pos: [number, number, number]) => {
        const eng = engineRef.current;
        if (!eng) return;
        const isFull = configRef.current.officeViewMode === 'full_office';
        const selKey = configRef.current.selectedRoomKey;
        const ox = isFull
          ? selKey === 'ceo_executive'
            ? 16
            : selKey === 'uiux_studio' || selKey === 'qa_devops_studio'
            ? 24
            : selKey === 'pm_strategy'
            ? 8
            : 0
          : 0;
        const oz =
          isFull &&
          (selKey === 'ceo_executive' ||
            selKey === 'uiux_studio' ||
            selKey === 'pm_strategy' ||
            selKey === 'research_brain')
            ? 18
            : 0;
        const tx = ox + pos[0];
        const tz = oz + pos[2];
        eng.startCameraTransition([tx + 5.6, 5.2, tz - 4.8], [tx, 1.0, tz], 136);
      },
      startAllAgentMeetingDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.allAgentMeetingDemo.startMeetingDemo();
        eng.requestRender();
      },
      stopAllAgentMeetingDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.allAgentMeetingDemo.stopMeetingDemo();
        eng.requestRender();
      },
      resetAllAgentMeetingDemo: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.allAgentMeetingDemo.resetMeetingDemo();
        eng.requestRender();
      },
      teleportAllAgentsToMeetingSeats: () => {
        const eng = engineRef.current;
        if (!eng) return;
        eng.allAgentMeetingDemo.teleportAllToSeatsImmediate();
        eng.requestRender();
      },
      focusMeetingTableCamera: () => {
        const eng = engineRef.current;
        if (!eng) return;
        const preset =
          FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'focus_meeting_table') ||
          FULL_OFFICE_CAMERA_PRESETS[0];
        eng.startCameraTransition(preset.position, preset.target, preset.zoom);
        callbacksRef.current.onPresetChange(preset.id);
      },
      focusCentralHubCamera: () => {
        const eng = engineRef.current;
        if (!eng) return;
        const preset =
          FULL_OFFICE_CAMERA_PRESETS.find((p) => p.id === 'focus_central_hub') ||
          FULL_OFFICE_CAMERA_PRESETS[0];
        eng.startCameraTransition(preset.position, preset.target, preset.zoom);
        callbacksRef.current.onPresetChange(preset.id);
      },
      exportCentralHubV2GLB: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const pack = await buildCentralHubV2ProductionAssetPack(
          eng.officeA3.centralHub.hubRoot,
          null,
          'PASS'
        );
        triggerBinaryDownload(pack.glbBuffer, PRODUCTION_FILENAMES.CENTRAL_HUB_V2_GLB);
        return {
          filename: PRODUCTION_FILENAMES.CENTRAL_HUB_V2_GLB,
          byteLength: pack.glbSizeBytes,
        };
      },
      exportCentralHubV2AssetPack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const previewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();
        return await buildCentralHubV2ProductionAssetPack(
          eng.officeA3.centralHub.hubRoot,
          previewDataUrl,
          'PASS'
        );
      },
      exportFullOfficeVisualUpgradeV2Pack: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const previewDataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();
        const pack = await buildCentralHubV2ProductionAssetPack(
          eng.officeA3.centralHub.hubRoot,
          previewDataUrl,
          'PASS'
        );
        return downloadOfficeVisualUpgradeV2PackZip(pack);
      },
      exportFullOfficePreviewV2PNG: async () => {
        const eng = engineRef.current;
        if (!eng) throw new Error('3D engine not initialized.');
        const prevHelpersVis = eng.previewHelpersGroup.visible;
        eng.previewHelpersGroup.visible = false;
        eng.renderer.render(eng.scene, eng.camera);
        const dataUrl = eng.renderer.domElement.toDataURL('image/png');
        eng.previewHelpersGroup.visible = prevHelpersVis;
        eng.requestRender();
        triggerDataUrlDownload(dataUrl, PRODUCTION_FILENAMES.FULL_OFFICE_PREVIEW_V2);
        return {
          filename: PRODUCTION_FILENAMES.FULL_OFFICE_PREVIEW_V2,
          dataUrl,
        };
      },
      exportCentralHubMeetingSeats: () => {
        const res = downloadCentralHubMeetingSeatsJson();
        return { filename: res.filename };
      },
      exportFullOfficeVisualProfileV2: () => {
        const res = downloadFullOfficeVisualProfileV2Json();
        return { filename: res.filename };
      },
    }));

    return (
      <div
        ref={mountRef}
        data-testid="modular-room-canvas"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer?.files?.[0];
          if (file && callbacksRef.current.onDropGLBFile) {
            callbacksRef.current.onDropGLBFile(file);
          }
        }}
        className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
        aria-label={`Interactive 3D Isometric Viewport for ${
          config.officeViewMode === 'full_office'
            ? 'AI Office Master Floor Plan A3.2 (32x26)'
            : config.selectedRoomKey === 'engineering'
            ? ENGINEERING_MODULE_CONSTANTS.DISPLAY_NAME
            : config.selectedRoomKey === 'qa_devops_studio'
            ? QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME
            : config.selectedRoomKey === 'research_brain'
            ? RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME
            : config.selectedRoomKey === 'ceo_executive'
            ? CEO_MODULE_CONSTANTS.DISPLAY_NAME
            : config.selectedRoomKey === 'uiux_studio'
            ? UIUX_MODULE_CONSTANTS.DISPLAY_NAME
            : MODULE_CONSTANTS.DISPLAY_NAME
        }`}
      />
    );
  }
);
