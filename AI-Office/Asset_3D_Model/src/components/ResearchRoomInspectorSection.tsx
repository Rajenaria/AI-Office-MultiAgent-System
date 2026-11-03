import React, { useState } from 'react';
import {
  Archive,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Database,
  Download,
  FileCode2,
  Image as ImageIcon,
  Layers,
  Network,
  Sparkles,
} from 'lucide-react';
import { RoomExportStats } from '../domain/modularRoomSpec';
import {
  DEFAULT_RESEARCH_ANCHORS,
  RESEARCH_CAMERA_PRESETS,
  RESEARCH_CONNECTORS_SPEC,
  RESEARCH_DISPLAY_SLOTS,
  RESEARCH_EAST_BOUNDARY_NOTE,
  RESEARCH_FUTURE_ACTION_CONTRACTS,
  RESEARCH_INTERIOR_ZONES,
  RESEARCH_MODULE_CONSTANTS,
  ResearchAnchorId,
} from '../domain/researchRoomSpec';

interface ResearchRoomInspectorSectionProps {
  stats: RoomExportStats | null;
  selectedAnchorId: ResearchAnchorId | null;
  onSelectAnchor: (anchorId: ResearchAnchorId) => void;
  onFocusAnchorPosition: (pos: [number, number, number]) => void;
  onSetCameraPreset: (presetId: string) => void;
  onExportResearchRoomGLB: () => void;
  onExportResearchRoomJsonContracts: () => void;
  onExportResearchRoomPNG: () => void;
  onDownloadResearchRoomPackZip: () => void;
  onRunImportTest: () => void;
}

export const ResearchRoomInspectorSection: React.FC<ResearchRoomInspectorSectionProps> = ({
  stats,
  selectedAnchorId,
  onSelectAnchor,
  onFocusAnchorPosition,
  onSetCameraPreset,
  onExportResearchRoomGLB,
  onExportResearchRoomJsonContracts,
  onExportResearchRoomPNG,
  onDownloadResearchRoomPackZip,
  onRunImportTest,
}) => {
  const [showZones, setShowZones] = useState(true);
  const [showDisplaySlots, setShowDisplaySlots] = useState(true);
  const [showAnchors, setShowAnchors] = useState(true);
  const [showFutureContracts, setShowFutureContracts] = useState(false);

  return (
    <div className="space-y-3 text-xs text-[#E8E4DA]">
      {/* Header Banner */}
      <div className="p-3 rounded-lg bg-gradient-to-br from-[#2B221B] via-[#1E2421] to-[#171A21] border border-[#D4A359]/40 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D4A359]/20 text-[#F4C97E] border border-[#D4A359]/40">
            <BookOpen className="w-3 h-3" />
            MODULE 05 · READY FOR REVIEW
          </span>
          <span className="text-[10px] font-mono text-[#94A3B8]">8 × 8 × 3.2u</span>
        </div>

        <h3 className="text-sm font-bold text-[#F5F2EB] tracking-tight">
          {RESEARCH_MODULE_CONSTANTS.DISPLAY_NAME}
        </h3>
        <p className="text-[11px] text-[#C8C2B4] mt-0.5">
          “{RESEARCH_MODULE_CONSTANTS.ALTERNATIVE_TITLE}” — Warm Scholarly Library + Structured AI Memory Hub
        </p>

        <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2.5 border-t border-[#2E323E] text-[10px]">
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Room ID</span>
            <span className="font-mono text-[#F4C97E] font-medium">
              {RESEARCH_MODULE_CONSTANTS.MODULE_ID}
            </span>
          </div>
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Scene Root</span>
            <span className="font-mono text-[#6EE7B7] font-medium">
              {RESEARCH_MODULE_CONSTANTS.ROOT_NODE_NAME}
            </span>
          </div>
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Local Origin</span>
            <span className="font-mono text-[#E2E8F0]">[0, 0, 0] (SW Corner)</span>
          </div>
          <div className="bg-[#14161D]/80 px-2 py-1 rounded border border-[#262936]">
            <span className="text-[#8E95A5] block">Office A3.1 Slot</span>
            <span className="font-mono text-[#38BDF8]">[0, 0, 18] (NW Wing)</span>
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

        <div className="mt-2 px-2 py-1.5 rounded bg-[#14161D]/90 border border-[#D4A359]/30 text-[10px] text-[#D6D1C7]">
          <span className="font-semibold text-[#F4C97E]">Module 05 Complete:</span>{' '}
          <span className="text-[#6EE7B7] font-semibold">Research Professor</span> (
          <code className="font-mono">research_professor_agent</code>) is active across 14 room-local
          anchors with 18 actions &amp; 20 clips, while <code className="font-mono">research_room.glb</code>{' '}
          exports as a clean Room-Only GLB.
        </div>
      </div>

      {/* Camera Presets */}
      <div className="p-2.5 rounded-lg bg-[#1C1E26] border border-[#2B2D38]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-[#D4A359]" />
            Knowledge Atelier Camera Presets
          </span>
          <span className="text-[10px] text-[#8E95A5]">{RESEARCH_CAMERA_PRESETS.length} views</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {RESEARCH_CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSetCameraPreset(preset.id)}
              className="px-2 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] border border-[#343848] text-left transition-colors"
            >
              <div className="text-[11px] font-medium text-[#F5F2EB] truncate">{preset.name}</div>
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
            Research Room Production Pack V1
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#34D399]">
            ROOM-ONLY GLB
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportResearchRoomGLB}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#D4A359] hover:bg-[#E0B168] text-[#14151B] font-semibold text-[11px] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export research_room.glb</span>
          </button>

          <button
            type="button"
            onClick={onDownloadResearchRoomPackZip}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#10B981] hover:bg-[#34D399] text-[#0B1310] font-semibold text-[11px] transition-colors"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download Pack .ZIP</span>
          </button>

          <button
            type="button"
            onClick={onExportResearchRoomJsonContracts}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] text-[#E2E8F0] border border-[#343848] text-[10px] transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5 text-[#F4C97E]" />
            <span>Manifest + Anchors + Slots</span>
          </button>

          <button
            type="button"
            onClick={onExportResearchRoomPNG}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-[#252834] hover:bg-[#2F3342] text-[#E2E8F0] border border-[#343848] text-[10px] transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Preview .PNG</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRunImportTest}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-[#38BDF8] border border-[#38BDF8]/30 font-medium text-[11px] transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Validate Exported GLB (Independent Round-Trip)</span>
        </button>
      </div>

      {/* 6 Shared Brain Display Slots (DEMO) */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDisplaySlots((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-[#34D399]" />
            Shared Brain Display Slots ({RESEARCH_DISPLAY_SLOTS.length} Static DEMO Contracts)
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
              Structured 3-layer Shared Brain visual taxonomy (Organization Brain, Project Brain,
              Agent Working Context) + Source Index &amp; Evidence Status:
            </p>
            {RESEARCH_DISPLAY_SLOTS.map((slot) => (
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
                <div className="text-[11px] font-medium text-[#F5F2EB]">{slot.demo_headline}</div>
                <div className="text-[10px] text-[#94A3B8]">{slot.demo_summary}</div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {slot.supported_future_payload_types.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded bg-[#1E222D] text-[9px] text-[#CBD5E1] border border-[#2E3446]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4 Functional Interior Zones */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowZones((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#F4C97E]" />
            4 Functional Interior Zones &amp; Boundaries
          </span>
          {showZones ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showZones && (
          <div className="p-2.5 pt-0 space-y-1.5 border-t border-[#262936]">
            {RESEARCH_INTERIOR_ZONES.map((zone) => (
              <div
                key={zone.id}
                className="p-2 rounded bg-[#14161D] border border-[#282C3A] space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#F4C97E]">{zone.title}</span>
                  <span className="text-[9px] font-mono text-[#38BDF8]">{zone.subtitle}</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-snug">{zone.placementSummary}</p>
              </div>
            ))}

            <div className="p-2 rounded bg-[#14161D] border border-[#282C3A] text-[10px] space-y-1">
              <div className="font-semibold text-[#6EE7B7]">
                Connector: {RESEARCH_CONNECTORS_SPEC[0].id} ([4, 0, 0])
              </div>
              <div className="text-[#94A3B8]">{RESEARCH_EAST_BOUNDARY_NOTE}</div>
            </div>
          </div>
        )}
      </div>

      {/* 13 Room-Local Activity Anchors */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAnchors((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
            Room-Local Anchors ({DEFAULT_RESEARCH_ANCHORS.length} Anchors)
          </span>
          {showAnchors ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showAnchors && (
          <div className="p-2.5 pt-0 space-y-1 max-h-64 overflow-y-auto border-t border-[#262936]">
            {DEFAULT_RESEARCH_ANCHORS.map((anchor) => {
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
                      ? 'bg-[#D4A359]/20 border-[#D4A359] text-[#F5F2EB]'
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
                      [{anchor.position[0].toFixed(1)}, {anchor.position[2].toFixed(1)}]
                    </div>
                    <div className="text-[#6EE7B7]">{anchor.supported_posture}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 14 Future Research Professor Action Contracts */}
      <div className="rounded-lg bg-[#1C1E26] border border-[#2B2D38] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFutureContracts((v) => !v)}
          className="w-full px-2.5 py-2 flex items-center justify-between text-left hover:bg-[#232631] transition-colors"
        >
          <span className="text-[11px] font-semibold text-[#F5F2EB] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            Future Research Professor Contracts ({RESEARCH_FUTURE_ACTION_CONTRACTS.length})
          </span>
          {showFutureContracts ? (
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
          )}
        </button>

        {showFutureContracts && (
          <div className="p-2.5 pt-0 space-y-1 max-h-60 overflow-y-auto border-t border-[#262936]">
            {RESEARCH_FUTURE_ACTION_CONTRACTS.map((act) => (
              <div
                key={act.action_id}
                className="p-1.5 rounded bg-[#14161D] border border-[#282C3A] flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-semibold text-[#C4B5FD]">
                    {act.action_id}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] truncate">
                    Anchor: <span className="font-mono text-[#F4C97E]">{act.target_anchor}</span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#1E222D] font-mono text-[9px] text-[#6EE7B7] shrink-0">
                  {act.occupied_posture} · {act.default_duration_sec}s
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
