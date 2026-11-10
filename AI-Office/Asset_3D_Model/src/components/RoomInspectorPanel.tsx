import React, { useState } from 'react';
import {
  Activity,
  Archive,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Download,
  Eye,
  EyeOff,
  FileCode2,
  Focus,
  Image as ImageIcon,
  Layers,
  PackageCheck,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  FURNITURE_CATALOG,
  MODULE_CONSTANTS,
  RoomExportStats,
  generateRoomManifest,
} from '../domain/modularRoomSpec';
import {
  ActivityAnchor,
  AnchorId,
  CharacterSourceType,
  GLBInspectionReport,
  PMActionId,
} from '../domain/pmSimulationSpec';
import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEO_FURNITURE_CATALOG,
  CEO_MODULE_CONSTANTS,
  buildCEORoomBehaviorJson,
  generateCEORoomLegacyManifest,
} from '../domain/ceoRoomSpec';
import {
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUX_FURNITURE_CATALOG,
  UIUX_MODULE_CONSTANTS,
  buildUIUXRoomBehaviorJson,
  generateUIUXRoomLegacyManifest,
} from '../domain/uiuxRoomSpec';
import {
  ENGINEERING_FURNITURE_CATALOG,
  ENGINEERING_MODULE_CONSTANTS,
  EngineeringActivityAnchor,
  EngineeringAnchorId,
  buildEngineeringRoomBehaviorJson,
} from '../domain/engineeringRoomSpec';
import {
  RESEARCH_FURNITURE_CATALOG,
  RESEARCH_MODULE_CONSTANTS,
  ResearchAnchorId,
  buildResearchDisplaySlotsJson,
  buildResearchRoomBehaviorJson,
} from '../domain/researchRoomSpec';
import {
  QA_DEVOPS_FURNITURE_CATALOG,
  QA_DEVOPS_MODULE_CONSTANTS,
  QADevOpsAnchorId,
  buildQADevOpsDisplaySlotsJson,
  buildQADevOpsRoomBehaviorJson,
} from '../domain/qaDevopsRoomSpec';
import {
  RoomModuleKey,
  buildOfficeLayoutA3ExportJson,
  buildOfficeLayoutA3_1ExportJson,
  buildOfficeLayoutA3_2ExportJson,
  getRoomModuleByKey,
} from '../domain/officeLayoutA3Spec';
import {
  ClickedMeshDiagnostic,
  PMSimulationRuntimeTelemetry,
  SelectedObjectInspection,
  ViewerDisplayConfig,
  VisualStabilityDiagnosticReport,
} from './ModularRoomCanvas';
import { PMSimulationPanel } from './PMSimulationPanel';
import {
  CEORoomInspectorSection,
  PlannedRoomInspectorCard,
} from './CEORoomInspectorSection';
import { UIUXRoomInspectorSection } from './UIUXRoomInspectorSection';
import { EngineeringRoomInspectorSection } from './EngineeringRoomInspectorSection';
import { ResearchRoomInspectorSection } from './ResearchRoomInspectorSection';
import { QADevOpsRoomInspectorSection } from './QADevOpsRoomInspectorSection';
import { ImportValidationReport } from '../three/RoomExportAndImportManager';
import { VisualStyleMode } from '../three/PixelMaterialLibrary';
import { IndependentRoundTripReportV1 } from '../export/AssetValidation';
import {
  buildCEORoomAnchorsJsonV1,
  buildQADevOpsRoomAnchorsJsonV1,
  buildQADevOpsRoomManifestV1,
  buildResearchRoomAnchorsJsonV1,
  buildResearchRoomManifestV1,
  buildUIUXRoomAnchorsJsonV1,
} from '../export/RoomExporter';
import {
  PRODUCTION_FILENAMES,
  buildEngineeringRoomAnchorsJsonV1,
  buildPMRoomAnchorsJsonV1,
} from '../export/AssetManifestBuilder';
import { CEORuntimeStatus } from '../three/CEOCharacterSystem';
import {
  CEOActionId,
  CEOExpressionId,
  CEOPlaybackCommand,
} from '../domain/ceoSimulationSpec';
import {
  UIUXActionId,
  UIUXAnimationPlaybackCommand,
  UIUXExpressionId,
  UIUXRuntimeStatusSnapshot,
  UIUXSpeedMultiplier,
} from '../domain/uiuxSimulationSpec';
import {
  FrontendActionId,
  FrontendAnimationPlaybackCommand,
  FrontendExpressionId,
  FrontendSimulationRuntimeStatus,
  FrontendSpeedMultiplier,
} from '../domain/frontendSimulationSpec';
import {
  BackendActionId,
  BackendAnimationPlaybackCommand,
  BackendExpressionId,
  BackendSimulationRuntimeStatus,
  BackendSpeedMultiplier,
} from '../domain/backendSimulationSpec';
import {
  DatabaseActionId,
  DatabaseAnimationPlaybackCommand,
  DatabaseExpressionId,
  DatabaseSimulationRuntimeStatus,
  DatabaseSpeedMultiplier,
} from '../domain/databaseSimulationSpec';
import { ResearchSimulationPanel } from './ResearchSimulationPanel';
import {
  ResearchActionId,
  ResearchAnimationPlaybackCommand,
  ResearchExpressionId,
  ResearchSimulationRuntimeStatus,
  ResearchSpeedMultiplier,
} from '../domain/researchSimulationSpec';
import { QASimulationPanel } from './QASimulationPanel';
import {
  QAActionId,
  QAAnimationPlaybackCommand,
  QAExpressionId,
  QASimulationRuntimeStatus,
  QASpeedMultiplier,
} from '../domain/qaSimulationSpec';
import { DevOpsSimulationPanel } from './DevOpsSimulationPanel';
import {
  DevOpsActionId,
  DevOpsAnimationPlaybackCommand,
  DevOpsExpressionId,
  DevOpsSimulationRuntimeStatus,
  DevOpsSpeedMultiplier,
} from '../domain/devopsSimulationSpec';
import { BookOpen, Code2, Palette, Server } from 'lucide-react';

export type InspectorTabId = 'simulation' | 'controls' | 'assets' | 'validation' | 'manifest';

interface RoomInspectorPanelProps {
  activeTab: InspectorTabId;
  onTabChange: (tab: InspectorTabId) => void;
  config: ViewerDisplayConfig;
  stats: RoomExportStats | null;
  ceoStats?: RoomExportStats | null;
  uiuxStats?: RoomExportStats | null;
  engineeringStats?: RoomExportStats | null;
  researchStats?: RoomExportStats | null;
  qaDevopsStats?: RoomExportStats | null;
  selectedDetails: SelectedObjectInspection | null;
  importReport: ImportValidationReport | null;
  roundTripReport: IndependentRoundTripReportV1 | null;
  telemetry: PMSimulationRuntimeTelemetry;
  glbInspectionReport: GLBInspectionReport | null;
  anchors: Record<AnchorId, ActivityAnchor>;
  selectedAnchorId: AnchorId | null;
  ceoAnchors: Record<CEOAnchorId, CEOActivityAnchor>;
  selectedCEOAnchorId: CEOAnchorId | null;
  uiuxAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>;
  selectedUIUXAnchorId: UIUXAnchorId | null;
  engineeringAnchors: Record<EngineeringAnchorId, EngineeringActivityAnchor>;
  selectedEngineeringAnchorId: EngineeringAnchorId | null;
  selectedResearchAnchorId?: ResearchAnchorId | null;
  onSelectResearchAnchor?: (anchorId: ResearchAnchorId) => void;
  selectedQADevOpsAnchorId?: QADevOpsAnchorId | null;
  onSelectQADevOpsAnchor?: (anchorId: QADevOpsAnchorId) => void;
  onUpdateConfig: (partial: Partial<ViewerDisplayConfig>) => void;
  onSelectCatalogItem: (catalogId: string | null) => void;
  onRunImportTest: () => void;
  onExportGLB: () => void;
  onExportCEORoomGLB: () => void;
  onExportUIUXRoomGLB: () => void;
  onExportEngineeringRoomGLB: () => void;
  onExportResearchRoomGLB?: () => void;
  onExportQADevOpsRoomGLB?: () => void;
  onExportOriginalPMGLB: () => void;
  onExportManifest: () => void;
  onExportRoomManifestAndAnchors: () => void;
  onExportCEORoomJsonContracts: () => void;
  onExportUIUXRoomJsonContracts: () => void;
  onExportEngineeringRoomJsonContracts: () => void;
  onExportResearchRoomJsonContracts?: () => void;
  onExportQADevOpsRoomJsonContracts?: () => void;
  onExportCharacterManifestAndBehavior: () => void;
  onExportOfficeLayoutA3Json: () => void;
  onExportOfficeLayoutA3_1Json: () => void;
  onExportOfficeLayoutA3_2Json?: () => void;
  onExportPNG: () => void;
  onExportCEORoomPNG: () => void;
  onExportUIUXRoomPNG: () => void;
  onExportEngineeringRoomPNG: () => void;
  onExportResearchRoomPNG?: () => void;
  onExportQADevOpsRoomPNG?: () => void;
  onExportCharacterPNG: () => void;
  onDownloadRoomPackZip: () => void;
  onDownloadCEORoomPackZip: () => void;
  onDownloadUIUXRoomPackZip: () => void;
  onDownloadEngineeringRoomPackZip: () => void;
  onDownloadResearchRoomPackZip?: () => void;
  onDownloadQADevOpsRoomPackZip?: () => void;
  onDownloadCharacterPackZip: () => void;
  onDownloadSourceZip: () => void;
  onDownloadCompleteHandoffZip: () => void;
  onDownloadRoundTripReport: () => void;
  onFitRoom: () => void;
  onSetCameraPreset: (presetId: string) => void;
  onSelectRoomKey: (roomKey: RoomModuleKey) => void;
  // PM Simulation callbacks
  onCharacterSourceChange: (source: CharacterSourceType) => void;
  onTriggerAction: (actionId: PMActionId) => void;
  onPlaybackCommand: (
    cmd: 'play' | 'pause' | 'resume' | 'stop' | 'reset_position' | 'reset_pose'
  ) => void;
  onSpeedChange: (speed: 0.5 | 1 | 1.5) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onApproveTask: () => void;
  onFocusPM: () => void;
  onReturnRoomView: () => void;
  onSelectAnchor: (anchorId: AnchorId | null) => void;
  onUpdateAnchor: (anchorId: AnchorId, updated: ActivityAnchor) => void;
  onResetAnchors: () => void;
  onTeleportToAnchor: (anchorId: AnchorId) => void;
  onUploadCustomGLB: (file: File) => void;
  onScaleMultiplierChange: (multiplier: number) => void;
  onForwardOffsetChange: (deg: number) => void;
  onExportSimConfig: () => void;
  // CEO Anchors & Simulation callbacks
  ceoStatus: CEORuntimeStatus;
  onTriggerCEOAction: (actionId: CEOActionId) => void;
  onCEOPlaybackCommand?: (cmd: CEOPlaybackCommand) => void;
  onExecuteCEOPlayback?: (cmd: CEOPlaybackCommand) => void;
  onSetCEOSpeed: (speed: 0.5 | 1 | 1.5) => void;
  onToggleCEOPatrol?: (enabled: boolean) => void;
  onSetCEOPatrol?: (enabled: boolean) => void;
  onStartCEOAutoDemo: () => void;
  onStopCEOAutoDemo: () => void;
  onSetCEOExpression: (expr: CEOExpressionId) => void;
  onSetCEOGlassesVisible: (visible: boolean) => void;
  onFocusCEOCharacter: () => void;
  onDownloadCEOCharacterGlb?: () => void;
  onExportCEOCharacterGLB?: () => void;
  onDownloadCEOCharacterManifestAndBehavior?: () => void;
  onExportCEOCharacterManifestAndBehavior?: () => void;
  onDownloadCEOCharacterPreviewPng?: () => void;
  onExportCEOCharacterPNG?: () => void;
  onDownloadCEOCharacterPackZip: () => void;
  onSelectCEOAnchor: (anchorId: CEOAnchorId) => void;
  onUpdateCEOAnchor: (anchorId: CEOAnchorId, updated: CEOActivityAnchor) => void;
  onResetCEOAnchors: () => void;
  // UI/UX Studio Anchors & Character Simulation callbacks
  uiuxStatus: UIUXRuntimeStatusSnapshot;
  onTriggerUIUXAction: (actionId: UIUXActionId) => void;
  onUIUXPlaybackCommand?: (cmd: UIUXAnimationPlaybackCommand) => void;
  onExecuteUIUXPlayback?: (cmd: UIUXAnimationPlaybackCommand) => void;
  onSetUIUXSpeed: (speed: UIUXSpeedMultiplier) => void;
  onToggleUIUXPatrol?: (enabled: boolean) => void;
  onSetUIUXPatrol?: (enabled: boolean) => void;
  onStartUIUXAutoDemo: () => void;
  onStopUIUXAutoDemo: () => void;
  onSetUIUXExpression: (expr: UIUXExpressionId) => void;
  onSetUIUXGlassesVisible: (visible: boolean) => void;
  onFocusUIUXCharacter: () => void;
  onDownloadUIUXCharacterGlb?: () => void;
  onExportUIUXCharacterGLB?: () => void;
  onDownloadUIUXCharacterManifestAndBehavior?: () => void;
  onExportUIUXCharacterManifestAndBehavior?: () => void;
  onDownloadUIUXCharacterPreviewPng?: () => void;
  onExportUIUXCharacterPNG?: () => void;
  onDownloadUIUXCharacterPackZip: () => void;
  onSelectUIUXAnchor: (anchorId: UIUXAnchorId) => void;
  onUpdateUIUXAnchor: (anchorId: UIUXAnchorId, updated: UIUXActivityAnchor) => void;
  onResetUIUXAnchors: () => void;
  onSelectEngineeringAnchor: (anchorId: EngineeringAnchorId) => void;
  onUpdateEngineeringAnchor: (
    anchorId: EngineeringAnchorId,
    updated: EngineeringActivityAnchor
  ) => void;
  onResetEngineeringAnchors: () => void;
  // Frontend Developer Character Simulation & Export callbacks
  frontendStatus?: FrontendSimulationRuntimeStatus | null;
  onTriggerFrontendAction?: (actionId: FrontendActionId) => void;
  onFrontendPlaybackCommand?: (cmd: FrontendAnimationPlaybackCommand) => void;
  onSetFrontendSpeed?: (speed: FrontendSpeedMultiplier) => void;
  onToggleFrontendPatrol?: (enabled: boolean) => void;
  onStartFrontendAutoDemo?: () => void;
  onStopFrontendAutoDemo?: () => void;
  onSetFrontendExpression?: (expr: FrontendExpressionId) => void;
  onSetFrontendGlassesVisible?: (visible: boolean) => void;
  onSetFrontendBackpackVisible?: (visible: boolean) => void;
  onFocusFrontendCharacter?: () => void;
  onDownloadFrontendCharacterGlb?: () => void;
  onDownloadFrontendCharacterManifestAndBehavior?: () => void;
  onDownloadFrontendCharacterPreviewPng?: () => void;
  onDownloadFrontendCharacterPackZip?: () => void;
  // Backend Developer Character Simulation & Export callbacks
  backendStatus?: BackendSimulationRuntimeStatus | null;
  onTriggerBackendAction?: (actionId: BackendActionId) => void;
  onBackendPlaybackCommand?: (cmd: BackendAnimationPlaybackCommand) => void;
  onSetBackendSpeed?: (speed: BackendSpeedMultiplier) => void;
  onToggleBackendPatrol?: (enabled: boolean) => void;
  onStartBackendAutoDemo?: () => void;
  onStopBackendAutoDemo?: () => void;
  onSetBackendExpression?: (expr: BackendExpressionId) => void;
  onSetBackendGlassesVisible?: (visible: boolean) => void;
  onSetBackendBackpackVisible?: (visible: boolean) => void;
  onFocusBackendCharacter?: () => void;
  onDownloadBackendCharacterGlb?: () => void;
  onDownloadBackendCharacterManifestAndBehavior?: () => void;
  onDownloadBackendCharacterPreviewPng?: () => void;
  onDownloadBackendCharacterPackZip?: () => void;
  // Database Developer Character Simulation & Export callbacks
  databaseStatus?: DatabaseSimulationRuntimeStatus | null;
  onTriggerDatabaseAction?: (actionId: DatabaseActionId) => void;
  onDatabasePlaybackCommand?: (cmd: DatabaseAnimationPlaybackCommand) => void;
  onSetDatabaseSpeed?: (speed: DatabaseSpeedMultiplier) => void;
  onToggleDatabasePatrol?: (enabled: boolean) => void;
  onStartDatabaseAutoDemo?: () => void;
  onStopDatabaseAutoDemo?: () => void;
  onSetDatabaseExpression?: (expr: DatabaseExpressionId) => void;
  onSetDatabaseBackpackVisible?: (visible: boolean) => void;
  onFocusDatabaseCharacter?: () => void;
  onDownloadDatabaseCharacterGlb?: () => void;
  onDownloadDatabaseCharacterManifestAndBehavior?: () => void;
  onDownloadDatabaseCharacterPreviewPng?: () => void;
  onDownloadDatabaseCharacterPackZip?: () => void;
  // Research Professor Character Simulation & Export callbacks
  researchStatus?: ResearchSimulationRuntimeStatus | null;
  onTriggerResearchAction?: (actionId: ResearchActionId) => void;
  onResearchPlaybackCommand?: (cmd: ResearchAnimationPlaybackCommand) => void;
  onSetResearchSpeed?: (speed: ResearchSpeedMultiplier) => void;
  onToggleResearchPatrol?: (enabled: boolean) => void;
  onStartResearchAutoDemo?: () => void;
  onStopResearchAutoDemo?: () => void;
  onSetResearchExpression?: (expr: ResearchExpressionId) => void;
  onSetResearchGlassesVisible?: (visible: boolean) => void;
  onSetResearchBackpackVisible?: (visible: boolean) => void;
  onFocusResearchCharacter?: () => void;
  onDownloadResearchCharacterGlb?: () => void;
  onDownloadResearchCharacterManifestAndBehavior?: () => void;
  onDownloadResearchCharacterPreviewPng?: () => void;
  onDownloadResearchCharacterPackZip?: () => void;
  // QA Engineer Character Simulation & Export callbacks
  qaStatus?: QASimulationRuntimeStatus | null;
  onTriggerQAAction?: (actionId: QAActionId) => void;
  onQAPlaybackCommand?: (cmd: QAAnimationPlaybackCommand) => void;
  onSetQASpeed?: (speed: QASpeedMultiplier) => void;
  onToggleQAPatrol?: (enabled: boolean) => void;
  onStartQAAutoDemo?: () => void;
  onStopQAAutoDemo?: () => void;
  onSetQAExpression?: (expr: QAExpressionId) => void;
  onSetQAGlassesVisible?: (visible: boolean) => void;
  onSetQAHeadsetVisible?: (visible: boolean) => void;
  onSetQABackpackVisible?: (visible: boolean) => void;
  onFocusQACharacter?: () => void;
  onDownloadQACharacterGlb?: () => void;
  onDownloadQACharacterManifestAndBehavior?: () => void;
  onDownloadQACharacterPreviewPng?: () => void;
  onDownloadQACharacterPackZip?: () => void;
  // DevOps Engineer Character Simulation & Export callbacks
  devopsStatus?: DevOpsSimulationRuntimeStatus | null;
  onTriggerDevOpsAction?: (actionId: DevOpsActionId) => void;
  onDevOpsPlaybackCommand?: (cmd: DevOpsAnimationPlaybackCommand) => void;
  onSetDevOpsSpeed?: (speed: DevOpsSpeedMultiplier) => void;
  onToggleDevOpsPatrol?: (enabled: boolean) => void;
  onStartDevOpsAutoDemo?: () => void;
  onStopDevOpsAutoDemo?: () => void;
  onSetDevOpsExpression?: (expr: DevOpsExpressionId) => void;
  onSetDevOpsHeadphonesVisible?: (visible: boolean) => void;
  onSetDevOpsGlassesVisible?: (visible: boolean) => void;
  onSetDevOpsBackpackVisible?: (visible: boolean) => void;
  onFocusDevOpsCharacter?: () => void;
  onDownloadDevOpsCharacterGlb?: () => void;
  onDownloadDevOpsCharacterManifestAndBehavior?: () => void;
  onDownloadDevOpsCharacterPreviewPng?: () => void;
  onDownloadDevOpsCharacterPackZip?: () => void;
  onFocusAnchorPosition: (pos: [number, number, number]) => void;
  // Visual Stability & Mesh Diagnostic props
  clickedMeshDiagnostic: ClickedMeshDiagnostic | null;
  stabilityReport: VisualStabilityDiagnosticReport | null;
  onRunStabilityScan: () => void;
}

export const RoomInspectorPanel: React.FC<RoomInspectorPanelProps> = ({
  activeTab,
  onTabChange,
  config,
  stats,
  ceoStats,
  uiuxStats,
  engineeringStats,
  researchStats,
  qaDevopsStats,
  selectedDetails,
  importReport,
  roundTripReport,
  telemetry,
  glbInspectionReport,
  anchors,
  selectedAnchorId,
  ceoAnchors,
  selectedCEOAnchorId,
  uiuxAnchors,
  selectedUIUXAnchorId,
  engineeringAnchors,
  selectedEngineeringAnchorId,
  selectedResearchAnchorId,
  onSelectResearchAnchor,
  selectedQADevOpsAnchorId,
  onSelectQADevOpsAnchor,
  onUpdateConfig,
  onSelectCatalogItem,
  onRunImportTest,
  onExportGLB,
  onExportCEORoomGLB,
  onExportUIUXRoomGLB,
  onExportEngineeringRoomGLB,
  onExportResearchRoomGLB,
  onExportQADevOpsRoomGLB,
  onExportOriginalPMGLB,
  onExportRoomManifestAndAnchors,
  onExportCEORoomJsonContracts,
  onExportUIUXRoomJsonContracts,
  onExportEngineeringRoomJsonContracts,
  onExportResearchRoomJsonContracts,
  onExportQADevOpsRoomJsonContracts,
  onExportCharacterManifestAndBehavior,
  onExportOfficeLayoutA3Json,
  onExportOfficeLayoutA3_1Json,
  onExportOfficeLayoutA3_2Json,
  onExportPNG,
  onExportCEORoomPNG,
  onExportUIUXRoomPNG,
  onExportEngineeringRoomPNG,
  onExportResearchRoomPNG,
  onExportQADevOpsRoomPNG,
  onExportCharacterPNG,
  onDownloadRoomPackZip,
  onDownloadCEORoomPackZip,
  onDownloadUIUXRoomPackZip,
  onDownloadEngineeringRoomPackZip,
  onDownloadResearchRoomPackZip,
  onDownloadQADevOpsRoomPackZip,
  onDownloadCharacterPackZip,
  onDownloadSourceZip,
  onDownloadCompleteHandoffZip,
  onDownloadRoundTripReport,
  onFitRoom,
  onSetCameraPreset,
  onSelectRoomKey,
  onCharacterSourceChange,
  onTriggerAction,
  onPlaybackCommand,
  onSpeedChange,
  onStartAutoDemo,
  onStopAutoDemo,
  onApproveTask,
  onFocusPM,
  onReturnRoomView,
  onSelectAnchor,
  onUpdateAnchor,
  onResetAnchors,
  onTeleportToAnchor,
  onUploadCustomGLB,
  onScaleMultiplierChange,
  onForwardOffsetChange,
  onExportSimConfig,
  ceoStatus,
  onTriggerCEOAction,
  onCEOPlaybackCommand,
  onExecuteCEOPlayback,
  onSetCEOSpeed,
  onToggleCEOPatrol,
  onSetCEOPatrol,
  onStartCEOAutoDemo,
  onStopCEOAutoDemo,
  onSetCEOExpression,
  onSetCEOGlassesVisible,
  onFocusCEOCharacter,
  onDownloadCEOCharacterGlb,
  onExportCEOCharacterGLB,
  onDownloadCEOCharacterManifestAndBehavior,
  onExportCEOCharacterManifestAndBehavior,
  onDownloadCEOCharacterPreviewPng,
  onExportCEOCharacterPNG,
  onDownloadCEOCharacterPackZip,
  onSelectCEOAnchor,
  onUpdateCEOAnchor,
  onResetCEOAnchors,
  uiuxStatus,
  onTriggerUIUXAction,
  onUIUXPlaybackCommand,
  onExecuteUIUXPlayback,
  onSetUIUXSpeed,
  onToggleUIUXPatrol,
  onSetUIUXPatrol,
  onStartUIUXAutoDemo,
  onStopUIUXAutoDemo,
  onSetUIUXExpression,
  onSetUIUXGlassesVisible,
  onFocusUIUXCharacter,
  onDownloadUIUXCharacterGlb,
  onExportUIUXCharacterGLB,
  onDownloadUIUXCharacterManifestAndBehavior,
  onExportUIUXCharacterManifestAndBehavior,
  onDownloadUIUXCharacterPreviewPng,
  onExportUIUXCharacterPNG,
  onDownloadUIUXCharacterPackZip,
  onSelectUIUXAnchor,
  onUpdateUIUXAnchor,
  onResetUIUXAnchors,
  onSelectEngineeringAnchor,
  onUpdateEngineeringAnchor,
  onResetEngineeringAnchors,
  frontendStatus,
  onTriggerFrontendAction,
  onFrontendPlaybackCommand,
  onSetFrontendSpeed,
  onToggleFrontendPatrol,
  onStartFrontendAutoDemo,
  onStopFrontendAutoDemo,
  onSetFrontendExpression,
  onSetFrontendGlassesVisible,
  onSetFrontendBackpackVisible,
  onFocusFrontendCharacter,
  onDownloadFrontendCharacterGlb,
  onDownloadFrontendCharacterManifestAndBehavior,
  onDownloadFrontendCharacterPreviewPng,
  onDownloadFrontendCharacterPackZip,
  backendStatus,
  onTriggerBackendAction,
  onBackendPlaybackCommand,
  onSetBackendSpeed,
  onToggleBackendPatrol,
  onStartBackendAutoDemo,
  onStopBackendAutoDemo,
  onSetBackendExpression,
  onSetBackendGlassesVisible,
  onSetBackendBackpackVisible,
  onFocusBackendCharacter,
  onDownloadBackendCharacterGlb,
  onDownloadBackendCharacterManifestAndBehavior,
  onDownloadBackendCharacterPreviewPng,
  onDownloadBackendCharacterPackZip,
  databaseStatus,
  onTriggerDatabaseAction,
  onDatabasePlaybackCommand,
  onSetDatabaseSpeed,
  onToggleDatabasePatrol,
  onStartDatabaseAutoDemo,
  onStopDatabaseAutoDemo,
  onSetDatabaseExpression,
  onSetDatabaseBackpackVisible,
  onFocusDatabaseCharacter,
  onDownloadDatabaseCharacterGlb,
  onDownloadDatabaseCharacterManifestAndBehavior,
  onDownloadDatabaseCharacterPreviewPng,
  onDownloadDatabaseCharacterPackZip,
  researchStatus,
  onTriggerResearchAction,
  onResearchPlaybackCommand,
  onSetResearchSpeed,
  onToggleResearchPatrol,
  onStartResearchAutoDemo,
  onStopResearchAutoDemo,
  onSetResearchExpression,
  onSetResearchGlassesVisible,
  onSetResearchBackpackVisible,
  onFocusResearchCharacter,
  onDownloadResearchCharacterGlb,
  onDownloadResearchCharacterManifestAndBehavior,
  onDownloadResearchCharacterPreviewPng,
  onDownloadResearchCharacterPackZip,
  qaStatus,
  onTriggerQAAction,
  onQAPlaybackCommand,
  onSetQASpeed,
  onToggleQAPatrol,
  onStartQAAutoDemo,
  onStopQAAutoDemo,
  onSetQAExpression,
  onSetQAGlassesVisible,
  onSetQAHeadsetVisible,
  onSetQABackpackVisible,
  onFocusQACharacter,
  onDownloadQACharacterGlb,
  onDownloadQACharacterManifestAndBehavior,
  onDownloadQACharacterPreviewPng,
  onDownloadQACharacterPackZip,
  devopsStatus,
  onTriggerDevOpsAction,
  onDevOpsPlaybackCommand,
  onSetDevOpsSpeed,
  onToggleDevOpsPatrol,
  onStartDevOpsAutoDemo,
  onStopDevOpsAutoDemo,
  onSetDevOpsExpression,
  onSetDevOpsHeadphonesVisible,
  onSetDevOpsGlassesVisible,
  onSetDevOpsBackpackVisible,
  onFocusDevOpsCharacter,
  onDownloadDevOpsCharacterGlb,
  onDownloadDevOpsCharacterManifestAndBehavior,
  onDownloadDevOpsCharacterPreviewPng,
  onDownloadDevOpsCharacterPackZip,
  onFocusAnchorPosition,
  clickedMeshDiagnostic,
  stabilityReport,
  onRunStabilityScan,
}) => {
  const [showRefImage, setShowRefImage] = useState<boolean>(true);
  const [showDebugInspection, setShowDebugInspection] = useState<boolean>(true);
  const [showCameraDebug, setShowCameraDebug] = useState<boolean>(false);
  const [showHandoffSection, setShowHandoffSection] = useState<boolean>(true);
  const [showValidationMatrix, setShowValidationMatrix] = useState<boolean>(true);
  const [qaDevOpsAgentView, setQaDevOpsAgentView] = useState<'devops' | 'qa' | 'both'>('devops');
  const [manifestDocTab, setManifestDocTab] = useState<
    | 'room_manifest'
    | 'room_anchors'
    | 'ceo_manifest'
    | 'ceo_anchors'
    | 'ceo_behavior'
    | 'uiux_manifest'
    | 'uiux_anchors'
    | 'uiux_behavior'
    | 'eng_anchors'
    | 'eng_behavior'
    | 'research_manifest'
    | 'research_anchors'
    | 'research_display_slots'
    | 'research_behavior'
    | 'qa_devops_manifest'
    | 'qa_devops_anchors'
    | 'qa_devops_display_slots'
    | 'qa_devops_behavior'
    | 'office_a3'
    | 'office_a3_1'
    | 'office_a3_2'
    | 'roundtrip'
  >('room_manifest');

  const isCEORoom = config.selectedRoomKey === 'ceo_executive';
  const isUIUXRoom = config.selectedRoomKey === 'uiux_studio';
  const isEngineeringRoom = config.selectedRoomKey === 'engineering';
  const isResearchRoom = config.selectedRoomKey === 'research_brain';
  const isQADevOpsRoom =
    config.selectedRoomKey === 'qa_devops_studio' ||
    config.selectedRoomKey === 'qa_review' ||
    config.selectedRoomKey === 'devops_ai_engine';
  const isPMRoom = config.selectedRoomKey === 'pm_strategy';
  const activeRoomEntry = getRoomModuleByKey(config.selectedRoomKey);
  const activeCatalog = isQADevOpsRoom
    ? QA_DEVOPS_FURNITURE_CATALOG
    : isResearchRoom
    ? RESEARCH_FURNITURE_CATALOG
    : isEngineeringRoom
    ? ENGINEERING_FURNITURE_CATALOG
    : isCEORoom
    ? CEO_FURNITURE_CATALOG
    : isUIUXRoom
    ? UIUX_FURNITURE_CATALOG
    : FURNITURE_CATALOG;

  const visualModes: Array<{ id: VisualStyleMode; label: string; desc: string }> = [
    {
      id: 'reference',
      label: 'Reference Match',
      desc: 'Default cozy pixel-art textures & warm studio lighting',
    },
    {
      id: 'clean',
      label: 'Clean Geometry',
      desc: 'Untextured clay shading to inspect 3D mesh silhouettes',
    },
    {
      id: 'pixel',
      label: 'Pixel-Art Detail',
      desc: 'Crisp nearest-neighbor pixel texture emphasis',
    },
  ];

  const toggleCatalogItemHidden = (id: string) => {
    const exists = config.hiddenCatalogIds.includes(id);
    const next = exists
      ? config.hiddenCatalogIds.filter((item) => item !== id)
      : [...config.hiddenCatalogIds, id];
    onUpdateConfig({ hiddenCatalogIds: next });
  };

  const toggleIsolateCatalogItem = (id: string) => {
    onUpdateConfig({
      isolatedCatalogId: config.isolatedCatalogId === id ? null : id,
    });
  };

  const manifestPreview = stats ? generateRoomManifest(stats) : null;
  const ceoManifestPreview = (ceoStats || stats)
    ? generateCEORoomLegacyManifest(ceoStats || stats!)
    : null;
  const uiuxManifestPreview = (uiuxStats || stats)
    ? generateUIUXRoomLegacyManifest(uiuxStats || stats!)
    : null;

  const resolvedCEOPlayback = onCEOPlaybackCommand || onExecuteCEOPlayback || (() => {});
  const resolvedCEOPatrol = onToggleCEOPatrol || onSetCEOPatrol || (() => {});
  const resolvedCEOCharGlb = onDownloadCEOCharacterGlb || onExportCEOCharacterGLB || (() => {});
  const resolvedCEOCharManifest =
    onDownloadCEOCharacterManifestAndBehavior ||
    onExportCEOCharacterManifestAndBehavior ||
    (() => {});
  const resolvedCEOCharPng =
    onDownloadCEOCharacterPreviewPng || onExportCEOCharacterPNG || (() => {});

  const resolvedUIUXPlayback = onUIUXPlaybackCommand || onExecuteUIUXPlayback || (() => {});
  const resolvedUIUXPatrol = onToggleUIUXPatrol || onSetUIUXPatrol || (() => {});
  const resolvedUIUXCharGlb = onDownloadUIUXCharacterGlb || onExportUIUXCharacterGLB || (() => {});
  const resolvedUIUXCharManifest =
    onDownloadUIUXCharacterManifestAndBehavior ||
    onExportUIUXCharacterManifestAndBehavior ||
    (() => {});
  const resolvedUIUXCharPng =
    onDownloadUIUXCharacterPreviewPng || onExportUIUXCharacterPNG || (() => {});

  return (
    <aside
      aria-label="Room Inspector and Simulation Controls"
      className="w-92 shrink-0 bg-[#181920] border-l border-[#2B2D38] flex flex-col h-full select-none z-20"
    >
      {/* Inspector Navigation Tabs */}
      <div className="p-2 border-b border-[#2B2D38] bg-[#14151B]">
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#1E2029] rounded-lg">
          <button
            type="button"
            onClick={() => onTabChange('simulation')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
              activeTab === 'simulation'
                ? isCEORoom
                  ? 'bg-[#10B981] text-[#0B1310] font-semibold shadow-xs'
                  : isUIUXRoom
                  ? 'bg-[#63B3AE] text-[#0D1918] font-semibold shadow-xs'
                  : isEngineeringRoom
                  ? 'bg-[#38BDF8] text-[#082F49] font-semibold shadow-xs'
                : isResearchRoom
                ? 'bg-[#F59E0B] text-[#1C1204] font-semibold shadow-xs'
                : isQADevOpsRoom
                ? 'bg-[#D89B3C] text-[#14151B] font-semibold shadow-xs'
                : 'bg-[#D99252] text-[#14151B] font-semibold shadow-xs'
                : 'text-[#D6D1C7] hover:text-[#F5F2EB]'
            }`}
          >
            {isCEORoom ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>CEO Brain</span>
              </>
            ) : isUIUXRoom ? (
              <>
                <Palette className="w-3.5 h-3.5" />
                <span>UI/UX Studio</span>
              </>
            ) : isEngineeringRoom ? (
              <>
                <Code2 className="w-3.5 h-3.5" />
                <span>Eng Agents</span>
              </>
            ) : isResearchRoom ? (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Research</span>
              </>
            ) : isQADevOpsRoom ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>QA/DevOps</span>
              </>
            ) : isPMRoom ? (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>PM Sim</span>
              </>
            ) : (
              <>
                <Box className="w-3.5 h-3.5" />
                <span>Module</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('controls')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
              activeTab === 'controls'
                ? 'bg-[#2E3240] text-[#F5F2EB] shadow-xs'
                : 'text-[#9CA3AF] hover:text-[#F5F2EB]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Display</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('assets')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
              activeTab === 'assets'
                ? 'bg-[#2E3240] text-[#F5F2EB] shadow-xs'
                : 'text-[#9CA3AF] hover:text-[#F5F2EB]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Room</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onTabChange('validation');
              if (!importReport) onRunImportTest();
            }}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
              activeTab === 'validation'
                ? 'bg-[#2E3240] text-[#F5F2EB] shadow-xs'
                : 'text-[#9CA3AF] hover:text-[#F5F2EB]'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>GLB Test</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('manifest')}
            className={`px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
              activeTab === 'manifest'
                ? 'bg-[#2E3240] text-[#F5F2EB] shadow-xs'
                : 'text-[#9CA3AF] hover:text-[#F5F2EB]'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Manifest</span>
          </button>
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5 text-sm">
        {activeTab === 'simulation' && (
          <>
            {isPMRoom ? (
              <PMSimulationPanel
                config={config}
                telemetry={telemetry}
                inspectionReport={glbInspectionReport}
                anchors={anchors}
                selectedAnchorId={selectedAnchorId}
                onUpdateConfig={onUpdateConfig}
                onCharacterSourceChange={onCharacterSourceChange}
                onTriggerAction={onTriggerAction}
                onPlaybackCommand={onPlaybackCommand}
                onSpeedChange={onSpeedChange}
                onStartAutoDemo={onStartAutoDemo}
                onStopAutoDemo={onStopAutoDemo}
                onApproveTask={onApproveTask}
                onFocusPM={onFocusPM}
                onReturnRoomView={onReturnRoomView}
                onSelectAnchor={onSelectAnchor}
                onUpdateAnchor={onUpdateAnchor}
                onResetAnchors={onResetAnchors}
                onTeleportToAnchor={onTeleportToAnchor}
                onUploadCustomGLB={onUploadCustomGLB}
                onScaleMultiplierChange={onScaleMultiplierChange}
                onForwardOffsetChange={onForwardOffsetChange}
                onExportOriginalPMGLB={onExportOriginalPMGLB}
                onExportSimConfig={onExportSimConfig}
              />
            ) : isCEORoom ? (
              <CEORoomInspectorSection
                config={config}
                ceoStatus={ceoStatus}
                ceoAnchors={ceoAnchors}
                selectedCEOAnchorId={selectedCEOAnchorId}
                onUpdateConfig={onUpdateConfig}
                onTriggerCEOAction={onTriggerCEOAction}
                onCEOPlaybackCommand={resolvedCEOPlayback}
                onSetCEOSpeed={onSetCEOSpeed}
                onToggleCEOPatrol={resolvedCEOPatrol}
                onStartCEOAutoDemo={onStartCEOAutoDemo}
                onStopCEOAutoDemo={onStopCEOAutoDemo}
                onSetCEOExpression={onSetCEOExpression}
                onSetCEOGlassesVisible={onSetCEOGlassesVisible}
                onFocusCEOCharacter={onFocusCEOCharacter}
                onReturnToRoomView={onReturnRoomView}
                onDownloadCEOCharacterGlb={resolvedCEOCharGlb}
                onDownloadCEOCharacterManifestAndBehavior={resolvedCEOCharManifest}
                onDownloadCEOCharacterPreviewPng={resolvedCEOCharPng}
                onDownloadCEOCharacterPackZip={onDownloadCEOCharacterPackZip}
                onSelectCEOAnchor={onSelectCEOAnchor}
                onUpdateCEOAnchor={onUpdateCEOAnchor}
                onResetCEOAnchors={onResetCEOAnchors}
                onFocusAnchorPosition={onFocusAnchorPosition}
                onSetCameraPreset={onSetCameraPreset}
                onExportCEORoomGLB={onExportCEORoomGLB}
                onExportCEORoomJsonContracts={onExportCEORoomJsonContracts}
                onExportCEORoomPNG={onExportCEORoomPNG}
                onDownloadCEORoomPackZip={onDownloadCEORoomPackZip}
                onExportOfficeLayoutA3Json={onExportOfficeLayoutA3Json}
                onSelectRoomKey={onSelectRoomKey}
              />
            ) : isUIUXRoom ? (
              <UIUXRoomInspectorSection
                config={config}
                uiuxStatus={uiuxStatus}
                uiuxAnchors={uiuxAnchors}
                selectedUIUXAnchorId={selectedUIUXAnchorId}
                onUpdateConfig={onUpdateConfig}
                onTriggerUIUXAction={onTriggerUIUXAction}
                onUIUXPlaybackCommand={resolvedUIUXPlayback}
                onSetUIUXSpeed={onSetUIUXSpeed}
                onToggleUIUXPatrol={resolvedUIUXPatrol}
                onStartUIUXAutoDemo={onStartUIUXAutoDemo}
                onStopUIUXAutoDemo={onStopUIUXAutoDemo}
                onSetUIUXExpression={onSetUIUXExpression}
                onSetUIUXGlassesVisible={onSetUIUXGlassesVisible}
                onFocusUIUXCharacter={onFocusUIUXCharacter}
                onReturnToRoomView={onReturnRoomView}
                onDownloadUIUXCharacterGlb={resolvedUIUXCharGlb}
                onDownloadUIUXCharacterManifestAndBehavior={resolvedUIUXCharManifest}
                onDownloadUIUXCharacterPreviewPng={resolvedUIUXCharPng}
                onDownloadUIUXCharacterPackZip={onDownloadUIUXCharacterPackZip}
                onSelectUIUXAnchor={onSelectUIUXAnchor}
                onUpdateUIUXAnchor={onUpdateUIUXAnchor}
                onResetUIUXAnchors={onResetUIUXAnchors}
                onFocusAnchorPosition={onFocusAnchorPosition}
                onSetCameraPreset={onSetCameraPreset}
                onExportUIUXRoomGLB={onExportUIUXRoomGLB}
                onExportUIUXRoomJsonContracts={onExportUIUXRoomJsonContracts}
                onExportUIUXRoomPNG={onExportUIUXRoomPNG}
                onDownloadUIUXRoomPackZip={onDownloadUIUXRoomPackZip}
                onSelectCatalogItem={onSelectCatalogItem}
                onSelectRoomKey={onSelectRoomKey}
              />
            ) : isEngineeringRoom ? (
              <EngineeringRoomInspectorSection
                config={config}
                engineeringAnchors={engineeringAnchors}
                selectedEngineeringAnchorId={selectedEngineeringAnchorId}
                onUpdateConfig={onUpdateConfig}
                onSelectEngineeringAnchor={onSelectEngineeringAnchor}
                onUpdateEngineeringAnchor={onUpdateEngineeringAnchor}
                onResetEngineeringAnchors={onResetEngineeringAnchors}
                onFocusAnchorPosition={onFocusAnchorPosition}
                onSetCameraPreset={onSetCameraPreset}
                onExportEngineeringRoomGLB={onExportEngineeringRoomGLB}
                onExportEngineeringRoomJsonContracts={onExportEngineeringRoomJsonContracts}
                onExportEngineeringRoomPNG={onExportEngineeringRoomPNG}
                onDownloadEngineeringRoomPackZip={onDownloadEngineeringRoomPackZip}
                onExportOfficeLayoutA3_1Json={onExportOfficeLayoutA3_1Json}
                onSelectCatalogItem={onSelectCatalogItem}
                onSelectRoomKey={onSelectRoomKey}
                frontendStatus={frontendStatus}
                onTriggerFrontendAction={onTriggerFrontendAction}
                onFrontendPlaybackCommand={onFrontendPlaybackCommand}
                onSetFrontendSpeed={onSetFrontendSpeed}
                onToggleFrontendPatrol={onToggleFrontendPatrol}
                onStartFrontendAutoDemo={onStartFrontendAutoDemo}
                onStopFrontendAutoDemo={onStopFrontendAutoDemo}
                onSetFrontendExpression={onSetFrontendExpression}
                onSetFrontendGlassesVisible={onSetFrontendGlassesVisible}
                onSetFrontendBackpackVisible={onSetFrontendBackpackVisible}
                onFocusFrontendCharacter={onFocusFrontendCharacter}
                onReturnToRoomView={onReturnRoomView}
                onDownloadFrontendCharacterGlb={onDownloadFrontendCharacterGlb}
                onDownloadFrontendCharacterManifestAndBehavior={
                  onDownloadFrontendCharacterManifestAndBehavior
                }
                onDownloadFrontendCharacterPreviewPng={onDownloadFrontendCharacterPreviewPng}
                onDownloadFrontendCharacterPackZip={onDownloadFrontendCharacterPackZip}
                backendStatus={backendStatus}
                onTriggerBackendAction={onTriggerBackendAction}
                onBackendPlaybackCommand={onBackendPlaybackCommand}
                onSetBackendSpeed={onSetBackendSpeed}
                onToggleBackendPatrol={onToggleBackendPatrol}
                onStartBackendAutoDemo={onStartBackendAutoDemo}
                onStopBackendAutoDemo={onStopBackendAutoDemo}
                onSetBackendExpression={onSetBackendExpression}
                onSetBackendGlassesVisible={onSetBackendGlassesVisible}
                onSetBackendBackpackVisible={onSetBackendBackpackVisible}
                onFocusBackendCharacter={onFocusBackendCharacter}
                onDownloadBackendCharacterGlb={onDownloadBackendCharacterGlb}
                onDownloadBackendCharacterManifestAndBehavior={
                  onDownloadBackendCharacterManifestAndBehavior
                }
                onDownloadBackendCharacterPreviewPng={onDownloadBackendCharacterPreviewPng}
                onDownloadBackendCharacterPackZip={onDownloadBackendCharacterPackZip}
                databaseStatus={databaseStatus}
                onTriggerDatabaseAction={onTriggerDatabaseAction}
                onDatabasePlaybackCommand={onDatabasePlaybackCommand}
                onSetDatabaseSpeed={onSetDatabaseSpeed}
                onToggleDatabasePatrol={onToggleDatabasePatrol}
                onStartDatabaseAutoDemo={onStartDatabaseAutoDemo}
                onStopDatabaseAutoDemo={onStopDatabaseAutoDemo}
                onSetDatabaseExpression={onSetDatabaseExpression}
                onSetDatabaseBackpackVisible={onSetDatabaseBackpackVisible}
                onFocusDatabaseCharacter={onFocusDatabaseCharacter}
                onDownloadDatabaseCharacterGlb={onDownloadDatabaseCharacterGlb}
                onDownloadDatabaseCharacterManifestAndBehavior={
                  onDownloadDatabaseCharacterManifestAndBehavior
                }
                onDownloadDatabaseCharacterPreviewPng={onDownloadDatabaseCharacterPreviewPng}
                onDownloadDatabaseCharacterPackZip={onDownloadDatabaseCharacterPackZip}
              />
            ) : isResearchRoom ? (
              <div className="space-y-4">
                {researchStatus && (
                  <ResearchSimulationPanel
                    status={researchStatus}
                    onTriggerAction={(actId) => onTriggerResearchAction?.(actId)}
                    onPlaybackCommand={(cmd) => onResearchPlaybackCommand?.(cmd)}
                    onSpeedChange={(spd) => onSetResearchSpeed?.(spd)}
                    onTogglePatrol={(en) => onToggleResearchPatrol?.(en)}
                    onStartAutoDemo={() => onStartResearchAutoDemo?.()}
                    onStopAutoDemo={() => onStopResearchAutoDemo?.()}
                    onSelectExpression={(expr) => onSetResearchExpression?.(expr)}
                    onToggleGlasses={(vis) => onSetResearchGlassesVisible?.(vis)}
                    onToggleBackpack={(vis) => onSetResearchBackpackVisible?.(vis)}
                    onFocusCharacterCamera={() => onFocusResearchCharacter?.()}
                    onExportResearchCharacterGLB={() => onDownloadResearchCharacterGlb?.()}
                    onExportResearchCharacterPackZip={() => onDownloadResearchCharacterPackZip?.()}
                    onExportResearchManifestAndBehavior={() =>
                      onDownloadResearchCharacterManifestAndBehavior?.()
                    }
                    onExportResearchPreviewPNG={() => onDownloadResearchCharacterPreviewPng?.()}
                  />
                )}
                <ResearchRoomInspectorSection
                  stats={researchStats || stats}
                  selectedAnchorId={selectedResearchAnchorId ?? null}
                  onSelectAnchor={(anchorId) => onSelectResearchAnchor?.(anchorId)}
                  onFocusAnchorPosition={onFocusAnchorPosition}
                  onSetCameraPreset={onSetCameraPreset}
                  onExportResearchRoomGLB={() => onExportResearchRoomGLB?.()}
                  onExportResearchRoomJsonContracts={() => onExportResearchRoomJsonContracts?.()}
                  onExportResearchRoomPNG={() => onExportResearchRoomPNG?.()}
                  onDownloadResearchRoomPackZip={() => onDownloadResearchRoomPackZip?.()}
                  onRunImportTest={onRunImportTest}
                />
              </div>
            ) : isQADevOpsRoom ? (
              <div className="space-y-4">
                {/* QA & DevOps Agent Selector */}
                <div
                  data-testid="qa-devops-agent-selector"
                  className="rounded-lg border border-slate-700/80 bg-slate-900/95 p-2 text-xs"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      QA &amp; DevOps Studio — Pilih Agent
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400">
                      2 Active Agents (8×16)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      data-testid="qa-devops-select-devops"
                      onClick={() => setQaDevOpsAgentView('devops')}
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-semibold transition ${
                        qaDevOpsAgentView === 'devops'
                          ? 'border-sky-400 bg-sky-500/25 text-sky-200'
                          : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Server className="h-3.5 w-3.5 text-sky-400" />
                      <span>DevOps (South)</span>
                    </button>
                    <button
                      type="button"
                      data-testid="qa-devops-select-qa"
                      onClick={() => setQaDevOpsAgentView('qa')}
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-semibold transition ${
                        qaDevOpsAgentView === 'qa'
                          ? 'border-amber-400 bg-amber-500/25 text-amber-200'
                          : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      <span>QA (North)</span>
                    </button>
                    <button
                      type="button"
                      data-testid="qa-devops-select-both"
                      onClick={() => setQaDevOpsAgentView('both')}
                      className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-semibold transition ${
                        qaDevOpsAgentView === 'both'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                          : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>Kedua Panel</span>
                    </button>
                  </div>
                </div>

                {(qaDevOpsAgentView === 'devops' || qaDevOpsAgentView === 'both') &&
                  devopsStatus && (
                    <DevOpsSimulationPanel
                      status={devopsStatus}
                      onTriggerAction={(actId) => onTriggerDevOpsAction?.(actId)}
                      onPlaybackCommand={(cmd) => onDevOpsPlaybackCommand?.(cmd)}
                      onSpeedChange={(spd) => onSetDevOpsSpeed?.(spd)}
                      onTogglePatrol={(en) => onToggleDevOpsPatrol?.(en)}
                      onStartAutoDemo={() => onStartDevOpsAutoDemo?.()}
                      onStopAutoDemo={() => onStopDevOpsAutoDemo?.()}
                      onSelectExpression={(expr) => onSetDevOpsExpression?.(expr)}
                      onToggleHeadphones={(vis) => onSetDevOpsHeadphonesVisible?.(vis)}
                      onToggleGlasses={(vis) => onSetDevOpsGlassesVisible?.(vis)}
                      onToggleBackpack={(vis) => onSetDevOpsBackpackVisible?.(vis)}
                      onFocusCharacterCamera={() => onFocusDevOpsCharacter?.()}
                      onReturnToRoomView={() => onReturnRoomView()}
                      onExportDevOpsCharacterGLB={() => onDownloadDevOpsCharacterGlb?.()}
                      onExportDevOpsCharacterPackZip={() => onDownloadDevOpsCharacterPackZip?.()}
                      onExportDevOpsManifestAndBehavior={() =>
                        onDownloadDevOpsCharacterManifestAndBehavior?.()
                      }
                      onExportDevOpsPreviewPNG={() => onDownloadDevOpsCharacterPreviewPng?.()}
                    />
                  )}

                {(qaDevOpsAgentView === 'qa' || qaDevOpsAgentView === 'both') && qaStatus && (
                  <QASimulationPanel
                    status={qaStatus}
                    onTriggerAction={(actId) => onTriggerQAAction?.(actId)}
                    onPlaybackCommand={(cmd) => onQAPlaybackCommand?.(cmd)}
                    onSpeedChange={(spd) => onSetQASpeed?.(spd)}
                    onTogglePatrol={(en) => onToggleQAPatrol?.(en)}
                    onStartAutoDemo={() => onStartQAAutoDemo?.()}
                    onStopAutoDemo={() => onStopQAAutoDemo?.()}
                    onSelectExpression={(expr) => onSetQAExpression?.(expr)}
                    onToggleGlasses={(vis) => onSetQAGlassesVisible?.(vis)}
                    onToggleHeadset={(vis) => onSetQAHeadsetVisible?.(vis)}
                    onToggleBackpack={(vis) => onSetQABackpackVisible?.(vis)}
                    onFocusCharacterCamera={() => onFocusQACharacter?.()}
                    onReturnToRoomView={() => onReturnRoomView()}
                    onExportQACharacterGLB={() => onDownloadQACharacterGlb?.()}
                    onExportQACharacterPackZip={() => onDownloadQACharacterPackZip?.()}
                    onExportQAManifestAndBehavior={() =>
                      onDownloadQACharacterManifestAndBehavior?.()
                    }
                    onExportQAPreviewPNG={() => onDownloadQACharacterPreviewPng?.()}
                  />
                )}
                <QADevOpsRoomInspectorSection
                  stats={qaDevopsStats || stats}
                  selectedAnchorId={selectedQADevOpsAnchorId ?? null}
                  onSelectAnchor={(anchorId) => onSelectQADevOpsAnchor?.(anchorId)}
                  onFocusAnchorPosition={onFocusAnchorPosition}
                  onSetCameraPreset={onSetCameraPreset}
                  onExportQADevOpsRoomGLB={() => onExportQADevOpsRoomGLB?.()}
                  onExportQADevOpsRoomJsonContracts={() => onExportQADevOpsRoomJsonContracts?.()}
                  onExportQADevOpsRoomPNG={() => onExportQADevOpsRoomPNG?.()}
                  onDownloadQADevOpsRoomPackZip={() => onDownloadQADevOpsRoomPackZip?.()}
                  onExportOfficeLayoutA3_2Json={onExportOfficeLayoutA3_2Json}
                  onRunImportTest={onRunImportTest}
                />
              </div>
            ) : (
              <PlannedRoomInspectorCard
                roomKey={config.selectedRoomKey}
                officeViewMode={config.officeViewMode}
                onSelectRoomKey={onSelectRoomKey}
                onSwitchViewMode={(mode) => onUpdateConfig({ officeViewMode: mode })}
              />
            )}
          </>
        )}

        {activeTab === 'controls' && (
          <>
            {/* Visual Style Mode Selector */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#D6D1C7]">Visual Mode</h2>
                <span className="text-xs text-[#8E95A5] font-mono tabular-nums">
                  {config.visualStyle === 'reference'
                    ? 'Reference Match'
                    : config.visualStyle === 'clean'
                    ? 'Clean Geometry'
                    : 'Pixel-Art Detail'}
                </span>
              </div>
              <div className="space-y-1.5">
                {visualModes.map((m) => {
                  const active = config.visualStyle === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onUpdateConfig({ visualStyle: m.id })}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                        active
                          ? 'bg-[#262936] border-[#D99252] text-[#F5F2EB]'
                          : 'bg-[#1D1F28] border-[#2A2D3A] text-[#9CA3AF] hover:border-[#3D4254] hover:text-[#E5E0D8]'
                      }`}
                    >
                      <div className="text-xs font-semibold">{m.label}</div>
                      <div className="text-[11px] text-[#8E95A5] leading-snug mt-0.5">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Scene Layer & Visibility Toggles */}
            <section className="space-y-2 pt-3 border-t border-[#262833]">
              <h2 className="text-xs font-semibold text-[#D6D1C7]">Scene Layers & Helpers</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    key: 'showBossPM' as const,
                    label: 'Boss PM Character',
                    active: config.showBossPM,
                  },
                  {
                    key: 'showGrid' as const,
                    label: 'Modular Grid / Bounds',
                    active: config.showGrid,
                  },
                  {
                    key: 'autoCutawayWalls' as const,
                    label: 'Auto Cutaway Walls',
                    active: config.autoCutawayWalls,
                  },
                  {
                    key: 'showWallsAndWindows' as const,
                    label: 'Walls & Windows',
                    active: config.showWallsAndWindows,
                  },
                  {
                    key: 'showFurniture' as const,
                    label: 'Furniture Group',
                    active: config.showFurniture,
                  },
                  {
                    key: 'showPropsAndDecor' as const,
                    label: 'Props & Decor',
                    active: config.showPropsAndDecor,
                  },
                  {
                    key: 'showMannequin' as const,
                    label: 'Scale Mannequin',
                    active: config.showMannequin,
                  },
                  {
                    key: 'showTextures' as const,
                    label: 'Pixel Textures',
                    active: config.showTextures,
                  },
                  {
                    key: 'showShadows' as const,
                    label: 'Soft Shadows',
                    active: config.showShadows,
                  },
                  {
                    key: 'showWireframe' as const,
                    label: 'Wireframe Mode',
                    active: config.showWireframe,
                  },
                  {
                    key: 'showSimulationAnchors' as const,
                    label: 'Activity Anchors',
                    active: config.showSimulationAnchors,
                  },
                ].map((toggle) => (
                  <button
                    key={toggle.key}
                    type="button"
                    aria-pressed={toggle.active}
                    onClick={() => onUpdateConfig({ [toggle.key]: !toggle.active })}
                    className={`px-2.5 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-colors whitespace-nowrap shrink-0 ${
                      toggle.active
                        ? 'bg-[#252834] border-[#4B5563] text-[#F3EFEA]'
                        : 'bg-[#191B22] border-[#262833] text-[#7D8494] hover:text-[#D1D5DB]'
                    }`}
                  >
                    <span className="truncate">{toggle.label}</span>
                    <span className="text-[11px] font-mono ml-1.5">
                      {toggle.active ? 'ON' : 'OFF'}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Collapsible Developer Debug Inspection & Visual Stability Mode */}
            <section className="space-y-2 pt-3 border-t border-[#262833]">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#D6D1C7]">
                  Debug Inspection & Visual Stability
                </h2>
                <button
                  type="button"
                  onClick={() => setShowDebugInspection((v) => !v)}
                  className="text-xs text-[#D99252] hover:underline whitespace-nowrap shrink-0"
                >
                  {showDebugInspection ? 'Collapse' : 'Expand'}
                </button>
              </div>

              {showDebugInspection && (
                <div className="bg-[#14151B] border border-[#262833] rounded-lg p-3 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8E95A5]">
                      Inspect Selected Mesh & Coplanar Stability
                    </span>
                    <button
                      type="button"
                      onClick={onRunStabilityScan}
                      className="px-2 py-1 rounded bg-[#262936] hover:bg-[#323646] border border-[#D99252]/50 text-[#FBBF24] text-[11px] font-medium whitespace-nowrap shrink-0"
                    >
                      Scan Visual Stability
                    </button>
                  </div>

                  {/* Quick Wireframe & Shadow Diagnostic Toggles */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ showWireframe: !config.showWireframe })}
                      className={`px-2 py-1.5 rounded border text-[11px] font-mono flex items-center justify-between ${
                        config.showWireframe
                          ? 'bg-[#2E3240] border-[#D99252] text-[#F5F2EB]'
                          : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
                      }`}
                    >
                      <span>Wireframe</span>
                      <span>{config.showWireframe ? 'ON' : 'OFF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateConfig({ showShadows: !config.showShadows })}
                      className={`px-2 py-1.5 rounded border text-[11px] font-mono flex items-center justify-between ${
                        config.showShadows
                          ? 'bg-[#2E3240] border-[#6EE7B7] text-[#F5F2EB]'
                          : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
                      }`}
                    >
                      <span>Shadows</span>
                      <span>{config.showShadows ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>

                  {/* Clicked Mesh & Material Readout */}
                  <div className="p-2 rounded bg-[#1A1C24] border border-[#262833] space-y-1 font-mono text-[11px]">
                    <div className="text-[#D99252] font-semibold">Selected Mesh Readout</div>
                    {clickedMeshDiagnostic ? (
                      <>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#8E95A5]">Mesh Name</span>
                          <span className="text-[#F3EFEA] truncate">
                            {clickedMeshDiagnostic.meshName}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#8E95A5]">Material</span>
                          <span className="text-[#6EE7B7] truncate">
                            {clickedMeshDiagnostic.materialName}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#8E95A5]">Material Type</span>
                          <span className="text-[#7DD3FC]">
                            {clickedMeshDiagnostic.materialType}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-[#8E95A5]">Parent Group</span>
                          <span className="text-[#D6D1C7] truncate">
                            {clickedMeshDiagnostic.parentName}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[#8E95A5] font-sans">
                        Click any surface on the PM or CEO room furniture, Brain Console, cabinets,
                        walls, or character to inspect its exact sub-mesh name and material type.
                      </div>
                    )}
                  </div>

                  {/* Stability Audit Report */}
                  {stabilityReport && (
                    <div className="pt-2 border-t border-[#262833] space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-[#6EE7B7] font-semibold">
                        <span>Zero Coplanar / Z-Fight Conflicts</span>
                        <span>{stabilityReport.timestamp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E95A5]">PM / CEO / Char Meshes</span>
                        <span className="text-[#F3EFEA]">
                          {stabilityReport.totalRoomMeshes} /{' '}
                          {stabilityReport.totalCEORoomMeshes ?? 0} /{' '}
                          {stabilityReport.totalCharacterMeshes}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E95A5]">Duplicate Mesh Refs</span>
                        <span className="text-[#6EE7B7]">
                          {stabilityReport.duplicateRoomMeshNames.length +
                            (stabilityReport.duplicateCEORoomMeshNames?.length ?? 0) +
                            stabilityReport.duplicateCharacterMeshNames.length}{' '}
                          (Clean)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E95A5]">Camera Near / Far</span>
                        <span className="text-[#F3EFEA]">
                          [{stabilityReport.cameraNearFar[0]}u ..{' '}
                          {stabilityReport.cameraNearFar[1]}u]
                        </span>
                      </div>
                      <div className="pt-1 space-y-1 font-sans">
                        {stabilityReport.verifiedAreas.map((v, idx) => (
                          <div
                            key={idx}
                            className="p-1.5 rounded bg-[#181A22] border border-[#262833] text-[10px]"
                          >
                            <div className="flex items-center justify-between font-semibold text-[#A7F3D0]">
                              <span>{v.area}</span>
                              <span className="font-mono">{v.status}</span>
                            </div>
                            <div className="text-[#9CA3AF] mt-0.5 leading-snug">{v.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Collapsible Camera & Projection Diagnostics (Hidden by default per Section 5) */}
            <section className="space-y-2 pt-3 border-t border-[#262833]">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#D6D1C7]">
                  Camera & Projection Diagnostics
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCameraDebug((v) => !v)}
                  className="text-xs text-[#7DD3FC] hover:underline whitespace-nowrap shrink-0"
                >
                  {showCameraDebug ? 'Hide' : 'Show'}
                </button>
              </div>

              {showCameraDebug && telemetry.cameraDiagnostics && (
                <div className="bg-[#14151B] border border-[#262833] rounded-lg p-3 space-y-1.5 text-[11px] font-mono tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Camera Type</span>
                    <span className="text-[#6EE7B7]">
                      {telemetry.cameraDiagnostics.cameraType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Projection</span>
                    <span className="text-[#F5F2EB]">
                      {telemetry.cameraDiagnostics.projectionMode} (Zero Taper)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Position</span>
                    <span className="text-[#F3EFEA]">
                      [{telemetry.cameraDiagnostics.position.join(', ')}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Target</span>
                    <span className="text-[#F3EFEA]">
                      [{telemetry.cameraDiagnostics.target.join(', ')}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Azimuth / Elevation</span>
                    <span className="text-[#FBBF24]">
                      {telemetry.cameraDiagnostics.azimuthDeg}° /{' '}
                      {telemetry.cameraDiagnostics.elevationDeg}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Zoom (Scale)</span>
                    <span className="text-[#7DD3FC]">
                      {telemetry.cameraDiagnostics.nominalZoom} (
                      {telemetry.cameraDiagnostics.zoom}×)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Viewport Aspect</span>
                    <span className="text-[#F3EFEA]">
                      {telemetry.cameraDiagnostics.viewportWidth}×
                      {telemetry.cameraDiagnostics.viewportHeight} (
                      {telemetry.cameraDiagnostics.viewportAspect})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Ortho Frustum Span</span>
                    <span className="text-[#D6D1C7]">
                      {telemetry.cameraDiagnostics.frustumSize[0]}u ×{' '}
                      {telemetry.cameraDiagnostics.frustumSize[1]}u
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Modular Room Standard Specification Readout */}
            <section className="space-y-2 pt-3 border-t border-[#262833]">
              <h2 className="text-xs font-semibold text-[#D6D1C7]">Modular Block Specification</h2>
              <div className="bg-[#14151B] border border-[#262833] rounded-lg p-3 space-y-2 text-xs font-mono tabular-nums">
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Active Module</span>
                  <span className="text-[#6EE7B7]">{activeRoomEntry.module_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Root Node</span>
                  <span className="text-[#F3EFEA]">
                    {isQADevOpsRoom
                      ? QA_DEVOPS_MODULE_CONSTANTS.ROOT_NODE_NAME
                      : isResearchRoom
                      ? RESEARCH_MODULE_CONSTANTS.ROOT_NODE_NAME
                      : isEngineeringRoom
                      ? ENGINEERING_MODULE_CONSTANTS.ROOT_NODE_NAME
                      : isUIUXRoom
                      ? UIUX_MODULE_CONSTANTS.ROOT_NODE_NAME
                      : isCEORoom
                      ? CEO_MODULE_CONSTANTS.ROOT_NODE_NAME
                      : MODULE_CONSTANTS.ROOT_NODE_NAME}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Local Origin / A3 Slot</span>
                  <span className="text-[#F3EFEA]">
                    [0,0,0] / [{activeRoomEntry.global_offset.join(', ')}]
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Footprint Bounds</span>
                  <span className="text-[#F3EFEA]">
                    {isEngineeringRoom || isQADevOpsRoom
                      ? 'X: 0..8 · Z: 0..16 (8×16)'
                      : 'X: 0..8 · Z: 0..8'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8E95A5]">Wall / Floor Y</span>
                  <span className="text-[#F3EFEA]">3.20u / -0.16u</span>
                </div>
                {isQADevOpsRoom ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector West (Hub)</span>
                      <span className="text-[#6EE7B7]">[0, 0, 8] · -X · 2u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector North (Corr)</span>
                      <span className="text-[#FBBF24]">[4, 0, 16] · +Z · 2u</span>
                    </div>
                  </>
                ) : isResearchRoom ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector South (Corr)</span>
                      <span className="text-[#FBBF24]">[4, 0, 0] · -Z · 2u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">East Wall (PM)</span>
                      <span className="text-[#9CA3AF]">Solid Partition</span>
                    </div>
                  </>
                ) : isEngineeringRoom ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector North (Corr)</span>
                      <span className="text-[#6EE7B7]">[4, 0, 16] · +Z · 2u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector East (Hub)</span>
                      <span className="text-[#38BDF8]">[8, 0, 8] · +X · 2u</span>
                    </div>
                  </>
                ) : isUIUXRoom ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector South (Corr)</span>
                      <span className="text-[#5EEAD4]">[4, 0, 0] · -Z · 2u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">West Wall (CEO)</span>
                      <span className="text-[#8E95A5]">Solid Partition</span>
                    </div>
                  </>
                ) : isCEORoom ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector West (PM)</span>
                      <span className="text-[#7DD3FC]">[0, 0, 4] · -X · 2u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector South (Corr)</span>
                      <span className="text-[#6EE7B7]">[4, 0, 0] · -Z · 2u</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector A (East)</span>
                      <span className="text-[#7DD3FC]">[8, 0, 4] · +X · 2u</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connector B (South)</span>
                      <span className="text-[#6EE7B7]">[4, 0, 0] · -Z · 2u</span>
                    </div>
                  </>
                )}
                {(qaDevopsStats || researchStats || engineeringStats || stats) && (
                  <div className="pt-1.5 border-t border-[#262833] flex justify-between text-[#D99252]">
                    <span>Room Geometry</span>
                    <span>
                      {(
                        isQADevOpsRoom && qaDevopsStats
                          ? qaDevopsStats
                          : isResearchRoom && researchStats
                          ? researchStats
                          : isEngineeringRoom && engineeringStats
                          ? engineeringStats
                          : stats
                      )!.meshCount}{' '}
                      meshes ·{' '}
                      {(
                        isQADevOpsRoom && qaDevopsStats
                          ? qaDevopsStats
                          : isResearchRoom && researchStats
                          ? researchStats
                          : isEngineeringRoom && engineeringStats
                          ? engineeringStats
                          : stats
                      )!.triangleCount.toLocaleString()}{' '}
                      tris
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Authoritative Reference Image Comparison */}
            <section className="space-y-2 pt-3 border-t border-[#262833]">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#D6D1C7]">Art Direction Reference</h2>
                <button
                  type="button"
                  onClick={() => setShowRefImage((v) => !v)}
                  className="text-xs text-[#D99252] hover:underline whitespace-nowrap shrink-0"
                >
                  {showRefImage ? 'Hide Reference' : 'Show Reference'}
                </button>
              </div>
              {showRefImage && (
                <div className="bg-[#14151B] border border-[#262833] rounded-lg overflow-hidden">
                  <img
                    src="/assets/aistudio/Screenshot_2026-10-28_024156_e1b906a9.png"
                    alt="Approved Isometric Pixel-Art Room Reference"
                    referrerPolicy="no-referrer"
                    className="w-full h-38 object-cover"
                  />
                  <div className="px-2.5 py-1.5 text-[11px] text-[#8E95A5]">
                    Target Style: Premium Cozy Isometric Pixel-Art 3D · Shared by PM, CEO, UI/UX, Research & QA/DevOps
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'assets' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#D6D1C7]">
                {isQADevOpsRoom
                  ? 'QA & DevOps Studio (8×16)'
                  : isResearchRoom
                  ? 'Research & Shared Brain'
                  : isEngineeringRoom
                  ? 'Engineering Studio (8×16)'
                  : isUIUXRoom
                  ? 'UI/UX Studio'
                  : isCEORoom
                  ? 'CEO Office'
                  : 'PM Room'}{' '}
                Asset Inspector ({activeCatalog.length})
              </h2>
              {(config.isolatedCatalogId || config.hiddenCatalogIds.length > 0) && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({
                      isolatedCatalogId: null,
                      hiddenCatalogIds: [],
                      selectedCatalogId: null,
                    })
                  }
                  className="text-xs text-[#D99252] hover:underline whitespace-nowrap shrink-0"
                >
                  Reset Visibility
                </button>
              )}
            </div>

            {selectedDetails ? (
              <div className="bg-[#14151B] border border-[#D99252]/60 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#F5F2EB]">
                      {selectedDetails.catalogItem.name}
                    </div>
                    <div className="text-[11px] text-[#8E95A5] mt-0.5">
                      {selectedDetails.catalogItem.category} · {selectedDetails.catalogItem.area}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectCatalogItem(null)}
                    className="text-xs text-[#9CA3AF] hover:text-white px-1.5 py-0.5"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-[#B4BAC6] leading-relaxed">
                  {selectedDetails.catalogItem.description}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[#262833] text-[11px] font-mono tabular-nums">
                  <div>
                    <span className="text-[#8E95A5] block">Local Position</span>
                    <span className="text-[#F3EFEA]">
                      [{selectedDetails.catalogItem.position.join(', ')}]
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E95A5] block">Measured Size</span>
                    <span className="text-[#F3EFEA]">
                      {selectedDetails.worldBox.size.join(' × ')}u
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E95A5] block">Sub-Meshes</span>
                    <span className="text-[#F3EFEA]">{selectedDetails.meshCount} parts</span>
                  </div>
                  <div>
                    <span className="text-[#8E95A5] block">Polygon Count</span>
                    <span className="text-[#F3EFEA]">{selectedDetails.triangleCount} tris</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#8E95A5] pt-1">
                  Materials:{' '}
                  <span className="text-[#D6D1C7]">
                    {selectedDetails.catalogItem.materialSummary}
                  </span>
                </div>
                {selectedDetails.clickedMeshName && (
                  <div className="text-[11px] text-[#8E95A5] font-mono pt-0.5">
                    Clicked Sub-Mesh:{' '}
                    <span className="text-[#6EE7B7]">{selectedDetails.clickedMeshName}</span> (
                    <span className="text-[#7DD3FC]">{selectedDetails.clickedMaterialType}</span>)
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleIsolateCatalogItem(selectedDetails.catalogItem.id)}
                    className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 ${
                      config.isolatedCatalogId === selectedDetails.catalogItem.id
                        ? 'bg-[#D99252] text-[#14151B] border-[#D99252]'
                        : 'bg-[#1F222D] text-[#E5E0D8] border-[#323646] hover:border-[#4B5563]'
                    }`}
                  >
                    <Focus className="w-3.5 h-3.5" />
                    <span>
                      {config.isolatedCatalogId === selectedDetails.catalogItem.id
                        ? 'Un-Isolate'
                        : 'Isolate Asset'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCatalogItemHidden(selectedDetails.catalogItem.id)}
                    className="py-1.5 px-2.5 rounded-md text-xs font-medium bg-[#1F222D] text-[#E5E0D8] border border-[#323646] hover:border-[#4B5563] whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    {config.hiddenCatalogIds.includes(selectedDetails.catalogItem.id) ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#14151B] border border-[#262833] rounded-lg p-3 text-xs text-[#8E95A5]">
                Click any furniture object in the 3D viewport or select an item below to inspect its
                position, scale, material, and polygon count.
              </div>
            )}

            <div className="space-y-1.5">
              {activeCatalog.map((item) => {
                const isSelected = config.selectedCatalogId === item.id;
                const isHidden = config.hiddenCatalogIds.includes(item.id);
                const isIsolated = config.isolatedCatalogId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#262936] border-[#D99252]'
                        : 'bg-[#1B1D26] border-[#262833] hover:border-[#3A3E50]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectCatalogItem(item.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="text-xs font-medium text-[#F3EFEA] truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#8E95A5] truncate">
                        {item.area} · [{item.position.join(', ')}]
                      </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label={`Isolate ${item.name}`}
                        onClick={() => toggleIsolateCatalogItem(item.id)}
                        className={`p-1.5 rounded-md border text-xs transition-colors ${
                          isIsolated
                            ? 'bg-[#D99252] text-[#14151B] border-[#D99252]'
                            : 'bg-[#14151B] text-[#8E95A5] border-[#2A2D3A] hover:text-white'
                        }`}
                      >
                        <Focus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={isHidden ? `Show ${item.name}` : `Hide ${item.name}`}
                        onClick={() => toggleCatalogItemHidden(item.id)}
                        className={`p-1.5 rounded-md border text-xs transition-colors ${
                          isHidden
                            ? 'bg-[#372228] text-[#FCA5A5] border-[#7F1D1D]'
                            : 'bg-[#14151B] text-[#8E95A5] border-[#2A2D3A] hover:text-white'
                        }`}
                      >
                        {isHidden ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'validation' && (
          <section className="space-y-3">
            {/* Asset Export & Integration Handoff */}
            <div className="bg-[#14151B] border border-[#D99252]/70 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHandoffSection((v) => !v)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#1B1D26] transition-colors"
              >
                <span className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D99252]" />
                  <span>Asset Export & Integration Handoff</span>
                </span>
                {showHandoffSection ? (
                  <ChevronDown className="w-4 h-4 text-[#8E95A5]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
                )}
              </button>

              {showHandoffSection && (
                <div className="p-3 pt-2 border-t border-[#262833] space-y-2 text-xs">
                  <div className="text-[11px] text-[#9CA3AF] leading-snug">
                    Export standalone GLBs (`pm_room.glb`, `ceo_room.glb`, `uiux_room.glb`, `boss_pm.glb`), A3 layout
                    contracts (`office-layout-a3.json`), & full source archives.
                  </div>

                  {/* Primary Handoff Controls */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={onExportGLB}
                      className="px-2.5 py-2 rounded-md bg-[#262936] hover:bg-[#313546] border border-[#D99252]/50 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D99252] shrink-0" />
                      <span>Export PM Room GLB</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportCEORoomGLB}
                      className="px-2.5 py-2 rounded-md bg-[#192623] hover:bg-[#21332E] border border-[#10B981]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span>Export CEO Room GLB</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportUIUXRoomGLB}
                      className="px-2.5 py-2 rounded-md bg-[#142322] hover:bg-[#1B302F] border border-[#14B8A6]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
                      <span>Export UI/UX Room GLB</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportEngineeringRoomGLB}
                      className="px-2.5 py-2 rounded-md bg-[#0C2234] hover:bg-[#12314A] border border-[#38BDF8]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span>Export Engineering GLB</span>
                    </button>
                    {onExportResearchRoomGLB && (
                      <button
                        type="button"
                        onClick={onExportResearchRoomGLB}
                        className="px-2.5 py-2 rounded-md bg-[#2A1E0C] hover:bg-[#3B2A12] border border-[#F59E0B]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                        <span>Export Research GLB</span>
                      </button>
                    )}
                    {onExportResearchRoomJsonContracts && (
                      <button
                        type="button"
                        onClick={onExportResearchRoomJsonContracts}
                        className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#F59E0B]/40 text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <FileCode2 className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                        <span>Research JSONs (4)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onExportUIUXRoomJsonContracts}
                      className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#14B8A6]/40 text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
                      <span>UI/UX Manifest+Anchors</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportEngineeringRoomJsonContracts}
                      className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#38BDF8]/40 text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span>Engineering JSONs</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportRoomManifestAndAnchors}
                      className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#2E3242] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
                      <span>PM Manifest+Anchors</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportCEORoomJsonContracts}
                      className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#2E3242] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
                      <span>CEO Manifest+Anchors</span>
                    </button>
                    <button
                      type="button"
                      onClick={onExportOriginalPMGLB}
                      className="px-2.5 py-2 rounded-md bg-[#262936] hover:bg-[#313546] border border-[#38BDF8]/50 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span>Export Boss PM GLB</span>
                    </button>
                    <button
                      type="button"
                      onClick={resolvedCEOCharGlb}
                      className="px-2.5 py-2 rounded-md bg-[#192623] hover:bg-[#21332E] border border-[#10B981]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span>Export CEO Char GLB</span>
                    </button>
                    <button
                      type="button"
                      onClick={resolvedUIUXCharGlb}
                      className="px-2.5 py-2 rounded-md bg-[#142322] hover:bg-[#1B302F] border border-[#14B8A6]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0" />
                      <span>Export UI/UX Char GLB</span>
                    </button>
                    {onDownloadFrontendCharacterGlb && (
                      <button
                        type="button"
                        onClick={onDownloadFrontendCharacterGlb}
                        className="px-2.5 py-2 rounded-md bg-[#0C2234] hover:bg-[#12314A] border border-[#38BDF8]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                        <span>Export FE Char GLB</span>
                      </button>
                    )}
                    {onDownloadBackendCharacterGlb && (
                      <button
                        type="button"
                        onClick={onDownloadBackendCharacterGlb}
                        className="px-2.5 py-2 rounded-md bg-[#0D231B] hover:bg-[#133529] border border-[#10B981]/60 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Download className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                        <span>Export BE Char GLB</span>
                      </button>
                    )}
                      {onDownloadDatabaseCharacterGlb && (
                        <button
                          type="button"
                          onClick={onDownloadDatabaseCharacterGlb}
                          className="px-2.5 py-2 rounded-md bg-[#08251C] hover:bg-[#0D382B] border border-[#10B981]/70 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          <span>Export DB Char GLB</span>
                        </button>
                      )}
                      {onDownloadResearchCharacterGlb && (
                        <button
                          type="button"
                          onClick={onDownloadResearchCharacterGlb}
                          className="px-2.5 py-2 rounded-md bg-[#0B261C] hover:bg-[#103829] border border-[#22C55E]/70 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                          <span>Export Research Char GLB</span>
                        </button>
                      )}
                      {onDownloadQACharacterGlb && (
                        <button
                          type="button"
                          onClick={onDownloadQACharacterGlb}
                          className="px-2.5 py-2 rounded-md bg-[#2A1E0C] hover:bg-[#3B2A12] border border-[#F59E0B]/70 text-[#F5F2EB] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                          <span>Export QA Char GLB</span>
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={onExportOfficeLayoutA3_1Json}
                      className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#34D399]/50 text-[#A7F3D0] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                      <span>office-layout-a3.1.json</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={onRunImportTest}
                      className="px-2.5 py-2 rounded-md bg-[#D99252] hover:bg-[#E49F60] text-[#14151B] text-[11px] font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <PackageCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Validate Exported GLB</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowValidationMatrix((v) => !v)}
                      className="px-2.5 py-2 rounded-md bg-[#1E293B] hover:bg-[#334155] border border-[#38BDF8]/40 text-[#7DD3FC] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {showValidationMatrix ? 'Hide Validation Report' : 'Show Validation Report'}
                      </span>
                    </button>
                  </div>

                  {/* Packaged ZIP Archives */}
                  <div className="pt-2 border-t border-[#262833] space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-[#8E95A5]">
                      Production Asset Packs & Full Source (.ZIP)
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {onDownloadQACharacterPackZip && (
                        <button
                          type="button"
                          onClick={onDownloadQACharacterPackZip}
                          className="px-2 py-1.5 rounded bg-[#2A1E0C] hover:bg-[#3B2A12] border border-[#F59E0B]/70 text-[#FDE68A] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                        >
                          <Archive className="w-3 h-3 text-[#FBBF24] shrink-0" />
                          <span>
                            QA Engineer Pack .zip (qa_engineer_agent_pack_v1.zip)
                          </span>
                        </button>
                      )}
                      {onDownloadResearchCharacterPackZip && (
                        <button
                          type="button"
                          onClick={onDownloadResearchCharacterPackZip}
                          className="px-2 py-1.5 rounded bg-[#0B261C] hover:bg-[#103829] border border-[#22C55E]/70 text-[#86EFAC] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                        >
                          <Archive className="w-3 h-3 text-[#4ADE80] shrink-0" />
                          <span>
                            Research Prof Pack .zip (research_professor_agent_pack_v1.zip)
                          </span>
                        </button>
                      )}
                      {onDownloadResearchRoomPackZip && (
                        <button
                          type="button"
                          onClick={onDownloadResearchRoomPackZip}
                          className="px-2 py-1.5 rounded bg-[#2A1E0C] hover:bg-[#3B2A12] border border-[#F59E0B]/60 text-[#FDE68A] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                        >
                          <Archive className="w-3 h-3 text-[#FBBF24] shrink-0" />
                          <span>Research Pack .zip (research_room_production_pack_v1.zip)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={onDownloadEngineeringRoomPackZip}
                        className="px-2 py-1.5 rounded bg-[#0C2234] hover:bg-[#12314A] border border-[#38BDF8]/60 text-[#7DD3FC] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                      >
                        <Archive className="w-3 h-3 text-[#38BDF8] shrink-0" />
                        <span>Engineering Pack .zip (engineering_room_production_pack_v1.zip)</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDownloadRoomPackZip}
                        className="px-2 py-1.5 rounded bg-[#1B1E28] hover:bg-[#252A38] border border-[#2F3446] text-[#E5E0D8] text-[10px] flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Archive className="w-3 h-3 text-[#D99252] shrink-0" />
                        <span>PM Room Pack .zip</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDownloadCEORoomPackZip}
                        className="px-2 py-1.5 rounded bg-[#1B1E28] hover:bg-[#252A38] border border-[#10B981]/50 text-[#A7F3D0] text-[10px] flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Archive className="w-3 h-3 text-[#34D399] shrink-0" />
                        <span>CEO Room Pack .zip</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDownloadUIUXRoomPackZip}
                        className="px-2 py-1.5 rounded bg-[#142322] hover:bg-[#1B302F] border border-[#14B8A6]/60 text-[#99F6E4] text-[10px] flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                      >
                        <Archive className="w-3 h-3 text-[#5EEAD4] shrink-0" />
                        <span>UI/UX Room Pack .zip (uiux_room_production_pack_v1.zip)</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDownloadCharacterPackZip}
                        className="px-2 py-1.5 rounded bg-[#1B1E28] hover:bg-[#252A38] border border-[#2F3446] text-[#E5E0D8] text-[10px] flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Archive className="w-3 h-3 text-[#38BDF8] shrink-0" />
                        <span>Boss PM Pack .zip</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDownloadCEOCharacterPackZip}
                        className="px-2 py-1.5 rounded bg-[#1B1E28] hover:bg-[#252A38] border border-[#10B981]/50 text-[#A7F3D0] text-[10px] flex items-center justify-center gap-1 whitespace-nowrap"
                      >
                        <Archive className="w-3 h-3 text-[#34D399] shrink-0" />
                        <span>CEO Char Pack .zip</span>
                      </button>
                      <button
                        type="button"
                        onClick={onDownloadUIUXCharacterPackZip}
                        className="px-2 py-1.5 rounded bg-[#142322] hover:bg-[#1B302F] border border-[#14B8A6]/60 text-[#99F6E4] text-[10px] flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                      >
                        <Archive className="w-3 h-3 text-[#5EEAD4] shrink-0" />
                        <span>UI/UX Char Pack .zip (uiux_designer_agent_pack.zip)</span>
                      </button>
                      {onDownloadFrontendCharacterPackZip && (
                        <button
                          type="button"
                          onClick={onDownloadFrontendCharacterPackZip}
                          className="px-2 py-1.5 rounded bg-[#0C2234] hover:bg-[#12314A] border border-[#38BDF8]/60 text-[#7DD3FC] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                        >
                          <Archive className="w-3 h-3 text-[#38BDF8] shrink-0" />
                          <span>FE Dev Pack .zip (frontend_developer_agent_pack.zip)</span>
                        </button>
                      )}
                      {onDownloadBackendCharacterPackZip && (
                        <button
                          type="button"
                          onClick={onDownloadBackendCharacterPackZip}
                          className="px-2 py-1.5 rounded bg-[#0D231B] hover:bg-[#133529] border border-[#10B981]/60 text-[#6EE7B7] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                        >
                          <Archive className="w-3 h-3 text-[#34D399] shrink-0" />
                          <span>BE Dev Pack .zip (backend_developer_agent_pack.zip)</span>
                        </button>
                      )}
                      {onDownloadDatabaseCharacterPackZip && (
                        <button
                          type="button"
                          onClick={onDownloadDatabaseCharacterPackZip}
                          className="px-2 py-1.5 rounded bg-[#08251C] hover:bg-[#0D382B] border border-[#10B981]/70 text-[#A7F3D0] text-[10px] font-semibold flex items-center justify-center gap-1 whitespace-nowrap col-span-2"
                        >
                          <Archive className="w-3 h-3 text-[#10B981] shrink-0" />
                          <span>DB Dev Pack .zip (database_developer_agent_pack.zip)</span>
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onDownloadSourceZip}
                      className="w-full py-1.5 px-2.5 rounded bg-[#1B1E28] hover:bg-[#252A38] border border-[#6EE7B7]/40 text-[#A7F3D0] text-[11px] font-medium flex items-center justify-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
                      <span>Deliverable C: modular-room-lab-source.zip</span>
                    </button>
                    <button
                      type="button"
                      onClick={onDownloadCompleteHandoffZip}
                      className="w-full py-2 px-3 rounded-md bg-[#10B981] hover:bg-[#059669] text-[#0B1310] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Archive className="w-3.5 h-3.5 shrink-0" />
                      <span>Download AI-OFFICE-PM-ROOM-HANDOFF-V1.zip</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scene Source & Independent Re-Import Target Switcher */}
            <div className="p-2.5 rounded-lg bg-[#14151B] border border-[#262833] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#D6D1C7] font-medium">Viewer Scene Source</span>
                <span className="text-xs font-mono text-[#6EE7B7]">
                  {config.workspaceMode === 'import_test' ? 'Loaded from .GLB' : 'Live Builder'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ workspaceMode: 'builder' })}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    config.workspaceMode === 'builder'
                      ? 'bg-[#2E3240] text-white border-[#4B5563]'
                      : 'bg-[#1A1C24] text-[#8E95A5] border-[#262833]'
                  }`}
                >
                  Builder Scene
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ workspaceMode: 'import_test' });
                    if (!roundTripReport) onRunImportTest();
                  }}
                  className={`py-1.5 px-2 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    config.workspaceMode === 'import_test'
                      ? 'bg-[#2E3240] text-white border-[#6EE7B7]'
                      : 'bg-[#1A1C24] text-[#8E95A5] border-[#262833]'
                  }`}
                >
                  Test Exported GLB
                </button>
              </div>

              {config.workspaceMode === 'import_test' && (
                <div className="pt-1 space-y-1">
                  <div className="text-[10px] font-mono text-[#8E95A5]">
                    Re-Imported GLB Inspection Target:
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {(
                      [
                        { id: 'qa_devops_room_and_char', label: 'QA/DevOps Room + QA Eng' },
                        { id: 'qa_character_only', label: 'qa_engineer_agent.glb' },
                        { id: 'qa_devops_room_only', label: 'qa_devops_room.glb (8×16)' },
                        { id: 'research_room_and_char', label: 'Research Room + Prof' },
                        { id: 'research_character_only', label: 'research_professor_agent.glb' },
                        { id: 'research_room_only', label: 'research_room.glb (8×8)' },
                        { id: 'engineering_room_and_char', label: 'Eng Room + FE/BE/DB Dev' },
                        { id: 'database_character_only', label: 'database_developer_agent.glb' },
                        { id: 'backend_character_only', label: 'backend_developer_agent.glb' },
                        { id: 'frontend_character_only', label: 'frontend_developer_agent.glb' },
                        { id: 'engineering_room_only', label: 'engineering_room.glb (8×16)' },
                        { id: 'both_reimported', label: 'PM Room + PM Char' },
                        { id: 'ceo_room_and_char', label: 'CEO Room + CEO Char' },
                        { id: 'uiux_room_and_char', label: 'UI/UX Room + UI/UX Char' },
                        { id: 'uiux_character_only', label: 'uiux_designer_agent.glb' },
                        { id: 'uiux_room_only', label: 'uiux_room.glb Only' },
                        { id: 'room_only', label: 'pm_room.glb Only' },
                        { id: 'ceo_room_only', label: 'ceo_room.glb Only' },
                        { id: 'character_only', label: 'boss_pm.glb Only' },
                        { id: 'ceo_character_only', label: 'ceo_executive_assistant.glb' },
                      ] as const
                    ).map((opt) => {
                      const cur = config.importTestTarget || 'both_reimported';
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onUpdateConfig({ importTestTarget: opt.id })}
                          className={`py-1 px-1.5 rounded text-[10px] font-medium border ${
                            cur === opt.id
                              ? 'bg-[#262936] border-[#D99252] text-[#F5F2EB]'
                              : 'bg-[#181A22] border-[#262833] text-[#8E95A5]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const next = !config.showNeighborAssembly;
                  onUpdateConfig({
                    workspaceMode: 'import_test',
                    showNeighborAssembly: next,
                  });
                  setTimeout(onFitRoom, 60);
                }}
                className={`w-full py-2 px-2.5 rounded-md text-xs font-medium border flex items-center justify-between transition-colors ${
                  config.showNeighborAssembly && config.workspaceMode === 'import_test'
                    ? 'bg-[#1E3A34] border-[#34D399] text-[#A7F3D0]'
                    : 'bg-[#1A1C24] border-[#2B2F3C] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Neighbor Module Snap Proof</span>
                </span>
                <span className="font-mono text-[11px]">
                  {config.showNeighborAssembly && config.workspaceMode === 'import_test'
                    ? 'ACTIVE'
                    : 'OFF'}
                </span>
              </button>
            </div>

            {/* Validation Matrix & Round-Trip Reports */}
            {showValidationMatrix && roundTripReport && (
              <div className="bg-[#14151B] border border-[#34D399]/60 rounded-lg p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#6EE7B7] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Validation Matrix ({roundTripReport.overall_status})</span>
                  </span>
                  <button
                    type="button"
                    onClick={onDownloadRoundTripReport}
                    className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#7DD3FC] text-[10px] font-mono"
                  >
                    roundtrip-report.json
                  </button>
                </div>

                {/* QA & DevOps Integrated Studio GLB Round-Trip Summary */}
                {roundTripReport.qa_devops_room_roundtrip && (
                  <div className="p-2 rounded bg-[#231C11] border border-[#D89B3C]/55 space-y-1 font-mono text-[11px]">
                    <div className="text-[#F4C97E] font-semibold">
                      QA &amp; DevOps Studio GLB Round-Trip (
                      {PRODUCTION_FILENAMES.QA_DEVOPS_ROOM_GLB})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.qa_devops_room_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.qa_devops_room_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Meshes / Materials</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.qa_devops_room_roundtrip.meshCount} meshes /{' '}
                        {roundTripReport.qa_devops_room_roundtrip.materialCount} mats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">8×16 Monitors &amp; Connectors</span>
                      <span className="text-[#6EE7B7]">
                        9/9 Screens · West [0,0,8] · North [4,0,16]
                      </span>
                    </div>
                  </div>
                )}

                {/* Research & Shared Brain GLB Round-Trip Summary */}
                {roundTripReport.research_room_roundtrip && (
                  <div className="p-2 rounded bg-[#2A1E0C] border border-[#F59E0B]/50 space-y-1 font-mono text-[11px]">
                    <div className="text-[#FBBF24] font-semibold">
                      Research & Shared Brain GLB Round-Trip (
                      {PRODUCTION_FILENAMES.RESEARCH_ROOM_GLB})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.research_room_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.research_room_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Meshes / Materials</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.research_room_roundtrip.meshCount} meshes /{' '}
                        {roundTripReport.research_room_roundtrip.materialCount} mats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connectors & Atlas</span>
                      <span className="text-[#6EE7B7]">
                        South [4,0,0] · 6 DEMO Slots (VERIFIED)
                      </span>
                    </div>
                  </div>
                )}

                {/* Engineering Room GLB Round-Trip Summary */}
                {roundTripReport.engineering_room_roundtrip && (
                  <div className="p-2 rounded bg-[#0C2234] border border-[#38BDF8]/50 space-y-1 font-mono text-[11px]">
                    <div className="text-[#38BDF8] font-semibold">
                      Engineering Studio GLB Round-Trip (
                      {PRODUCTION_FILENAMES.ENGINEERING_ROOM_GLB})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.engineering_room_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.engineering_room_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Meshes / Materials</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.engineering_room_roundtrip.meshCount} meshes /{' '}
                        {roundTripReport.engineering_room_roundtrip.materialCount} mats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">8×16 Monitors & Connectors</span>
                      <span className="text-[#6EE7B7]">
                        6/6 Monitors · North [4,0,16] · East [8,0,8]
                      </span>
                    </div>
                  </div>
                )}

                {/* UI/UX Room GLB Round-Trip Summary */}
                {roundTripReport.uiux_room_roundtrip && (
                  <div className="p-2 rounded bg-[#142322] border border-[#14B8A6]/40 space-y-1 font-mono text-[11px]">
                    <div className="text-[#5EEAD4] font-semibold">
                      UI/UX Room GLB Round-Trip ({PRODUCTION_FILENAMES.UIUX_ROOM_GLB})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.uiux_room_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.uiux_room_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Meshes / Materials</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.uiux_room_roundtrip.meshCount} meshes /{' '}
                        {roundTripReport.uiux_room_roundtrip.materialCount} mats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connectors</span>
                      <span className="text-[#5EEAD4]">
                        South [4,0,0] · West Solid (VERIFIED)
                      </span>
                    </div>
                  </div>
                )}

                {/* CEO Room GLB Round-Trip Summary */}
                {roundTripReport.ceo_room_roundtrip && (
                  <div className="p-2 rounded bg-[#141E1B] border border-[#10B981]/40 space-y-1 font-mono text-[11px]">
                    <div className="text-[#34D399] font-semibold">
                      CEO Room GLB Round-Trip ({PRODUCTION_FILENAMES.CEO_ROOM_GLB})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.ceo_room_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.ceo_room_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Meshes / Materials</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.ceo_room_roundtrip.meshCount} meshes /{' '}
                        {roundTripReport.ceo_room_roundtrip.materialCount} mats
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Connectors</span>
                      <span className="text-[#6EE7B7]">
                        West [0,0,4] · South [4,0,0] (VERIFIED)
                      </span>
                    </div>
                  </div>
                )}

                {/* Boss PM Character GLB Round-Trip Summary */}
                <div className="p-2 rounded bg-[#191B22] border border-[#262833] space-y-1 font-mono text-[11px]">
                  <div className="text-[#38BDF8] font-semibold">
                    Character GLB Round-Trip ({roundTripReport.character_roundtrip.filename})
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Binary / SHA-256</span>
                    <span className="text-[#F3EFEA]">
                      {roundTripReport.character_roundtrip.fileSizeKB} ·{' '}
                      {roundTripReport.character_roundtrip.sha256.slice(0, 10)}…
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                    <span className="text-[#F3EFEA]">
                      {roundTripReport.character_roundtrip.sourceTotalMeshes} /{' '}
                      {roundTripReport.character_roundtrip.importedMeshCount} rest-pose
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                    <span className="text-[#6EE7B7]">
                      {roundTripReport.character_roundtrip.embeddedClipsVerified.count} / 11 VERIFIED
                    </span>
                  </div>
                </div>

                {/* CEO Executive Assistant GLB Round-Trip Summary */}
                {roundTripReport.ceo_character_roundtrip && (
                  <div className="p-2 rounded bg-[#141E1B] border border-[#10B981]/40 space-y-1 font-mono text-[11px]">
                    <div className="text-[#34D399] font-semibold">
                      CEO Character GLB Round-Trip ({roundTripReport.ceo_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.ceo_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.ceo_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.ceo_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.ceo_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#6EE7B7]">
                        {roundTripReport.ceo_character_roundtrip.embeddedClipsVerified.count} / 14 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* UI/UX Designer GLB Round-Trip Summary */}
                {roundTripReport.uiux_character_roundtrip && (
                  <div className="p-2 rounded bg-[#142322] border border-[#14B8A6]/40 space-y-1 font-mono text-[11px]">
                    <div className="text-[#5EEAD4] font-semibold">
                      UI/UX Designer GLB Round-Trip ({roundTripReport.uiux_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.uiux_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.uiux_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.uiux_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.uiux_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#5EEAD4]">
                        {roundTripReport.uiux_character_roundtrip.embeddedClipsVerified.count} / 15 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* Frontend Developer GLB Round-Trip Summary */}
                {roundTripReport.frontend_character_roundtrip && (
                  <div className="p-2 rounded bg-[#0C2234] border border-[#38BDF8]/50 space-y-1 font-mono text-[11px]">
                    <div className="text-[#38BDF8] font-semibold">
                      Frontend Developer GLB Round-Trip (
                      {roundTripReport.frontend_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.frontend_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.frontend_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.frontend_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.frontend_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#38BDF8]">
                        {roundTripReport.frontend_character_roundtrip.embeddedClipsVerified.count} / 16 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* Backend Developer GLB Round-Trip Summary */}
                {roundTripReport.backend_character_roundtrip && (
                  <div className="p-2 rounded bg-[#0D231B] border border-[#10B981]/50 space-y-1 font-mono text-[11px]">
                    <div className="text-[#34D399] font-semibold">
                      Backend Developer GLB Round-Trip (
                      {roundTripReport.backend_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.backend_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.backend_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.backend_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.backend_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#34D399]">
                        {roundTripReport.backend_character_roundtrip.embeddedClipsVerified.count} / 17 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* Database Developer GLB Round-Trip Summary */}
                {roundTripReport.database_character_roundtrip && (
                  <div className="p-2 rounded bg-[#08251C] border border-[#10B981]/70 space-y-1 font-mono text-[11px]">
                    <div className="text-[#10B981] font-semibold">
                      Database Developer GLB Round-Trip (
                      {roundTripReport.database_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.database_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.database_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.database_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.database_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#10B981]">
                        {roundTripReport.database_character_roundtrip.embeddedClipsVerified.count} / 21 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* Research Professor GLB Round-Trip Summary */}
                {roundTripReport.research_character_roundtrip && (
                  <div className="p-2 rounded bg-[#0B261C] border border-[#22C55E]/70 space-y-1 font-mono text-[11px]">
                    <div className="text-[#4ADE80] font-semibold">
                      Research Professor GLB Round-Trip (
                      {roundTripReport.research_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.research_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.research_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.research_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.research_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#4ADE80]">
                        {roundTripReport.research_character_roundtrip.embeddedClipsVerified.count} / 20 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* QA Engineer GLB Round-Trip Summary */}
                {roundTripReport.qa_character_roundtrip && (
                  <div className="p-2 rounded bg-[#2A1E0C] border border-[#F59E0B]/70 space-y-1 font-mono text-[11px]">
                    <div className="text-[#FBBF24] font-semibold">
                      QA Engineer GLB Round-Trip (
                      {roundTripReport.qa_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.qa_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.qa_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.qa_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.qa_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#FBBF24]">
                        {roundTripReport.qa_character_roundtrip.embeddedClipsVerified.count} / 23 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* DevOps Engineer GLB Round-Trip Summary */}
                {roundTripReport.devops_character_roundtrip && (
                  <div className="p-2 rounded bg-[#0C2234] border border-[#38BDF8]/70 space-y-1 font-mono text-[11px]">
                    <div className="text-[#38BDF8] font-semibold">
                      DevOps Engineer GLB Round-Trip (
                      {roundTripReport.devops_character_roundtrip.filename})
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Binary / SHA-256</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.devops_character_roundtrip.fileSizeKB} ·{' '}
                        {roundTripReport.devops_character_roundtrip.sha256.slice(0, 10)}…
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Source / Exported Meshes</span>
                      <span className="text-[#F3EFEA]">
                        {roundTripReport.devops_character_roundtrip.sourceTotalMeshes} /{' '}
                        {roundTripReport.devops_character_roundtrip.importedMeshCount} rest-pose
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8E95A5]">Embedded Clips in GLB</span>
                      <span className="text-[#38BDF8]">
                        {roundTripReport.devops_character_roundtrip.embeddedClipsVerified.count} / 27 VERIFIED
                      </span>
                    </div>
                  </div>
                )}

                {/* Validation Matrix Rows */}
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {roundTripReport.validation_matrix.map((row) => (
                    <div
                      key={row.id}
                      className="p-2 rounded bg-[#181A22] border border-[#262833] space-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#E5E0D8] text-[11px]">
                          {row.area}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                            row.status === 'PASS'
                              ? 'bg-[#064E3B] text-[#6EE7B7]'
                              : row.status === 'FAIL'
                              ? 'bg-[#7F1D1D] text-[#FCA5A5]'
                              : 'bg-[#374151] text-[#FDE68A]'
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#7DD3FC]">
                        {row.measured_result}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] leading-snug">{row.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PM Room GLB Round-Trip Summary Card */}
            {importReport ? (
              <div className="bg-[#14151B] border border-[#262833] rounded-lg p-3 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#6EE7B7] font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>PM Room GLB Round-Trip Verified ({importReport.fileSizeKB})</span>
                </div>

                <div className="space-y-1.5 font-mono tabular-nums text-[11px] pt-1 border-t border-[#262833]">
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Asset File</span>
                    <span className="text-[#F3EFEA]">{PRODUCTION_FILENAMES.ROOM_GLB}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Binary Size</span>
                    <span className="text-[#F3EFEA]">
                      {importReport.fileSizeKB} ({importReport.fileSizeBytes.toLocaleString()} B)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Imported Meshes</span>
                    <span className="text-[#F3EFEA]">{importReport.meshCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Imported Materials</span>
                    <span className="text-[#F3EFEA]">{importReport.materialCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Triangles</span>
                    <span className="text-[#F3EFEA]">{importReport.triangleCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Connectors Valid</span>
                    <span className="text-[#6EE7B7]">
                      {importReport.connectorsVerified.alignmentValid
                        ? 'East [8,0,4] · South [4,0,0]'
                        : 'Check'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#14151B] border border-[#262833] rounded-lg p-3 text-xs text-[#8E95A5]">
                Click "Validate Exported GLB" above to serialize pm_room.glb, ceo_room.glb, and
                boss_pm.glb with GLTFExporter and parse their binary ArrayBuffers back through an
                independent GLTFLoader.
              </div>
            )}
          </section>
        )}

        {activeTab === 'manifest' && manifestPreview && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#D6D1C7]">
                Handoff JSON Manifests & Contracts
              </h2>
              <button
                type="button"
                onClick={
                  isQADevOpsRoom
                    ? () => onExportQADevOpsRoomJsonContracts?.()
                    : isResearchRoom
                    ? () => onExportResearchRoomJsonContracts?.()
                    : isEngineeringRoom
                    ? onExportEngineeringRoomJsonContracts
                    : isUIUXRoom
                    ? onExportUIUXRoomJsonContracts
                    : isCEORoom
                    ? onExportCEORoomJsonContracts
                    : onExportRoomManifestAndAnchors
                }
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#2E3240] text-[#F3EFEA] hover:bg-[#3B4052] transition-colors whitespace-nowrap shrink-0"
              >
                Download JSONs
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-[#14151B] p-1 rounded-lg border border-[#262833]">
              {(
                [
                  { id: 'qa_devops_manifest', label: 'qa_devops.manifest' },
                  { id: 'qa_devops_anchors', label: 'qa_devops.anchors' },
                  { id: 'qa_devops_display_slots', label: 'qa_devops.slots' },
                  { id: 'qa_devops_behavior', label: 'qa_devops.behavior' },
                  { id: 'office_a3_2', label: 'office-layout-a3.2' },
                  { id: 'research_manifest', label: 'research.manifest' },
                  { id: 'research_anchors', label: 'research.anchors' },
                  { id: 'research_display_slots', label: 'research.slots' },
                  { id: 'research_behavior', label: 'research.behavior' },
                  { id: 'room_manifest', label: 'pm_room.manifest' },
                  { id: 'room_anchors', label: 'pm_room.anchors' },
                  { id: 'ceo_manifest', label: 'ceo_room.manifest' },
                  { id: 'ceo_anchors', label: 'ceo_room.anchors' },
                  { id: 'ceo_behavior', label: 'ceo_room.behavior' },
                  { id: 'uiux_manifest', label: 'uiux-room.manifest' },
                  { id: 'uiux_anchors', label: 'uiux-room.anchors' },
                  { id: 'uiux_behavior', label: 'uiux-room.behavior' },
                  { id: 'eng_anchors', label: 'eng_room.anchors' },
                  { id: 'eng_behavior', label: 'eng_room.behavior' },
                  { id: 'office_a3_1', label: 'office-layout-a3.1' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setManifestDocTab(tab.id)}
                  className={`py-1 px-1.5 rounded text-[10px] font-mono transition-colors truncate ${
                    manifestDocTab === tab.id
                      ? 'bg-[#D99252] text-[#14151B] font-semibold'
                      : 'text-[#8E95A5] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre className="bg-[#121318] border border-[#262833] rounded-lg p-2.5 text-[11px] font-mono text-[#D6D1C7] overflow-x-auto max-h-96 leading-relaxed">
              {manifestDocTab === 'qa_devops_manifest'
                ? JSON.stringify(
                    buildQADevOpsRoomManifestV1(
                      qaDevopsStats || stats!,
                      0,
                      new Date().toISOString()
                    ),
                    null,
                    2
                  )
                : manifestDocTab === 'qa_devops_anchors'
                ? JSON.stringify(buildQADevOpsRoomAnchorsJsonV1(), null, 2)
                : manifestDocTab === 'qa_devops_display_slots'
                ? JSON.stringify(buildQADevOpsDisplaySlotsJson(), null, 2)
                : manifestDocTab === 'qa_devops_behavior'
                ? JSON.stringify(buildQADevOpsRoomBehaviorJson(), null, 2)
                : manifestDocTab === 'office_a3_2'
                ? JSON.stringify(buildOfficeLayoutA3_2ExportJson(), null, 2)
                : manifestDocTab === 'research_manifest'
                ? JSON.stringify(
                    buildResearchRoomManifestV1(
                      researchStats || stats!,
                      0,
                      new Date().toISOString()
                    ),
                    null,
                    2
                  )
                : manifestDocTab === 'research_anchors'
                ? JSON.stringify(buildResearchRoomAnchorsJsonV1(), null, 2)
                : manifestDocTab === 'research_display_slots'
                ? JSON.stringify(buildResearchDisplaySlotsJson(), null, 2)
                : manifestDocTab === 'research_behavior'
                ? JSON.stringify(buildResearchRoomBehaviorJson(), null, 2)
                : manifestDocTab === 'room_manifest'
                ? JSON.stringify(manifestPreview, null, 2)
                : manifestDocTab === 'room_anchors'
                ? JSON.stringify(buildPMRoomAnchorsJsonV1(anchors), null, 2)
                : manifestDocTab === 'ceo_manifest'
                ? JSON.stringify(ceoManifestPreview, null, 2)
                : manifestDocTab === 'ceo_anchors'
                ? JSON.stringify(buildCEORoomAnchorsJsonV1(ceoAnchors), null, 2)
                : manifestDocTab === 'ceo_behavior'
                ? JSON.stringify(buildCEORoomBehaviorJson(), null, 2)
                : manifestDocTab === 'uiux_manifest'
                ? JSON.stringify(uiuxManifestPreview, null, 2)
                : manifestDocTab === 'uiux_anchors'
                ? JSON.stringify(buildUIUXRoomAnchorsJsonV1(uiuxAnchors), null, 2)
                : manifestDocTab === 'uiux_behavior'
                ? JSON.stringify(buildUIUXRoomBehaviorJson(), null, 2)
                : manifestDocTab === 'eng_anchors'
                ? JSON.stringify(buildEngineeringRoomAnchorsJsonV1(engineeringAnchors), null, 2)
                : manifestDocTab === 'eng_behavior'
                ? JSON.stringify(buildEngineeringRoomBehaviorJson(), null, 2)
                : manifestDocTab === 'office_a3_1'
                ? JSON.stringify(buildOfficeLayoutA3_1ExportJson(), null, 2)
                : JSON.stringify(buildOfficeLayoutA3ExportJson(), null, 2)}
            </pre>
          </section>
        )}
      </div>

      {/* Bottom Pipeline Export Actions Footer */}
      <div className="p-3 border-t border-[#2B2D38] bg-[#14151B] space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={
              isQADevOpsRoom
                ? () => onExportQADevOpsRoomJsonContracts?.()
                : isResearchRoom
                ? () => onExportResearchRoomJsonContracts?.()
                : isEngineeringRoom
                ? onExportEngineeringRoomJsonContracts
                : isUIUXRoom
                ? onExportUIUXRoomJsonContracts
                : isCEORoom
                ? onExportCEORoomJsonContracts
                : onExportRoomManifestAndAnchors
            }
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#222530] hover:bg-[#2C303E] text-[#E5E0D8] border border-[#323646] transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>
              {isQADevOpsRoom
                ? 'QA/DevOps JSONs (4)'
                : isResearchRoom
                ? 'Research JSONs (4)'
                : isEngineeringRoom
                ? 'Engineering JSONs'
                : isUIUXRoom
                ? 'UI/UX JSON Contracts'
                : isCEORoom
                ? 'CEO JSON Contracts'
                : 'PM Manifest+Anchors'}
            </span>
          </button>
          <button
            type="button"
            onClick={
              isQADevOpsRoom
                ? () => onExportQADevOpsRoomPNG?.()
                : isResearchRoom
                ? () => onExportResearchRoomPNG?.()
                : isEngineeringRoom
                ? onExportEngineeringRoomPNG
                : isUIUXRoom
                ? onExportUIUXRoomPNG
                : isCEORoom
                ? onExportCEORoomPNG
                : onExportPNG
            }
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-[#222530] hover:bg-[#2C303E] text-[#E5E0D8] border border-[#323646] transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>
              {isQADevOpsRoom
                ? 'Export QA/DevOps PNG'
                : isResearchRoom
                ? 'Export Research PNG'
                : isEngineeringRoom
                ? 'Export Eng PNG'
                : isUIUXRoom
                ? 'Export UI/UX PNG'
                : isCEORoom
                ? 'Export CEO PNG'
                : 'Export Preview PNG'}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={
              isQADevOpsRoom
                ? () => onExportQADevOpsRoomGLB?.()
                : isResearchRoom
                ? () => onExportResearchRoomGLB?.()
                : isEngineeringRoom
                ? onExportEngineeringRoomGLB
                : isUIUXRoom
                ? onExportUIUXRoomGLB
                : isCEORoom
                ? onExportCEORoomGLB
                : onExportGLB
            }
            className={`py-2 px-2.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 shadow-xs ${
              isQADevOpsRoom
                ? 'bg-[#D89B3C] hover:bg-[#E5AB4E] text-[#14151B]'
                : isResearchRoom
                ? 'bg-[#F59E0B] hover:bg-[#D97706] text-[#1C1204]'
                : isEngineeringRoom
                ? 'bg-[#38BDF8] hover:bg-[#0284C7] text-[#08121E]'
                : isUIUXRoom
                ? 'bg-[#14B8A6] hover:bg-[#0D9488] text-[#042F2E]'
                : isCEORoom
                ? 'bg-[#10B981] hover:bg-[#059669] text-[#0B1310]'
                : 'bg-[#D99252] hover:bg-[#E49F60] text-[#14151B]'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isQADevOpsRoom
                ? 'Export qa_devops_room.glb'
                : isResearchRoom
                ? 'Export research_room.glb'
                : isEngineeringRoom
                ? 'Export engineering_room.glb'
                : isUIUXRoom
                ? 'Export uiux_room.glb'
                : isCEORoom
                ? 'Export ceo_room.glb'
                : 'Export pm_room.glb'}
            </span>
          </button>
          <button
            type="button"
            onClick={
              isQADevOpsRoom
                ? () => onDownloadQADevOpsRoomPackZip?.()
                : isResearchRoom
                ? () => onDownloadResearchRoomPackZip?.()
                : isEngineeringRoom
                ? onDownloadEngineeringRoomPackZip
                : isUIUXRoom
                ? onDownloadUIUXRoomPackZip
                : isCEORoom
                ? onExportGLB
                : onExportOriginalPMGLB
            }
            className="py-2 px-2.5 rounded-lg text-[11px] font-semibold bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#14151B] transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isQADevOpsRoom
                ? 'QA/DevOps Pack .zip'
                : isResearchRoom
                ? 'Research Pack .zip'
                : isEngineeringRoom
                ? 'Engineering Pack .zip'
                : isUIUXRoom
                ? 'UI/UX Pack .zip'
                : isCEORoom
                ? 'Export pm_room.glb'
                : 'Export boss_pm.glb'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};
