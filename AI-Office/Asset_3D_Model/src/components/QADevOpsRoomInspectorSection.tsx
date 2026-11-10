import React, { useMemo, useState } from 'react';
import {
  Activity,
  Archive,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Download,
  FileCode2,
  Image as ImageIcon,
  Layers,
  MonitorCheck,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { RoomExportStats } from '../domain/modularRoomSpec';
import {
  DEFAULT_QA_DEVOPS_ANCHOR_LIST,
  QA_DEVOPS_CAMERA_PRESETS,
  QA_DEVOPS_CONNECTORS_SPEC,
  QA_DEVOPS_DISPLAY_SLOTS,
  QA_DEVOPS_FUTURE_ACTIONS_CONTRACT,
  QA_DEVOPS_MODULE_CONSTANTS,
  QADevOpsAnchorId,
  verifyQADevOpsMonitorsOrientation,
} from '../domain/qaDevopsRoomSpec';

const QA_DEVOPS_LONGITUDINAL_ZONES = [
  {
    id: 'QA_TESTING_ZONE',
    title: 'North Zone — Quality Assurance & Device Testing',
    zRange: 'Z ≈ 10.6..16.0',
    subtitle: 'Dusty Teal & Slate Blue · Physical Device Verification',
    description:
      'QA Workstation with dual test-execution & bug-tracker displays, 3D Device Testing Counter (1 laptop, 2 phones, 2 tablets, Golden Bug Trophy), QA Checklist Wall Board, and Documentation Bookshelf.',
  },
  {
    id: 'SHARED_COZY_LOUNGE',
    title: 'Central Zone — Cozy Collaboration Lounge & Review',
    zRange: 'Z ≈ 5.4..10.6',
    subtitle: 'Warm Cream & Brushed Brass · Zero Wall at Z = 8',
    description:
      'Large 4.30×4.60m geometric area rug, cream 3-seat sofa with throw blanket, matching armchair, wooden coffee table, 3 soft poufs, and Shared QA & DevOps Release Readiness Board.',
  },
  {
    id: 'DEVOPS_OPERATIONS_ZONE',
    title: 'South Zone — DevOps & AI Engine Operations',
    zRange: 'Z ≈ 0.0..5.4',
    subtitle: 'Muted Olive-Green & Charcoal · Reliable Infrastructure',
    description:
      'DevOps Workstation with dual CI/CD pipeline & service health monitors, 2 separate compact Infrastructure Rack Cabinets with controlled status LEDs, Operations Wall Board, and technical storage.',
  },
] as const;

interface QADevOpsRoomInspectorSectionProps {
  stats: RoomExportStats | null;
  selectedAnchorId: QADevOpsAnchorId | null;
  onSelectAnchor: (anchorId: QADevOpsAnchorId) => void;
  onFocusAnchorPosition: (pos: [number, number, number]) => void;
  onSetCameraPreset: (presetId: string) => void;
  onExportQADevOpsRoomGLB: () => void;
  onExportQADevOpsRoomJsonContracts: () => void;
  onExportQADevOpsRoomPNG: () => void;
  onDownloadQADevOpsRoomPackZip: () => void;
  onExportOfficeLayoutA3_2Json?: () => void;
  onRunImportTest: () => void;
}

export const QADevOpsRoomInspectorSection: React.FC<QADevOpsRoomInspectorSectionProps> = ({
  stats,
  selectedAnchorId,
  onSelectAnchor,
  onFocusAnchorPosition,
  onSetCameraPreset,
  onExportQADevOpsRoomGLB,
  onExportQADevOpsRoomJsonContracts,
  onExportQADevOpsRoomPNG,
  onDownloadQADevOpsRoomPackZip,
  onExportOfficeLayoutA3_2Json,
  onRunImportTest,
}) => {
  const [showZones, setShowZones] = useState(true);
  const [showDisplaySlots, setShowDisplaySlots] = useState(true);
  const [showAnchors, setShowAnchors] = useState(true);
  const [showFutureContracts, setShowFutureContracts] = useState(false);

  const monitorAudit = useMemo(() => verifyQADevOpsMonitorsOrientation(), []);
  const verifiedMonitorCount = useMemo(
    () => monitorAudit.results.filter((r) => r.passed).length,
    [monitorAudit]
  );
  const totalMonitorCount = monitorAudit.results.length;

  const qaContracts = useMemo(
    () => QA_DEVOPS_FUTURE_ACTIONS_CONTRACT.filter((c) => c.agent_role === 'QA_REVIEW_AGENT'),
    []
  );
  const devopsContracts = useMemo(
    () =>
      QA_DEVOPS_FUTURE_ACTIONS_CONTRACT.filter((c) => c.agent_role === 'DEVOPS_AI_ENGINE_AGENT'),
    []
  );
  const connectorsList = useMemo(() => Object.values(QA_DEVOPS_CONNECTORS_SPEC), []);

  return (
    <div className="space-y-3 text-xs text-[#E8E4DA]">
      {/* Header Banner */}
      <div className="p-3 rounded-lg bg-gradient-to-br from-[#2B2219] via-[#1C2621] to-[#162028] border border-[#D89B3C]/45 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/40">
            <ShieldCheck className="w-3 h-3" />
            MODULE 06 · ELEGANT COZY EDITION
          </span>
          <span className="text-[10px] font-mono text-[#FBBF24]">8 × 16 × 3.2u</span>
        </div>

        <h3 className="text-sm font-bold text-[#F5F2EB] tracking-tight">
          {QA_DEVOPS_MODULE_CONSTANTS.DISPLAY_NAME}
        </h3>
        <p className="text-[11px] text-[#C8C2B4] mt-0.5">
          “{QA_DEVOPS_MODULE_CONSTANTS.EDITION_SUBTITLE}” — Integrated Quality Verification &amp;
          Infrastructure Reliability Studio
        </p>

        <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-[#2E323E] text-[10px]">
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Room ID</span>
            <span className="font-mono text-[#F4C97E] font-medium">
              {QA_DEVOPS_MODULE_CONSTANTS.MODULE_ID}
            </span>
          </div>
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Scene Root</span>
            <span className="font-mono text-[#6EE7B7] font-medium">
              {QA_DEVOPS_MODULE_CONSTANTS.ROOT_NODE_NAME}
            </span>
          </div>
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Local Origin</span>
            <span className="font-mono text-[#E2E8F0]">[0, 0, 0] (SW · 8×16)</span>
          </div>
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Office A3.2 Slot</span>
            <span className="font-mono text-[#38BDF8]">[24, 0, 0] (East Wing)</span>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-1.5 mt-1.5 text-[10px]">
            <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936] text-center">
              <span className="text-[#8E95A5] block">Meshes</span>
              <span className="font-mono font-semibold text-[#F5F2EB]">{stats.meshCount}</span>
            </div>
            <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936] text-center">
              <span className="text-[#8E95A5] block">Triangles</span>
              <span className="font-mono font-semibold text-[#F5F2EB]">{stats.triangleCount}</span>
            </div>
            <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936] text-center">
              <span className="text-[#8E95A5] block">Materials</span>
              <span className="font-mono font-semibold text-[#F5F2EB]">{stats.materialCount}</span>
            </div>
          </div>
        )}

        <div className="mt-2 px-2 py-1.5 rounded bg-[#14161D]/90 border border-[#D89B3C]/35 text-[10px] text-[#D6D1C7]">
          <span className="font-semibold text-[#F4C97E]">Dual-Agent Studio + Room Pack V1:</span>{' '}
          Active <code className="font-mono text-[#FBBF24]">qa_engineer_agent</code> (North QA Zone)
          &amp; <code className="font-mono text-[#38BDF8]">devops_engineer_agent</code> (South DevOps
          &amp; AI Engine Zone) operating together inside{' '}
          <code className="font-mono text-[#6EE7B7]">qa_devops_room.glb</code> (23 anchors, 8 static
          DEMO display slots across 9 front-only screens).
        </div>
      </div>

      {/* 9-Screen Front-Only Orientation Audit Badge */}
      <div className="p-2.5 rounded-lg bg-[#15221E] border border-[#10B981]/35 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <MonitorCheck className="w-4 h-4 text-[#34D399] shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-[#ECFDF5] truncate">
              9-Screen Front-Only Orientation Audit
            </div>
            <div className="text-[10px] text-[#A7F3D0] truncate">
              All {totalMonitorCount} displays verified facing operator / room interior · 0 rear
              emission
            </div>
          </div>
        </div>
        <span className="px-1.5 py-0.5 rounded font-mono text-[9px] font-semibold bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981]/40 shrink-0">
          {verifiedMonitorCount}/{totalMonitorCount} PASS
        </span>
      </div>

      {/* Camera Presets */}
      <div className="p-2.5 rounded-lg bg-[#1C1E26] border border-[#2B2D38]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#D89B3C]" />
            QA &amp; DevOps Studio Camera Presets
          </span>
          <span className="text-[10px] text-[#8E95A5]">{QA_DEVOPS_CAMERA_PRESETS.length} views</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {QA_DEVOPS_CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSetCameraPreset(preset.id)}
              className="px-2 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] border border-[#343848] text-left transition-colors"
            >
              <div className="text-[11px] font-medium text-[#F5F2EB] truncate">
                {preset.shortLabel || preset.label}
              </div>
              <div className="text-[9px] text-[#94A3B8] truncate">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Production Asset Pack Export Controls */}
      <div className="p-2.5 rounded-lg bg-[#1C1E26] border border-[#2B2D38] space-y-1.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-[#34D399]" />
            QA &amp; DevOps Production Pack V1
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#34D399]">
            ROOM-ONLY GLB
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportQADevOpsRoomGLB}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#D89B3C] hover:bg-[#E5AB4E] text-[#14151B] font-semibold text-[11px] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export qa_devops_room.glb</span>
          </button>

          <button
            type="button"
            onClick={onDownloadQADevOpsRoomPackZip}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#10B981] hover:bg-[#34D399] text-[#0B1310] font-semibold text-[11px] transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download Pack .ZIP</span>
          </button>

          <button
            type="button"
            onClick={onExportQADevOpsRoomJsonContracts}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] text-[#E2E8F0] border border-[#343848] text-[10px] transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#F4C97E]" />
            <span>Manifest + Anchors + Behavior</span>
          </button>

          <button
            type="button"
            onClick={onExportQADevOpsRoomPNG}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] text-[#E2E8F0] border border-[#343848] text-[10px] transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Preview .PNG</span>
          </button>
        </div>

        {onExportOfficeLayoutA3_2Json && (
          <button
            type="button"
            onClick={onExportOfficeLayoutA3_2Json}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] text-[#F4C97E] border border-[#D89B3C]/35 font-medium text-[10px] transition-colors"
          >
            <Server className="w-3.5 h-3.5 text-[#D89B3C]" />
            <span>Download Master Floor Plan office-layout-a3.2.json (8×16 Combined Slot)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRunImportTest}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#38BDF8]/30 font-medium text-[11px] transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Validate Exported GLB (Independent Round-Trip)</span>
        </button>
      </div>

      {/* 8 Display Slots (DEMO) */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDisplaySlots((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#34D399]" />
            QA &amp; DevOps Display Slots ({QA_DEVOPS_DISPLAY_SLOTS.length} Static DEMO Contracts)
          </span>
          {showDisplaySlots ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showDisplaySlots && (
          <div className="p-2.5 pt-0 space-y-1.5 border-t border-[#262936]">
            <p className="text-[10px] text-[#94A3B8] leading-relaxed">
              4 QA Verification slots (Test Suite, Bug Tracker, Checklist, Device Matrix), 1 Shared
              Release Readiness Board, and 3 DevOps Reliability slots (System Status, Pipeline,
              Monitoring):
            </p>
            {QA_DEVOPS_DISPLAY_SLOTS.map((slot) => (
              <div
                key={slot.slot_id}
                className="p-2 rounded bg-[#14161D] border border-[#282C3A] space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[10px] font-semibold text-[#F4C97E]">
                    {slot.slot_id}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30">
                    [{slot.demo_badge_label}]
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#F5F2EB]">{slot.display_name}</div>
                <div className="text-[10px] text-[#94A3B8]">{slot.description}</div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#1E222D] text-[9px] text-[#CBD5E1] border border-[#2E3446] font-mono">
                    mesh: {slot.associated_mesh}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#1E222D] text-[9px] text-[#38BDF8] border border-[#2E3446] font-mono">
                    {slot.expected_data_category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 Longitudinal Interior Zones & Connectors */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowZones((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F4C97E]" />
            3 Longitudinal Zones (8×16) &amp; Connectors
          </span>
          {showZones ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showZones && (
          <div className="p-2.5 pt-0 space-y-1.5 border-t border-[#262936]">
            {QA_DEVOPS_LONGITUDINAL_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="p-2 rounded bg-[#14161D] border border-[#282C3A] space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#F4C97E]">{zone.title}</span>
                  <span className="text-[9px] font-mono text-[#38BDF8]">{zone.zRange}</span>
                </div>
                <div className="text-[10px] font-medium text-[#6EE7B7]">{zone.subtitle}</div>
                <p className="text-[10px] text-[#94A3B8] leading-snug">{zone.description}</p>
              </div>
            ))}

            <div className="p-2 rounded bg-[#14161D] border border-[#282C3A] text-[10px] space-y-1">
              {connectorsList.map((conn) => (
                <div key={conn.id}>
                  <span className="font-semibold text-[#6EE7B7] font-mono">{conn.id}</span>:{' '}
                  <span className="text-[#E2E8F0]">
                    local [{conn.localPosition.join(', ')}] → global [
                    {conn.global_position.join(', ')}]
                  </span>{' '}
                  <span className="text-[#94A3B8]">({conn.target_zone})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 23 Room-Local Activity Anchors */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAnchors((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            Room-Local Anchors ({DEFAULT_QA_DEVOPS_ANCHOR_LIST.length} Anchors)
          </span>
          {showAnchors ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showAnchors && (
          <div className="p-2.5 pt-0 space-y-1 max-h-64 overflow-y-auto border-t border-[#262936]">
            {DEFAULT_QA_DEVOPS_ANCHOR_LIST.map((anchor) => {
              const isSel = selectedAnchorId === anchor.id;
              return (
                <button
                  key={anchor.id}
                  type="button"
                  onClick={() => {
                    onSelectAnchor(anchor.id);
                    onFocusAnchorPosition(anchor.position);
                  }}
                  className={`w-full p-1.5 rounded text-left border transition-colors flex items-center justify-between gap-2 ${
                    isSel
                      ? 'bg-[#D89B3C]/20 border-[#D89B3C] text-[#F5F2EB]'
                      : 'bg-[#14161D] hover:bg-[#1E212B] border-[#282C3A] text-[#D6D1C7]'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-mono text-[10px] font-semibold text-[#F4C97E] truncate">
                      {anchor.id}
                    </div>
                    <div className="text-[10px] text-[#94A3B8] truncate">{anchor.description}</div>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[9px] text-[#38BDF8]">
                    <div>
                      [{anchor.position[0].toFixed(2)}, {anchor.position[2].toFixed(2)}]
                    </div>
                    <div className="text-[#6EE7B7]">
                      {anchor.zone} · {anchor.posture}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 29 Future QA & DevOps Agent Action Contracts */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFutureContracts((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
            Prepared Future Action Contracts ({QA_DEVOPS_FUTURE_ACTIONS_CONTRACT.length}:{' '}
            {qaContracts.length} QA + {devopsContracts.length} DevOps)
          </span>
          {showFutureContracts ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showFutureContracts && (
          <div className="p-2.5 pt-0 space-y-1 max-h-60 overflow-y-auto border-t border-[#262936]">
            {QA_DEVOPS_FUTURE_ACTIONS_CONTRACT.map((act) => (
              <div
                key={act.action_id}
                className="p-1.5 rounded bg-[#14161D] border border-[#282C3A] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-semibold text-[#F4C97E]">
                    {act.action_id}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] truncate">
                    Anchor: <span className="font-mono text-[#6EE7B7]">{act.target_anchor}</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#1E222D] font-mono text-[9px] text-[#38BDF8] shrink-0">
                  {act.agent_role === 'QA_REVIEW_AGENT' ? 'QA' : 'DevOps'} · {act.posture}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

