import React, { useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Compass,
  Cpu,
  Database,
  Download,
  FileCode2,
  Focus,
  GitMerge,
  Image as ImageIcon,
  LayoutGrid,
  MonitorCheck,
  RotateCcw,
  Server,
} from 'lucide-react';
import {
  ENGINEERING_CAMERA_PRESETS,
  ENGINEERING_CONNECTORS_SPEC,
  ENGINEERING_FUTURE_ACTIONS_CONTRACT,
  ENGINEERING_MODULE_CONSTANTS,
  EngineeringActivityAnchor,
  EngineeringAnchorId,
  verifyEngineeringMonitorsOrientation,
} from '../domain/engineeringRoomSpec';
import { RoomModuleKey } from '../domain/officeLayoutA3Spec';
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
import { FrontendSimulationPanel } from './FrontendSimulationPanel';
import { BackendSimulationPanel } from './BackendSimulationPanel';
import { DatabaseSimulationPanel } from './DatabaseSimulationPanel';
import { ViewerDisplayConfig } from './ModularRoomCanvas';

interface EngineeringRoomInspectorSectionProps {
  config: ViewerDisplayConfig;
  engineeringAnchors: Record<EngineeringAnchorId, EngineeringActivityAnchor>;
  selectedEngineeringAnchorId: EngineeringAnchorId | null;
  onUpdateConfig: (partial: Partial<ViewerDisplayConfig>) => void;
  onSelectEngineeringAnchor: (anchorId: EngineeringAnchorId) => void;
  onUpdateEngineeringAnchor: (
    anchorId: EngineeringAnchorId,
    updated: EngineeringActivityAnchor
  ) => void;
  onResetEngineeringAnchors: () => void;
  onFocusAnchorPosition: (pos: [number, number, number]) => void;
  onSetCameraPreset: (presetId: string) => void;
  onExportEngineeringRoomGLB: () => void;
  onExportEngineeringRoomJsonContracts: () => void;
  onExportEngineeringRoomPNG: () => void;
  onDownloadEngineeringRoomPackZip: () => void;
  onExportOfficeLayoutA3_1Json: () => void;
  onSelectCatalogItem: (catalogId: string | null) => void;
  onSelectRoomKey: (roomKey: RoomModuleKey) => void;
  // Frontend Developer character simulation & export callbacks
  frontendStatus?: FrontendSimulationRuntimeStatus | null;
  onTriggerFrontendAction?: (actionId: FrontendActionId) => void;
  onFrontendPlaybackCommand?: (cmd: FrontendAnimationPlaybackCommand) => void;
  onSetFrontendSpeed?: (speed: FrontendSpeedMultiplier) => void;
  onSetFrontendPatrol?: (active: boolean) => void;
  onToggleFrontendPatrol?: (active: boolean) => void;
  onStartFrontendAutoDemo?: () => void;
  onStopFrontendAutoDemo?: () => void;
  onSetFrontendExpression?: (expr: FrontendExpressionId) => void;
  onSetFrontendGlassesVisible?: (visible: boolean) => void;
  onSetFrontendBackpackVisible?: (visible: boolean) => void;
  onFocusFrontendCharacter?: () => void;
  onReturnToRoomView?: () => void;
  onExportFrontendCharacterGLB?: () => void;
  onDownloadFrontendCharacterGlb?: () => void;
  onExportFrontendCharacterPackZip?: () => void;
  onDownloadFrontendCharacterPackZip?: () => void;
  onExportFrontendCharacterManifestAndBehavior?: () => void;
  onDownloadFrontendCharacterManifestAndBehavior?: () => void;
  onExportFrontendCharacterPreviewPng?: () => void;
  onDownloadFrontendCharacterPreviewPng?: () => void;
  // Backend Developer character simulation & export callbacks
  backendStatus?: BackendSimulationRuntimeStatus | null;
  onTriggerBackendAction?: (actionId: BackendActionId) => void;
  onBackendPlaybackCommand?: (cmd: BackendAnimationPlaybackCommand) => void;
  onSetBackendSpeed?: (speed: BackendSpeedMultiplier) => void;
  onSetBackendPatrol?: (active: boolean) => void;
  onToggleBackendPatrol?: (active: boolean) => void;
  onStartBackendAutoDemo?: () => void;
  onStopBackendAutoDemo?: () => void;
  onSetBackendExpression?: (expr: BackendExpressionId) => void;
  onSetBackendGlassesVisible?: (visible: boolean) => void;
  onSetBackendBackpackVisible?: (visible: boolean) => void;
  onFocusBackendCharacter?: () => void;
  onExportBackendCharacterGLB?: () => void;
  onDownloadBackendCharacterGlb?: () => void;
  onExportBackendCharacterPackZip?: () => void;
  onDownloadBackendCharacterPackZip?: () => void;
  onExportBackendCharacterManifestAndBehavior?: () => void;
  onDownloadBackendCharacterManifestAndBehavior?: () => void;
  onExportBackendCharacterPreviewPng?: () => void;
  onDownloadBackendCharacterPreviewPng?: () => void;
  // Database Developer character simulation & export callbacks
  databaseStatus?: DatabaseSimulationRuntimeStatus | null;
  onTriggerDatabaseAction?: (actionId: DatabaseActionId) => void;
  onDatabasePlaybackCommand?: (cmd: DatabaseAnimationPlaybackCommand) => void;
  onSetDatabaseSpeed?: (speed: DatabaseSpeedMultiplier) => void;
  onSetDatabasePatrol?: (active: boolean) => void;
  onToggleDatabasePatrol?: (active: boolean) => void;
  onStartDatabaseAutoDemo?: () => void;
  onStopDatabaseAutoDemo?: () => void;
  onSetDatabaseExpression?: (expr: DatabaseExpressionId) => void;
  onSetDatabaseBackpackVisible?: (visible: boolean) => void;
  onFocusDatabaseCharacter?: () => void;
  onExportDatabaseCharacterGLB?: () => void;
  onDownloadDatabaseCharacterGlb?: () => void;
  onExportDatabaseCharacterPackZip?: () => void;
  onDownloadDatabaseCharacterPackZip?: () => void;
  onExportDatabaseCharacterManifestAndBehavior?: () => void;
  onDownloadDatabaseCharacterManifestAndBehavior?: () => void;
  onExportDatabaseCharacterPreviewPng?: () => void;
  onDownloadDatabaseCharacterPreviewPng?: () => void;
}

export const EngineeringRoomInspectorSection: React.FC<
  EngineeringRoomInspectorSectionProps
> = ({
  config,
  engineeringAnchors,
  selectedEngineeringAnchorId,
  onUpdateConfig,
  onSelectEngineeringAnchor,
  onUpdateEngineeringAnchor,
  onResetEngineeringAnchors,
  onFocusAnchorPosition,
  onSetCameraPreset,
  onExportEngineeringRoomGLB,
  onExportEngineeringRoomJsonContracts,
  onExportEngineeringRoomPNG,
  onDownloadEngineeringRoomPackZip,
  onExportOfficeLayoutA3_1Json,
  onSelectCatalogItem,
  frontendStatus,
  onTriggerFrontendAction,
  onFrontendPlaybackCommand,
  onSetFrontendSpeed,
  onSetFrontendPatrol,
  onToggleFrontendPatrol,
  onStartFrontendAutoDemo,
  onStopFrontendAutoDemo,
  onSetFrontendExpression,
  onSetFrontendGlassesVisible,
  onSetFrontendBackpackVisible,
  onFocusFrontendCharacter,
  onReturnToRoomView,
  onExportFrontendCharacterGLB,
  onDownloadFrontendCharacterGlb,
  onExportFrontendCharacterPackZip,
  onDownloadFrontendCharacterPackZip,
  onExportFrontendCharacterManifestAndBehavior,
  onDownloadFrontendCharacterManifestAndBehavior,
  onExportFrontendCharacterPreviewPng,
  onDownloadFrontendCharacterPreviewPng,
  backendStatus,
  onTriggerBackendAction,
  onBackendPlaybackCommand,
  onSetBackendSpeed,
  onSetBackendPatrol,
  onToggleBackendPatrol,
  onStartBackendAutoDemo,
  onStopBackendAutoDemo,
  onSetBackendExpression,
  onSetBackendGlassesVisible,
  onSetBackendBackpackVisible,
  onFocusBackendCharacter,
  onExportBackendCharacterGLB,
  onDownloadBackendCharacterGlb,
  onExportBackendCharacterPackZip,
  onDownloadBackendCharacterPackZip,
  onExportBackendCharacterManifestAndBehavior,
  onDownloadBackendCharacterManifestAndBehavior,
  onExportBackendCharacterPreviewPng,
  onDownloadBackendCharacterPreviewPng,
  databaseStatus,
  onTriggerDatabaseAction,
  onDatabasePlaybackCommand,
  onSetDatabaseSpeed,
  onSetDatabasePatrol,
  onToggleDatabasePatrol,
  onStartDatabaseAutoDemo,
  onStopDatabaseAutoDemo,
  onSetDatabaseExpression,
  onSetDatabaseBackpackVisible,
  onFocusDatabaseCharacter,
  onExportDatabaseCharacterGLB,
  onDownloadDatabaseCharacterGlb,
  onExportDatabaseCharacterPackZip,
  onDownloadDatabaseCharacterPackZip,
  onExportDatabaseCharacterManifestAndBehavior,
  onDownloadDatabaseCharacterManifestAndBehavior,
  onExportDatabaseCharacterPreviewPng,
  onDownloadDatabaseCharacterPreviewPng,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'zones' | 'monitors' | 'anchors' | 'contracts'
  >('zones');
  const [activeAgentPanel, setActiveAgentPanel] = useState<
    'database' | 'backend' | 'frontend' | 'all'
  >('database');

  const monitorReport = useMemo(() => verifyEngineeringMonitorsOrientation(), []);

  const activeAnchor =
    (selectedEngineeringAnchorId &&
      engineeringAnchors[selectedEngineeringAnchorId]) ||
    engineeringAnchors.FE_DESK_WORK;

  const zoneCards = [
    {
      zone: 'Zone A (North-West · Z=12..16)',
      title: 'Frontend Developer Workstation',
      roleBadge: 'FRONTEND_WORKSTATION',
      presetId: 'eng_frontend_zone',
      catalogId: 'eng_frontend_desk',
      boardCatalogId: 'eng_frontend_board_credenza',
      accent: 'text-[#FB923C]',
      borderAccent: 'border-[#FB923C]/40',
      icon: LayoutGrid,
      desc: 'Warm oak workstation desk (X=2.35, Z=13.75), ergonomic chair at [2.35, 0, 12.95] facing North, React component tree monitor + angled breakpoint monitor, laptop on stand + USB-C dock, mobile UI test stand, headphones, NW bookshelf, & West-wall Component Board.',
    },
    {
      zone: 'Zone B (Center-West · Z=8..12)',
      title: 'Backend Developer Workstation',
      roleBadge: 'BACKEND_WORKSTATION',
      presetId: 'eng_backend_zone',
      catalogId: 'eng_backend_desk',
      boardCatalogId: 'eng_backend_api_board',
      accent: 'text-[#38BDF8]',
      borderAccent: 'border-[#38BDF8]/40',
      icon: Server,
      desc: 'Technical walnut/steel desk (X=2.35, Z=10.05), ergonomic chair at [2.35, 0, 9.25] facing North, API service mesh monitor + vertical terminal log display, tabletop microservice box with patch cables, RFC binders, under-desk server node, & API Architecture Board.',
    },
    {
      zone: 'Zone C (Center-South · Z=5..8)',
      title: 'Shared Integration & Code Review Hub',
      roleBadge: 'INTEGRATION_REVIEW_AREA',
      presetId: 'eng_integration_hub',
      catalogId: 'eng_integration_table',
      boardCatalogId: 'eng_architecture_board',
      accent: 'text-[#A78BFA]',
      borderAccent: 'border-[#A78BFA]/40',
      icon: GitMerge,
      desc: 'Collaborative code review table (NOT a 4th agent desk) at [3.25, 0, 6.35] on 3D woven runner rug with 3 stools, open review laptop, architecture tablet + stylus, sprint notes, and West-wall Shared System Architecture Board (Frontend → API → Backend → Database).',
    },
    {
      zone: 'Zone D (South-West · Z=0..5)',
      title: 'Database Developer Workstation',
      roleBadge: 'DATABASE_WORKSTATION',
      presetId: 'eng_database_zone',
      catalogId: 'eng_database_desk',
      boardCatalogId: 'eng_database_archive_board',
      accent: 'text-[#34D399]',
      borderAccent: 'border-[#34D399]/40',
      icon: Database,
      desc: 'Warm oak & deep emerald/teal workstation desk (X=2.35, Z=2.95), ergonomic chair at [2.35, 0, 2.15] facing North, sleek lower-profile ERD & SQL query displays with 3D VESA rear detail, workstation tower, SW sage bookcase + 4-bay NAS, & SE 6-drawer Schema Archive.',
    },
  ];

  const anchorEntries = Object.values(engineeringAnchors);
  const resolvedPatrol = onSetFrontendPatrol || onToggleFrontendPatrol;
  const resolvedCharGlb = onExportFrontendCharacterGLB || onDownloadFrontendCharacterGlb;
  const resolvedCharPack = onExportFrontendCharacterPackZip || onDownloadFrontendCharacterPackZip;
  const resolvedCharManifest =
    onExportFrontendCharacterManifestAndBehavior ||
    onDownloadFrontendCharacterManifestAndBehavior;
  const resolvedCharPng =
    onExportFrontendCharacterPreviewPng || onDownloadFrontendCharacterPreviewPng;

  const resolvedBackendPatrol = onSetBackendPatrol || onToggleBackendPatrol;
  const resolvedBackendGlb = onExportBackendCharacterGLB || onDownloadBackendCharacterGlb;
  const resolvedBackendPack =
    onExportBackendCharacterPackZip || onDownloadBackendCharacterPackZip;
  const resolvedBackendManifest =
    onExportBackendCharacterManifestAndBehavior ||
    onDownloadBackendCharacterManifestAndBehavior;
  const resolvedBackendPng =
    onExportBackendCharacterPreviewPng || onDownloadBackendCharacterPreviewPng;

  const resolvedDatabasePatrol = onSetDatabasePatrol || onToggleDatabasePatrol;
  const resolvedDatabaseGlb = onExportDatabaseCharacterGLB || onDownloadDatabaseCharacterGlb;
  const resolvedDatabasePack =
    onExportDatabaseCharacterPackZip || onDownloadDatabaseCharacterPackZip;
  const resolvedDatabaseManifest =
    onExportDatabaseCharacterManifestAndBehavior ||
    onDownloadDatabaseCharacterManifestAndBehavior;
  const resolvedDatabasePng =
    onExportDatabaseCharacterPreviewPng || onDownloadDatabaseCharacterPreviewPng;

  return (
    <div className="space-y-4 text-xs">
      {/* Engineering Agents Selector Bar (Agent 01 Frontend + Agent 02 Backend + Agent 03 Database) */}
      <div className="rounded-xl border border-slate-700/80 bg-[#14151B] p-2">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-slate-200">
            Engineering Studio Agents (3 Active)
          </span>
          <span className="font-mono text-[10px] text-teal-400">
            FE (Zone A) + BE (Zone B) + DB (Zone D)
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveAgentPanel('database')}
            className={`rounded px-1.5 py-1.5 text-[10px] font-semibold transition ${
              activeAgentPanel === 'database'
                ? 'border border-teal-400 bg-teal-500/20 text-teal-200'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent 03: DB
          </button>
          <button
            type="button"
            onClick={() => setActiveAgentPanel('backend')}
            className={`rounded px-1.5 py-1.5 text-[10px] font-semibold transition ${
              activeAgentPanel === 'backend'
                ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-200'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent 02: BE
          </button>
          <button
            type="button"
            onClick={() => setActiveAgentPanel('frontend')}
            className={`rounded px-1.5 py-1.5 text-[10px] font-semibold transition ${
              activeAgentPanel === 'frontend'
                ? 'border border-orange-400 bg-orange-500/20 text-orange-200'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Agent 01: FE
          </button>
          <button
            type="button"
            onClick={() => setActiveAgentPanel('all')}
            className={`rounded px-1.5 py-1.5 text-[10px] font-semibold transition ${
              activeAgentPanel === 'all'
                ? 'border border-sky-400 bg-sky-500/20 text-sky-200'
                : 'border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua (3)
          </button>
        </div>
      </div>

      {/* Agent 03: Database Developer Simulation & Export Panel */}
      {(activeAgentPanel === 'database' || activeAgentPanel === 'all') &&
        databaseStatus &&
        onTriggerDatabaseAction &&
        onDatabasePlaybackCommand &&
        onSetDatabaseSpeed &&
        resolvedDatabasePatrol &&
        onStartDatabaseAutoDemo &&
        onStopDatabaseAutoDemo &&
        onSetDatabaseExpression &&
        onSetDatabaseBackpackVisible &&
        onFocusDatabaseCharacter &&
        resolvedDatabaseGlb &&
        resolvedDatabasePack &&
        resolvedDatabaseManifest &&
        resolvedDatabasePng && (
          <DatabaseSimulationPanel
            status={databaseStatus}
            onTriggerAction={onTriggerDatabaseAction}
            onPlaybackCommand={onDatabasePlaybackCommand}
            onSpeedChange={onSetDatabaseSpeed}
            onTogglePatrol={resolvedDatabasePatrol}
            onStartAutoDemo={onStartDatabaseAutoDemo}
            onStopAutoDemo={onStopDatabaseAutoDemo}
            onSelectExpression={onSetDatabaseExpression}
            onToggleBackpack={onSetDatabaseBackpackVisible}
            onFocusCharacterCamera={onFocusDatabaseCharacter}
            onExportDatabaseCharacterGLB={resolvedDatabaseGlb}
            onExportDatabaseCharacterPackZip={resolvedDatabasePack}
            onExportDatabaseManifestAndBehavior={resolvedDatabaseManifest}
            onExportDatabasePreviewPNG={resolvedDatabasePng}
          />
        )}

      {/* Agent 02: Backend Developer Simulation & Export Panel */}
      {(activeAgentPanel === 'backend' || activeAgentPanel === 'all') &&
        backendStatus &&
        onTriggerBackendAction &&
        onBackendPlaybackCommand &&
        onSetBackendSpeed &&
        resolvedBackendPatrol &&
        onStartBackendAutoDemo &&
        onStopBackendAutoDemo &&
        onSetBackendExpression &&
        onSetBackendGlassesVisible &&
        onSetBackendBackpackVisible &&
        onFocusBackendCharacter &&
        resolvedBackendGlb &&
        resolvedBackendPack &&
        resolvedBackendManifest &&
        resolvedBackendPng && (
          <BackendSimulationPanel
            status={backendStatus}
            onTriggerAction={onTriggerBackendAction}
            onPlaybackCommand={onBackendPlaybackCommand}
            onSpeedChange={onSetBackendSpeed}
            onTogglePatrol={resolvedBackendPatrol}
            onStartAutoDemo={onStartBackendAutoDemo}
            onStopAutoDemo={onStopBackendAutoDemo}
            onSelectExpression={onSetBackendExpression}
            onToggleGlasses={onSetBackendGlassesVisible}
            onToggleBackpack={onSetBackendBackpackVisible}
            onFocusCharacterCamera={onFocusBackendCharacter}
            onExportBackendCharacterGLB={resolvedBackendGlb}
            onExportBackendCharacterPackZip={resolvedBackendPack}
            onExportBackendManifestAndBehavior={resolvedBackendManifest}
            onExportBackendPreviewPNG={resolvedBackendPng}
          />
        )}

      {/* Agent 01: Frontend Developer Simulation & Export Panel */}
      {(activeAgentPanel === 'frontend' || activeAgentPanel === 'all') &&
        onTriggerFrontendAction &&
        onFrontendPlaybackCommand &&
        onSetFrontendSpeed &&
        resolvedPatrol &&
        onStartFrontendAutoDemo &&
        onStopFrontendAutoDemo &&
        onSetFrontendExpression &&
        onSetFrontendGlassesVisible &&
        onSetFrontendBackpackVisible &&
        onFocusFrontendCharacter &&
        onReturnToRoomView &&
        resolvedCharGlb &&
        resolvedCharPack &&
        resolvedCharManifest &&
        resolvedCharPng && (
          <FrontendSimulationPanel
            status={frontendStatus ?? null}
            onTriggerAction={onTriggerFrontendAction}
            onPlaybackCommand={onFrontendPlaybackCommand}
            onSetSpeed={onSetFrontendSpeed}
            onSetPatrol={resolvedPatrol}
            onStartAutoDemo={onStartFrontendAutoDemo}
            onStopAutoDemo={onStopFrontendAutoDemo}
            onSetExpression={onSetFrontendExpression}
            onSetGlassesVisible={onSetFrontendGlassesVisible}
            onSetBackpackVisible={onSetFrontendBackpackVisible}
            onFocusCharacter={onFocusFrontendCharacter}
            onReturnToRoomView={onReturnToRoomView}
            onExportCharacterGLB={resolvedCharGlb}
            onExportCharacterPackZip={resolvedCharPack}
            onExportCharacterManifestAndBehavior={resolvedCharManifest}
            onExportCharacterPreviewPng={resolvedCharPng}
          />
        )}

      {/* Studio Header Card */}
      <div className="bg-[#14151B] border border-[#38BDF8]/50 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span className="font-semibold text-[#F5F2EB] text-xs">
              {ENGINEERING_MODULE_CONSTANTS.DISPLAY_NAME}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#0C2438] border border-[#38BDF8]/60 text-[#7DD3FC] font-mono text-[10px] font-semibold">
            FE + BE + DB AGENTS ACTIVE · 8×16
          </span>
        </div>

        <p className="text-[11px] text-[#A3AAB8] leading-relaxed">
          Continuous double-module (`8 × 16 × 3.2u`) multi-agent Engineering & Development Studio at
          Master Layout A3.1 slot `[0, 0, 0]` (`X = 0..8, Z = 0..16`). Agent 01{' '}
          <strong className="text-orange-300">Frontend Developer (`frontend_developer_agent`)</strong>{' '}
          is active in Zone A (North), Agent 02{' '}
          <strong className="text-emerald-300">Backend Developer (`backend_developer_agent`)</strong>{' '}
          is active in Zone B (Center-West), and Agent 03{' '}
          <strong className="text-teal-300">Database Developer (`database_developer_agent`)</strong>{' '}
          is active in Zone D (South-West).
        </p>

        <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[10px]">
          <div className="bg-[#1B1D26] border border-[#262833] rounded px-2 py-1">
            <span className="text-[#8E95A5] block">Module ID</span>
            <span className="text-[#7DD3FC] font-semibold">
              {ENGINEERING_MODULE_CONSTANTS.MODULE_ID}
            </span>
          </div>
          <div className="bg-[#1B1D26] border border-[#262833] rounded px-2 py-1">
            <span className="text-[#8E95A5] block">Footprint & A3.1 Slot</span>
            <span className="text-[#F3EFEA] font-semibold">8×16u · [0, 0, 0]</span>
          </div>
          <div className="bg-[#1B1D26] border border-[#262833] rounded px-2 py-1">
            <span className="text-[#8E95A5] block">North Connector</span>
            <span className="text-[#6EE7B7]">
              [{ENGINEERING_CONNECTORS_SPEC.NORTH_CORRIDOR.localPosition.join(', ')}] → Corridor
            </span>
          </div>
          <div className="bg-[#1B1D26] border border-[#262833] rounded px-2 py-1">
            <span className="text-[#8E95A5] block">East Connector</span>
            <span className="text-[#FBBF24]">
              [{ENGINEERING_CONNECTORS_SPEC.EAST_MAIN.localPosition.join(', ')}] → Central Hub
            </span>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="grid grid-cols-4 gap-1 pt-1.5 bg-[#1B1D26] p-1 rounded-lg border border-[#262833]">
          {(
            [
              { id: 'zones', label: '4 Zones' },
              { id: 'monitors', label: 'Monitors (6)' },
              { id: 'anchors', label: 'Anchors (20)' },
              { id: 'contracts', label: 'Export & A3.1' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSubTab(t.id)}
              className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                activeSubTab === t.id
                  ? 'bg-[#38BDF8] text-[#0B1520] font-semibold'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: 4 Interior Functional Zones & Camera Presets */}
      {activeSubTab === 'zones' && (
        <div className="space-y-3">
          {/* Quick Camera Framing Bar */}
          <div className="bg-[#14151B] border border-[#262833] rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#D6D1C7] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Engineering Studio Camera Presets</span>
              </span>
              <button
                type="button"
                onClick={() => onSetCameraPreset('isometric')}
                className="text-[10px] font-mono text-[#7DD3FC] hover:underline"
              >
                Reset 8×16 Iso
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ENGINEERING_CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSetCameraPreset(preset.id)}
                  className="px-2 py-1.5 rounded-lg bg-[#1C1E28] hover:bg-[#262A38] border border-[#2B2F3E] text-left transition-colors"
                >
                  <div className="text-[11px] font-medium text-[#F3EFEA] truncate">
                    {preset.shortLabel}
                  </div>
                  <div className="text-[10px] font-mono text-[#8E95A5]">
                    Target [{preset.target.join(', ')}]
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 4 Functional Zones Cards */}
          <div className="space-y-2">
            {zoneCards.map((z) => {
              const IconComp = z.icon;
              return (
                <div
                  key={z.roleBadge}
                  className={`bg-[#14151B] border ${z.borderAccent} rounded-xl p-3 space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <IconComp className={`w-3.5 h-3.5 ${z.accent} shrink-0`} />
                      <span className="font-semibold text-[#F5F2EB] text-xs">{z.title}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#1B1E28] text-[10px] font-mono text-[#9CA3AF]">
                      {z.zone}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A3AAB8] leading-relaxed">{z.desc}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onSetCameraPreset(z.presetId)}
                      className="flex-1 py-1.5 px-2 rounded-md bg-[#1E2534] hover:bg-[#283246] border border-[#38BDF8]/40 text-[#7DD3FC] text-[11px] font-medium flex items-center justify-center gap-1"
                    >
                      <Focus className="w-3 h-3" />
                      <span>Focus Zone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectCatalogItem(z.catalogId)}
                      className="py-1.5 px-2.5 rounded-md bg-[#1C1E26] hover:bg-[#272A36] border border-[#2F3342] text-[#E5E0D8] text-[11px] font-medium"
                    >
                      Inspect Desk
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectCatalogItem(z.boardCatalogId)}
                      className="py-1.5 px-2.5 rounded-md bg-[#1C1E26] hover:bg-[#272A36] border border-[#2F3342] text-[#E5E0D8] text-[11px] font-medium"
                    >
                      Board
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Mandatory Monitor Orientation Verification */}
      {activeSubTab === 'monitors' && (
        <div className="bg-[#14151B] border border-[#34D399]/50 rounded-xl p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#6EE7B7] flex items-center gap-1.5">
              <MonitorCheck className="w-4 h-4" />
              <span>Monitor-to-Chair Orientation Verification</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#064E3B] text-[#6EE7B7] font-mono text-[10px] font-semibold">
              {monitorReport.allValid ? '6/6 PASS (dot > 0.7)' : 'CHECK'}
            </span>
          </div>
          <p className="text-[11px] text-[#9CA3AF] leading-snug">
            Every workstation monitor has ONE front emissive display plane facing the seated
            developer chair and ONE dark opaque rear casing (`dot(screenNormal, chairVector) &gt;
            0.7`).
          </p>
          <div className="space-y-1.5 font-mono text-[10px]">
            {monitorReport.results.map((m) => (
              <div
                key={m.id}
                className="p-2 rounded-lg bg-[#1A1C24] border border-[#262833] space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#F3EFEA] font-semibold">{m.id}</span>
                  <span className="text-[#6EE7B7]">
                    dot = {m.dotProduct} ({m.valid ? 'FACES CHAIR' : 'FAIL'})
                  </span>
                </div>
                <div className="text-[#8E95A5] font-sans text-[10px]">{m.label}</div>
                <div className="flex justify-between text-[#9CA3AF] pt-0.5">
                  <span>Front Mesh: {m.frontScreenMeshName}</span>
                  <span>Rear: {m.rearCasingMeshName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: 20 Room-Local Semantic Activity Anchors */}
      {activeSubTab === 'anchors' && (
        <div className="bg-[#14151B] border border-[#262833] rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-[#F5F2EB] text-xs">
                Engineering Studio Anchors ({anchorEntries.length})
              </div>
              <div className="text-[10px] text-[#8E95A5]">
                Room-local coordinates relative to [0,0,0] SW corner (`8×16`)
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ showSimulationAnchors: !config.showSimulationAnchors })
                }
                className={`px-2 py-1 rounded text-[10px] font-mono border ${
                  config.showSimulationAnchors
                    ? 'bg-[#0C2438] border-[#38BDF8] text-[#7DD3FC]'
                    : 'bg-[#1B1D26] border-[#262833] text-[#8E95A5]'
                }`}
              >
                3D Markers: {config.showSimulationAnchors ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={onResetEngineeringAnchors}
                title="Reset Engineering Anchors"
                className="p-1 rounded bg-[#1B1D26] hover:bg-[#262936] border border-[#262833] text-[#9CA3AF] hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Selected Anchor Editor */}
          {activeAnchor && (
            <div className="p-2.5 rounded-lg bg-[#1A1C24] border border-[#38BDF8]/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold text-[#7DD3FC]">
                  {activeAnchor.id}
                </span>
                <button
                  type="button"
                  onClick={() => onFocusAnchorPosition(activeAnchor.position)}
                  className="px-2 py-0.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#7DD3FC] text-[10px] flex items-center gap-1"
                >
                  <Focus className="w-3 h-3" />
                  <span>Focus 3D</span>
                </button>
              </div>
              <div className="text-[11px] text-[#D6D1C7]">{activeAnchor.description}</div>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                <div>
                  <span className="text-[#8E95A5] block">X (0..8)</span>
                  <input
                    type="number"
                    step="0.05"
                    min={0.2}
                    max={7.8}
                    value={activeAnchor.position[0]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateEngineeringAnchor(activeAnchor.id, {
                        ...activeAnchor,
                        position: [val, activeAnchor.position[1], activeAnchor.position[2]],
                      });
                    }}
                    className="w-full bg-[#121318] border border-[#2A2D3A] rounded px-1.5 py-1 text-[#F3EFEA]"
                  />
                </div>
                <div>
                  <span className="text-[#8E95A5] block">Z (0..16)</span>
                  <input
                    type="number"
                    step="0.05"
                    min={0.2}
                    max={15.8}
                    value={activeAnchor.position[2]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onUpdateEngineeringAnchor(activeAnchor.id, {
                        ...activeAnchor,
                        position: [activeAnchor.position[0], activeAnchor.position[1], val],
                      });
                    }}
                    className="w-full bg-[#121318] border border-[#2A2D3A] rounded px-1.5 py-1 text-[#F3EFEA]"
                  />
                </div>
                <div>
                  <span className="text-[#8E95A5] block">Zone</span>
                  <span className="block px-1.5 py-1 rounded bg-[#121318] border border-[#262833] text-[#6EE7B7] truncate">
                    {activeAnchor.zone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable List of 20 Anchors */}
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {anchorEntries.map((a) => {
              const isSel = activeAnchor?.id === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    onSelectEngineeringAnchor(a.id);
                    onFocusAnchorPosition(a.position);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                    isSel
                      ? 'bg-[#1E2636] border-[#38BDF8] text-[#F5F2EB]'
                      : 'bg-[#181A22] border-[#262833] text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] font-semibold text-[#E5E0D8] truncate">
                      {a.id}
                    </div>
                    <div className="text-[10px] text-[#8E95A5] truncate">
                      {a.zone} · {a.label}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#7DD3FC] shrink-0">
                    [{a.position[0]}, {a.position[2]}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Export Deliverables & Master Layout A3.1 Contract */}
      {activeSubTab === 'contracts' && (
        <div className="bg-[#14151B] border border-[#38BDF8]/50 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#F5F2EB] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
              <span>Engineering Studio V1 Deliverables</span>
            </span>
            <span className="font-mono text-[10px] text-[#6EE7B7]">ROOM-ONLY · A3.1</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onExportEngineeringRoomGLB}
              className="py-2 px-2.5 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-[#08121E] font-semibold text-[11px] flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>engineering_room.glb</span>
            </button>
            <button
              type="button"
              onClick={onExportEngineeringRoomJsonContracts}
              className="py-2 px-2.5 rounded-lg bg-[#1D2230] hover:bg-[#272E40] border border-[#38BDF8]/40 text-[#E5E0D8] font-medium text-[11px] flex items-center justify-center gap-1.5"
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
              <span>Manifest+Anchors+Behavior</span>
            </button>
            <button
              type="button"
              onClick={onExportEngineeringRoomPNG}
              className="py-2 px-2.5 rounded-lg bg-[#1D2230] hover:bg-[#272E40] border border-[#2F3546] text-[#E5E0D8] font-medium text-[11px] flex items-center justify-center gap-1.5"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
              <span>engineering_room.preview.png</span>
            </button>
            <button
              type="button"
              onClick={onExportOfficeLayoutA3_1Json}
              className="py-2 px-2.5 rounded-lg bg-[#1D2230] hover:bg-[#272E40] border border-[#6EE7B7]/40 text-[#A7F3D0] font-medium text-[11px] flex items-center justify-center gap-1.5"
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
              <span>office-layout-a3.1.json</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onDownloadEngineeringRoomPackZip}
            className="w-full py-2 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            <span>Download engineering_room_production_pack_v1.zip</span>
          </button>

          {/* Future Specialist Agent Actions Contract */}
          <div className="pt-2 border-t border-[#262833] space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-[#8E95A5]">
              Prepared Multi-Agent Behavior Contract ({ENGINEERING_FUTURE_ACTIONS_CONTRACT.length}{' '}
              Actions · Deferred to Next Stage)
            </div>
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {ENGINEERING_FUTURE_ACTIONS_CONTRACT.map((act) => (
                <div
                  key={act.action_id}
                  className="px-2 py-1.5 rounded bg-[#181A22] border border-[#262833] flex items-center justify-between gap-2 text-[10px]"
                >
                  <div>
                    <span className="font-semibold text-[#E5E0D8]">{act.label}</span>
                    <span className="text-[#8E95A5] ml-1.5 font-mono">({act.agent_role})</span>
                  </div>
                  <span className="font-mono text-[#7DD3FC]">{act.target_anchor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
