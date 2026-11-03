import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Building2,
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  Eye,
  Film,
  Focus,
  Layers,
  Maximize2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Play,
  RotateCcw,
  RotateCw,
  Square,
  UserCheck,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CAMERA_PRESETS,
  MODULE_CONSTANTS,
  RoomExportStats,
} from './domain/modularRoomSpec';
import {
  ActivityAnchor,
  AnchorId,
  DEFAULT_ACTIVITY_ANCHORS,
  GLBInspectionReport,
  PMActionId,
  PM_DEMO_ACTIONS,
} from './domain/pmSimulationSpec';
import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEO_CAMERA_PRESETS,
  CEO_MODULE_CONSTANTS,
  DEFAULT_CEO_ANCHORS,
} from './domain/ceoRoomSpec';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUX_CAMERA_PRESETS,
} from './domain/uiuxRoomSpec';
import {
  DEFAULT_ENGINEERING_ANCHORS,
  ENGINEERING_CAMERA_PRESETS,
  EngineeringActivityAnchor,
  EngineeringAnchorId,
} from './domain/engineeringRoomSpec';
import {
  RESEARCH_CAMERA_PRESETS,
  ResearchAnchorId,
} from './domain/researchRoomSpec';
import {
  QA_DEVOPS_CAMERA_PRESETS,
  QADevOpsAnchorId,
} from './domain/qaDevopsRoomSpec';
import {
  CEOActionId,
  CEOExpressionId,
  CEORuntimeStatus,
  CEO_DEMO_ACTIONS,
} from './domain/ceoSimulationSpec';
import {
  UIUXActionId,
  UIUXExpressionId,
  UIUXRuntimeStatus,
  UIUXSpeedMultiplier,
  UIUX_DEMO_ACTIONS,
} from './domain/uiuxSimulationSpec';
import {
  FRONTEND_ACTION_LIST,
  FrontendActionId,
  FrontendExpressionId,
  FrontendSimulationRuntimeStatus,
  FrontendSpeedMultiplier,
} from './domain/frontendSimulationSpec';
import {
  BACKEND_ACTION_LIST,
  BackendActionId,
  BackendExpressionId,
  BackendSimulationRuntimeStatus,
  BackendSpeedMultiplier,
} from './domain/backendSimulationSpec';
import {
  DATABASE_ACTION_LIST,
  DatabaseActionId,
  DatabaseExpressionId,
  DatabaseSimulationRuntimeStatus,
  DatabaseSpeedMultiplier,
} from './domain/databaseSimulationSpec';
import {
  RESEARCH_ACTION_LIST,
  ResearchActionId,
  ResearchExpressionId,
  ResearchSimulationRuntimeStatus,
  ResearchSpeedMultiplier,
} from './domain/researchSimulationSpec';
import {
  FULL_OFFICE_CAMERA_PRESETS,
  FullOfficeCutawayMode,
  FullOfficeOrbitMode,
  OFFICE_ROOM_LIST,
  OfficeViewMode,
  RoomModuleKey,
  getRoomModuleByKey,
} from './domain/officeLayoutA3Spec';
import {
  ClickedMeshDiagnostic,
  ModularRoomCanvas,
  ModularRoomCanvasHandle,
  PMSimulationRuntimeTelemetry,
  SelectedObjectInspection,
  ViewerDisplayConfig,
  VisualStabilityDiagnosticReport,
} from './components/ModularRoomCanvas';
import { InspectorTabId, RoomInspectorPanel } from './components/RoomInspectorPanel';
import { ImportValidationReport } from './three/RoomExportAndImportManager';
import {
  IndependentRoundTripReportV1,
  downloadRoundTripReportJson,
} from './export/AssetValidation';
import { AllAgentMeetingDemoStatus } from './three/AllAgentMeetingDemoSystem';
import { HUB_MEETING_SEATS_LIST } from './domain/centralHubSpec';
import {
  downloadCEORoomAssetPackZip,
  downloadCEORoomJsonContracts,
  downloadEngineeringRoomAssetPackZip,
  downloadEngineeringRoomJsonContracts,
  downloadOfficeLayoutA3Json,
  downloadOfficeLayoutA3_1Json,
  downloadOfficeLayoutA3_2Json,
  downloadQADevOpsRoomAssetPackZip,
  downloadQADevOpsRoomJsonContracts,
  downloadResearchRoomAssetPackZip,
  downloadResearchRoomJsonContracts,
  downloadRoomAssetPackZip,
  downloadRoomManifestAndAnchors,
  downloadUIUXRoomAssetPackZip,
  downloadUIUXRoomJsonContracts,
} from './export/RoomExporter';
import {
  downloadBackendCharacterAssetPackZip,
  downloadBackendCharacterManifestAndBehavior,
  downloadCEOCharacterAssetPackZip,
  downloadCEOCharacterManifestAndBehavior,
  downloadCharacterAssetPackZip,
  downloadCharacterManifestAndBehavior,
  downloadDatabaseCharacterAssetPackZip,
  downloadDatabaseCharacterManifestAndBehavior,
  downloadFrontendCharacterAssetPackZip,
  downloadFrontendCharacterManifestAndBehavior,
  downloadResearchCharacterAssetPackZip,
  downloadResearchCharacterManifestAndBehavior,
  downloadUIUXCharacterAssetPackZip,
  downloadUIUXCharacterManifestAndBehavior,
} from './export/CharacterExporter';
import {
  downloadCompleteHandoffBundleZip,
  downloadModularRoomLabSourceZip,
  getBundledSourceFileList,
} from './export/BrowserSourceBundle';

export function App() {
  const canvasRef = useRef<ModularRoomCanvasHandle | null>(null);
  const topGlbInputRef = useRef<HTMLInputElement | null>(null);

  const [config, setConfig] = useState<ViewerDisplayConfig>({
    workspaceMode: 'builder',
    officeViewMode: 'single_room',
    selectedRoomKey: 'pm_strategy',
    reimportDisplayMode: 'both_reimported',
    visualStyle: 'reference',
    showGrid: false,
    autoCutawayWalls: true,
    showWallsAndWindows: true,
    showFurniture: true,
    showPropsAndDecor: true,
    showMannequin: false,
    showTextures: true,
    showShadows: true,
    showWireframe: false,
    showNeighborAssembly: false,
    showBossPM: true,
    showSimulationAnchors: false,
    showNavigationPath: true,
    followPMCamera: false,
    selectedCatalogId: null,
    isolatedCatalogId: null,
    hiddenCatalogIds: [],
  });

  const [inspectorTab, setInspectorTab] = useState<InspectorTabId>('simulation');
  const [activePresetId, setActivePresetId] = useState<string>('isometric');
  const [stats, setStats] = useState<RoomExportStats | null>(null);
  const [ceoStats, setCeoStats] = useState<RoomExportStats | null>(null);
  const [uiuxStats, setUiuxStats] = useState<RoomExportStats | null>(null);
  const [engineeringStats, setEngineeringStats] = useState<RoomExportStats | null>(null);
  const [researchStats, setResearchStats] = useState<RoomExportStats | null>(null);
  const [qaDevopsStats, setQaDevopsStats] = useState<RoomExportStats | null>(null);
  const [centralHubStats, setCentralHubStats] = useState<RoomExportStats | null>(null);
  const [meetingDemoStatus, setMeetingDemoStatus] = useState<AllAgentMeetingDemoStatus | null>(null);
  const [meetingSeatsExpanded, setMeetingSeatsExpanded] = useState<boolean>(false);
  const [selectedDetails, setSelectedDetails] = useState<SelectedObjectInspection | null>(null);
  const [importReport, setImportReport] = useState<ImportValidationReport | null>(null);
  const [roundTripReport, setRoundTripReport] = useState<IndependentRoundTripReportV1 | null>(null);
  const [glbInspectionReport, setGlbInspectionReport] = useState<GLBInspectionReport | null>(null);
  const [clickedMeshDiagnostic, setClickedMeshDiagnostic] = useState<ClickedMeshDiagnostic | null>(
    null
  );
  const [stabilityReport, setStabilityReport] = useState<VisualStabilityDiagnosticReport | null>(
    null
  );
  const [anchors, setAnchors] = useState<Record<AnchorId, ActivityAnchor>>(() => ({
    ...DEFAULT_ACTIVITY_ANCHORS,
  }));
  const [selectedAnchorId, setSelectedAnchorId] = useState<AnchorId | null>('PM_DESK_WORK_POSITION');

  const [ceoAnchors, setCeoAnchors] = useState<Record<CEOAnchorId, CEOActivityAnchor>>(() => ({
    ...DEFAULT_CEO_ANCHORS,
  }));
  const [selectedCEOAnchorId, setSelectedCEOAnchorId] = useState<CEOAnchorId | null>(
    'CEO_DESK_WORK'
  );

  const [uiuxAnchors, setUiuxAnchors] = useState<Record<UIUXAnchorId, UIUXActivityAnchor>>(() => ({
    ...DEFAULT_UIUX_ANCHORS,
  }));
  const [selectedUIUXAnchorId, setSelectedUIUXAnchorId] = useState<UIUXAnchorId | null>(
    'UIUX_DESK_WORK'
  );

  const [engineeringAnchors, setEngineeringAnchors] = useState<
    Record<EngineeringAnchorId, EngineeringActivityAnchor>
  >(() => ({
    ...DEFAULT_ENGINEERING_ANCHORS,
  }));
  const [selectedEngineeringAnchorId, setSelectedEngineeringAnchorId] =
    useState<EngineeringAnchorId | null>('FE_DESK_WORK');

  const [selectedResearchAnchorId, setSelectedResearchAnchorId] =
    useState<ResearchAnchorId | null>('RESEARCH_DESK_WORK');
  const [selectedQADevOpsAnchorId, setSelectedQADevOpsAnchorId] =
    useState<QADevOpsAnchorId | null>('QA_DESK_WORK');

  const [bubbleDismissedForAction, setBubbleDismissedForAction] = useState<PMActionId | null>(null);
  const [ceoBubbleDismissedForAction, setCeoBubbleDismissedForAction] =
    useState<CEOActionId | null>(null);
  const [uiuxBubbleDismissedForAction, setUiuxBubbleDismissedForAction] =
    useState<UIUXActionId | null>(null);
  const [frontendBubbleDismissedForAction, setFrontendBubbleDismissedForAction] =
    useState<FrontendActionId | null>(null);
  const [backendBubbleDismissedForAction, setBackendBubbleDismissedForAction] =
    useState<BackendActionId | null>(null);
  const [databaseBubbleDismissedForAction, setDatabaseBubbleDismissedForAction] =
    useState<DatabaseActionId | null>(null);
  const [researchBubbleDismissedForAction, setResearchBubbleDismissedForAction] =
    useState<ResearchActionId | null>(null);

  const [telemetry, setTelemetry] = useState<PMSimulationRuntimeTelemetry>({
    loaded: true,
    loadError: null,
    selectedCharacterSource: 'original_pm',
    activeCharacterSource: 'original_pm',
    hasImportedGLB: false,
    importedGLBFilename: null,
    currentActionId: 'idle',
    currentActionDef: PM_DEMO_ACTIONS[0],
    currentState: 'IDLE',
    isWalking: false,
    isPaused: false,
    speedMultiplier: 1,
    patrolActive: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoStepTitle: null,
    currentAnchorId: 'ROOM_IDLE_POSITION',
    targetAnchorId: 'ROOM_IDLE_POSITION',
    worldPosition: [3.35, 0, 5.15],
    facingDeg: 135,
    activeClipName: 'Idle_Breathing (Original Voxel)',
    capabilityMode: 'CASE_A_EMBEDDED_CLIPS',
    scaleMultiplier: 1.0,
    forwardOffsetDeg: 0,
    isPMSelected: false,
    overheadScreenPos: { x: 400, y: 300, visible: false },
  });

  const [ceoStatus, setCeoStatus] = useState<CEORuntimeStatus>({
    loaded: true,
    state: 'IDLE',
    currentState: 'IDLE',
    activeActionId: 'idle',
    currentActionId: 'idle',
    activeActionLabel: CEO_DEMO_ACTIONS[0].labelId,
    currentActionDef: CEO_DEMO_ACTIONS[0],
    currentClipName: 'Idle_Breathing',
    activeClipName: 'Idle_Breathing',
    currentAnchorId: 'CEO_ROOM_IDLE',
    targetAnchorId: 'CEO_ROOM_IDLE',
    expressionId: 'neutral',
    currentExpression: 'neutral',
    glassesVisible: true,
    activePropId: 'none',
    activeProp: 'none',
    position: [4.35, 0, 4.15],
    worldPosition: [4.35, 0, 4.15],
    rotationYDeg: 0,
    facingDeg: 0,
    speedMultiplier: 1,
    isWalking: false,
    isPaused: false,
    isPatrolling: false,
    patrolActive: false,
    isAutoDemoRunning: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoTotalSteps: 9,
    autoDemoStepTitle: null,
    bubbleText: CEO_DEMO_ACTIONS[0].speechBubble || null,
    bubbleBadge: CEO_DEMO_ACTIONS[0].statusBadgeText,
    bubbleTone: 'emerald',
    isEmbeddedClipPlaying: true,
    availableClips: CEO_DEMO_ACTIONS.map((a) => a.clipName),
    characterSource: 'procedural',
    characterPolyCount: 920,
  });

  const [uiuxStatus, setUiuxStatus] = useState<UIUXRuntimeStatus>({
    loaded: true,
    state: 'IDLE',
    currentState: 'IDLE',
    activeActionId: 'idle',
    currentActionId: 'idle',
    activeActionLabel: UIUX_DEMO_ACTIONS[0].labelId,
    currentActionDef: UIUX_DEMO_ACTIONS[0],
    currentClipName: 'Idle_Breathing',
    activeClipName: 'Idle_Breathing',
    currentAnchorId: 'UIUX_ROOM_IDLE',
    targetAnchorId: 'UIUX_ROOM_IDLE',
    expressionId: 'neutral',
    currentExpression: 'neutral',
    glassesVisible: true,
    activePropId: 'none',
    activeProp: 'none',
    position: [4.1, 0, 4.35],
    worldPosition: [4.1, 0, 4.35],
    rotationYDeg: 180,
    facingDeg: 180,
    speedMultiplier: 1,
    isWalking: false,
    isPaused: false,
    isPatrolling: false,
    patrolActive: false,
    isAutoDemoRunning: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoTotalSteps: 9,
    autoDemoStepTitle: null,
    bubbleText: UIUX_DEMO_ACTIONS[0].speechBubble || null,
    bubbleBadge: UIUX_DEMO_ACTIONS[0].statusBadgeText,
    bubbleTone: 'teal',
    isEmbeddedClipPlaying: true,
    availableClips: UIUX_DEMO_ACTIONS.map((a) => a.clipName),
    characterSource: 'procedural',
    characterPolyCount: 940,
  });

  const [frontendStatus, setFrontendStatus] = useState<FrontendSimulationRuntimeStatus>({
    characterId: 'frontend_developer_agent',
    displayName: 'Frontend Developer',
    currentState: 'IDLE',
    currentActionId: 'idle',
    currentActionLabel: FRONTEND_ACTION_LIST[0].idLabel,
    activeClipName: 'Idle_Breathing',
    currentAnchorId: 'ENGINEERING_ROOM_IDLE',
    targetAnchorId: 'ENGINEERING_ROOM_IDLE',
    currentExpression: 'neutral',
    posture: 'standing',
    handheldProp: 'none',
    isWalking: false,
    isPaused: false,
    patrolActive: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoTotalSteps: 10,
    speedMultiplier: 1,
    glassesVisible: true,
    backpackVisible: true,
    backpackAutoHiddenForSeat: false,
    bubbleText: FRONTEND_ACTION_LIST[0].bubbleText,
    thoughtText: FRONTEND_ACTION_LIST[0].thoughtText,
    worldPosition: [3.2, 0, 12.8],
    facingRad: 1.57,
  });

  const [backendStatus, setBackendStatus] = useState<BackendSimulationRuntimeStatus>({
    characterId: 'backend_developer_agent',
    displayName: 'Backend Developer',
    currentState: 'IDLE',
    currentActionId: 'IDLE',
    currentActionLabel: BACKEND_ACTION_LIST[0].idLabel,
    activeClipName: 'Idle_Breathing',
    currentAnchorId: 'BE_WORKSTATION_APPROACH',
    targetAnchorId: 'BE_WORKSTATION_APPROACH',
    currentExpression: 'neutral',
    posture: 'standing',
    handheldProp: 'none',
    isWalking: false,
    isPaused: false,
    patrolActive: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoTotalSteps: 12,
    speedMultiplier: 1,
    glassesVisible: true,
    backpackVisible: true,
    backpackAutoHiddenForSeat: false,
    bubbleText: BACKEND_ACTION_LIST[0].bubbleText,
    thoughtText: BACKEND_ACTION_LIST[0].thoughtText,
    worldPosition: [4.45, 0, 9.25],
    facingRad: -2.4,
  });

  const [databaseStatus, setDatabaseStatus] = useState<DatabaseSimulationRuntimeStatus>({
    characterId: 'database_developer_agent',
    displayName: 'Database Developer',
    currentState: 'IDLE',
    currentActionId: 'IDLE',
    currentActionLabel: DATABASE_ACTION_LIST[0].idLabel,
    activeClipName: 'Idle_Breathing',
    currentAnchorId: 'DB_WORKSTATION_APPROACH',
    targetAnchorId: 'DB_WORKSTATION_APPROACH',
    currentExpression: 'neutral',
    posture: 'standing',
    handheldProp: 'none',
    isWalking: false,
    isPaused: false,
    patrolActive: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoTotalSteps: 12,
    speedMultiplier: 1,
    glassesVisible: false,
    backpackVisible: true,
    backpackAutoHiddenForSeat: false,
    bubbleText: DATABASE_ACTION_LIST[0].bubbleText,
    thoughtText: DATABASE_ACTION_LIST[0].thoughtText,
    worldPosition: [4.45, 0, 2.15],
    facingRad: -Math.PI / 2,
  });

  const [researchStatus, setResearchStatus] = useState<ResearchSimulationRuntimeStatus>({
    characterId: 'research_professor_agent',
    displayName: 'Research Professor',
    currentState: 'IDLE',
    currentActionId: 'IDLE',
    currentActionLabel: RESEARCH_ACTION_LIST[0].idLabel,
    activeClipName: 'Idle_Breathing',
    currentAnchorId: 'RESEARCH_ROOM_IDLE',
    targetAnchorId: 'RESEARCH_ROOM_IDLE',
    currentExpression: 'neutral',
    posture: 'standing',
    handheldProp: 'none',
    isWalking: false,
    isPaused: false,
    patrolActive: false,
    autoDemoActive: false,
    autoDemoStepIndex: 0,
    autoDemoTotalSteps: 14,
    speedMultiplier: 1,
    glassesVisible: true,
    backpackVisible: true,
    backpackAutoHiddenForSeat: false,
    bubbleText: RESEARCH_ACTION_LIST[0].bubbleText,
    thoughtText: RESEARCH_ACTION_LIST[0].thoughtText,
    worldPosition: [3.85, 0, 3.65],
    facingRad: Math.PI,
  });

  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [demoPanelOpen, setDemoPanelOpen] = useState<boolean>(true);
  const [cinemaMode, setCinemaMode] = useState<boolean>(false);
  const [moreViewsExpanded, setMoreViewsExpanded] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [presetCategory, setPresetCategory] = useState<'all' | 'standard' | 'inspection'>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cinemaMode) {
        setCinemaMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cinemaMode]);

  const notifyStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
  }, []);

  const updateConfig = useCallback((partial: Partial<ViewerDisplayConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleSetCutawayMode = useCallback(
    (mode: FullOfficeCutawayMode) => {
      setConfig((prev) => ({
        ...prev,
        fullOfficeCutawayMode: mode,
        autoCutawayWalls: mode !== 'show_architecture',
        showWallsAndWindows: true,
      }));
      const modeLabel =
        mode === 'smart_cutaway'
          ? 'Smart Cutaway (Default)'
          : mode === 'show_architecture'
          ? 'Show All Walls (Architecture Mode)'
          : 'Agent Visibility Mode';
      notifyStatus(`Full Office Wall Mode: ${modeLabel}`);
    },
    [notifyStatus]
  );

  const handleSetOrbitMode = useCallback(
    (mode: FullOfficeOrbitMode) => {
      setConfig((prev) => ({
        ...prev,
        fullOfficeOrbitMode: mode,
      }));
      notifyStatus(
        mode === 'cinematic'
          ? 'Orbit Mode: Cinematic Constrained (Elevation 28°–46°, Azimuth ±20°)'
          : 'Orbit Mode: Free Inspect (Unconstrained Azimuth)'
      );
    },
    [notifyStatus]
  );

  const handleSwitchOfficeViewMode = useCallback(
    (mode: OfficeViewMode) => {
      setConfig((prev) => ({
        ...prev,
        workspaceMode: 'builder',
        officeViewMode: mode,
      }));
      setTimeout(() => {
        if (mode === 'full_office') {
          canvasRef.current?.setCameraPreset('full_office_cinematic');
        } else {
          canvasRef.current?.resetCamera();
        }
      }, 20);
      notifyStatus(
        mode === 'full_office'
          ? 'Office View: Full Office Cinematic Overview V2.1 (Master Floor Plan A3.2 · 32×26 Units · Smart Cutaway)'
          : `Office View: Single Room (${getRoomModuleByKey(config.selectedRoomKey).display_name})`
      );
    },
    [config.selectedRoomKey, notifyStatus]
  );

  const handleSelectRoomKey = useCallback(
    (roomKey: RoomModuleKey) => {
      const rm = getRoomModuleByKey(roomKey);
      setSelectedDetails(null);
      setConfig((prev) => ({
        ...prev,
        workspaceMode: 'builder',
        selectedRoomKey: roomKey,
        selectedCatalogId: null,
        isolatedCatalogId: null,
      }));
      setInspectorOpen(true);
      setInspectorTab('simulation');

      setTimeout(() => {
        if (config.officeViewMode === 'full_office') {
          canvasRef.current?.focusRoomInFullOffice(roomKey);
        } else {
          canvasRef.current?.setCameraPreset('isometric');
        }
      }, 25);

      notifyStatus(
        `Ruangan Dipilih: ${rm.display_name} [${rm.badge}] · Slot A3 [${rm.global_offset.join(', ')}]`
      );
    },
    [config.officeViewMode, notifyStatus]
  );

  const handleSelectCatalogItem = useCallback(
    (catalogId: string | null, details?: SelectedObjectInspection | null) => {
      setConfig((prev) => ({ ...prev, selectedCatalogId: catalogId }));
      if (details !== undefined) {
        setSelectedDetails(details);
      } else if (catalogId === null) {
        setSelectedDetails(null);
      } else {
        const measured = canvasRef.current?.inspectCatalogItem(catalogId) ?? null;
        setSelectedDetails(measured);
      }
    },
    []
  );

  const handleExportGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(`Exported Room-Only ${res.filename} (${kb} KB binary GLB · Character excluded)`);
    } catch (err) {
      notifyStatus(`GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportCEORoomGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportCEORoomGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(`Exported CEO Room ${res.filename} (${kb} KB binary GLB · 8×8 local [0,0,0])`);
    } catch (err) {
      notifyStatus(`CEO Room GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportUIUXRoomGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportUIUXRoomGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(`Exported UI/UX Studio ${res.filename} (${kb} KB binary GLB · 8×8 local [0,0,0] · Room-Only)`);
    } catch (err) {
      notifyStatus(`UI/UX Room GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportEngineeringRoomGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportEngineeringRoomGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Engineering Studio ${res.filename} (${kb} KB binary GLB · 8×16 local [0,0,0] · Room-Only)`
      );
    } catch (err) {
      notifyStatus(
        `Engineering Room GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportResearchRoomGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportResearchRoomGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Research & Shared Brain ${res.filename} (${kb} KB binary GLB · 8×8 local [0,0,0] · Room-Only)`
      );
    } catch (err) {
      notifyStatus(
        `Research Room GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportQADevOpsRoomGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportQADevOpsRoomGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported QA & DevOps Studio ${res.filename} (${kb} KB binary GLB · 8×16 local [0,0,0] · Room-Only)`
      );
    } catch (err) {
      notifyStatus(
        `QA & DevOps Room GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportOriginalPMGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportOriginalPMGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Original Room-Native Boss PM ${res.filename} (${kb} KB binary GLB with 11 animation clips)`
      );
    } catch (err) {
      notifyStatus(`Original PM GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportCEOCharacterGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportCEOCharacterGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported CEO Executive Assistant ${res.filename} (${kb} KB binary GLB with 14 animation clips)`
      );
    } catch (err) {
      notifyStatus(`CEO Character GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportUIUXCharacterGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportUIUXCharacterGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported UI/UX Designer ${res.filename} (${kb} KB binary GLB with 15 animation clips)`
      );
    } catch (err) {
      notifyStatus(`UI/UX Character GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportFrontendCharacterGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportFrontendCharacterGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Frontend Developer ${res.filename} (${kb} KB binary GLB with 16 animation clips)`
      );
    } catch (err) {
      notifyStatus(
        `Frontend Character GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportBackendCharacterGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportBackendCharacterGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Backend Developer ${res.filename} (${kb} KB binary GLB with 17 animation clips)`
      );
    } catch (err) {
      notifyStatus(
        `Backend Character GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportDatabaseCharacterGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportDatabaseCharacterGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Database Developer ${res.filename} (${kb} KB binary GLB with 21 animation clips)`
      );
    } catch (err) {
      notifyStatus(
        `Database Character GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportResearchCharacterGLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportResearchCharacterGLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(
        `Exported Research Professor ${res.filename} (${kb} KB binary GLB with 20 animation clips)`
      );
    } catch (err) {
      notifyStatus(
        `Research Character GLB Export error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportManifest = useCallback(() => {
    if (!canvasRef.current) return;
    const res = canvasRef.current.exportManifest();
    notifyStatus(`Exported companion manifest ${res.filename}`);
  }, [notifyStatus]);

  const handleExportRoomManifestAndAnchors = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportRoomProductionPack();
      downloadRoomManifestAndAnchors(pack.manifest, pack.anchorsJson);
      notifyStatus('Exported pm_room.manifest.json + pm_room.anchors.json');
    } catch (err) {
      notifyStatus(`Export Room Manifest failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportCEORoomJsonContracts = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportCEORoomProductionPack();
      downloadCEORoomJsonContracts(pack);
      notifyStatus('Exported ceo_room.manifest.json + ceo_room.anchors.json + ceo_room.behavior.json');
    } catch (err) {
      notifyStatus(`Export CEO JSONs failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportUIUXRoomJsonContracts = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportUIUXRoomProductionPack();
      downloadUIUXRoomJsonContracts(pack);
      notifyStatus('Exported uiux-room.manifest.json + uiux-room.anchors.json + uiux-room.behavior.json');
    } catch (err) {
      notifyStatus(`Export UI/UX JSONs failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportEngineeringRoomJsonContracts = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportEngineeringRoomProductionPack();
      downloadEngineeringRoomJsonContracts(pack);
      notifyStatus(
        'Exported engineering_room.manifest.json + engineering_room.anchors.json + engineering_room.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export Engineering JSONs failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportResearchRoomJsonContracts = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportResearchRoomProductionPack();
      downloadResearchRoomJsonContracts(pack);
      notifyStatus(
        'Exported research_room.manifest.json + research_room.anchors.json + research_room.display_slots.json + research_room.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export Research JSONs failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportQADevOpsRoomJsonContracts = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportQADevOpsRoomProductionPack();
      downloadQADevOpsRoomJsonContracts(pack);
      notifyStatus(
        'Exported qa_devops_room.manifest.json + qa_devops_room.anchors.json + qa_devops_room.display_slots.json + qa_devops_room.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export QA & DevOps JSONs failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportOfficeLayoutA3Json = useCallback(() => {
    const res = downloadOfficeLayoutA3Json();
    notifyStatus(`Exported Master Floor Plan A3 Contract (${res.filename})`);
  }, [notifyStatus]);

  const handleExportOfficeLayoutA3_1Json = useCallback(() => {
    const res = downloadOfficeLayoutA3_1Json();
    notifyStatus(`Exported Master Floor Plan A3.1 Contract (${res.filename})`);
  }, [notifyStatus]);

  const handleExportOfficeLayoutA3_2Json = useCallback(() => {
    const res = downloadOfficeLayoutA3_2Json();
    notifyStatus(`Exported Master Floor Plan A3.2 Contract (${res.filename})`);
  }, [notifyStatus]);

  const handleExportCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportCharacterCandidatePack();
      downloadCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus('Exported boss_pm.manifest.json + boss_pm.behavior.json');
    } catch (err) {
      notifyStatus(`Export Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportCEOCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportCEOCharacterPack();
      downloadCEOCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus(
        'Exported ceo_executive_assistant.manifest.json + ceo_executive_assistant.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export CEO Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportUIUXCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportUIUXCharacterPack();
      downloadUIUXCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus(
        'Exported uiux_designer_agent.manifest.json + uiux_designer_agent.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export UI/UX Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportFrontendCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportFrontendCharacterPack();
      downloadFrontendCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus(
        'Exported frontend_developer_agent.manifest.json + frontend_developer_agent.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export Frontend Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportBackendCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportBackendCharacterPack();
      downloadBackendCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus(
        'Exported backend_developer_agent.manifest.json + backend_developer_agent.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export Backend Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportDatabaseCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportDatabaseCharacterPack();
      downloadDatabaseCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus(
        'Exported database_developer_agent.manifest.json + database_developer_agent.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export Database Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportResearchCharacterManifestAndBehavior = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const pack = await canvasRef.current.exportResearchCharacterPack();
      downloadResearchCharacterManifestAndBehavior(pack.manifest, pack.behaviorJson);
      notifyStatus(
        'Exported research_professor_agent.manifest.json + research_professor_agent.behavior.json'
      );
    } catch (err) {
      notifyStatus(
        `Export Research Character Manifest failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    const res = await canvasRef.current.exportPreviewPNG();
    notifyStatus(`Saved room preview ${res.filename}`);
  }, [notifyStatus]);

  const handleExportCEORoomPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportCEORoomPreviewPNG();
      notifyStatus(`Saved CEO room preview ${res.filename}`);
    } catch (err) {
      notifyStatus(`Export CEO PNG failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportUIUXRoomPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportUIUXRoomPreviewPNG();
      notifyStatus(`Saved UI/UX Studio preview ${res.filename}`);
    } catch (err) {
      notifyStatus(`Export UI/UX PNG failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportEngineeringRoomPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportEngineeringRoomPreviewPNG();
      notifyStatus(`Saved Engineering Studio preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export Engineering PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportResearchRoomPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportResearchRoomPreviewPNG();
      notifyStatus(`Saved Research & Shared Brain preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export Research PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportQADevOpsRoomPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportQADevOpsRoomPreviewPNG();
      notifyStatus(`Saved QA & DevOps Studio preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export QA & DevOps PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportCharacterPreviewPNG();
      notifyStatus(`Saved Boss PM preview ${res.filename}`);
    } catch (err) {
      notifyStatus(`Export Character PNG failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportCEOCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportCEOCharacterPreviewPNG();
      notifyStatus(`Saved CEO Executive Assistant preview ${res.filename}`);
    } catch (err) {
      notifyStatus(`Export CEO Character PNG failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportUIUXCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportUIUXCharacterPreviewPNG();
      notifyStatus(`Saved UI/UX Designer preview ${res.filename}`);
    } catch (err) {
      notifyStatus(`Export UI/UX Character PNG failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportFrontendCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportFrontendCharacterPreviewPNG();
      notifyStatus(`Saved Frontend Developer preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export Frontend Character PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportBackendCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportBackendCharacterPreviewPNG();
      notifyStatus(`Saved Backend Developer preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export Backend Character PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportDatabaseCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportDatabaseCharacterPreviewPNG();
      notifyStatus(`Saved Database Developer preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export Database Character PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleExportResearchCharacterPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportResearchCharacterPreviewPNG();
      notifyStatus(`Saved Research Professor preview ${res.filename}`);
    } catch (err) {
      notifyStatus(
        `Export Research Character PNG failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadRoomPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus('Packaging Deliverable A (pm_room_production_pack_v1.zip)...');
      const pack = await canvasRef.current.exportRoomProductionPack();
      const res = downloadRoomAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (pm_room.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + anchors + preview + README)`
      );
    } catch (err) {
      notifyStatus(`Room Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadCEORoomPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus('Packaging CEO Room Production Pack (ceo_room_production_pack_v1.zip)...');
      const pack = await canvasRef.current.exportCEORoomProductionPack();
      const res = downloadCEORoomAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (ceo_room.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + anchors + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(`CEO Room Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadUIUXRoomPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus('Packaging UI/UX Studio Production Pack (uiux_room_production_pack_v1.zip)...');
      const pack = await canvasRef.current.exportUIUXRoomProductionPack();
      const res = downloadUIUXRoomAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (uiux_room.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + anchors + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(`UI/UX Room Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadEngineeringRoomPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging Engineering Studio Production Pack (engineering_room_production_pack_v1.zip)...'
      );
      const pack = await canvasRef.current.exportEngineeringRoomProductionPack();
      const res = downloadEngineeringRoomAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (engineering_room.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + anchors + behavior + preview + A3.1 + README)`
      );
    } catch (err) {
      notifyStatus(
        `Engineering Room Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadResearchRoomPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging Research & Shared Brain Production Pack (research_room_production_pack_v1.zip)...'
      );
      const pack = await canvasRef.current.exportResearchRoomProductionPack();
      const res = downloadResearchRoomAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (research_room.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + anchors + display_slots + behavior + preview + A3.1 + README)`
      );
    } catch (err) {
      notifyStatus(
        `Research Room Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadQADevOpsRoomPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging QA & DevOps Studio Production Pack (qa_devops_room_production_pack_v1.zip)...'
      );
      const pack = await canvasRef.current.exportQADevOpsRoomProductionPack();
      const res = downloadQADevOpsRoomAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (qa_devops_room.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + anchors + display_slots + behavior + preview + A3.2 + README)`
      );
    } catch (err) {
      notifyStatus(
        `QA & DevOps Room Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus('Packaging Deliverable B (boss_pm_export_candidate_v1.zip)...');
      const pack = await canvasRef.current.exportCharacterCandidatePack();
      const res = downloadCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (boss_pm.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(`Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadCEOCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging CEO Executive Assistant Pack (ceo_executive_assistant_pack_v1.zip)...'
      );
      const pack = await canvasRef.current.exportCEOCharacterPack();
      const res = downloadCEOCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (ceo_executive_assistant.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(`CEO Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadUIUXCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging UI/UX Designer Character Pack (uiux_designer_agent_pack.zip)...'
      );
      const pack = await canvasRef.current.exportUIUXCharacterPack();
      const res = downloadUIUXCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (uiux_designer_agent.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(`UI/UX Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadFrontendCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging Frontend Developer Character Pack (frontend_developer_agent_pack.zip)...'
      );
      const pack = await canvasRef.current.exportFrontendCharacterPack();
      const res = downloadFrontendCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (frontend_developer_agent.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(
        `Frontend Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadBackendCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging Backend Developer Character Pack (backend_developer_agent_pack.zip)...'
      );
      const pack = await canvasRef.current.exportBackendCharacterPack();
      const res = downloadBackendCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (backend_developer_agent.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(
        `Backend Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadDatabaseCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging Database Developer Character Pack (database_developer_agent_pack.zip)...'
      );
      const pack = await canvasRef.current.exportDatabaseCharacterPack();
      const res = downloadDatabaseCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (database_developer_agent.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(
        `Database Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadResearchCharacterPackZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Packaging Research Professor Character Pack (research_professor_agent_pack_v1.zip)...'
      );
      const pack = await canvasRef.current.exportResearchCharacterPack();
      const res = downloadResearchCharacterAssetPackZip(pack);
      notifyStatus(
        `Downloaded ${res.filename} (research_professor_agent.glb ${(pack.glbSizeBytes / 1024).toFixed(1)} KB + manifest + behavior + preview + README)`
      );
    } catch (err) {
      notifyStatus(
        `Research Character Pack ZIP failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }, [notifyStatus]);

  const handleDownloadSourceZip = useCallback(async () => {
    try {
      const res = await downloadModularRoomLabSourceZip();
      notifyStatus(
        `Downloaded ${res.filename} (${res.fileCount} source files · ${(res.byteLength / 1024).toFixed(1)} KB)`
      );
    } catch (err) {
      notifyStatus(`Source ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadCompleteHandoffZip = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus(
        'Building full AI-OFFICE-PM-ROOM-HANDOFF-V1.zip (PM + CEO + UI/UX + Engineering + Research + QA & DevOps Rooms + Characters + A3.2 Layout + Validation + Source)...'
      );
      const srcFiles = getBundledSourceFileList();
      const [
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
        rtReport,
      ] = await Promise.all([
        canvasRef.current.exportRoomProductionPack(),
        canvasRef.current.exportCEORoomProductionPack(),
        canvasRef.current.exportUIUXRoomProductionPack(),
        canvasRef.current.exportEngineeringRoomProductionPack(),
        canvasRef.current.exportResearchRoomProductionPack(),
        canvasRef.current.exportQADevOpsRoomProductionPack(),
        canvasRef.current.exportCharacterCandidatePack(),
        canvasRef.current.exportCEOCharacterPack(),
        canvasRef.current.exportUIUXCharacterPack(),
        canvasRef.current.exportFrontendCharacterPack(),
        canvasRef.current.exportBackendCharacterPack(),
        canvasRef.current.exportDatabaseCharacterPack(),
        canvasRef.current.exportResearchCharacterPack(),
        canvasRef.current.runFullHandoffValidation(srcFiles.length),
      ]);
      const stab = canvasRef.current.runVisualStabilityScan();
      setStabilityReport(stab);
      const res = await downloadCompleteHandoffBundleZip({
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
        roundTripReport: rtReport,
        stabilityReport: stab,
      });
      const passedCount = rtReport.validation_matrix.filter((r) => r.status === 'PASS').length;
      notifyStatus(
        `Downloaded ${res.filename} (${(res.byteLength / 1024).toFixed(1)} KB · All ${passedCount}/${rtReport.validation_matrix.length} validation checks PASS)`
      );
    } catch (err) {
      notifyStatus(`Complete Handoff ZIP failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleDownloadRoundTripReport = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const srcFiles = getBundledSourceFileList();
      const rtReport = await canvasRef.current.runFullHandoffValidation(srcFiles.length);
      downloadRoundTripReportJson(rtReport);
      const passedCount = rtReport.validation_matrix.filter((r) => r.status === 'PASS').length;
      notifyStatus(
        `Exported roundtrip-report.json (${passedCount}/${rtReport.validation_matrix.length} checks PASS)`
      );
    } catch (err) {
      notifyStatus(`Round-Trip Report failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleStartAllAgentMeetingDemo = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      workspaceMode: 'builder',
      officeViewMode: 'full_office',
      showBossPM: true,
    }));
    setTimeout(() => {
      canvasRef.current?.startAllAgentMeetingDemo();
    }, 20);
    notifyStatus(
      'Demo Meeting Semua Agent Dimulai: 7 Karakter Aktif berjalan menuju Meja Konferensi Central Hub (3 Kursi Kosong: Owner Reserved + QA + DevOps)'
    );
  }, [notifyStatus]);

  const handleStopAllAgentMeetingDemo = useCallback(() => {
    canvasRef.current?.stopAllAgentMeetingDemo();
    notifyStatus('Demo Meeting Dihentikan: Semua 7 Karakter dikembalikan ke ruangan masing-masing');
  }, [notifyStatus]);

  const handleResetAllAgentMeetingDemo = useCallback(() => {
    canvasRef.current?.resetAllAgentMeetingDemo();
    notifyStatus('Demo Meeting Direset: Semua 7 Karakter kembali ke anchor ruangan default');
  }, [notifyStatus]);

  const handleTeleportAllAgentsToMeetingSeats = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      workspaceMode: 'builder',
      officeViewMode: 'full_office',
      showBossPM: true,
    }));
    setTimeout(() => {
      canvasRef.current?.teleportAllAgentsToMeetingSeats();
    }, 20);
    notifyStatus(
      '7 Karakter Aktif langsung duduk di Meja Konferensi Central Hub (3 Kursi Kosong: Owner + QA + DevOps)'
    );
  }, [notifyStatus]);

  const handleFocusMeetingCamera = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      workspaceMode: 'builder',
      officeViewMode: 'full_office',
    }));
    setTimeout(() => {
      canvasRef.current?.focusMeetingTableCamera();
    }, 20);
    notifyStatus('Kamera difokuskan ke Meja Konferensi Open Central Hub ([16, 0.78, 8])');
  }, [notifyStatus]);

  const handleFocusCentralHubCamera = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      workspaceMode: 'builder',
      officeViewMode: 'full_office',
    }));
    setTimeout(() => {
      canvasRef.current?.focusCentralHubCamera();
    }, 20);
    notifyStatus('Kamera difokuskan ke Open Central Hub (16×16 di [8, 0, 0])');
  }, [notifyStatus]);

  const handleExportCentralHubV2GLB = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportCentralHubV2GLB();
      const kb = (res.byteLength / 1024).toFixed(1);
      notifyStatus(`Exported Open Central Hub V2 ${res.filename} (${kb} KB binary GLB · 16×16 local [0,0,0])`);
    } catch (err) {
      notifyStatus(`Central Hub V2 GLB Export error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportFullOfficeVisualUpgradeV2Pack = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      notifyStatus('Packaging office_visual_upgrade_v2_production_pack.zip...');
      const res = await canvasRef.current.exportFullOfficeVisualUpgradeV2Pack();
      notifyStatus(
        `Downloaded ${res.filename} (${(res.byteLength / 1024).toFixed(1)} KB · central_hub_v2.glb + manifest + anchors + meeting_seats + A3.2 + visual_profile + preview)`
      );
    } catch (err) {
      notifyStatus(`Visual Upgrade V2 Pack failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleExportCentralHubMeetingSeats = useCallback(() => {
    if (!canvasRef.current) return;
    const res = canvasRef.current.exportCentralHubMeetingSeats();
    notifyStatus(`Exported ${res.filename} (10 Central Hub conference seats contract)`);
  }, [notifyStatus]);

  const handleExportFullOfficeVisualProfileV2 = useCallback(() => {
    if (!canvasRef.current) return;
    const res = canvasRef.current.exportFullOfficeVisualProfileV2();
    notifyStatus(`Exported ${res.filename} (Full Office Visual & Architecture Overhaul V2 profile)`);
  }, [notifyStatus]);

  const handleExportFullOfficePreviewV2PNG = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const res = await canvasRef.current.exportFullOfficePreviewV2PNG();
      notifyStatus(`Saved Full Office preview ${res.filename}`);
    } catch (err) {
      notifyStatus(`Full Office PNG failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [notifyStatus]);

  const handleRunImportTest = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const srcFiles = getBundledSourceFileList();
      const rtReport = await canvasRef.current.runFullHandoffValidation(srcFiles.length);
      setRoundTripReport(rtReport);
      setImportReport(rtReport.room_roundtrip);
      const stab = canvasRef.current.runVisualStabilityScan();
      setStabilityReport(stab);
      const wasFullOffice = config.officeViewMode === 'full_office';
      setConfig((prev) => ({
        ...prev,
        workspaceMode: 'import_test',
        officeViewMode: 'single_room',
        importTestTarget:
          prev.selectedRoomKey === 'qa_devops_studio'
            ? 'qa_devops_room_only'
            : prev.selectedRoomKey === 'research_brain'
            ? 'research_room_and_char'
            : prev.selectedRoomKey === 'engineering'
            ? 'engineering_room_and_char'
            : prev.selectedRoomKey === 'uiux_studio'
            ? 'uiux_room_and_char'
            : prev.selectedRoomKey === 'ceo_executive'
            ? 'ceo_room_and_char'
            : prev.importTestTarget || 'both_reimported',
      }));
      if (wasFullOffice) {
        setTimeout(() => {
          canvasRef.current?.setCameraPreset('isometric');
        }, 25);
      }
      const passedCount = rtReport.validation_matrix.filter((r) => r.status === 'PASS').length;
      const ceoInfo = rtReport.ceo_room_roundtrip
        ? ` + ceo_room.glb (${rtReport.ceo_room_roundtrip.fileSizeKB})`
        : '';
      const uiuxInfo = rtReport.uiux_room_roundtrip
        ? ` + uiux_room.glb (${rtReport.uiux_room_roundtrip.fileSizeKB})`
        : '';
      const uiuxCharInfo = rtReport.uiux_character_roundtrip
        ? ` + uiux_designer_agent.glb (${rtReport.uiux_character_roundtrip.fileSizeKB})`
        : '';
      const engInfo = rtReport.engineering_room_roundtrip
        ? ` + engineering_room.glb (${rtReport.engineering_room_roundtrip.fileSizeKB})`
        : '';
      const resInfo = rtReport.research_room_roundtrip
        ? ` + research_room.glb (${rtReport.research_room_roundtrip.fileSizeKB})`
        : '';
      const qaDevopsInfo = rtReport.qa_devops_room_roundtrip
        ? ` + qa_devops_room.glb (${rtReport.qa_devops_room_roundtrip.fileSizeKB})`
        : '';
      const feCharInfo = rtReport.frontend_character_roundtrip
        ? ` + frontend_developer_agent.glb (${rtReport.frontend_character_roundtrip.fileSizeKB})`
        : '';
      const beCharInfo = rtReport.backend_character_roundtrip
        ? ` + backend_developer_agent.glb (${rtReport.backend_character_roundtrip.fileSizeKB})`
        : '';
      const dbCharInfo = rtReport.database_character_roundtrip
        ? ` + database_developer_agent.glb (${rtReport.database_character_roundtrip.fileSizeKB})`
        : '';
      const resCharInfo = rtReport.research_character_roundtrip
        ? ` + research_professor_agent.glb (${rtReport.research_character_roundtrip.fileSizeKB})`
        : '';
      notifyStatus(
        `Independent Round-Trip Verified: pm_room.glb (${rtReport.room_roundtrip.fileSizeKB})${ceoInfo}${uiuxInfo}${uiuxCharInfo}${engInfo}${resInfo}${qaDevopsInfo}${feCharInfo}${beCharInfo}${dbCharInfo}${resCharInfo} — ${passedCount}/${rtReport.validation_matrix.length} PASS`
      );
    } catch (err) {
      notifyStatus(`GLB Import test failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [config.officeViewMode, notifyStatus]);

  const handleTriggerAction = useCallback((actionId: PMActionId) => {
    setBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerPMAction(actionId);
  }, []);

  const handleTriggerCEOAction = useCallback((actionId: CEOActionId) => {
    setCeoBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerCEOAction(actionId);
  }, []);

  const handleTriggerUIUXAction = useCallback((actionId: UIUXActionId) => {
    setUiuxBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerUIUXAction(actionId);
  }, []);

  const handleTriggerFrontendAction = useCallback((actionId: FrontendActionId) => {
    setFrontendBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerFrontendAction(actionId);
  }, []);

  const handleTriggerBackendAction = useCallback((actionId: BackendActionId) => {
    setBackendBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerBackendAction(actionId);
  }, []);

  const handleTriggerDatabaseAction = useCallback((actionId: DatabaseActionId) => {
    setDatabaseBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerDatabaseAction(actionId);
  }, []);

  const handleTriggerResearchAction = useCallback((actionId: ResearchActionId) => {
    setResearchBubbleDismissedForAction(null);
    setConfig((prev) => ({ ...prev, workspaceMode: 'builder', showBossPM: true }));
    canvasRef.current?.triggerResearchAction(actionId);
  }, []);

  const handleUploadCustomGLB = useCallback(
    async (file: File) => {
      if (!canvasRef.current) return;
      try {
        setConfig((prev) => ({
          ...prev,
          workspaceMode: 'builder',
          selectedRoomKey: 'pm_strategy',
          showBossPM: true,
        }));
        setInspectorOpen(true);
        setInspectorTab('simulation');
        const report = await canvasRef.current.loadCustomBossPMFile(file);
        setGlbInspectionReport(report);
        notifyStatus(
          `Karakter GLB Diimpor: ${file.name} (${report.meshCount} meshes · ${report.materialCount} materials · ${report.animationClips.length} clips)`
        );
      } catch (err) {
        notifyStatus(
          `Gagal mengimpor GLB: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    },
    [notifyStatus]
  );

  const handleTopFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadCustomGLB(file);
      e.target.value = '';
    }
  };

  const handleExportSimConfig = useCallback(() => {
    if (!canvasRef.current) return;
    const res = canvasRef.current.exportSimulationConfig();
    notifyStatus(`Exported reusable PM Simulation Config (${res.filename})`);
  }, [notifyStatus]);

  const handleRunStabilityScan = useCallback(() => {
    if (!canvasRef.current) return;
    const report = canvasRef.current.runVisualStabilityScan();
    setStabilityReport(report);
    notifyStatus(
      `Visual Stability Verified: ${report.totalRoomMeshes} PM · ${report.totalCEORoomMeshes ?? 0} CEO · ${report.totalUIUXRoomMeshes ?? 0} UI/UX meshes · 0 coplanar conflicts`
    );
  }, [notifyStatus]);

  // Select camera presets dynamically based on Office View Mode and Selected Room
  const activePresetList =
    config.officeViewMode === 'full_office'
      ? FULL_OFFICE_CAMERA_PRESETS
      : config.selectedRoomKey === 'qa_devops_studio'
      ? QA_DEVOPS_CAMERA_PRESETS
      : config.selectedRoomKey === 'research_brain'
      ? RESEARCH_CAMERA_PRESETS
      : config.selectedRoomKey === 'engineering'
      ? ENGINEERING_CAMERA_PRESETS
      : config.selectedRoomKey === 'uiux_studio'
      ? UIUX_CAMERA_PRESETS
      : config.selectedRoomKey === 'ceo_executive'
      ? CEO_CAMERA_PRESETS
      : CAMERA_PRESETS;

  const visiblePresets = activePresetList.filter((p) => {
    if (config.officeViewMode === 'full_office') return true;
    if (presetCategory === 'all') return true;
    if (presetCategory === 'standard') return p.category === 'standard' || p.category === 'diagonal';
    return p.category === 'inspection';
  });

  const activeRoomModule = getRoomModuleByKey(config.selectedRoomKey);
  const isPMVisibleInViewport =
    config.workspaceMode === 'builder' &&
    config.showBossPM &&
    (config.officeViewMode === 'full_office' || config.selectedRoomKey === 'pm_strategy');

  const isCEOVisibleInViewport =
    config.workspaceMode === 'builder' &&
    config.showBossPM &&
    (config.officeViewMode === 'full_office' || config.selectedRoomKey === 'ceo_executive');

  const isUIUXVisibleInViewport =
    config.workspaceMode === 'builder' &&
    config.showBossPM &&
    (config.officeViewMode === 'full_office' || config.selectedRoomKey === 'uiux_studio');

  const isFrontendVisibleInViewport =
    config.workspaceMode === 'builder' &&
    config.showBossPM &&
    (config.officeViewMode === 'full_office' || config.selectedRoomKey === 'engineering');

  const isResearchVisibleInViewport =
    config.workspaceMode === 'builder' &&
    config.showBossPM &&
    (config.officeViewMode === 'full_office' || config.selectedRoomKey === 'research_brain');

  const activeSpeechOrThought =
    isPMVisibleInViewport &&
    telemetry.loaded &&
    !telemetry.isWalking &&
    bubbleDismissedForAction !== telemetry.currentActionId &&
    (telemetry.currentActionDef.speechBubble || telemetry.currentActionDef.thoughtBubble);

  const activeCEOSpeechOrThought =
    isCEOVisibleInViewport &&
    config.selectedRoomKey === 'ceo_executive' &&
    ceoStatus.loaded &&
    !ceoStatus.isWalking &&
    ceoBubbleDismissedForAction !== ceoStatus.currentActionId &&
    (ceoStatus.currentActionDef.speechBubble || ceoStatus.currentActionDef.thoughtBubble);

  const activeUIUXSpeechOrThought =
    isUIUXVisibleInViewport &&
    config.selectedRoomKey === 'uiux_studio' &&
    uiuxStatus.loaded &&
    !uiuxStatus.isWalking &&
    uiuxBubbleDismissedForAction !== uiuxStatus.currentActionId &&
    (uiuxStatus.currentActionDef.speechBubble || uiuxStatus.currentActionDef.thoughtBubble);

  const activeFrontendSpeechOrThought =
    isFrontendVisibleInViewport &&
    config.selectedRoomKey === 'engineering' &&
    !frontendStatus.isWalking &&
    frontendBubbleDismissedForAction !== frontendStatus.currentActionId &&
    (frontendStatus.bubbleText || frontendStatus.thoughtText);

  const activeBackendSpeechOrThought =
    isFrontendVisibleInViewport &&
    config.selectedRoomKey === 'engineering' &&
    !backendStatus.isWalking &&
    backendBubbleDismissedForAction !== backendStatus.currentActionId &&
    (backendStatus.bubbleText || backendStatus.thoughtText);

  const activeDatabaseSpeechOrThought =
    isFrontendVisibleInViewport &&
    config.selectedRoomKey === 'engineering' &&
    !databaseStatus.isWalking &&
    databaseBubbleDismissedForAction !== databaseStatus.currentActionId &&
    (databaseStatus.bubbleText || databaseStatus.thoughtText);

  const activeResearchSpeechOrThought =
    isResearchVisibleInViewport &&
    config.selectedRoomKey === 'research_brain' &&
    !researchStatus.isWalking &&
    researchBubbleDismissedForAction !== researchStatus.currentActionId &&
    (researchStatus.bubbleText || researchStatus.thoughtText);

  return (
    <div
      data-state={config.workspaceMode}
      className="h-screen w-screen overflow-hidden flex flex-col bg-[#1E1F26] text-[#F3EFEA]"
    >
      {/* Hidden Top-Level File Picker for Import Karakter GLB */}
      <input
        ref={topGlbInputRef}
        type="file"
        accept=".glb,model/gltf-binary,.gltf"
        onChange={handleTopFileInputChange}
        className="hidden"
      />

      {/* Top Bar Contract: 3 Zones with zero horizontal overflow */}
      <header className="h-13 w-full max-w-full overflow-hidden shrink-0 flex items-center justify-between gap-3 px-4 bg-[#14151B] border-b border-[#2B2D38] z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            canvasRef.current?.resetCamera();
          }}
          className="text-sm font-bold tracking-tight text-[#F5F2EB] whitespace-nowrap shrink-0"
        >
          AI Office — Modular Room Lab
        </a>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav
          aria-label="Workspace Navigation"
          className="hidden md:flex items-center gap-3.5 text-[11px] font-medium text-[#A3AAB8] min-w-0 overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => handleSelectRoomKey('pm_strategy')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'builder' && config.selectedRoomKey === 'pm_strategy'
                ? 'text-[#F5F2EB] underline underline-offset-4 decoration-[#D99252]'
                : ''
            }`}
          >
            PM & Strategy Room
          </button>
          <button
            type="button"
            onClick={() => handleSelectRoomKey('ceo_executive')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'builder' && config.selectedRoomKey === 'ceo_executive'
                ? 'text-[#6EE7B7] underline underline-offset-4 decoration-[#10B981] font-semibold'
                : 'text-[#6EE7B7]'
            }`}
          >
            CEO Brain Office
          </button>
          <button
            type="button"
            onClick={() => handleSelectRoomKey('uiux_studio')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'builder' && config.selectedRoomKey === 'uiux_studio'
                ? 'text-[#5EEAD4] underline underline-offset-4 decoration-[#14B8A6] font-semibold'
                : 'text-[#5EEAD4]'
            }`}
          >
            UI/UX Studio
          </button>
          <button
            type="button"
            onClick={() => handleSelectRoomKey('engineering')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'builder' && config.selectedRoomKey === 'engineering'
                ? 'text-[#38BDF8] underline underline-offset-4 decoration-[#0EA5E9] font-semibold'
                : 'text-[#7DD3FC]'
            }`}
          >
            Engineering (8×16)
          </button>
          <button
            type="button"
            onClick={() => handleSelectRoomKey('research_brain')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'builder' && config.selectedRoomKey === 'research_brain'
                ? 'text-[#FBBF24] underline underline-offset-4 decoration-[#F59E0B] font-semibold'
                : 'text-[#FDE68A]'
            }`}
          >
            Research & Brain
          </button>
          <button
            type="button"
            onClick={() => handleSelectRoomKey('qa_devops_studio')}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'builder' && config.selectedRoomKey === 'qa_devops_studio'
                ? 'text-[#2DD4BF] underline underline-offset-4 decoration-[#10B981] font-semibold'
                : 'text-[#6EE7B7]'
            }`}
          >
            QA & DevOps (8×16)
          </button>
          <button
            type="button"
            onClick={() =>
              handleSwitchOfficeViewMode(
                config.officeViewMode === 'full_office' ? 'single_room' : 'full_office'
              )
            }
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.officeViewMode === 'full_office'
                ? 'text-[#7DD3FC] underline underline-offset-4 decoration-[#38BDF8] font-semibold'
                : ''
            }`}
          >
            {config.officeViewMode === 'full_office' ? 'Full Office (Active)' : 'Full Office A3.2'}
          </button>
          <button
            type="button"
            onClick={() => {
              setInspectorOpen(true);
              setInspectorTab('validation');
              handleRunImportTest();
            }}
            className={`hover:text-[#F5F2EB] transition-colors whitespace-nowrap shrink-0 py-1 ${
              config.workspaceMode === 'import_test'
                ? 'text-[#F5F2EB] underline underline-offset-4 decoration-[#6EE7B7]'
                : ''
            }`}
          >
            Test Exported GLB
          </button>
        </nav>

        {/* Zone 3: Panel Toggles, Cinema Mode & Primary Export Action */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="toggle-left-sidebar"
            onClick={() => {
              if (cinemaMode) setCinemaMode(false);
              setLeftSidebarOpen((v) => !v);
            }}
            className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1 ${
              leftSidebarOpen && !cinemaMode
                ? 'bg-[#1E2230] text-[#F5F2EB] border-[#38BDF8]/50'
                : 'bg-[#1A1C24] text-[#9CA3AF] border-[#2B2D38] hover:text-white'
            }`}
            title="Toggle Left Room & Meeting Sidebar"
          >
            {leftSidebarOpen && !cinemaMode ? (
              <PanelLeftClose className="w-3.5 h-3.5 text-[#38BDF8]" />
            ) : (
              <PanelLeftOpen className="w-3.5 h-3.5 text-[#9CA3AF]" />
            )}
            <span className="hidden 2xl:inline">Left Panel</span>
          </button>

          {config.officeViewMode === 'full_office' && (
            <button
              type="button"
              data-testid="toggle-demo-panel"
              onClick={() => {
                if (cinemaMode) setCinemaMode(false);
                if (!leftSidebarOpen) setLeftSidebarOpen(true);
                setDemoPanelOpen((v) => !v);
              }}
              className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1 ${
                demoPanelOpen && leftSidebarOpen && !cinemaMode
                  ? 'bg-[#262018] text-[#FBBF24] border-[#D99252]/60'
                  : 'bg-[#1A1C24] text-[#9CA3AF] border-[#2B2D38] hover:text-white'
              }`}
              title="Toggle All-Agent Meeting Demo Panel"
            >
              <Users className="w-3.5 h-3.5 text-[#D99252]" />
              <span className="hidden 2xl:inline">Demo</span>
            </button>
          )}

          <button
            type="button"
            data-testid="toggle-right-sidebar"
            onClick={() => {
              if (cinemaMode) setCinemaMode(false);
              setInspectorOpen((v) => !v);
            }}
            className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1 ${
              inspectorOpen && !cinemaMode
                ? 'bg-[#1E2230] text-[#F5F2EB] border-[#D99252]/50'
                : 'bg-[#1A1C24] text-[#9CA3AF] border-[#2B2D38] hover:text-white'
            }`}
            title="Toggle Right Inspector Sidebar"
          >
            {inspectorOpen && !cinemaMode ? (
              <PanelRightClose className="w-3.5 h-3.5 text-[#D99252]" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 text-[#9CA3AF]" />
            )}
            <span className="hidden 2xl:inline">Right Panel</span>
          </button>

          <button
            type="button"
            data-testid="toggle-cinema-mode"
            onClick={() => setCinemaMode((v) => !v)}
            className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors whitespace-nowrap flex items-center gap-1 ${
              cinemaMode
                ? 'bg-[#38BDF8] text-[#082F49] border-[#38BDF8]'
                : 'bg-[#1A1C24] text-[#7DD3FC] border-[#38BDF8]/40 hover:bg-[#1E293B]'
            }`}
            title="Toggle Clean View / Cinema Mode (Esc to exit)"
          >
            <Film className="w-3.5 h-3.5" />
            <span>{cinemaMode ? 'Cinema On' : 'Cinema Mode'}</span>
          </button>

          <button
            type="button"
            onClick={
              config.selectedRoomKey === 'qa_devops_studio'
                ? handleExportQADevOpsRoomGLB
                : config.selectedRoomKey === 'research_brain'
                ? handleExportResearchRoomGLB
                : config.selectedRoomKey === 'engineering'
                ? handleExportEngineeringRoomGLB
                : config.selectedRoomKey === 'uiux_studio'
                ? handleExportUIUXRoomGLB
                : config.selectedRoomKey === 'ceo_executive'
                ? handleExportCEORoomGLB
                : handleExportGLB
            }
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              config.selectedRoomKey === 'qa_devops_studio'
                ? 'text-[#042F2E] bg-[#14B8A6] hover:bg-[#0D9488]'
                : config.selectedRoomKey === 'research_brain'
                ? 'text-[#1C1204] bg-[#F59E0B] hover:bg-[#D97706]'
                : config.selectedRoomKey === 'engineering'
                ? 'text-[#082F49] bg-[#38BDF8] hover:bg-[#0EA5E9]'
                : config.selectedRoomKey === 'uiux_studio'
                ? 'text-[#042F2E] bg-[#14B8A6] hover:bg-[#0D9488]'
                : config.selectedRoomKey === 'ceo_executive'
                ? 'text-[#0B1310] bg-[#10B981] hover:bg-[#059669]'
                : 'text-[#14151B] bg-[#D99252] hover:bg-[#E49F60]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {config.selectedRoomKey === 'qa_devops_studio'
                ? 'Export QA/DevOps GLB'
                : config.selectedRoomKey === 'research_brain'
                ? 'Export Research GLB'
                : config.selectedRoomKey === 'engineering'
                ? 'Export Eng GLB'
                : config.selectedRoomKey === 'uiux_studio'
                ? 'Export UI/UX GLB'
                : config.selectedRoomKey === 'ceo_executive'
                ? 'Export CEO GLB'
                : 'Export Room GLB'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area: Non-Overlapping Left Sidebar + Center 3D Viewport + Right Inspector */}
      <main className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Non-Overlapping Left Sidebar (Room Selector + Cutaway Controls + Meeting Demo Panel) */}
        {leftSidebarOpen && !cinemaMode && (
          <aside
            data-testid="left-sidebar"
            className="w-[336px] shrink-0 h-full bg-[#15161D] border-r border-[#2B2D38] flex flex-col overflow-y-auto p-3 gap-2.5 z-20"
          >
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#242632]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#D99252]" />
                <span>Office & Room Controls</span>
              </span>
              <div className="flex items-center gap-1">
                {config.officeViewMode === 'full_office' && (
                  <button
                    type="button"
                    onClick={() => setDemoPanelOpen((v) => !v)}
                    className="px-2 py-0.5 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[10px] font-semibold text-[#FBBF24] border border-[#D99252]/40"
                  >
                    {demoPanelOpen ? 'Hide Demo' : 'Show Demo'}
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Collapse Left Sidebar"
                  onClick={() => setLeftSidebarOpen(false)}
                  className="p-1 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[#9CA3AF] hover:text-white"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Section 3 Required Office View & Pilih Ruangan Selector Card */}
            <div className="bg-[#191B24] border border-[#2B2D38] rounded-xl p-2.5 shadow-sm space-y-2">
              {/* Row A: Office View Mode Switcher ([ Single Room ] | [ Full Office ]) */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-[#A3AAB8] flex items-center gap-1.5 shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-[#D99252]" />
                  <span>Office View:</span>
                </span>
                <div className="grid grid-cols-2 gap-1 bg-[#13151C] p-0.5 rounded-lg border border-[#2A2D3A] flex-1">
                  <button
                    type="button"
                    data-testid="view-mode-single-room"
                    onClick={() => handleSwitchOfficeViewMode('single_room')}
                    className={`py-1 px-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      config.officeViewMode === 'single_room'
                        ? 'bg-[#D99252] text-[#14151B]'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    Single Room
                  </button>
                  <button
                    type="button"
                    data-testid="view-mode-full-office"
                    onClick={() => handleSwitchOfficeViewMode('full_office')}
                    className={`py-1 px-2.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      config.officeViewMode === 'full_office'
                        ? 'bg-[#38BDF8] text-[#0F172A]'
                        : 'text-[#9CA3AF] hover:text-white'
                    }`}
                  >
                    Full Office
                  </button>
                </div>
              </div>

              {/* Row B: Pilih Ruangan Dropdown (6 Rooms with READY / NEW badges) */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="pilih-ruangan-select"
                  className="text-[11px] font-semibold text-[#A3AAB8] flex items-center gap-1.5 shrink-0"
                >
                  <Layers className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>Pilih Ruangan:</span>
                </label>
                <select
                  id="pilih-ruangan-select"
                  data-testid="room-selector-dropdown"
                  value={config.selectedRoomKey}
                  onChange={(e) => handleSelectRoomKey(e.target.value as RoomModuleKey)}
                  className="flex-1 min-w-0 bg-[#13151C] border border-[#323646] hover:border-[#D99252] rounded-lg px-2 py-1.5 text-xs font-medium text-[#F5F2EB] focus:outline-none focus:border-[#D99252]"
                >
                  {OFFICE_ROOM_LIST.map((room) => (
                    <option key={room.key} value={room.key}>
                      {room.dropdown_label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row C: Active Room / Floor Plan Status Readout */}
              <div className="pt-1.5 border-t border-[#242630] flex items-center justify-between gap-2 text-[11px]">
                <span className="font-semibold text-[#F5F2EB] truncate">
                  {config.officeViewMode === 'full_office'
                    ? `Master Floor Plan A3.2 (32×26) · ${activeRoomModule.display_name}`
                    : activeRoomModule.display_name}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold shrink-0 ${
                    activeRoomModule.badge === 'NEW'
                      ? 'bg-[#064E3B] text-[#6EE7B7]'
                      : activeRoomModule.badge === 'READY'
                      ? 'bg-[#3B2816] text-[#FBBF24]'
                      : 'bg-[#272A36] text-[#9CA3AF]'
                  }`}
                >
                  {activeRoomModule.badge}
                </span>
              </div>

              <div className="text-[10px] text-[#9CA3AF] font-mono tabular-nums">
                {config.officeViewMode === 'full_office' ? (
                  <>
                    A3.2 Slot: [{activeRoomModule.global_offset.join(', ')}] · PM:{' '}
                    {telemetry.currentState} · CEO: {ceoStatus.currentState} · UI/UX:{' '}
                    {uiuxStatus.currentState}
                  </>
                ) : config.selectedRoomKey === 'pm_strategy' ? (
                  <>
                    8×8 Units · Origin [0,0,0] SW · PM Pos: [{telemetry.worldPosition[0]},{' '}
                    {telemetry.worldPosition[2]}] ({telemetry.currentState})
                  </>
                ) : config.selectedRoomKey === 'ceo_executive' ? (
                  <>
                    8×8 Units · Origin [0,0,0] SW · CEO Pos: [{ceoStatus.worldPosition[0]},{' '}
                    {ceoStatus.worldPosition[2]}] ({ceoStatus.currentState})
                  </>
                ) : config.selectedRoomKey === 'uiux_studio' ? (
                  <>
                    8×8 Units · Origin [0,0,0] SW · UI/UX Pos: [{uiuxStatus.worldPosition[0]},{' '}
                    {uiuxStatus.worldPosition[2]}] ({uiuxStatus.currentState})
                  </>
                ) : config.selectedRoomKey === 'engineering' ? (
                  <>
                    8×16 Studio · FE: [{frontendStatus.worldPosition[0]},{' '}
                    {frontendStatus.worldPosition[2]}] · BE: [{backendStatus.worldPosition[0]},{' '}
                    {backendStatus.worldPosition[2]}] · DB: [{databaseStatus.worldPosition[0]},{' '}
                    {databaseStatus.worldPosition[2]}] ({databaseStatus.currentState})
                  </>
                ) : config.selectedRoomKey === 'research_brain' ? (
                  <>
                    8×8 Units · Origin [0,0,0] SW · Prof Pos: [{researchStatus.worldPosition[0]},{' '}
                    {researchStatus.worldPosition[2]}] ({researchStatus.currentState})
                  </>
                ) : (
                  <>
                    8×16 Studio · Origin [0,0,0] SW · A3.2 Slot [24, 0, 0] · QA (North) + Lounge +
                    DevOps (South) · Room-Only Production V1
                  </>
                )}
              </div>
            </div>

            {/* Full Office V2.1 Wall Cutaway & Camera Orbit Controls */}
            {config.officeViewMode === 'full_office' && (
              <div
                data-testid="full-office-cutaway-controls"
                className="bg-[#191B24] border border-[#38BDF8]/40 rounded-xl p-2.5 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#7DD3FC] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span>Wall Cutaway & Orbit V2.1</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#0C4A6E] text-[#7DD3FC] font-mono text-[9px] font-semibold">
                    {(config.fullOfficeCutawayMode ?? 'smart_cutaway') === 'smart_cutaway'
                      ? 'SMART CUTAWAY'
                      : config.fullOfficeCutawayMode === 'show_architecture'
                      ? 'ALL WALLS 3.2U'
                      : 'AGENT VISIBILITY'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    data-testid="cutaway-mode-smart_cutaway"
                    onClick={() => handleSetCutawayMode('smart_cutaway')}
                    className={`py-1.5 px-1.5 rounded-md text-[10px] font-semibold transition-colors text-center ${
                      (config.fullOfficeCutawayMode ?? 'smart_cutaway') === 'smart_cutaway'
                        ? 'bg-[#38BDF8] text-[#082F49]'
                        : 'bg-[#13151C] text-[#9CA3AF] hover:text-white border border-[#2A2D3A]'
                    }`}
                  >
                    Smart Cutaway
                  </button>
                  <button
                    type="button"
                    data-testid="cutaway-mode-show_architecture"
                    onClick={() => handleSetCutawayMode('show_architecture')}
                    className={`py-1.5 px-1.5 rounded-md text-[10px] font-semibold transition-colors text-center ${
                      config.fullOfficeCutawayMode === 'show_architecture'
                        ? 'bg-[#10B981] text-[#052E16]'
                        : 'bg-[#13151C] text-[#9CA3AF] hover:text-white border border-[#2A2D3A]'
                    }`}
                  >
                    Show All Walls
                  </button>
                  <button
                    type="button"
                    data-testid="cutaway-mode-agent_visibility"
                    onClick={() => handleSetCutawayMode('agent_visibility')}
                    className={`py-1.5 px-1.5 rounded-md text-[10px] font-semibold transition-colors text-center ${
                      config.fullOfficeCutawayMode === 'agent_visibility'
                        ? 'bg-[#F59E0B] text-[#1C1204]'
                        : 'bg-[#13151C] text-[#9CA3AF] hover:text-white border border-[#2A2D3A]'
                    }`}
                  >
                    Agent Visibility
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#242632]">
                  <span className="text-[10px] text-[#9CA3AF] font-medium">Orbit Constraint:</span>
                  <div className="grid grid-cols-2 gap-1 bg-[#13151C] p-0.5 rounded-md border border-[#2A2D3A]">
                    <button
                      type="button"
                      data-testid="orbit-mode-cinematic"
                      onClick={() => handleSetOrbitMode('cinematic')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        (config.fullOfficeOrbitMode ?? 'cinematic') === 'cinematic'
                          ? 'bg-[#D99252] text-[#14151B]'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      Cinematic (±20°)
                    </button>
                    <button
                      type="button"
                      data-testid="orbit-mode-free_inspect"
                      onClick={() => handleSetOrbitMode('free_inspect')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        config.fullOfficeOrbitMode === 'free_inspect'
                          ? 'bg-[#38BDF8] text-[#082F49]'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      Free Inspect
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Open Central Hub V2 & All-Agent Meeting Demo Panel (Full Office Mode) */}
            {config.officeViewMode === 'full_office' && demoPanelOpen && (
              <div
                data-testid="all-agent-meeting-demo-panel"
                className="bg-[#191B24] border border-[#D99252]/70 rounded-xl p-2.5 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#FBBF24] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#D99252]" />
                    <span>All-Agent Meeting Demo</span>
                  </span>
                  <span
                    data-testid="meeting-demo-phase-badge"
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      meetingDemoStatus?.active
                        ? 'bg-[#064E3B] text-[#6EE7B7] border border-[#10B981]/50'
                        : 'bg-[#262936] text-[#9CA3AF]'
                    }`}
                  >
                    {meetingDemoStatus?.phase ?? 'INACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    data-testid="btn-start-all-agent-meeting"
                    onClick={handleStartAllAgentMeetingDemo}
                    className="col-span-2 py-1.5 px-2.5 rounded-lg bg-[#D99252] hover:bg-[#E49F60] text-[#14151B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Jalankan Demo Meeting Semua Agent</span>
                  </button>
                  <button
                    type="button"
                    data-testid="btn-seat-all-agent-meeting"
                    onClick={handleTeleportAllAgentsToMeetingSeats}
                    className="py-1 px-2 rounded-md bg-[#1E293B] hover:bg-[#334155] border border-[#38BDF8]/40 text-[#7DD3FC] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Users className="w-3 h-3" />
                    <span>Instant Seat (7 Agents)</span>
                  </button>
                  <button
                    type="button"
                    data-testid="btn-focus-meeting-camera"
                    onClick={handleFocusMeetingCamera}
                    className="py-1 px-2 rounded-md bg-[#1E293B] hover:bg-[#334155] border border-[#FBBF24]/40 text-[#FDE68A] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Focus className="w-3 h-3" />
                    <span>Focus Meeting Camera</span>
                  </button>
                  <button
                    type="button"
                    data-testid="btn-stop-all-agent-meeting"
                    onClick={handleStopAllAgentMeetingDemo}
                    className="py-1 px-2 rounded-md bg-[#2A1C1E] hover:bg-[#3F2327] border border-[#F87171]/40 text-[#FCA5A5] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Square className="w-3 h-3" />
                    <span>Stop Meeting Demo</span>
                  </button>
                  <button
                    type="button"
                    data-testid="btn-reset-all-agent-meeting"
                    onClick={handleResetAllAgentMeetingDemo}
                    className="py-1 px-2 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] border border-[#374151] text-[#D1D5DB] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Meeting</span>
                  </button>
                </div>

                {/* Live Meeting Telemetry Summary */}
                <div className="bg-[#13151C] border border-[#2A2D3A] rounded-lg px-2.5 py-1.5 text-[10px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-[#E5E0D8]">
                    <span>
                      Seated:{' '}
                      <strong className="text-[#6EE7B7]" data-testid="meeting-seated-count">
                        {meetingDemoStatus?.seatedCount ?? 0}
                      </strong>
                      /7 Real Agents
                    </span>
                    <span>
                      Walking:{' '}
                      <strong className="text-[#38BDF8]">{meetingDemoStatus?.walkingCount ?? 0}</strong>
                    </span>
                    <span>
                      Empty: <strong className="text-[#FBBF24]">3</strong>/10 Seats
                    </span>
                  </div>
                  <div className="text-[#9CA3AF] flex items-center justify-between">
                    <span>Empty: Owner (#01), QA (#09), DevOps (#10)</span>
                    {centralHubStats && (
                      <span className="text-[#A3AAB8]">{centralHubStats.meshCount} Hub meshes</span>
                    )}
                  </div>
                  {meetingDemoStatus?.activeSpeakerLabel && (
                    <div className="text-[#6EE7B7] truncate pt-0.5 border-t border-[#262936]">
                      Speaking: {meetingDemoStatus.activeSpeakerLabel}
                    </div>
                  )}
                </div>

                {/* Collapsible 10-Seat Assignment Table & Export Actions */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  <button
                    type="button"
                    data-testid="btn-toggle-meeting-seats"
                    onClick={() => setMeetingSeatsExpanded((v) => !v)}
                    className="text-[10px] font-semibold text-[#7DD3FC] hover:underline flex items-center gap-1"
                  >
                    <span>
                      {meetingSeatsExpanded
                        ? 'Hide 10 Conference Seats & V2 Exports'
                        : 'Show 10 Conference Seats & V2 Exports'}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-testid="btn-export-office-visual-upgrade-v2-pack"
                    onClick={handleExportFullOfficeVisualUpgradeV2Pack}
                    className="px-2 py-1 rounded bg-[#10B981] hover:bg-[#059669] text-[#051F15] font-bold text-[10px] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Export V2 Pack ZIP</span>
                  </button>
                </div>

                {meetingSeatsExpanded && (
                  <div className="space-y-2 pt-1 border-t border-[#262936] max-h-56 overflow-y-auto">
                    <div className="space-y-1">
                      {(meetingDemoStatus?.seats ??
                        HUB_MEETING_SEATS_LIST.map((s) => ({
                          seatId: s.seat_id,
                          seatNumber: s.seat_number,
                          side: s.side,
                          assignedRoleId: s.assigned_agent_id,
                          assignedDisplayName: s.assigned_display_name,
                          departmentRoomKey: s.department_room_key,
                          isRealAvailableCharacter: s.is_real_available_character,
                          runtimeState:
                            s.seat_id === 'HUB_MEETING_SEAT_01'
                              ? 'EMPTY_OWNER_RESERVED'
                              : s.is_real_available_character
                              ? 'ROOM_WORK'
                              : 'EMPTY_PLANNED_AGENT',
                          statusBadgeLabel: s.status_badge,
                          globalSeatPosition: s.global_position,
                          currentGlobalPosition: s.global_position,
                          facingRad: s.seat_facing_radians,
                          remainingWaypoints: 0,
                        }))
                      ).map((seat) => (
                        <div
                          key={seat.seatId}
                          className="flex items-center justify-between gap-2 text-[10px] bg-[#13151C] px-2 py-1 rounded border border-[#252834]"
                        >
                          <span className="font-mono text-[#D99252] shrink-0">
                            #{String(seat.seatNumber).padStart(2, '0')} ({seat.side[0]})
                          </span>
                          <span className="text-[#F5F2EB] truncate flex-1">
                            {seat.assignedDisplayName}
                          </span>
                          <span
                            className={`font-mono px-1.5 py-0.2 rounded text-[9px] shrink-0 ${
                              seat.runtimeState === 'SEATED_IN_MEETING'
                                ? 'bg-[#064E3B] text-[#6EE7B7]'
                                : seat.runtimeState === 'WALKING_TO_HUB' ||
                                  seat.runtimeState === 'APPROACHING_CHAIR'
                                ? 'bg-[#0C4A6E] text-[#7DD3FC]'
                                : !seat.isRealAvailableCharacter
                                ? 'bg-[#3B2816] text-[#FBBF24]'
                                : 'bg-[#262936] text-[#9CA3AF]'
                            }`}
                          >
                            {seat.runtimeState}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1 pt-1 border-t border-[#262936]">
                      <button
                        type="button"
                        onClick={handleExportCentralHubV2GLB}
                        className="py-1 px-2 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[#F5F2EB] text-[10px] font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3 text-[#D99252]" />
                        <span>central_hub_v2.glb</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportCentralHubMeetingSeats}
                        className="py-1 px-2 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[#F5F2EB] text-[10px] font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3 text-[#6EE7B7]" />
                        <span>meeting_seats.json</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportFullOfficeVisualProfileV2}
                        className="py-1 px-2 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[#F5F2EB] text-[10px] font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3 text-[#38BDF8]" />
                        <span>visual-profile-v2.json</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportFullOfficePreviewV2PNG}
                        className="py-1 px-2 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[#F5F2EB] text-[10px] font-medium flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3 text-[#FBBF24]" />
                        <span>preview-v2.png</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </aside>
        )}

        {/* Center 3D Viewport */}
        <div
          data-testid="center-canvas-viewport"
          className="flex-1 relative h-full min-w-0 bg-[#2C2D35]"
        >
          <ModularRoomCanvas
            ref={canvasRef}
            config={config}
            activePresetId={activePresetId}
            anchors={anchors}
            selectedAnchorId={selectedAnchorId}
            ceoAnchors={ceoAnchors}
            selectedCEOAnchorId={selectedCEOAnchorId}
            uiuxAnchors={uiuxAnchors}
            selectedUIUXAnchorId={selectedUIUXAnchorId}
            engineeringAnchors={engineeringAnchors}
            selectedEngineeringAnchorId={selectedEngineeringAnchorId}
            onSelectCatalogItem={handleSelectCatalogItem}
            onStatsReady={setStats}
            onCEOStatsReady={setCeoStats}
            onUIUXStatsReady={setUiuxStats}
            onEngineeringStatsReady={setEngineeringStats}
            onResearchStatsReady={setResearchStats}
            onQADevOpsStatsReady={setQaDevopsStats}
            onCentralHubStatsReady={setCentralHubStats}
            onMeetingDemoStatusChange={setMeetingDemoStatus}
            onImportReportReady={setImportReport}
            onRoundTripReportReady={setRoundTripReport}
            onPresetChange={setActivePresetId}
            onPMRuntimeStateChange={setTelemetry}
            onCEORuntimeStateChange={setCeoStatus}
            onUIUXRuntimeStateChange={setUiuxStatus}
            onFrontendRuntimeStateChange={setFrontendStatus}
            onBackendRuntimeStateChange={setBackendStatus}
            onDatabaseRuntimeStateChange={setDatabaseStatus}
            onResearchRuntimeStateChange={setResearchStatus}
            onGLBInspectionReady={setGlbInspectionReport}
            onPMCharacterSelectChange={(sel) => {
              if (sel) {
                setInspectorOpen(true);
                setInspectorTab('simulation');
              }
            }}
            onMeshDiagnosticSelect={setClickedMeshDiagnostic}
            onDropGLBFile={handleUploadCustomGLB}
            onSelectRoomModuleFromCanvas={handleSelectRoomKey}
          />

          {/* Compact Top-Right Floating Exit Control when Cinema Mode is Active */}
          {cinemaMode && (
            <div className="absolute top-3.5 right-4 z-20 flex items-center gap-2 pointer-events-auto">
              <span className="px-2.5 py-1.5 rounded-lg bg-[#14151B]/90 border border-[#38BDF8]/50 text-[11px] font-mono text-[#7DD3FC]">
                Cinema Mode ·{' '}
                {config.fullOfficeCutawayMode === 'show_architecture'
                  ? 'Show All Walls'
                  : config.fullOfficeCutawayMode === 'agent_visibility'
                  ? 'Agent Visibility'
                  : 'Smart Cutaway'}
              </span>
              <button
                type="button"
                data-testid="btn-exit-cinema-mode"
                onClick={() => setCinemaMode(false)}
                className="px-3 py-1.5 rounded-lg bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#082F49] text-xs font-bold shadow-lg flex items-center gap-1.5 transition-colors"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Exit Cinema Mode / Show Controls (Esc)</span>
              </button>
            </div>
          )}

          {/* Top-Left Open Left Panel Button & Speech/Status Overlays */}
          {!cinemaMode && (
            <div className="absolute top-3.5 left-4 z-10 pointer-events-none flex flex-col gap-1.5 max-w-md">
              {!leftSidebarOpen && (
                <button
                  type="button"
                  data-testid="btn-open-left-sidebar"
                  onClick={() => setLeftSidebarOpen(true)}
                  className="pointer-events-auto self-start px-3 py-2 rounded-lg bg-[#14151B]/95 border border-[#2B2D38] text-xs font-medium text-[#E5E0D8] hover:border-[#38BDF8] transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <PanelLeftOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Open Left Panel</span>
                </button>
              )}

              {/* Interactive Speech / Thought / Pending Approval Bubble Overlay (PM Room) */}
              {isPMVisibleInViewport &&
                config.selectedRoomKey === 'pm_strategy' &&
                telemetry.loaded &&
                (activeSpeechOrThought || telemetry.currentState === 'WAITING_APPROVAL') && (
                  <div
                    role="dialog"
                    aria-label="Boss PM Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#D99252] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#FBBF24] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          Boss PM — {telemetry.currentActionDef.labelId} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss Speech Bubble"
                        onClick={() => setBubbleDismissedForAction(telemetry.currentActionId)}
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeSpeechOrThought}”
                      </p>
                    )}

                    {telemetry.currentState === 'WAITING_APPROVAL' && (
                      <button
                        type="button"
                        onClick={() => canvasRef.current?.approvePendingTask()}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0B1310] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Berikan Persetujuan</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Interactive Speech / Thought / Pending Approval Bubble Overlay (CEO Executive Assistant) */}
              {isCEOVisibleInViewport &&
                config.selectedRoomKey === 'ceo_executive' &&
                ceoStatus.loaded &&
                (activeCEOSpeechOrThought ||
                  ceoStatus.currentState === 'WAITING_APPROVAL' ||
                  ceoStatus.currentState === 'REPORTING_DEMO') && (
                  <div
                    role="dialog"
                    aria-label="CEO Executive Assistant Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#10B981] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#6EE7B7] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          CEO Agent — {ceoStatus.currentActionDef.labelId} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss CEO Speech Bubble"
                        onClick={() => setCeoBubbleDismissedForAction(ceoStatus.currentActionId)}
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeCEOSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeCEOSpeechOrThought}”
                      </p>
                    )}

                    {ceoStatus.currentState === 'WAITING_APPROVAL' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerCEOAction('task_completed')}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0B1310] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Berikan Persetujuan Owner (Simulasi)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Interactive Speech / Thought / Approval Bubble Overlay (UI/UX Designer) */}
              {isUIUXVisibleInViewport &&
                config.selectedRoomKey === 'uiux_studio' &&
                uiuxStatus.loaded &&
                (activeUIUXSpeechOrThought ||
                  uiuxStatus.currentState === 'APPROVE_DESIGN' ||
                  uiuxStatus.currentState === 'PRESENTING_DESIGN') && (
                  <div
                    role="dialog"
                    aria-label="UI/UX Designer Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#14B8A6] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#5EEAD4] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          UI/UX Designer — {uiuxStatus.currentActionDef.labelId} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss UI/UX Speech Bubble"
                        onClick={() => setUiuxBubbleDismissedForAction(uiuxStatus.currentActionId)}
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeUIUXSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeUIUXSpeechOrThought}”
                      </p>
                    )}

                    {uiuxStatus.currentState === 'APPROVE_DESIGN' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerUIUXAction('task_completed')}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-[#042F2E] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Selesaikan Handoff UI/UX (Simulasi)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Interactive Speech / Thought / PR Approval Bubble Overlay (Frontend Developer) */}
              {isFrontendVisibleInViewport &&
                config.selectedRoomKey === 'engineering' &&
                (activeFrontendSpeechOrThought ||
                  frontendStatus.currentState === 'WAITING_REVIEW' ||
                  frontendStatus.currentState === 'PRESENTING') && (
                  <div
                    role="dialog"
                    aria-label="Frontend Developer Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#38BDF8] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#38BDF8] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          Frontend Developer — {frontendStatus.currentActionLabel} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss Frontend Speech Bubble"
                        onClick={() =>
                          setFrontendBubbleDismissedForAction(frontendStatus.currentActionId)
                        }
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeFrontendSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeFrontendSpeechOrThought}”
                      </p>
                    )}

                    {frontendStatus.currentState === 'WAITING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerFrontendAction('task_completed')}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#082F49] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve PR & Selesaikan Build (Simulasi)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Interactive Speech / Thought / PR Approval Bubble Overlay (Backend Developer) */}
              {isFrontendVisibleInViewport &&
                config.selectedRoomKey === 'engineering' &&
                (activeBackendSpeechOrThought ||
                  backendStatus.currentState === 'WAITING_REVIEW' ||
                  backendStatus.currentState === 'PRESENTING_ARCH') && (
                  <div
                    role="dialog"
                    aria-label="Backend Developer Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#10B981] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#34D399] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          Backend Developer — {backendStatus.currentActionLabel} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss Backend Speech Bubble"
                        onClick={() =>
                          setBackendBubbleDismissedForAction(backendStatus.currentActionId)
                        }
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeBackendSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeBackendSpeechOrThought}”
                      </p>
                    )}

                    {backendStatus.currentState === 'WAITING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerBackendAction('TASK_COMPLETED')}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#051F15] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Backend PR & Deploy (Simulasi)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Interactive Speech / Thought / DB Migration Approval Bubble Overlay (Database Developer) */}
              {isFrontendVisibleInViewport &&
                config.selectedRoomKey === 'engineering' &&
                (activeDatabaseSpeechOrThought ||
                  databaseStatus.currentState === 'WAITING_REVIEW' ||
                  databaseStatus.currentState === 'PRESENTING_SCHEMA') && (
                  <div
                    role="dialog"
                    aria-label="Database Developer Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#10B981] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          Database Developer — {databaseStatus.currentActionLabel} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss Database Speech Bubble"
                        onClick={() =>
                          setDatabaseBubbleDismissedForAction(databaseStatus.currentActionId)
                        }
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeDatabaseSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeDatabaseSpeechOrThought}”
                      </p>
                    )}

                    {databaseStatus.currentState === 'WAITING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerDatabaseAction('TASK_COMPLETED')}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#051F15] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Schema Migration & Apply Index (Simulasi)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Interactive Speech / Thought / Research Review Approval Bubble Overlay (Research Professor) */}
              {isResearchVisibleInViewport &&
                config.selectedRoomKey === 'research_brain' &&
                (activeResearchSpeechOrThought ||
                  researchStatus.currentState === 'WAITING_REVIEW' ||
                  researchStatus.currentState === 'PRESENTING_FINDINGS') && (
                  <div
                    role="dialog"
                    aria-label="Research Professor Activity Status Bubble"
                    className="bg-[#14151B]/95 border border-[#4ADE80] rounded-xl p-3 pointer-events-auto shadow-lg space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#4ADE80] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          Research Professor — {researchStatus.currentActionLabel} (SIMULASI / DEMO)
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label="Dismiss Research Speech Bubble"
                        onClick={() =>
                          setResearchBubbleDismissedForAction(researchStatus.currentActionId)
                        }
                        className="text-[#9CA3AF] hover:text-white p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeResearchSpeechOrThought && (
                      <p className="text-xs text-[#F5F2EB] italic leading-relaxed bg-[#1E2029] px-2.5 py-2 rounded-lg border border-[#2B2D38]">
                        “{activeResearchSpeechOrThought}”
                      </p>
                    )}

                    {researchStatus.currentState === 'WAITING_REVIEW' && (
                      <button
                        type="button"
                        onClick={() => handleTriggerResearchAction('RESEARCH_COMPLETED')}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-[#051F15] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Research Brief & Archive to Shared Brain (Simulasi)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Selected Boss PM Character Quick Action Bar */}
              {isPMVisibleInViewport && telemetry.loaded && telemetry.isPMSelected && (
                <div className="bg-[#14151B]/95 border border-[#38BDF8] rounded-lg px-3 py-2 pointer-events-auto flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="font-semibold text-[#7DD3FC]">Karakter PM Dipilih</span>
                    <span className="text-[#9CA3AF] ml-2 font-mono text-[11px]">
                      {telemetry.currentState}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => canvasRef.current?.focusCameraOnPM()}
                      className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#F3EFEA] text-[11px] flex items-center gap-1"
                    >
                      <Focus className="w-3 h-3 text-[#D99252]" />
                      <span>Focus Camera on PM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => canvasRef.current?.returnToRoomView()}
                      className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#F3EFEA] text-[11px]"
                    >
                      Return to Room View
                    </button>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div
                  role="status"
                  className="bg-[#1B2420] border border-[#34D399]/60 text-[#A7F3D0] rounded-lg px-3.5 py-1.5 text-xs font-medium pointer-events-auto flex items-center justify-between gap-3"
                >
                  <span>{statusMessage}</span>
                  <button
                    type="button"
                    onClick={() => setStatusMessage(null)}
                    className="text-[11px] text-[#6EE7B7] hover:underline whitespace-nowrap shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Top-Right Inspector Drawer Toggle Button when closed */}
          {!inspectorOpen && !cinemaMode && (
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              aria-label="Open Room Inspector"
              className="absolute top-3.5 right-4 z-10 px-3 py-2 rounded-lg bg-[#14151B] border border-[#2B2D38] text-xs font-medium text-[#E5E0D8] hover:border-[#D99252] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <PanelRightOpen className="w-3.5 h-3.5 text-[#D99252]" />
              <span>Open Panel</span>
            </button>
          )}

          {/* Collapsible Bottom Control & Camera Preset Dock */}
          {!cinemaMode && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[min(980px,96%)] flex flex-col items-center pointer-events-none">
              <div className="pointer-events-auto mb-1 flex items-center gap-1.5">
                {config.officeViewMode === 'full_office' && (
                  <span
                    data-testid="full-office-camera-mode-indicator"
                    className="px-2.5 py-1 rounded-t-lg bg-[#14151B] border border-b-0 border-[#38BDF8]/40 text-[11px] font-semibold text-[#7DD3FC] flex items-center gap-1.5"
                  >
                    <Camera className="w-3 h-3 text-[#38BDF8]" />
                    <span>
                      {(config.fullOfficeOrbitMode ?? 'cinematic') === 'cinematic'
                        ? 'Cinematic'
                        : 'Free Inspect'}{' '}
                      ·{' '}
                      {(config.fullOfficeCutawayMode ?? 'smart_cutaway') === 'smart_cutaway'
                        ? 'Smart Cutaway'
                        : config.fullOfficeCutawayMode === 'show_architecture'
                        ? 'Show All Walls'
                        : 'Agent Visibility'}
                    </span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setDockCollapsed((c) => !c)}
                  className="px-3 py-1 rounded-t-lg bg-[#14151B] border border-b-0 border-[#2B2D38] text-[11px] font-medium text-[#A3AAB8] hover:text-white flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {dockCollapsed ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Show Camera Dock</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Collapse Dock</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  data-testid="btn-dock-cinema-mode"
                  onClick={() => setCinemaMode(true)}
                  className="px-3 py-1 rounded-t-lg bg-[#14151B] border border-b-0 border-[#38BDF8]/40 text-[11px] font-semibold text-[#7DD3FC] hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Film className="w-3 h-3" />
                  <span>Cinema Mode</span>
                </button>
              </div>

              {!dockCollapsed && (
                <div className="pointer-events-auto w-full bg-[#14151B]/95 border border-[#2B2D38] rounded-xl p-2.5 shadow-lg space-y-2">
                  {/* Row 1: Camera Manipulation Controls + V2.1 Full Office Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#242630]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {config.officeViewMode === 'full_office' && (
                        <button
                          type="button"
                          data-testid="btn-cinematic-overview"
                          onClick={() =>
                            canvasRef.current?.setCameraPreset('full_office_cinematic')
                          }
                          className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 border ${
                            activePresetId === 'full_office_cinematic'
                              ? 'bg-[#38BDF8] text-[#082F49] border-[#38BDF8]'
                              : 'bg-[#1D2432] text-[#7DD3FC] border-[#38BDF8]/40 hover:bg-[#273246]'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Cinematic Overview</span>
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid="btn-fit-office"
                        onClick={() => canvasRef.current?.fitRoom()}
                        aria-label="Fit Room in Viewport"
                        className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#E5E0D8] flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>
                          {config.officeViewMode === 'full_office' ? 'Fit Office' : 'Fit Room'}
                        </span>
                      </button>
                      {config.officeViewMode === 'full_office' && (
                        <>
                          <button
                            type="button"
                            data-testid="btn-top-view"
                            onClick={() => canvasRef.current?.setCameraPreset('full_office_top')}
                            className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#E5E0D8] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Top View</span>
                          </button>
                          <button
                            type="button"
                            data-testid="btn-focus-room"
                            onClick={() =>
                              canvasRef.current?.focusRoomInFullOffice(config.selectedRoomKey)
                            }
                            className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] border border-[#34D399]/40 text-xs font-medium text-[#6EE7B7] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Focus className="w-3.5 h-3.5" />
                            <span>Focus Room</span>
                          </button>
                          <button
                            type="button"
                            data-testid="btn-focus-agent"
                            onClick={() => canvasRef.current?.focusSelectedAgentCamera()}
                            className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] border border-[#38BDF8]/40 text-xs font-medium text-[#7DD3FC] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Focus className="w-3.5 h-3.5" />
                            <span>Focus Agent</span>
                          </button>
                          <button
                            type="button"
                            data-testid="btn-focus-meeting"
                            onClick={handleFocusMeetingCamera}
                            className="px-2.5 py-1.5 rounded-md bg-[#262118] hover:bg-[#352E20] border border-[#D99252]/50 text-xs font-medium text-[#FBBF24] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Focus Meeting</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => canvasRef.current?.orbitBy(-Math.PI / 8)}
                        aria-label="Rotate Camera Left"
                        className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#E5E0D8] flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rotate L</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => canvasRef.current?.orbitBy(Math.PI / 8)}
                        aria-label="Rotate Camera Right"
                        className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#E5E0D8] flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Rotate R</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => canvasRef.current?.zoomBy(1.18)}
                        aria-label="Zoom In"
                        className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#E5E0D8] flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Zoom In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => canvasRef.current?.zoomBy(1 / 1.18)}
                        aria-label="Zoom Out"
                        className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#E5E0D8] flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                        <span>Zoom Out</span>
                      </button>
                      <button
                        type="button"
                        data-testid="btn-reset-camera"
                        onClick={() => canvasRef.current?.resetCamera()}
                        aria-label="Reset Camera"
                        className="px-2.5 py-1.5 rounded-md bg-[#1E2029] hover:bg-[#2A2D3A] text-xs font-medium text-[#D99252] flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>
                          {config.officeViewMode === 'full_office' ? 'Reset Camera' : 'Reset Iso'}
                        </span>
                      </button>

                      {config.officeViewMode === 'single_room' &&
                        isPMVisibleInViewport &&
                        config.selectedRoomKey === 'pm_strategy' &&
                        telemetry.loaded && (
                          <button
                            type="button"
                            onClick={() => canvasRef.current?.focusCameraOnPM()}
                            className="px-2.5 py-1.5 rounded-md bg-[#262936] hover:bg-[#313546] border border-[#D99252]/40 text-xs font-medium text-[#FBBF24] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Focus className="w-3.5 h-3.5" />
                            <span>Focus PM</span>
                          </button>
                        )}
                      {config.officeViewMode === 'single_room' &&
                        isCEOVisibleInViewport &&
                        config.selectedRoomKey === 'ceo_executive' && (
                          <button
                            type="button"
                            onClick={() => canvasRef.current?.focusCameraOnCEOCharacter()}
                            className="px-2.5 py-1.5 rounded-md bg-[#1B2A26] hover:bg-[#233933] border border-[#10B981]/40 text-xs font-medium text-[#6EE7B7] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Focus className="w-3.5 h-3.5" />
                            <span>Focus CEO</span>
                          </button>
                        )}
                      {config.officeViewMode === 'single_room' &&
                        isUIUXVisibleInViewport &&
                        config.selectedRoomKey === 'uiux_studio' && (
                          <button
                            type="button"
                            onClick={() => canvasRef.current?.focusCameraOnUIUXCharacter()}
                            className="px-2.5 py-1.5 rounded-md bg-[#122625] hover:bg-[#193533] border border-[#14B8A6]/40 text-xs font-medium text-[#5EEAD4] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Focus className="w-3.5 h-3.5" />
                            <span>Focus UI/UX</span>
                          </button>
                        )}
                      {config.officeViewMode === 'single_room' &&
                        isFrontendVisibleInViewport &&
                        config.selectedRoomKey === 'engineering' && (
                          <>
                            <button
                              type="button"
                              onClick={() => canvasRef.current?.focusCameraOnDatabaseCharacter()}
                              className="px-2.5 py-1.5 rounded-md bg-[#08251C] hover:bg-[#0D382B] border border-[#10B981]/60 text-xs font-medium text-[#10B981] flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <Focus className="w-3.5 h-3.5" />
                              <span>Focus DB Dev</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => canvasRef.current?.focusCameraOnBackendCharacter()}
                              className="px-2.5 py-1.5 rounded-md bg-[#0D231B] hover:bg-[#133529] border border-[#10B981]/50 text-xs font-medium text-[#34D399] flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <Focus className="w-3.5 h-3.5" />
                              <span>Focus BE Dev</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => canvasRef.current?.focusCameraOnFrontendCharacter()}
                              className="px-2.5 py-1.5 rounded-md bg-[#0C2234] hover:bg-[#12314A] border border-[#38BDF8]/40 text-xs font-medium text-[#38BDF8] flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <Focus className="w-3.5 h-3.5" />
                              <span>Focus FE Dev</span>
                            </button>
                          </>
                        )}
                      {config.officeViewMode === 'single_room' &&
                        isResearchVisibleInViewport &&
                        config.selectedRoomKey === 'research_brain' && (
                          <button
                            type="button"
                            onClick={() => canvasRef.current?.focusCameraOnResearchCharacter()}
                            className="px-2.5 py-1.5 rounded-md bg-[#11261B] hover:bg-[#193A29] border border-[#4ADE80]/50 text-xs font-medium text-[#4ADE80] flex items-center gap-1 whitespace-nowrap shrink-0"
                          >
                            <Focus className="w-3.5 h-3.5" />
                            <span>Focus Prof</span>
                          </button>
                        )}
                    </div>

                    {/* Camera Preset Filter Tabs (Single Room Mode) or More Views Toggle (Full Office) */}
                    {config.officeViewMode === 'single_room' ? (
                      <div className="flex items-center gap-1 bg-[#1C1E26] p-0.5 rounded-lg border border-[#282B36]">
                        {(
                          [
                            { id: 'all', label: `All Views (${activePresetList.length})` },
                            { id: 'standard', label: 'Angles' },
                            { id: 'inspection', label: 'Close-Ups' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setPresetCategory(tab.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              presetCategory === tab.id
                                ? 'bg-[#2E3240] text-[#F5F2EB]'
                                : 'text-[#8E95A5] hover:text-white'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <button
                        type="button"
                        data-testid="btn-toggle-more-views"
                        onClick={() => setMoreViewsExpanded((v) => !v)}
                        className="px-2.5 py-1 rounded-md bg-[#1C1E26] hover:bg-[#282B36] border border-[#2A2D3A] text-[11px] font-medium text-[#A3AAB8] hover:text-white whitespace-nowrap shrink-0"
                      >
                        {moreViewsExpanded
                          ? 'Compact Presets'
                          : `More Views (${visiblePresets.length})`}
                      </button>
                    )}
                  </div>

                  {/* Row 2: Camera Angle & Inspection Close-Up Presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-medium text-[#8E95A5] flex items-center gap-1 pr-1 shrink-0">
                      <Camera className="w-3.5 h-3.5 text-[#D99252]" />
                      <span>
                        {config.officeViewMode === 'full_office'
                          ? 'A3.2 Office Views:'
                          : config.selectedRoomKey === 'qa_devops_studio'
                          ? 'QA & DevOps Presets:'
                          : config.selectedRoomKey === 'research_brain'
                          ? 'Research Presets:'
                          : config.selectedRoomKey === 'engineering'
                          ? 'Engineering Presets:'
                          : config.selectedRoomKey === 'uiux_studio'
                          ? 'UI/UX Presets:'
                          : config.selectedRoomKey === 'ceo_executive'
                          ? 'CEO Presets:'
                          : 'PM Presets:'}
                      </span>
                    </span>
                    {(config.officeViewMode === 'full_office' && !moreViewsExpanded
                      ? visiblePresets.slice(0, 7)
                      : visiblePresets
                    ).map((preset) => {
                      const active = activePresetId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          data-testid={`camera-preset-${preset.id}`}
                          onClick={() => canvasRef.current?.setCameraPreset(preset.id)}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 border ${
                            active
                              ? 'bg-[#D99252] text-[#14151B] border-[#D99252] font-semibold'
                              : 'bg-[#1D1F28] text-[#D1D5DB] border-[#2A2D3A] hover:border-[#4B5563] hover:text-white'
                          }`}
                        >
                          {preset.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Room Inspector & Simulation Controls Panel */}
        {inspectorOpen && !cinemaMode && (
          <div data-testid="right-sidebar" className="relative h-full flex">
            <button
              type="button"
              onClick={() => setInspectorOpen(false)}
              aria-label="Collapse Room Inspector"
              className="absolute -left-8 top-3.5 z-20 p-1.5 rounded-l-lg bg-[#181920] border border-r-0 border-[#2B2D38] text-[#9CA3AF] hover:text-white"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
            <RoomInspectorPanel
              activeTab={inspectorTab}
              onTabChange={setInspectorTab}
              config={config}
              stats={stats}
              ceoStats={ceoStats}
              uiuxStats={uiuxStats}
              engineeringStats={engineeringStats}
              researchStats={researchStats}
              qaDevopsStats={qaDevopsStats}
              selectedDetails={selectedDetails}
              importReport={importReport}
              roundTripReport={roundTripReport}
              telemetry={telemetry}
              glbInspectionReport={glbInspectionReport}
              anchors={anchors}
              selectedAnchorId={selectedAnchorId}
              ceoAnchors={ceoAnchors}
              selectedCEOAnchorId={selectedCEOAnchorId}
              uiuxAnchors={uiuxAnchors}
              selectedUIUXAnchorId={selectedUIUXAnchorId}
              engineeringAnchors={engineeringAnchors}
              selectedEngineeringAnchorId={selectedEngineeringAnchorId}
              selectedResearchAnchorId={selectedResearchAnchorId}
              onSelectResearchAnchor={setSelectedResearchAnchorId}
              selectedQADevOpsAnchorId={selectedQADevOpsAnchorId}
              onSelectQADevOpsAnchor={setSelectedQADevOpsAnchorId}
              onUpdateConfig={updateConfig}
              onSelectCatalogItem={(id) => handleSelectCatalogItem(id)}
              onRunImportTest={handleRunImportTest}
              onExportGLB={handleExportGLB}
              onExportCEORoomGLB={handleExportCEORoomGLB}
              onExportUIUXRoomGLB={handleExportUIUXRoomGLB}
              onExportEngineeringRoomGLB={handleExportEngineeringRoomGLB}
              onExportResearchRoomGLB={handleExportResearchRoomGLB}
              onExportQADevOpsRoomGLB={handleExportQADevOpsRoomGLB}
              onExportOriginalPMGLB={handleExportOriginalPMGLB}
              onExportManifest={handleExportManifest}
              onExportRoomManifestAndAnchors={handleExportRoomManifestAndAnchors}
              onExportCEORoomJsonContracts={handleExportCEORoomJsonContracts}
              onExportUIUXRoomJsonContracts={handleExportUIUXRoomJsonContracts}
              onExportEngineeringRoomJsonContracts={handleExportEngineeringRoomJsonContracts}
              onExportResearchRoomJsonContracts={handleExportResearchRoomJsonContracts}
              onExportQADevOpsRoomJsonContracts={handleExportQADevOpsRoomJsonContracts}
              onExportCharacterManifestAndBehavior={handleExportCharacterManifestAndBehavior}
              onExportOfficeLayoutA3Json={handleExportOfficeLayoutA3Json}
              onExportOfficeLayoutA3_1Json={handleExportOfficeLayoutA3_1Json}
              onExportOfficeLayoutA3_2Json={handleExportOfficeLayoutA3_2Json}
              onExportPNG={handleExportPNG}
              onExportCEORoomPNG={handleExportCEORoomPNG}
              onExportUIUXRoomPNG={handleExportUIUXRoomPNG}
              onExportEngineeringRoomPNG={handleExportEngineeringRoomPNG}
              onExportResearchRoomPNG={handleExportResearchRoomPNG}
              onExportQADevOpsRoomPNG={handleExportQADevOpsRoomPNG}
              onExportCharacterPNG={handleExportCharacterPNG}
              onDownloadRoomPackZip={handleDownloadRoomPackZip}
              onDownloadCEORoomPackZip={handleDownloadCEORoomPackZip}
              onDownloadUIUXRoomPackZip={handleDownloadUIUXRoomPackZip}
              onDownloadEngineeringRoomPackZip={handleDownloadEngineeringRoomPackZip}
              onDownloadResearchRoomPackZip={handleDownloadResearchRoomPackZip}
              onDownloadQADevOpsRoomPackZip={handleDownloadQADevOpsRoomPackZip}
              onDownloadCharacterPackZip={handleDownloadCharacterPackZip}
              onDownloadSourceZip={handleDownloadSourceZip}
              onDownloadCompleteHandoffZip={handleDownloadCompleteHandoffZip}
              onDownloadRoundTripReport={handleDownloadRoundTripReport}
              onFitRoom={() => canvasRef.current?.fitRoom()}
              onSetCameraPreset={(presetId) => canvasRef.current?.setCameraPreset(presetId)}
              onSelectRoomKey={handleSelectRoomKey}
              onCharacterSourceChange={(src) => {
                canvasRef.current?.setCharacterSource(src);
                notifyStatus(
                  src === 'original_pm'
                    ? 'Sumber Karakter: Original Room-Native Boss PM (Default)'
                    : 'Sumber Karakter: Imported GLB (Optional)'
                );
              }}
              onTriggerAction={handleTriggerAction}
              onPlaybackCommand={(cmd) => canvasRef.current?.setSimulationPlayback(cmd)}
              onSpeedChange={(spd) => canvasRef.current?.setSimulationSpeed(spd)}
              onStartAutoDemo={() => canvasRef.current?.startAutoDemo()}
              onStopAutoDemo={() => canvasRef.current?.stopAutoDemo()}
              onApproveTask={() => canvasRef.current?.approvePendingTask()}
              onFocusPM={() => canvasRef.current?.focusCameraOnPM()}
              onReturnRoomView={() => canvasRef.current?.returnToRoomView()}
              onSelectAnchor={setSelectedAnchorId}
              onUpdateAnchor={(id, updated) =>
                setAnchors((prev) => ({
                  ...prev,
                  [id]: updated,
                }))
              }
              onResetAnchors={() => setAnchors({ ...DEFAULT_ACTIVITY_ANCHORS })}
              onTeleportToAnchor={(id) => canvasRef.current?.teleportPMToAnchor(id)}
              onUploadCustomGLB={handleUploadCustomGLB}
              onScaleMultiplierChange={(mult) =>
                canvasRef.current?.setCharacterScaleMultiplier(mult)
              }
              onForwardOffsetChange={(deg) =>
                canvasRef.current?.setCharacterForwardOffsetDeg(deg)
              }
              onExportSimConfig={handleExportSimConfig}
              onSelectCEOAnchor={setSelectedCEOAnchorId}
              onUpdateCEOAnchor={(id, updated) =>
                setCeoAnchors((prev) => ({
                  ...prev,
                  [id]: updated,
                }))
              }
              onResetCEOAnchors={() => setCeoAnchors({ ...DEFAULT_CEO_ANCHORS })}
              onSelectUIUXAnchor={setSelectedUIUXAnchorId}
              onUpdateUIUXAnchor={(id, updated) =>
                setUiuxAnchors((prev) => ({
                  ...prev,
                  [id]: updated,
                }))
              }
              onResetUIUXAnchors={() => setUiuxAnchors({ ...DEFAULT_UIUX_ANCHORS })}
              onSelectEngineeringAnchor={setSelectedEngineeringAnchorId}
              onUpdateEngineeringAnchor={(id, updated) =>
                setEngineeringAnchors((prev) => ({
                  ...prev,
                  [id]: updated,
                }))
              }
              onResetEngineeringAnchors={() =>
                setEngineeringAnchors({ ...DEFAULT_ENGINEERING_ANCHORS })
              }
              onFocusAnchorPosition={(pos) => canvasRef.current?.focusAnchorPosition(pos)}
              ceoStatus={ceoStatus}
              onTriggerCEOAction={handleTriggerCEOAction}
              onExecuteCEOPlayback={(cmd) => canvasRef.current?.executeCEOPlayback(cmd)}
              onSetCEOSpeed={(spd) => canvasRef.current?.setCEOSpeed(spd)}
              onSetCEOPatrol={(act) => canvasRef.current?.setCEOPatrol(act)}
              onStartCEOAutoDemo={() => canvasRef.current?.startCEOAutoDemo()}
              onStopCEOAutoDemo={() => canvasRef.current?.stopCEOAutoDemo()}
              onSetCEOExpression={(expr: CEOExpressionId) =>
                canvasRef.current?.setCEOExpression(expr)
              }
              onSetCEOGlassesVisible={(vis: boolean) =>
                canvasRef.current?.setCEOGlassesVisible(vis)
              }
              onFocusCEOCharacter={() => canvasRef.current?.focusCameraOnCEOCharacter()}
              onExportCEOCharacterGLB={handleExportCEOCharacterGLB}
              onExportCEOCharacterManifestAndBehavior={handleExportCEOCharacterManifestAndBehavior}
              onExportCEOCharacterPNG={handleExportCEOCharacterPNG}
              onDownloadCEOCharacterPackZip={handleDownloadCEOCharacterPackZip}
              uiuxStatus={uiuxStatus}
              onTriggerUIUXAction={handleTriggerUIUXAction}
              onExecuteUIUXPlayback={(cmd) => canvasRef.current?.executeUIUXPlayback(cmd)}
              onSetUIUXSpeed={(spd: UIUXSpeedMultiplier) => canvasRef.current?.setUIUXSpeed(spd)}
              onSetUIUXPatrol={(act) => canvasRef.current?.setUIUXPatrol(act)}
              onStartUIUXAutoDemo={() => canvasRef.current?.startUIUXAutoDemo()}
              onStopUIUXAutoDemo={() => canvasRef.current?.stopUIUXAutoDemo()}
              onSetUIUXExpression={(expr: UIUXExpressionId) =>
                canvasRef.current?.setUIUXExpression(expr)
              }
              onSetUIUXGlassesVisible={(vis: boolean) =>
                canvasRef.current?.setUIUXGlassesVisible(vis)
              }
              onFocusUIUXCharacter={() => canvasRef.current?.focusCameraOnUIUXCharacter()}
              onExportUIUXCharacterGLB={handleExportUIUXCharacterGLB}
              onExportUIUXCharacterManifestAndBehavior={
                handleExportUIUXCharacterManifestAndBehavior
              }
              onExportUIUXCharacterPNG={handleExportUIUXCharacterPNG}
              onDownloadUIUXCharacterPackZip={handleDownloadUIUXCharacterPackZip}
              frontendStatus={frontendStatus}
              onTriggerFrontendAction={handleTriggerFrontendAction}
              onFrontendPlaybackCommand={(cmd) => canvasRef.current?.executeFrontendPlayback(cmd)}
              onSetFrontendSpeed={(spd: FrontendSpeedMultiplier) =>
                canvasRef.current?.setFrontendSpeed(spd)
              }
              onToggleFrontendPatrol={(act) => canvasRef.current?.setFrontendPatrol(act)}
              onStartFrontendAutoDemo={() => canvasRef.current?.startFrontendAutoDemo()}
              onStopFrontendAutoDemo={() => canvasRef.current?.stopFrontendAutoDemo()}
              onSetFrontendExpression={(expr: FrontendExpressionId) =>
                canvasRef.current?.setFrontendExpression(expr)
              }
              onSetFrontendGlassesVisible={(vis: boolean) =>
                canvasRef.current?.setFrontendGlassesVisible(vis)
              }
              onSetFrontendBackpackVisible={(vis: boolean) =>
                canvasRef.current?.setFrontendBackpackVisible(vis)
              }
              onFocusFrontendCharacter={() => canvasRef.current?.focusCameraOnFrontendCharacter()}
              onDownloadFrontendCharacterGlb={handleExportFrontendCharacterGLB}
              onDownloadFrontendCharacterManifestAndBehavior={
                handleExportFrontendCharacterManifestAndBehavior
              }
              onDownloadFrontendCharacterPreviewPng={handleExportFrontendCharacterPNG}
              onDownloadFrontendCharacterPackZip={handleDownloadFrontendCharacterPackZip}
              backendStatus={backendStatus}
              onTriggerBackendAction={handleTriggerBackendAction}
              onBackendPlaybackCommand={(cmd) => canvasRef.current?.executeBackendPlayback(cmd)}
              onSetBackendSpeed={(spd: BackendSpeedMultiplier) =>
                canvasRef.current?.setBackendSpeed(spd)
              }
              onToggleBackendPatrol={(act) => canvasRef.current?.setBackendPatrol(act)}
              onStartBackendAutoDemo={() => canvasRef.current?.startBackendAutoDemo()}
              onStopBackendAutoDemo={() => canvasRef.current?.stopBackendAutoDemo()}
              onSetBackendExpression={(expr: BackendExpressionId) =>
                canvasRef.current?.setBackendExpression(expr)
              }
              onSetBackendGlassesVisible={(vis: boolean) =>
                canvasRef.current?.setBackendGlassesVisible(vis)
              }
              onSetBackendBackpackVisible={(vis: boolean) =>
                canvasRef.current?.setBackendBackpackVisible(vis)
              }
              onFocusBackendCharacter={() => canvasRef.current?.focusCameraOnBackendCharacter()}
              onDownloadBackendCharacterGlb={handleExportBackendCharacterGLB}
              onDownloadBackendCharacterManifestAndBehavior={
                handleExportBackendCharacterManifestAndBehavior
              }
              onDownloadBackendCharacterPreviewPng={handleExportBackendCharacterPNG}
              onDownloadBackendCharacterPackZip={handleDownloadBackendCharacterPackZip}
              databaseStatus={databaseStatus}
              onTriggerDatabaseAction={handleTriggerDatabaseAction}
              onDatabasePlaybackCommand={(cmd) => canvasRef.current?.executeDatabasePlayback(cmd)}
              onSetDatabaseSpeed={(spd: DatabaseSpeedMultiplier) =>
                canvasRef.current?.setDatabaseSpeed(spd)
              }
              onToggleDatabasePatrol={(act) => canvasRef.current?.setDatabasePatrol(act)}
              onStartDatabaseAutoDemo={() => canvasRef.current?.startDatabaseAutoDemo()}
              onStopDatabaseAutoDemo={() => canvasRef.current?.stopDatabaseAutoDemo()}
              onSetDatabaseExpression={(expr: DatabaseExpressionId) =>
                canvasRef.current?.setDatabaseExpression(expr)
              }
              onSetDatabaseBackpackVisible={(vis: boolean) =>
                canvasRef.current?.setDatabaseBackpackVisible(vis)
              }
              onFocusDatabaseCharacter={() => canvasRef.current?.focusCameraOnDatabaseCharacter()}
              onDownloadDatabaseCharacterGlb={handleExportDatabaseCharacterGLB}
              onDownloadDatabaseCharacterManifestAndBehavior={
                handleExportDatabaseCharacterManifestAndBehavior
              }
              onDownloadDatabaseCharacterPreviewPng={handleExportDatabaseCharacterPNG}
              onDownloadDatabaseCharacterPackZip={handleDownloadDatabaseCharacterPackZip}
              researchStatus={researchStatus}
              onTriggerResearchAction={handleTriggerResearchAction}
              onResearchPlaybackCommand={(cmd) => canvasRef.current?.executeResearchPlayback(cmd)}
              onSetResearchSpeed={(spd: ResearchSpeedMultiplier) =>
                canvasRef.current?.setResearchSpeed(spd)
              }
              onToggleResearchPatrol={(act) => canvasRef.current?.setResearchPatrol(act)}
              onStartResearchAutoDemo={() => canvasRef.current?.startResearchAutoDemo()}
              onStopResearchAutoDemo={() => canvasRef.current?.stopResearchAutoDemo()}
              onSetResearchExpression={(expr: ResearchExpressionId) =>
                canvasRef.current?.setResearchExpression(expr)
              }
              onSetResearchGlassesVisible={(vis: boolean) =>
                canvasRef.current?.setResearchGlassesVisible(vis)
              }
              onSetResearchBackpackVisible={(vis: boolean) =>
                canvasRef.current?.setResearchBackpackVisible(vis)
              }
              onFocusResearchCharacter={() => canvasRef.current?.focusCameraOnResearchCharacter()}
              onDownloadResearchCharacterGlb={handleExportResearchCharacterGLB}
              onDownloadResearchCharacterManifestAndBehavior={
                handleExportResearchCharacterManifestAndBehavior
              }
              onDownloadResearchCharacterPreviewPng={handleExportResearchCharacterPNG}
              onDownloadResearchCharacterPackZip={handleDownloadResearchCharacterPackZip}
              clickedMeshDiagnostic={clickedMeshDiagnostic}
              stabilityReport={stabilityReport}
              onRunStabilityScan={handleRunStabilityScan}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
