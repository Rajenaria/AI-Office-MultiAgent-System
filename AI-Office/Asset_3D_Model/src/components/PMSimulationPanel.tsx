import React, { useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Download,
  Eye,
  Focus,
  Info,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Square,
  Upload,
  UserCheck,
} from 'lucide-react';
import {
  ActivityAnchor,
  AnchorId,
  CharacterSourceType,
  GLBInspectionReport,
  PMActionId,
  PM_DEMO_ACTIONS,
} from '../domain/pmSimulationSpec';
import {
  PMSimulationRuntimeTelemetry,
  ViewerDisplayConfig,
} from './ModularRoomCanvas';

interface PMSimulationPanelProps {
  config: ViewerDisplayConfig;
  telemetry: PMSimulationRuntimeTelemetry;
  inspectionReport: GLBInspectionReport | null;
  anchors: Record<AnchorId, ActivityAnchor>;
  selectedAnchorId: AnchorId | null;
  onUpdateConfig: (partial: Partial<ViewerDisplayConfig>) => void;
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
  onExportOriginalPMGLB: () => void;
  onExportSimConfig: () => void;
}

export const PMSimulationPanel: React.FC<PMSimulationPanelProps> = ({
  config,
  telemetry,
  inspectionReport,
  anchors,
  selectedAnchorId,
  onUpdateConfig,
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
  onExportOriginalPMGLB,
  onExportSimConfig,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editAnchorsOpen, setEditAnchorsOpen] = useState<boolean>(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState<boolean>(true);
  const [hierarchyExpanded, setHierarchyExpanded] = useState<boolean>(false);

  const activeAnchorKey: AnchorId = selectedAnchorId || 'PM_DESK_WORK_POSITION';
  const activeAnchor = anchors[activeAnchorKey];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomGLB(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Hidden HTML File Input accepting .glb */}
      <input
        ref={fileInputRef}
        data-testid="character-glb-file-input"
        type="file"
        accept=".glb,model/gltf-binary,.gltf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 1. Sumber Karakter (Original Room-Native PM vs Imported GLB) & Live Telemetry */}
      <section className="bg-[#14151B] border border-[#D99252]/70 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold text-[#F5F2EB] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#D99252]" />
              <span>Sumber Karakter</span>
            </h2>
            <p className="text-[11px] text-[#8E95A5] mt-0.5">
              Original Room-Native Voxel PM atau Imported GLB
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#262936] border border-[#D99252]/50 text-[10px] font-mono font-semibold text-[#FBBF24] whitespace-nowrap shrink-0">
            SIMULASI / DEMO
          </span>
        </div>

        {/* Character Source Selector: 1. Original PM (Default) | 2. Imported GLB (Optional) */}
        <div
          role="group"
          aria-label="Sumber Karakter"
          className="grid grid-cols-2 gap-1.5 bg-[#1B1D26] p-1 rounded-lg border border-[#2B2D38]"
        >
          <button
            type="button"
            data-testid="char-source-original"
            aria-pressed={telemetry.selectedCharacterSource === 'original_pm'}
            onClick={() => onCharacterSourceChange('original_pm')}
            className={`py-2 px-2 rounded-md text-xs font-semibold transition-colors text-center ${
              telemetry.selectedCharacterSource === 'original_pm'
                ? 'bg-[#D99252] text-[#14151B] shadow-xs'
                : 'text-[#B4BAC6] hover:text-[#F5F2EB]'
            }`}
          >
            Original PM (Default)
          </button>
          <button
            type="button"
            data-testid="char-source-imported"
            aria-pressed={telemetry.selectedCharacterSource === 'imported_glb'}
            onClick={() => onCharacterSourceChange('imported_glb')}
            className={`py-2 px-2 rounded-md text-xs font-semibold transition-colors text-center ${
              telemetry.selectedCharacterSource === 'imported_glb'
                ? 'bg-[#38BDF8] text-[#14151B] shadow-xs'
                : 'text-[#B4BAC6] hover:text-[#F5F2EB]'
            }`}
          >
            Imported GLB (Optional)
          </button>
        </div>

        {/* Active Character Source Status & Optional GLB File Picker */}
        {telemetry.selectedCharacterSource === 'original_pm' ? (
          <div className="p-2 rounded bg-[#191B22] border border-[#262833] flex items-center justify-between gap-2 text-[11px]">
            <div>
              <span className="text-[#6EE7B7] font-semibold block">
                Original Room-Native Boss PM Aktif
              </span>
              <span className="text-[#9CA3AF] text-[10px]">
                Cozy Handcrafted Isometric Voxel · Jas Hitam, Dasi Merah, Kacamata Hitam
              </span>
            </div>
            <button
              type="button"
              data-testid="import-karakter-glb-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded bg-[#252834] hover:bg-[#303444] border border-[#3A3F52] text-[#E5E0D8] text-[11px] font-medium flex items-center gap-1 shrink-0"
            >
              <Upload className="w-3.5 h-3.5 text-[#D99252]" />
              <span>Import GLB</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              data-testid="import-karakter-glb-btn"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg bg-[#D99252] hover:bg-[#E49F60] text-[#14151B] font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Import Karakter GLB</span>
            </button>

            {telemetry.hasImportedGLB ? (
              <div className="p-2 rounded bg-[#191B22] border border-[#38BDF8]/50 text-[11px] text-[#E5E0D8] flex items-center justify-between">
                <span>
                  Model GLB Aktif:{' '}
                  <strong className="font-mono text-[#7DD3FC]">
                    {telemetry.importedGLBFilename}
                  </strong>
                </span>
                <span className="text-[10px] font-mono text-[#6EE7B7]">SESSION-SCOPED</span>
              </div>
            ) : (
              <div className="p-2 rounded bg-[#1B1D26] border border-[#F59E0B]/60 flex items-start gap-2 text-[11px] text-[#E5E0D8] leading-snug">
                <Info className="w-3.5 h-3.5 text-[#FBBF24] shrink-0 mt-0.5" />
                <span>
                  Belum ada file <span className="font-mono">.glb</span> yang diunggah pada sesi ini. Klik{' '}
                  <strong>“Import Karakter GLB”</strong> di atas untuk memilih file <span className="font-mono">.glb</span> dari komputer Anda. Karakter <strong>Original PM</strong> tetap ditampilkan agar ruangan tidak kosong.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Banner if GLB Loading Fails */}
        {telemetry.loadError && (
          <div
            role="alert"
            className="p-2.5 rounded-md bg-[#371B22] border border-[#DC2626] text-[#FCA5A5] space-y-1"
          >
            <div className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Gagal Memuat Karakter GLB</span>
            </div>
            <div className="text-[11px] leading-snug">{telemetry.loadError}</div>
          </div>
        )}

        {/* Live Telemetry Readout */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#262833] font-mono text-[11px] tabular-nums">
          <div className="bg-[#1B1D26] px-2 py-1.5 rounded border border-[#262833]">
            <span className="text-[#8E95A5] block text-[10px]">Current State</span>
            <span className="text-[#6EE7B7] font-semibold">
              {telemetry.isPaused ? `${telemetry.currentState} (PAUSED)` : telemetry.currentState}
            </span>
          </div>
          <div className="bg-[#1B1D26] px-2 py-1.5 rounded border border-[#262833]">
            <span className="text-[#8E95A5] block text-[10px]">Active Animation</span>
            <span className="text-[#F3EFEA] truncate block">{telemetry.activeClipName}</span>
          </div>
          <div className="bg-[#1B1D26] px-2 py-1.5 rounded border border-[#262833]">
            <span className="text-[#8E95A5] block text-[10px]">Target Anchor</span>
            <span className="text-[#7DD3FC] truncate block">
              {telemetry.targetAnchorId || 'In-Place'}
            </span>
          </div>
          <div className="bg-[#1B1D26] px-2 py-1.5 rounded border border-[#262833]">
            <span className="text-[#8E95A5] block text-[10px]">World Pos / Yaw</span>
            <span className="text-[#F3EFEA]">
              [{telemetry.worldPosition[0]}, {telemetry.worldPosition[2]}] · {telemetry.facingDeg}°
            </span>
          </div>
        </div>

        {/* Waiting Approval Interactive Resolution Banner */}
        {telemetry.loaded && telemetry.currentState === 'WAITING_APPROVAL' && (
          <div className="p-2.5 rounded-lg bg-[#2B2118] border border-[#F59E0B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FDE68A]">
                Menunggu Persetujuan Milestone
              </span>
              <span className="text-[10px] font-mono text-[#FBBF24]">PENDING</span>
            </div>
            <p className="text-[11px] text-[#E5E0D8] leading-snug">
              Karakter PM menghentikan aktivitas kerja dan menunggu konfirmasi persetujuan Anda.
            </p>
            <button
              type="button"
              onClick={onApproveTask}
              className="w-full py-2 px-3 rounded-md bg-[#10B981] hover:bg-[#059669] text-[#0B1310] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Berikan Persetujuan (Selesaikan Tugas)</span>
            </button>
          </div>
        )}

        {/* Auto-Demo Sequence Button */}
        {telemetry.loaded && (
          <div className="pt-1">
            {telemetry.autoDemoActive ? (
              <div className="p-2.5 rounded-lg bg-[#1E293B] border border-[#38BDF8] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#7DD3FC] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Demo Otomatis Berjalan</span>
                  </span>
                  <button
                    type="button"
                    onClick={onStopAutoDemo}
                    className="px-2 py-0.5 rounded bg-[#334155] hover:bg-[#475569] text-white text-[11px]"
                  >
                    Hentikan
                  </button>
                </div>
                <div className="text-[11px] text-[#E2E8F0] font-mono">
                  {telemetry.autoDemoStepTitle}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStartAutoDemo}
                className="w-full py-2 px-3 rounded-lg bg-[#252834] hover:bg-[#2F3342] border border-[#D99252]/60 text-[#F5F2EB] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D99252]" />
                <span>Jalankan Demo Otomatis (8 Langkah)</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* 2. Diagnostics Panel (Mandatory GLB Inspection & Scale/Orientation Calibration) */}
      <section className="bg-[#14151B] border border-[#262833] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setDiagnosticsOpen((o) => !o)}
          className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#1B1D26] transition-colors"
        >
          <span className="font-semibold text-[#D6D1C7] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6EE7B7]" />
            <span>Diagnostics Karakter GLB</span>
          </span>
          {diagnosticsOpen ? (
            <ChevronDown className="w-4 h-4 text-[#8E95A5]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
          )}
        </button>

        {diagnosticsOpen && (
          <div className="p-3 pt-1 border-t border-[#262833] space-y-2.5">
            {inspectionReport ? (
              <div className="space-y-2.5 text-[11px] font-mono tabular-nums">
                <div className="p-2 rounded bg-[#191B22] border border-[#262833] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Active Character</span>
                    <span className="text-[#F3EFEA] font-semibold truncate max-w-44">
                      {inspectionReport.assetPathOrName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Source Mode</span>
                    <span className="text-[#6EE7B7]">
                      {inspectionReport.assetSource === 'original_room_native'
                        ? 'ORIGINAL PM (DEFAULT)'
                        : inspectionReport.assetSource === 'runtime_upload'
                        ? 'IMPORTED GLB (SESSION)'
                        : 'FIXED PROJECT ASSET'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">File Size</span>
                    <span className="text-[#F3EFEA]">
                      {(inspectionReport.fileSizeBytes / 1024).toFixed(1)} KB (
                      {inspectionReport.fileSizeBytes.toLocaleString()} B)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Mesh Count</span>
                    <span className="text-[#F3EFEA]">{inspectionReport.meshCount} meshes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Material Count</span>
                    <span className="text-[#F3EFEA]">{inspectionReport.materialCount} materials</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Raw Bounding Box</span>
                    <span className="text-[#F3EFEA]">
                      {inspectionReport.rawBounds.size.join(' × ')}u
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Bounds Min / Max Y</span>
                    <span className="text-[#F3EFEA]">
                      [{inspectionReport.rawBounds.min[1]} .. {inspectionReport.rawBounds.max[1]}]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Detected Animations</span>
                    <span className="text-[#6EE7B7]">
                      {inspectionReport.animationClips.length} clip(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Skeleton / Bones</span>
                    <span className="text-[#F3EFEA]">
                      {inspectionReport.hasSkeleton
                        ? `Yes (${inspectionReport.boneCount} bones, ${inspectionReport.skinnedMeshCount} skinned)`
                        : 'No Skinned Bones'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Calibrated Scale</span>
                    <span className="text-[#F3EFEA]">
                      {inspectionReport.rawHeight}u → {(inspectionReport.normalizedHeight * telemetry.scaleMultiplier).toFixed(2)}u (×
                      {(inspectionReport.appliedScaleFactor * telemetry.scaleMultiplier).toFixed(3)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E95A5]">Capability Mode</span>
                    <span className="text-[#FBBF24] font-semibold">
                      {inspectionReport.capabilityMode}
                    </span>
                  </div>
                </div>

                {/* Scale & Forward Orientation Calibration Controls */}
                <div className="p-2 rounded bg-[#191B22] border border-[#262833] space-y-2 font-sans">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#D6D1C7] font-medium">Kalibrasi Skala & Arah Hadap</span>
                    <button
                      type="button"
                      onClick={() => {
                        onScaleMultiplierChange(1.0);
                        onForwardOffsetChange(0);
                      }}
                      className="text-[10px] text-[#D99252] hover:underline"
                    >
                      Reset (1.0x · 0°)
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8E95A5]">Scale Multiplier:</span>
                    <div className="flex items-center gap-1 font-mono">
                      {[0.75, 1.0, 1.25, 1.5].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => onScaleMultiplierChange(m)}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            Math.abs(telemetry.scaleMultiplier - m) < 0.02
                              ? 'bg-[#D99252] text-[#14151B] font-semibold'
                              : 'bg-[#121318] text-[#9CA3AF] hover:text-white'
                          }`}
                        >
                          {m}x
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8E95A5]">Forward Offset:</span>
                    <div className="flex items-center gap-1 font-mono">
                      {[0, 90, 180, 270].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => onForwardOffsetChange(deg)}
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            telemetry.forwardOffsetDeg === deg
                              ? 'bg-[#38BDF8] text-[#14151B] font-semibold'
                              : 'bg-[#121318] text-[#9CA3AF] hover:text-white'
                          }`}
                        >
                          +{deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded bg-[#191B22] border border-[#262833] font-sans text-[11px] text-[#D6D1C7] leading-snug space-y-1">
                  <div className="font-semibold text-[#F5F2EB]">Status Kompatibilitas Animasi:</div>
                  <div>{inspectionReport.capabilitySummary}</div>
                  {inspectionReport.disclosures.map((d, idx) => (
                    <div key={idx} className="text-[10px] text-[#9CA3AF]">
                      • {d}
                    </div>
                  ))}
                </div>

                {/* Embedded Animation Clips Table */}
                {inspectionReport.animationClips.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-semibold text-[#8E95A5] uppercase">
                      Detected Animation Clips ({inspectionReport.animationClips.length})
                    </div>
                    <div className="max-h-28 overflow-y-auto bg-[#121318] border border-[#262833] rounded p-1.5 space-y-0.5 text-[10px]">
                      {inspectionReport.animationClips.map((c) => (
                        <div key={c.name} className="flex justify-between text-[#B4BAC6]">
                          <span>{c.name}</span>
                          <span className="text-[#8E95A5]">
                            {c.duration}s · {c.trackCount} tracks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible Full Scene Hierarchy Tree */}
                <div>
                  <button
                    type="button"
                    onClick={() => setHierarchyExpanded((h) => !h)}
                    className="text-[11px] text-[#7DD3FC] hover:underline font-sans"
                  >
                    {hierarchyExpanded
                      ? 'Hide Inspected GLB Node Hierarchy'
                      : `Show Inspected GLB Node Hierarchy (${inspectionReport.hierarchyTree.length} nodes)`}
                  </button>
                  {hierarchyExpanded && (
                    <pre className="mt-1 max-h-40 overflow-y-auto bg-[#121318] border border-[#262833] rounded p-2 text-[10px] text-[#9CA3AF] leading-relaxed">
                      {inspectionReport.hierarchyTree.join('\n')}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[#8E95A5] text-[11px] leading-snug py-1">
                Belum ada file GLB yang diimpor. Setelah Anda memilih file <span className="text-[#E5E0D8] font-mono">.glb</span> melalui tombol <span className="text-[#F5F2EB] font-medium">Import Karakter GLB</span>, laporan diagnostik lengkap (jumlah mesh, material, bounding box, skeleton/bone, dan daftar animasi) akan ditampilkan di sini.
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. All 11 Required Demo Action Buttons */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#D6D1C7]">
            Aktivitas Simulasi PM (11 Aksi)
          </h3>
          <span className="text-[11px] text-[#8E95A5] font-mono">
            {telemetry.currentActionDef.labelId}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {PM_DEMO_ACTIONS.map((action, idx) => {
            const isActive = telemetry.loaded && telemetry.currentActionId === action.id;
            return (
              <button
                key={action.id}
                type="button"
                disabled={!telemetry.loaded}
                data-testid={`pm-action-${action.id}`}
                onClick={() => onTriggerAction(action.id)}
                className={`text-left px-2 py-2 rounded-lg border transition-colors flex flex-col justify-between ${
                  idx === PM_DEMO_ACTIONS.length - 1 ? 'col-span-2' : ''
                } ${
                  !telemetry.loaded
                    ? 'bg-[#15161D] border-[#22242E] text-[#5E6472] cursor-not-allowed'
                    : isActive
                    ? 'bg-[#262936] border-[#D99252] text-[#F5F2EB]'
                    : 'bg-[#181A22] border-[#262833] text-[#B4BAC6] hover:border-[#3D4254] hover:text-[#F3EFEA]'
                }`}
              >
                <div className="flex items-start justify-between gap-1 w-full">
                  <span className="font-semibold text-[11px] leading-tight">{action.labelId}</span>
                  <span className="text-[10px] font-mono text-[#8E95A5] shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[10px] text-[#8E95A5] truncate mt-0.5">
                  {action.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Extra Patrol Sub-Controls when Jalan Keliling is selected */}
        {telemetry.loaded && telemetry.currentActionId === 'patrol' && (
          <div className="p-2 rounded-lg bg-[#14151B] border border-[#38BDF8]/50 flex items-center justify-between gap-1.5">
            <span className="text-[11px] text-[#7DD3FC] font-medium pl-1">
              Kontrol Patroli:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onTriggerAction('patrol')}
                className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] text-[11px]"
              >
                Start
              </button>
              <button
                type="button"
                onClick={() => onPlaybackCommand('stop')}
                className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#E2E8F0] text-[11px]"
              >
                Stop
              </button>
              <button
                type="button"
                onClick={() => onPlaybackCommand('reset_position')}
                className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#334155] text-[#FBBF24] text-[11px]"
              >
                Return to Spawn
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Playback, Speed & Camera Tracking Controls */}
      <section className="bg-[#14151B] border border-[#262833] rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#D6D1C7]">Playback & Kamera PM</span>
          <div className="flex items-center gap-1">
            {([0.5, 1, 1.5] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onSpeedChange(spd)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  telemetry.speedMultiplier === spd
                    ? 'bg-[#D99252] text-[#14151B] font-semibold'
                    : 'bg-[#1E2029] text-[#9CA3AF] hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {telemetry.isPaused ? (
            <button
              type="button"
              disabled={!telemetry.loaded}
              onClick={() => onPlaybackCommand('resume')}
              className="px-2 py-1.5 rounded bg-[#1E3A34] border border-[#34D399] text-[#A7F3D0] text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <Play className="w-3 h-3" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!telemetry.loaded}
              onClick={() => onPlaybackCommand('pause')}
              className="px-2 py-1.5 rounded bg-[#1E2029] hover:bg-[#2A2D3A] border border-[#2E3240] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </button>
          )}
          <button
            type="button"
            disabled={!telemetry.loaded}
            onClick={() => onPlaybackCommand('stop')}
            className="px-2 py-1.5 rounded bg-[#1E2029] hover:bg-[#2A2D3A] border border-[#2E3240] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Square className="w-3 h-3" />
            <span>Stop</span>
          </button>
          <button
            type="button"
            disabled={!telemetry.loaded}
            onClick={() => onPlaybackCommand('reset_position')}
            className="px-2 py-1.5 rounded bg-[#1E2029] hover:bg-[#2A2D3A] border border-[#2E3240] text-[#E5E0D8] text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Pos</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#262833]">
          <button
            type="button"
            disabled={!telemetry.loaded}
            onClick={onFocusPM}
            className="px-2.5 py-1.5 rounded bg-[#1F222D] hover:bg-[#2A2E3D] border border-[#323646] text-[#F3EFEA] text-[11px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Focus className="w-3.5 h-3.5 text-[#D99252]" />
            <span>Focus Camera on PM</span>
          </button>
          <button
            type="button"
            onClick={onReturnRoomView}
            className="px-2.5 py-1.5 rounded bg-[#1F222D] hover:bg-[#2A2E3D] border border-[#323646] text-[#F3EFEA] text-[11px] font-medium flex items-center justify-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#7DD3FC]" />
            <span>Return Room View</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onUpdateConfig({ followPMCamera: !config.followPMCamera })}
            className={`px-2 py-1.5 rounded border text-[11px] font-medium flex items-center justify-between ${
              config.followPMCamera
                ? 'bg-[#262936] border-[#D99252] text-[#F5F2EB]'
                : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
            }`}
          >
            <span>Follow PM</span>
            <span className="font-mono text-[10px]">{config.followPMCamera ? 'ON' : 'OFF'}</span>
          </button>
          <button
            type="button"
            onClick={() => onUpdateConfig({ showNavigationPath: !config.showNavigationPath })}
            className={`px-2 py-1.5 rounded border text-[11px] font-medium flex items-center justify-between ${
              config.showNavigationPath
                ? 'bg-[#262936] border-[#4B5563] text-[#F5F2EB]'
                : 'bg-[#191B22] border-[#262833] text-[#8E95A5]'
            }`}
          >
            <span>Path Line</span>
            <span className="font-mono text-[10px]">{config.showNavigationPath ? 'ON' : 'OFF'}</span>
          </button>
          <button
            type="button"
            disabled={!telemetry.loaded}
            onClick={() => onPlaybackCommand('reset_pose')}
            className="px-2 py-1.5 rounded bg-[#191B22] hover:bg-[#222530] border border-[#262833] text-[#B4BAC6] text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Rest Pose</span>
          </button>
        </div>
      </section>

      {/* 5. Developer Edit Anchors Mode (Collapsible) */}
      <section className="bg-[#14151B] border border-[#262833] rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => {
            const next = !editAnchorsOpen;
            setEditAnchorsOpen(next);
            onUpdateConfig({ showSimulationAnchors: next });
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#1B1D26] transition-colors"
        >
          <span className="font-semibold text-[#D6D1C7] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Developer: Edit Activity Anchors (10)</span>
          </span>
          {editAnchorsOpen ? (
            <ChevronDown className="w-4 h-4 text-[#8E95A5]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#8E95A5]" />
          )}
        </button>

        {editAnchorsOpen && (
          <div className="p-3 pt-1 border-t border-[#262833] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateConfig({ showSimulationAnchors: !config.showSimulationAnchors })
                }
                className="px-2 py-1 rounded bg-[#1E2029] border border-[#2E3240] text-[11px] text-[#E5E0D8] flex items-center gap-1"
              >
                <Eye className="w-3 h-3 text-[#38BDF8]" />
                <span>{config.showSimulationAnchors ? 'Hide 3D Markers' : 'Show 3D Markers'}</span>
              </button>
              <button
                type="button"
                onClick={onResetAnchors}
                className="px-2 py-1 rounded bg-[#1E2029] hover:bg-[#2A2D3A] text-[11px] text-[#D99252]"
              >
                Reset Default Anchors
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#8E95A5] block">Select Room Anchor</label>
              <select
                aria-label="Select Room Anchor"
                value={activeAnchorKey}
                onChange={(e) => onSelectAnchor(e.target.value as AnchorId)}
                className="w-full bg-[#1B1D26] border border-[#2E3240] rounded px-2 py-1.5 text-xs text-[#F3EFEA]"
              >
                {(Object.keys(anchors) as AnchorId[]).map((id) => (
                  <option key={id} value={id}>
                    {id} — {anchors[id].label}
                  </option>
                ))}
              </select>
            </div>

            {activeAnchor && (
              <div className="space-y-2 bg-[#191B22] p-2.5 rounded border border-[#262833]">
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                  <div>
                    <label className="text-[#8E95A5] block text-[10px]">X (0..8)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.4"
                      max="7.6"
                      value={activeAnchor.position[0]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateAnchor(activeAnchorKey, {
                          ...activeAnchor,
                          position: [val, 0, activeAnchor.position[2]],
                        });
                      }}
                      className="w-full bg-[#121318] border border-[#2E3240] rounded px-1.5 py-1 text-[#F3EFEA]"
                    />
                  </div>
                  <div>
                    <label className="text-[#8E95A5] block text-[10px]">Z (0..8)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.4"
                      max="7.6"
                      value={activeAnchor.position[2]}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateAnchor(activeAnchorKey, {
                          ...activeAnchor,
                          position: [activeAnchor.position[0], 0, val],
                        });
                      }}
                      className="w-full bg-[#121318] border border-[#2E3240] rounded px-1.5 py-1 text-[#F3EFEA]"
                    />
                  </div>
                  <div>
                    <label className="text-[#8E95A5] block text-[10px]">Facing (rad)</label>
                    <input
                      type="number"
                      step="0.15"
                      value={Number(activeAnchor.facingRad.toFixed(2))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateAnchor(activeAnchorKey, {
                          ...activeAnchor,
                          facingRad: val,
                        });
                      }}
                      className="w-full bg-[#121318] border border-[#2E3240] rounded px-1.5 py-1 text-[#F3EFEA]"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!telemetry.loaded}
                  onClick={() => onTeleportToAnchor(activeAnchorKey)}
                  className="w-full py-1.5 px-2.5 rounded bg-[#262936] hover:bg-[#313546] border border-[#38BDF8]/50 text-[#7DD3FC] text-[11px] font-medium disabled:opacity-40"
                >
                  Teleport Karakter PM ke {activeAnchorKey}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 6. Independent Character GLB & Simulation Config Exports */}
      <div className="space-y-1.5 pt-1">
        <button
          type="button"
          data-testid="export-original-pm-glb-btn"
          onClick={onExportOriginalPMGLB}
          className="w-full py-2 px-3 rounded-lg bg-[#252834] hover:bg-[#303444] border border-[#D99252]/60 text-[#F5F2EB] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#D99252]" />
          <span>Export Original PM GLB (AI_OFFICE_ORIGINAL_BOSS_PM_v1.glb)</span>
        </button>
        <button
          type="button"
          onClick={onExportSimConfig}
          className="w-full py-2 px-3 rounded-lg bg-[#222530] hover:bg-[#2C303E] border border-[#323646] text-[#E5E0D8] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#6EE7B7]" />
          <span>Export PM Simulation Config (.json)</span>
        </button>
      </div>
    </div>
  );
};
