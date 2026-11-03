import React, { useState } from 'react';
import {
  Archive,
  Building2,
  Compass,
  Cpu,
  Download,
  Eye,
  FileCode2,
  Focus,
  Image as ImageIcon,
  Layers,
  MapPin,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  CEOActivityAnchor,
  CEOAnchorId,
  CEO_DEMO_TELEMETRY,
  CEO_FUTURE_ACTIONS_CONTRACT,
  CEO_MODULE_CONSTANTS,
} from '../domain/ceoRoomSpec';
import {
  OFFICE_A3_CONSTANTS,
  OFFICE_COMMON_AREAS,
  OFFICE_ROOM_LIST,
  OfficeRoomRegistryEntry,
  RoomModuleKey,
  getRoomModuleByKey,
} from '../domain/officeLayoutA3Spec';
import { ViewerDisplayConfig } from './ModularRoomCanvas';
import { CEOSimulationPanel } from './CEOSimulationPanel';
import { CEORuntimeStatus } from '../three/CEOCharacterSystem';
import {
  CEOActionId,
  CEOExpressionId,
  CEOPlaybackCommand,
} from '../domain/ceoSimulationSpec';

interface CEORoomInspectorSectionProps {
  config: ViewerDisplayConfig;
  ceoStatus: CEORuntimeStatus;
  ceoAnchors: Record<CEOAnchorId, CEOActivityAnchor>;
  selectedCEOAnchorId: CEOAnchorId | null;
  onUpdateConfig: (partial: Partial<ViewerDisplayConfig>) => void;
  onTriggerCEOAction: (actionId: CEOActionId) => void;
  onCEOPlaybackCommand: (cmd: CEOPlaybackCommand) => void;
  onSetCEOSpeed: (speed: number) => void;
  onToggleCEOPatrol: (enabled: boolean) => void;
  onStartCEOAutoDemo: () => void;
  onStopCEOAutoDemo: () => void;
  onSetCEOExpression: (expr: CEOExpressionId) => void;
  onSetCEOGlassesVisible: (visible: boolean) => void;
  onFocusCEOCharacter: () => void;
  onReturnToRoomView: () => void;
  onDownloadCEOCharacterGlb: () => void;
  onDownloadCEOCharacterManifestAndBehavior: () => void;
  onDownloadCEOCharacterPreviewPng: () => void;
  onDownloadCEOCharacterPackZip: () => void;
  onSelectCEOAnchor: (anchorId: CEOAnchorId) => void;
  onUpdateCEOAnchor: (anchorId: CEOAnchorId, updated: CEOActivityAnchor) => void;
  onResetCEOAnchors: () => void;
  onFocusAnchorPosition: (pos: [number, number, number]) => void;
  onSetCameraPreset: (presetId: string) => void;
  onExportCEORoomGLB: () => void;
  onExportCEORoomJsonContracts: () => void;
  onExportCEORoomPNG: () => void;
  onDownloadCEORoomPackZip: () => void;
  onExportOfficeLayoutA3Json: () => void;
  onSelectRoomKey: (roomKey: RoomModuleKey) => void;
}

export const CEORoomInspectorSection: React.FC<CEORoomInspectorSectionProps> = ({
  config,
  ceoStatus,
  ceoAnchors,
  selectedCEOAnchorId,
  onUpdateConfig,
  onTriggerCEOAction,
  onCEOPlaybackCommand,
  onSetCEOSpeed,
  onToggleCEOPatrol,
  onStartCEOAutoDemo,
  onStopCEOAutoDemo,
  onSetCEOExpression,
  onSetCEOGlassesVisible,
  onFocusCEOCharacter,
  onReturnToRoomView,
  onDownloadCEOCharacterGlb,
  onDownloadCEOCharacterManifestAndBehavior,
  onDownloadCEOCharacterPreviewPng,
  onDownloadCEOCharacterPackZip,
  onSelectCEOAnchor,
  onUpdateCEOAnchor,
  onResetCEOAnchors,
  onFocusAnchorPosition,
  onSetCameraPreset,
  onExportCEORoomGLB,
  onExportCEORoomJsonContracts,
  onExportCEORoomPNG,
  onDownloadCEORoomPackZip,
  onExportOfficeLayoutA3Json,
  onSelectRoomKey,
}) => {
  const [subTab, setSubTab] = useState<'ceo_agent' | 'brain' | 'anchors' | 'behavior' | 'a3_layout'>('ceo_agent');
  const activeAnchor = selectedCEOAnchorId ? ceoAnchors[selectedCEOAnchorId] : null;
  const anchorList = Object.values(ceoAnchors);

  return (
    <div className="space-y-3.5">
      {/* CEO Executive Brain + Character Production Card */}
      <div className="p-3 rounded-lg bg-[#141A18] border border-[#10B981]/50 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#6EE7B7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#34D399]" />
            <span>CEO Executive Brain Office</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[#064E3B] text-[#A7F3D0] font-mono text-[10px] font-semibold">
            CEO AGENT · READY
          </span>
        </div>
        <p className="text-[11px] text-[#D1FAE5]/90 leading-relaxed">
          <strong>CEO Character & Animation Production V1:</strong> Senior Executive Assistant /
          Chief of Staff (<code className="text-[#A7F3D0]">ceo_executive_assistant</code>) active in
          room with 14 executive animations, open-frame eyeglasses, gray hair highlights, emerald
          necktie, and green-lanyard ID card.
        </p>
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#6EE7B7]">
          <span>Room: {CEO_MODULE_CONSTANTS.MODULE_ID}</span>
          <span>Agent: ceo_executive_assistant (1.725u)</span>
        </div>
      </div>

      {/* Sub-Navigation Pills for CEO Room */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-[#14151B] rounded-lg border border-[#262833]">
        {(
          [
            { id: 'ceo_agent', label: 'CEO Agent (14)' },
            { id: 'brain', label: 'Brain UI' },
            { id: 'anchors', label: 'Anchors (11)' },
            { id: 'behavior', label: 'Contract' },
            { id: 'a3_layout', label: 'A3 Layout' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`py-1.5 px-1 rounded text-[10px] font-medium transition-colors whitespace-nowrap ${
              subTab === tab.id
                ? 'bg-[#10B981] text-[#0B1310] font-semibold'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 0: CEO AGENT — SIMULASI EKSEKUTIF (14 ACTIONS + EXPRESSIONS + GLB EXPORT) */}
      {subTab === 'ceo_agent' && (
        <CEOSimulationPanel
          ceoStatus={ceoStatus}
          onTriggerCEOAction={onTriggerCEOAction}
          onCEOPlaybackCommand={onCEOPlaybackCommand}
          onSetCEOSpeed={onSetCEOSpeed}
          onToggleCEOPatrol={onToggleCEOPatrol}
          onStartCEOAutoDemo={onStartCEOAutoDemo}
          onStopCEOAutoDemo={onStopCEOAutoDemo}
          onSetCEOExpression={onSetCEOExpression}
          onSetCEOGlassesVisible={onSetCEOGlassesVisible}
          onFocusCEOCharacter={onFocusCEOCharacter}
          onReturnToRoomView={onReturnToRoomView}
          onDownloadCEOCharacterGlb={onDownloadCEOCharacterGlb}
          onDownloadCEOCharacterManifestAndBehavior={onDownloadCEOCharacterManifestAndBehavior}
          onDownloadCEOCharacterPreviewPng={onDownloadCEOCharacterPreviewPng}
          onDownloadCEOCharacterPackZip={onDownloadCEOCharacterPackZip}
        />
      )}

      {/* TAB 1: EXECUTIVE BRAIN CONSOLE & COMPUTER DEMO TELEMETRY */}
      {subTab === 'brain' && (
        <div className="space-y-3">
          {/* Quick Camera Focus Buttons for CEO Zones */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onSetCameraPreset('ceo_desk_closeup')}
              className="px-2.5 py-2 rounded-lg bg-[#1E222D] hover:bg-[#272C3A] border border-[#32384A] text-xs font-medium text-[#F3EFEA] flex items-center justify-center gap-1.5"
            >
              <Focus className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Focus CEO Desk</span>
            </button>
            <button
              type="button"
              onClick={() => onSetCameraPreset('brain_console_closeup')}
              className="px-2.5 py-2 rounded-lg bg-[#1E222D] hover:bg-[#272C3A] border border-[#10B981]/50 text-xs font-medium text-[#6EE7B7] flex items-center justify-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Focus Brain Console</span>
            </button>
            <button
              type="button"
              onClick={() => onSetCameraPreset('report_review_closeup')}
              className="px-2.5 py-2 rounded-lg bg-[#1E222D] hover:bg-[#272C3A] border border-[#32384A] text-xs font-medium text-[#F3EFEA] flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Focus Report Table</span>
            </button>
            <button
              type="button"
              onClick={() => onSetCameraPreset('strategy_cabinet_closeup')}
              className="px-2.5 py-2 rounded-lg bg-[#1E222D] hover:bg-[#272C3A] border border-[#32384A] text-xs font-medium text-[#F3EFEA] flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-[#7DD3FC]" />
              <span>Focus Strategy Wall</span>
            </button>
          </div>

          {/* Executive Computer Station Demo Telemetry */}
          <div className="p-3 rounded-lg bg-[#14151B] border border-[#262833] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F5F2EB]">
                Executive Computer Station
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#1E293B] text-[#FBBF24] font-mono text-[10px] font-semibold">
                {CEO_DEMO_TELEMETRY.dataClassification}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              <div className="p-2 rounded bg-[#191B22] border border-[#262833] flex justify-between">
                <span className="text-[#8E95A5]">Active Projects</span>
                <span className="text-[#6EE7B7] font-semibold">
                  {CEO_DEMO_TELEMETRY.activeProjects}
                </span>
              </div>
              <div className="p-2 rounded bg-[#191B22] border border-[#262833] flex justify-between">
                <span className="text-[#8E95A5]">PM Reports</span>
                <span className="text-[#7DD3FC] font-semibold">{CEO_DEMO_TELEMETRY.pmReports}</span>
              </div>
              <div className="p-2 rounded bg-[#191B22] border border-[#262833] flex justify-between">
                <span className="text-[#8E95A5]">Pending Approval</span>
                <span className="text-[#FBBF24] font-semibold">
                  {CEO_DEMO_TELEMETRY.pendingApprovals}
                </span>
              </div>
              <div className="p-2 rounded bg-[#191B22] border border-[#262833] flex justify-between">
                <span className="text-[#8E95A5]">Weekly Summary</span>
                <span className="text-[#A7F3D0] font-semibold">
                  {CEO_DEMO_TELEMETRY.weeklySummaryStatus}
                </span>
              </div>
            </div>
            <div className="p-2 rounded bg-[#191B22] border border-[#262833] flex items-center justify-between font-mono text-[11px]">
              <span className="text-[#8E95A5]">Telegram Executive Digest</span>
              <span className="text-[#FDE68A]">{CEO_DEMO_TELEMETRY.telegramReportStatus}</span>
            </div>
          </div>

          {/* 7-Panel Executive Brain Console Readout */}
          <div className="p-3 rounded-lg bg-[#14151B] border border-[#262833] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#F5F2EB]">
                7-Panel Executive Brain Console
              </span>
              <span className="text-[10px] font-mono text-[#6EE7B7]">SIMULATED / DEMO DATA</span>
            </div>
            <div className="space-y-1.5">
              {CEO_DEMO_TELEMETRY.consolePanels.map((panel) => (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => onSetCameraPreset('brain_console_closeup')}
                  className="w-full text-left p-2 rounded-md bg-[#191B22] hover:bg-[#222530] border border-[#262833] transition-colors flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-medium text-[#E5E0D8]">{panel.title}</div>
                    <div className="text-[10px] text-[#8E95A5] font-mono">{panel.summary}</div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#6EE7B7] shrink-0">
                    {panel.value}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 11 CEO ROOM NAVIGATION ANCHORS */}
      {subTab === 'anchors' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#D6D1C7]">
              CEO Navigation Anchors ({anchorList.length})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ showSimulationAnchors: !config.showSimulationAnchors })
                }
                className={`px-2 py-1 rounded text-[11px] font-mono border ${
                  config.showSimulationAnchors
                    ? 'bg-[#064E3B] border-[#10B981] text-[#A7F3D0]'
                    : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
                }`}
              >
                3D Markers: {config.showSimulationAnchors ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={onResetCEOAnchors}
                className="p-1 rounded bg-[#191B22] hover:bg-[#252834] border border-[#262833] text-[#9CA3AF] hover:text-white"
                title="Reset CEO Anchors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {activeAnchor && (
            <div className="p-3 rounded-lg bg-[#14151B] border border-[#10B981]/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#6EE7B7] text-[11px]">
                  {activeAnchor.id}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateConfig({ showSimulationAnchors: true });
                    onFocusAnchorPosition(activeAnchor.position);
                  }}
                  className="px-2 py-0.5 rounded bg-[#10B981] text-[#0B1310] font-semibold text-[10px] flex items-center gap-1"
                >
                  <Focus className="w-3 h-3" />
                  <span>Focus Anchor</span>
                </button>
              </div>
              <div className="text-[11px] text-[#9CA3AF]">{activeAnchor.description}</div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                <label className="space-y-0.5">
                  <span className="text-[#8E95A5] block text-[10px]">Local X (0..8)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.3"
                    max="7.7"
                    value={activeAnchor.position[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val)) {
                        onUpdateCEOAnchor(activeAnchor.id, {
                          ...activeAnchor,
                          position: [val, 0, activeAnchor.position[2]],
                        });
                      }
                    }}
                    className="w-full px-2 py-1 rounded bg-[#191B22] border border-[#2E3240] text-[#F3EFEA]"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[#8E95A5] block text-[10px]">Local Z (0..8)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.3"
                    max="7.7"
                    value={activeAnchor.position[2]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val)) {
                        onUpdateCEOAnchor(activeAnchor.id, {
                          ...activeAnchor,
                          position: [activeAnchor.position[0], 0, val],
                        });
                      }
                    }}
                    className="w-full px-2 py-1 rounded bg-[#191B22] border border-[#2E3240] text-[#F3EFEA]"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-[#8E95A5] block text-[10px]">Facing (rad)</span>
                  <input
                    type="number"
                    step="0.15"
                    value={activeAnchor.facingRad}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (!Number.isNaN(val)) {
                        onUpdateCEOAnchor(activeAnchor.id, {
                          ...activeAnchor,
                          facingRad: val,
                        });
                      }
                    }}
                    className="w-full px-2 py-1 rounded bg-[#191B22] border border-[#2E3240] text-[#F3EFEA]"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="space-y-1 max-h-68 overflow-y-auto pr-1">
            {anchorList.map((anc) => {
              const isSel = selectedCEOAnchorId === anc.id;
              return (
                <button
                  key={anc.id}
                  type="button"
                  onClick={() => {
                    onSelectCEOAnchor(anc.id);
                    onUpdateConfig({ showSimulationAnchors: true });
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                    isSel
                      ? 'bg-[#1D2825] border-[#10B981] text-[#F5F2EB]'
                      : 'bg-[#191B22] border-[#262833] text-[#D1D5DB] hover:border-[#3B4254]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold font-mono truncate flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#34D399] shrink-0" />
                      <span>{anc.id}</span>
                    </div>
                    <div className="text-[11px] text-[#8E95A5] truncate">{anc.label}</div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#6EE7B7] shrink-0">
                    [{anc.position[0]}, 0, {anc.position[2]}]
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FUTURE CEO ROOM BEHAVIOR CONTRACT (METADATA ONLY) */}
      {subTab === 'behavior' && (
        <div className="space-y-2.5">
          <div className="p-2.5 rounded-lg bg-[#191B22] border border-[#F59E0B]/40 text-[11px] text-[#FDE68A] leading-snug">
            <strong>Future Behavior Contract (`ceo_room.behavior.json`):</strong> Metadata-only
            action definitions prepared for a future Executive Assistant / AI Chief of Staff
            character. No character is instantiated inside the CEO Room in this milestone.
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {CEO_FUTURE_ACTIONS_CONTRACT.map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-lg bg-[#14151B] border border-[#262833] space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#F5F2EB]">{act.label}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1E293B] text-[#7DD3FC] font-mono text-[10px]">
                    {act.targetAnchorId}
                  </span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] leading-snug">{act.description}</div>
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#6EE7B7]">
                  <span>Code: {act.code}</span>
                  <span className="truncate ml-2">{act.simulatedScreenStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER FLOOR PLAN A3 OVERVIEW */}
      {subTab === 'a3_layout' && (
        <div className="space-y-2.5">
          <div className="p-2.5 rounded-lg bg-[#14151B] border border-[#262833] space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[#F5F2EB] font-semibold">
              <span>Master Floor Plan A3</span>
              <span className="text-[#6EE7B7]">
                {OFFICE_A3_CONSTANTS.TOTAL_WIDTH_X}×{OFFICE_A3_CONSTANTS.TOTAL_DEPTH_Z} Units
              </span>
            </div>
            <div className="text-[10px] text-[#9CA3AF] font-sans">
              PM Room at [8, 0, 18] connects directly via East Doorway [16, 0, 22] to CEO Office at
              [16, 0, 18], and both open South onto the Shared Corridor (Z = 16..18) and 16×16 Open
              Central Collaboration Hub.
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig({
                  officeViewMode:
                    config.officeViewMode === 'full_office' ? 'single_room' : 'full_office',
                })
              }
              className="w-full mt-1 py-1.5 px-2.5 rounded bg-[#262936] hover:bg-[#313546] border border-[#D99252]/50 text-[#FBBF24] text-xs font-sans font-semibold flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>
                {config.officeViewMode === 'full_office'
                  ? 'Switch to Single Room View (8×8)'
                  : 'Inspect Full Office Preview (32×26)'}
              </span>
            </button>
          </div>

          <div className="space-y-1">
            {OFFICE_ROOM_LIST.map((rm) => (
              <button
                key={rm.key}
                type="button"
                onClick={() => onSelectRoomKey(rm.key)}
                className={`w-full text-left px-2.5 py-1.5 rounded border text-xs flex items-center justify-between ${
                  config.selectedRoomKey === rm.key
                    ? 'bg-[#262936] border-[#D99252] text-white'
                    : 'bg-[#191B22] border-[#262833] text-[#9CA3AF] hover:text-white'
                }`}
              >
                <span className="truncate">{rm.display_name}</span>
                <span className="font-mono text-[10px] text-[#6EE7B7] ml-2 shrink-0">
                  [{rm.global_offset.join(',')}] · {rm.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CEO Room Production Export Suite */}
      <div className="pt-3 border-t border-[#262833] space-y-2">
        <div className="text-[11px] font-semibold text-[#D6D1C7]">
          CEO Room Production Export & Handoff
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportCEORoomGLB}
            className="px-2.5 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-[#0B1310] text-[11px] font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export ceo_room.glb</span>
          </button>
          <button
            type="button"
            onClick={onExportCEORoomJsonContracts}
            className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#2E3242] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0" />
            <span>Manifest+Anchors+Behavior</span>
          </button>
          <button
            type="button"
            onClick={onExportCEORoomPNG}
            className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#2E3242] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
            <span>ceo_room.preview.png</span>
          </button>
          <button
            type="button"
            onClick={onExportOfficeLayoutA3Json}
            className="px-2.5 py-2 rounded-md bg-[#1D1F28] hover:bg-[#282B38] border border-[#2E3242] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-[#7DD3FC] shrink-0" />
            <span>office-layout-a3.json</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onDownloadCEORoomPackZip}
          className="w-full py-2 px-3 rounded-md bg-[#1E293B] hover:bg-[#334155] border border-[#10B981]/50 text-[#A7F3D0] text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <Archive className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
          <span>Download ceo_room_production_pack_v1.zip</span>
        </button>
      </div>
    </div>
  );
};

export const PlannedRoomInspectorCard: React.FC<{
  roomKey: RoomModuleKey;
  officeViewMode: 'single_room' | 'full_office';
  onSelectRoomKey: (roomKey: RoomModuleKey) => void;
  onSwitchViewMode: (mode: 'single_room' | 'full_office') => void;
}> = ({ roomKey, officeViewMode, onSelectRoomKey, onSwitchViewMode }) => {
  const room: OfficeRoomRegistryEntry = getRoomModuleByKey(roomKey);

  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-lg bg-[#14151B] border border-[#F59E0B]/50 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#FBBF24] flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{room.display_name}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#451A03] text-[#FDE68A] font-mono text-[10px] font-semibold">
            PLANNED MODULE
          </span>
        </div>
        <p className="text-xs text-[#D6D1C7] leading-relaxed">{room.description}</p>

        <div className="pt-2 border-t border-[#262833] space-y-1 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#8E95A5]">Reserved Room ID</span>
            <span className="text-[#F3EFEA]">{room.module_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E95A5]">A3 Global Slot</span>
            <span className="text-[#7DD3FC]">[{room.global_offset.join(', ')}]</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E95A5]">Module Footprint</span>
            <span className="text-[#F3EFEA]">8 × 8 × 3.2 Units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8E95A5]">Production Status</span>
            <span className="text-[#FBBF24]">PLANNED (Placeholder Curb Only)</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#14151B] border border-[#262833] space-y-2">
        <div className="text-xs font-semibold text-[#D6D1C7]">
          Switch to Completed Production Rooms
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => onSelectRoomKey('pm_strategy')}
            className="w-full py-2 px-3 rounded-lg bg-[#262936] hover:bg-[#313546] border border-[#D99252] text-left flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-[#F5F2EB]">
                Module 01: PM & Strategy Room
              </div>
              <div className="text-[11px] text-[#9CA3AF]">
                Original Room-Native Boss PM + 11 Live Activities
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#D99252] text-[#14151B] font-mono text-[10px] font-bold">
              READY
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectRoomKey('ceo_executive')}
            className="w-full py-2 px-3 rounded-lg bg-[#192623] hover:bg-[#21332E] border border-[#10B981] text-left flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-semibold text-[#F5F2EB]">
                Module 02: CEO Executive Brain Office
              </div>
              <div className="text-[11px] text-[#A7F3D0]">
                Executive Brain Console + Dual Monitors + Report Review Area
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#10B981] text-[#0B1310] font-mono text-[10px] font-bold">
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              onSwitchViewMode(officeViewMode === 'full_office' ? 'single_room' : 'full_office')
            }
            className="w-full py-2 px-3 rounded-lg bg-[#1D1F28] hover:bg-[#262936] border border-[#38BDF8]/50 text-xs font-medium text-[#7DD3FC] flex items-center justify-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>
              {officeViewMode === 'full_office'
                ? 'View Single 8×8 Slot'
                : 'View in Full Office A3 (32×26)'}
            </span>
          </button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#14151B] border border-[#262833] space-y-1.5 text-xs">
        <div className="font-semibold text-[#D6D1C7]">Shared A3 Common Areas</div>
        {OFFICE_COMMON_AREAS.map((area) => (
          <div
            key={area.id}
            className="p-2 rounded bg-[#191B22] border border-[#262833] flex items-center justify-between gap-2"
          >
            <span className="text-[11px] text-[#E5E0D8]">{area.display_name}</span>
            <span className="font-mono text-[10px] text-[#8E95A5]">
              X:{area.bounds.minX}..{area.bounds.maxX} Z:{area.bounds.minZ}..{area.bounds.maxZ}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
