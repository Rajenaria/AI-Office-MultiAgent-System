import React, { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Compass,
  Download,
  FileCode2,
  Focus,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Palette,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_UIUX_ANCHORS,
  UIUXActivityAnchor,
  UIUXAnchorId,
  UIUX_CAMERA_PRESETS,
  UIUX_FURNITURE_CATALOG,
  UIUX_FUTURE_ACTIONS_CONTRACT,
  UIUX_MODULE_CONSTANTS,
} from '../domain/uiuxRoomSpec';
import {
  UIUXActionId,
  UIUXAnimationPlaybackCommand,
  UIUXExpressionId,
  UIUXRuntimeStatusSnapshot,
  UIUXSpeedMultiplier,
} from '../domain/uiuxSimulationSpec';
import { RoomModuleKey } from '../domain/officeLayoutA3Spec';
import { ViewerDisplayConfig } from './ModularRoomCanvas';
import { UIUXSimulationPanel } from './UIUXSimulationPanel';

interface UIUXRoomInspectorSectionProps {
  config: ViewerDisplayConfig;
  uiuxStatus: UIUXRuntimeStatusSnapshot;
  uiuxAnchors: Record<UIUXAnchorId, UIUXActivityAnchor>;
  selectedUIUXAnchorId: UIUXAnchorId | null;
  onUpdateConfig: (partial: Partial<ViewerDisplayConfig>) => void;
  onTriggerUIUXAction: (actionId: UIUXActionId) => void;
  onUIUXPlaybackCommand: (cmd: UIUXAnimationPlaybackCommand) => void;
  onSetUIUXSpeed: (speed: UIUXSpeedMultiplier) => void;
  onToggleUIUXPatrol: (enabled: boolean) => void;
  onStartUIUXAutoDemo: () => void;
  onStopUIUXAutoDemo: () => void;
  onSetUIUXExpression: (expr: UIUXExpressionId) => void;
  onSetUIUXGlassesVisible: (visible: boolean) => void;
  onFocusUIUXCharacter: () => void;
  onReturnToRoomView: () => void;
  onDownloadUIUXCharacterGlb: () => void;
  onDownloadUIUXCharacterManifestAndBehavior: () => void;
  onDownloadUIUXCharacterPreviewPng: () => void;
  onDownloadUIUXCharacterPackZip: () => void;
  onSelectUIUXAnchor: (anchorId: UIUXAnchorId) => void;
  onUpdateUIUXAnchor: (anchorId: UIUXAnchorId, updated: UIUXActivityAnchor) => void;
  onResetUIUXAnchors: () => void;
  onFocusAnchorPosition: (pos: [number, number, number]) => void;
  onSetCameraPreset: (presetId: string) => void;
  onExportUIUXRoomGLB: () => void;
  onExportUIUXRoomJsonContracts: () => void;
  onExportUIUXRoomPNG: () => void;
  onDownloadUIUXRoomPackZip: () => void;
  onSelectCatalogItem: (catalogId: string | null) => void;
  onSelectRoomKey: (roomKey: RoomModuleKey) => void;
}

export const UIUXRoomInspectorSection: React.FC<UIUXRoomInspectorSectionProps> = ({
  config,
  uiuxStatus,
  uiuxAnchors,
  selectedUIUXAnchorId,
  onUpdateConfig,
  onTriggerUIUXAction,
  onUIUXPlaybackCommand,
  onSetUIUXSpeed,
  onToggleUIUXPatrol,
  onStartUIUXAutoDemo,
  onStopUIUXAutoDemo,
  onSetUIUXExpression,
  onSetUIUXGlassesVisible,
  onFocusUIUXCharacter,
  onReturnToRoomView,
  onDownloadUIUXCharacterGlb,
  onDownloadUIUXCharacterManifestAndBehavior,
  onDownloadUIUXCharacterPreviewPng,
  onDownloadUIUXCharacterPackZip,
  onSelectUIUXAnchor,
  onUpdateUIUXAnchor,
  onResetUIUXAnchors,
  onFocusAnchorPosition,
  onSetCameraPreset,
  onExportUIUXRoomGLB,
  onExportUIUXRoomJsonContracts,
  onExportUIUXRoomPNG,
  onDownloadUIUXRoomPackZip,
  onSelectCatalogItem,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'zones' | 'anchors' | 'contracts'>('zones');

  const activeAnchor =
    (selectedUIUXAnchorId && uiuxAnchors[selectedUIUXAnchorId]) ||
    uiuxAnchors.UIUX_DESK_WORK;

  const zoneSummaries = [
    {
      zone: 'Zone A',
      title: 'Primary Design Workstation',
      presetId: 'uiux_desk_focus',
      catalogId: 'UIUX_Primary_Workstation',
      accent: 'text-[#6EE7B7]',
      desc: 'L-shaped pale-birch studio desk, 5K UI canvas monitor, angled Wacom pen display + stylus, pastel keyboard, Pantone fan deck, & sage task chair.',
    },
    {
      zone: 'Zone B',
      title: 'Wireframe / UX Flow Wall',
      presetId: 'uiux_wireframe_wall',
      catalogId: 'UIUX_Wireframe_Flow_Wall',
      accent: 'text-[#7DD3FC]',
      desc: 'West wall UX journey pinboard with 3D mobile/desktop screen cards, flow connectors, & 10 raised sticky notes (DEMO / CONCEPT).',
    },
    {
      zone: 'Zone C',
      title: 'Visual Design / Style Board',
      presetId: 'uiux_style_board',
      catalogId: 'UIUX_Style_System_Board',
      accent: 'text-[#C4B5FD]',
      desc: 'North-West Design System board with 12 raised 3D color swatch tiles, typography specimens, & UI button token cards (DEMO / CONCEPT).',
    },
    {
      zone: 'Zone D',
      title: 'Prototype Critique & Easel Area',
      presetId: 'uiux_critique_area',
      catalogId: 'UIUX_Prototype_Review_Table',
      accent: 'text-[#FBBF24]',
      desc: 'Collaborative round birch table with 2 bouclé stools, interactive tablet stand, & rolling A-frame Mobile Prototype Critique Stand.',
    },
    {
      zone: 'Zone E',
      title: 'Material & Reference Shelf',
      presetId: 'uiux_shelf_closeup',
      catalogId: 'UIUX_Material_Storage_Shelf',
      accent: 'text-[#FCA5A5]',
      desc: 'Asymmetric Nordic birch & sage open-cubby shelf with UX books, Pantone binders, material sample boxes, & rolled blueprint tubes.',
    },
    {
      zone: 'Zone F',
      title: 'Cozy Studio Rug, Pouf & Plants',
      presetId: 'isometric',
      catalogId: 'UIUX_Studio_Rug',
      accent: 'text-[#A7F3D0]',
      desc: 'Woven geometric color-block rug, sculpted dusty-lavender bouclé pouf, Nordic tripod floor lamp, & ribbed sage/coral planters.',
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* UI/UX Designer Character & Simulation Controls */}
      <UIUXSimulationPanel
        status={uiuxStatus}
        onTriggerAction={onTriggerUIUXAction}
        onPlaybackCommand={onUIUXPlaybackCommand}
        onSetSpeed={onSetUIUXSpeed}
        onTogglePatrol={onToggleUIUXPatrol}
        onStartAutoDemo={onStartUIUXAutoDemo}
        onStopAutoDemo={onStopUIUXAutoDemo}
        onSetExpression={onSetUIUXExpression}
        onSetGlassesVisible={onSetUIUXGlassesVisible}
        onFocusCharacter={onFocusUIUXCharacter}
        onReturnToRoomView={onReturnToRoomView}
        onDownloadCharacterGlb={onDownloadUIUXCharacterGlb}
        onDownloadCharacterManifestAndBehavior={onDownloadUIUXCharacterManifestAndBehavior}
        onDownloadCharacterPreviewPng={onDownloadUIUXCharacterPreviewPng}
        onDownloadCharacterPackZip={onDownloadUIUXCharacterPackZip}
      />

      {/* Studio Header Card */}
      <div className="bg-[#14151B] border border-[#14B8A6]/40 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-[#5EEAD4] shrink-0" />
            <span className="font-semibold text-[#F5F2EB] text-xs">
              {UIUX_MODULE_CONSTANTS.DISPLAY_NAME}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#0F2A28] border border-[#14B8A6]/50 text-[#99F6E4] font-mono text-[10px] font-semibold">
            MODULE 03 · READY
          </span>
        </div>

        <p className="text-[11px] text-[#A3AAB8] leading-relaxed">
          Bright creative product-design & prototyping studio (`8 × 8` units) with pale birch
          worksurfaces, muted sage & dusty-lavender accents, 3D wireframe flow wall, and 3D color
          swatch tokens.
        </p>

        <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[10px]">
          <div className="bg-[#1B1D26] border border-[#262833] rounded px-2 py-1">
            <span className="text-[#8E95A5] block">Module ID</span>
            <span className="text-[#E5E0D8]">{UIUX_MODULE_CONSTANTS.MODULE_ID}</span>
          </div>
          <div className="bg-[#1B1D26] border border-[#262833] rounded px-2 py-1">
            <span className="text-[#8E95A5] block">Root / A3 Offset</span>
            <span className="text-[#5EEAD4]">
              {UIUX_MODULE_CONSTANTS.ROOT_NODE_NAME} · [24, 0, 18]
            </span>
          </div>
        </div>

        {/* Character + Studio Active Notice */}
        <div className="bg-[#102624] border border-[#14B8A6]/40 rounded-lg p-2.5 text-[11px] text-[#CCFBF1] leading-snug flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#5EEAD4] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Studio + UI/UX Designer Active:</span>{' '}
            `uiux_designer_agent` is integrated across 10 room-local anchors with 15 embedded clips
            and 8 expressions while keeping `uiux_room.glb` 100% character-free.
          </div>
        </div>
      </div>

      {/* Sub-navigation for Zones / Anchors / Future Contracts */}
      <div className="grid grid-cols-3 gap-1 bg-[#14151B] p-1 rounded-lg border border-[#262833]">
        <button
          type="button"
          onClick={() => setActiveSubTab('zones')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeSubTab === 'zones'
              ? 'bg-[#8B5CF6] text-[#0F172A] font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>6 Zones</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('anchors')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeSubTab === 'anchors'
              ? 'bg-[#8B5CF6] text-[#0F172A] font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>10 Anchors</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('contracts')}
          className={`py-1.5 px-2 rounded-md text-[11px] font-medium transition-colors flex items-center justify-center gap-1 ${
            activeSubTab === 'contracts'
              ? 'bg-[#8B5CF6] text-[#0F172A] font-semibold'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Contracts</span>
        </button>
      </div>

      {/* TAB 1: 6 CREATIVE STUDIO ZONES & CAMERA FOCUS */}
      {activeSubTab === 'zones' && (
        <div className="space-y-3">
          {/* Quick Camera Focus Bar */}
          <div className="bg-[#14151B] border border-[#262833] rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#D6D1C7]">
                Studio Camera Presets
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ showSimulationAnchors: !config.showSimulationAnchors })
                }
                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                  config.showSimulationAnchors
                    ? 'bg-[#2E1065] border-[#A78BFA] text-[#DDD6FE]'
                    : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
                }`}
              >
                Anchors: {config.showSimulationAnchors ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {UIUX_CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSetCameraPreset(preset.id)}
                  className="px-2.5 py-1.5 rounded-md bg-[#1B1D26] hover:bg-[#262936] border border-[#2E3242] hover:border-[#A78BFA] text-[#E5E0D8] text-[11px] font-medium text-left truncate transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Functional Studio Zones */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-[#D6D1C7]">
              6 Required Creative Studio Zones ({UIUX_FURNITURE_CATALOG.length} Assemblies)
            </div>
            {zoneSummaries.map((z) => (
              <div
                key={z.zone}
                className="bg-[#14151B] border border-[#262833] hover:border-[#3A3E50] rounded-lg p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className={`font-mono text-[10px] font-bold ${z.accent}`}>
                      {z.zone}
                    </span>
                    <span className="text-[#F5F2EB] font-semibold ml-1.5">{z.title}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCatalogItem(z.catalogId);
                        onSetCameraPreset(z.presetId);
                      }}
                      className="px-2 py-1 rounded bg-[#1F222D] hover:bg-[#2C303F] border border-[#323646] text-[#DDD6FE] text-[10px] font-medium flex items-center gap-1"
                    >
                      <Focus className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-snug">{z.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 10 ROOM-LOCAL ACTIVITY ANCHORS */}
      {activeSubTab === 'anchors' && (
        <div className="space-y-3">
          <div className="bg-[#14151B] border border-[#262833] rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#D6D1C7]">
                10 Room-Local Activity Anchors
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({ showSimulationAnchors: !config.showSimulationAnchors })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    config.showSimulationAnchors
                      ? 'bg-[#064E3B] border-[#10B981] text-[#6EE7B7]'
                      : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
                  }`}
                >
                  Gizmos: {config.showSimulationAnchors ? 'VISIBLE' : 'HIDDEN'}
                </button>
                <button
                  type="button"
                  onClick={onResetUIUXAnchors}
                  title="Reset UI/UX Anchors to Default"
                  className="p-1 rounded bg-[#1F222D] hover:bg-[#2A2E3D] text-[#9CA3AF] hover:text-white border border-[#2E3242]"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {(Object.keys(DEFAULT_UIUX_ANCHORS) as UIUXAnchorId[]).map((id) => {
                const a = uiuxAnchors[id];
                const isSelected = selectedUIUXAnchorId === id;
                return (
                  <div
                    key={id}
                    className={`p-2 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-[#251E38] border-[#A78BFA]'
                        : 'bg-[#191B22] border-[#262833] hover:border-[#373B4C]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectUIUXAnchor(id);
                        onUpdateConfig({ showSimulationAnchors: true });
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="font-mono text-[11px] font-semibold text-[#F5F2EB] truncate">
                        {a.id}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] truncate">
                        {a.label} · Local [{a.position.join(', ')}] · {a.posture}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectUIUXAnchor(id);
                        onUpdateConfig({ showSimulationAnchors: true });
                        onFocusAnchorPosition(a.position);
                      }}
                      className="px-2 py-1 rounded bg-[#14151B] hover:bg-[#262936] border border-[#2E3242] text-[#C4B5FD] text-[10px] font-medium shrink-0"
                    >
                      Focus
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Active Anchor Fine-Tuning Readout */}
            {activeAnchor && (
              <div className="pt-2 border-t border-[#262833] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-[#C4B5FD]">
                    {activeAnchor.id}
                  </span>
                  <span className="font-mono text-[10px] text-[#8E95A5]">
                    Global A3: [{(activeAnchor.position[0] + 24).toFixed(2)}, 0,{' '}
                    {(activeAnchor.position[2] + 18).toFixed(2)}]
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <label className="bg-[#191B22] border border-[#262833] rounded p-1.5">
                    <span className="text-[#8E95A5] block">Local X (0..8)</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.4"
                      max="7.6"
                      value={activeAnchor.position[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          onUpdateUIUXAnchor(activeAnchor.id, {
                            ...activeAnchor,
                            position: [val, activeAnchor.position[1], activeAnchor.position[2]],
                          });
                        }
                      }}
                      className="w-full bg-transparent text-[#F5F2EB] mt-0.5 focus:outline-none"
                    />
                  </label>
                  <label className="bg-[#191B22] border border-[#262833] rounded p-1.5">
                    <span className="text-[#8E95A5] block">Local Z (0..8)</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0.3"
                      max="7.6"
                      value={activeAnchor.position[2]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          onUpdateUIUXAnchor(activeAnchor.id, {
                            ...activeAnchor,
                            position: [activeAnchor.position[0], activeAnchor.position[1], val],
                          });
                        }
                      }}
                      className="w-full bg-transparent text-[#F5F2EB] mt-0.5 focus:outline-none"
                    />
                  </label>
                  <label className="bg-[#191B22] border border-[#262833] rounded p-1.5">
                    <span className="text-[#8E95A5] block">Facing (rad)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={Number(activeAnchor.facingRad.toFixed(2))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!Number.isNaN(val)) {
                          onUpdateUIUXAnchor(activeAnchor.id, {
                            ...activeAnchor,
                            facingRad: val,
                          });
                        }
                      }}
                      className="w-full bg-transparent text-[#F5F2EB] mt-0.5 focus:outline-none"
                    />
                  </label>
                </div>
                <div className="text-[10px] text-[#9CA3AF] leading-snug">
                  {activeAnchor.description}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: FUTURE DESIGNER BEHAVIOR CONTRACTS & CONNECTOR SPEC */}
      {activeSubTab === 'contracts' && (
        <div className="space-y-3">
          <div className="bg-[#14151B] border border-[#262833] rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#D6D1C7]">
                Connector & Boundary Contract
              </span>
              <span className="text-[10px] font-mono text-[#6EE7B7]">VERIFIED</span>
            </div>
            <div className="p-2 rounded bg-[#191B22] border border-[#262833] space-y-1 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#8E95A5]">Primary Connector</span>
                <span className="text-[#6EE7B7]">UIUX_CONNECTOR_SOUTH [4, 0, 0]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E95A5]">Global Corridor Link</span>
                <span className="text-[#F5F2EB]">[28, 0, 18] → SHARED_CORRIDOR_ROOT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E95A5]">West Wall (X = 0)</span>
                <span className="text-[#C4B5FD]">Solid Gallery Wall (Abuts CEO East)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#14151B] border border-[#262833] rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#D6D1C7]">
                Future UI/UX Designer Actions ({UIUX_FUTURE_ACTIONS_CONTRACT.length})
              </span>
              <span className="text-[10px] font-mono text-[#C4B5FD]">uiux-room.behavior.json</span>
            </div>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {UIUX_FUTURE_ACTIONS_CONTRACT.map((act) => (
                <div
                  key={act.id}
                  className="p-2 rounded bg-[#191B22] border border-[#262833] space-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-[#F5F2EB]">
                      {act.code} — {act.label}
                    </span>
                    <span className="font-mono text-[10px] text-[#A78BFA]">
                      → {act.targetAnchorId}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] leading-snug">{act.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Production Asset Export Card */}
      <div className="bg-[#14151B] border border-[#8B5CF6]/50 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>UI/UX Studio Production Exports</span>
          </span>
          <span className="font-mono text-[10px] text-[#C4B5FD]">Local [0,0,0]</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportUIUXRoomGLB}
            className="px-2.5 py-2 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-[#0F172A] text-[11px] font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export uiux_room.glb</span>
          </button>
          <button
            type="button"
            onClick={onExportUIUXRoomJsonContracts}
            className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#323646] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
            <span>Manifest + Anchors</span>
          </button>
          <button
            type="button"
            onClick={onExportUIUXRoomPNG}
            className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#323646] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
            <span>uiux_room.preview.png</span>
          </button>
          <button
            type="button"
            onClick={onDownloadUIUXRoomPackZip}
            className="px-2.5 py-2 rounded-md bg-[#251E38] hover:bg-[#32284B] border border-[#8B5CF6]/60 text-[#DDD6FE] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Archive className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
            <span>UI/UX Pack .zip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
