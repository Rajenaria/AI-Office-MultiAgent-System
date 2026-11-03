import React from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
  Navigation,
  Eye,
  Glasses,
  Download,
  FileJson,
  Image as ImageIcon,
  Archive,
  Focus,
  Maximize2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import {
  CEOActionId,
  CEOExpressionId,
  CEOPlaybackCommand,
  CEO_AUTO_DEMO_SEQUENCE,
  CEO_DEMO_ACTION_LIST,
  CEO_EXPRESSION_LIST,
} from '../domain/ceoSimulationSpec';
import { CEORuntimeStatus } from '../three/CEOCharacterSystem';
import { PRODUCTION_FILENAMES } from '../export/AssetManifestBuilder';

interface CEOSimulationPanelProps {
  ceoStatus: CEORuntimeStatus;
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
  isExporting?: boolean;
}

export const CEOSimulationPanel: React.FC<CEOSimulationPanelProps> = ({
  ceoStatus,
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
  isExporting = false,
}) => {
  const speeds = [0.5, 1.0, 1.5];

  return (
    <div className="space-y-3 text-xs">
      {/* Header & SIMULASI / DEMO Badge */}
      <div className="rounded-xl border border-emerald-500/35 bg-gradient-to-br from-emerald-950/60 via-slate-900/90 to-slate-950 p-3 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-slate-100 tracking-wide">
                CEO Agent — Simulasi Eksekutif
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              CEO Executive Assistant · Executive Brain / Chief of Staff
            </p>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[10px] font-semibold shrink-0">
            SIMULASI / DEMO
          </span>
        </div>

        {/* Live Telemetry Strip */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-lg bg-slate-950/80 border border-slate-800/80 p-2 font-mono text-[10px]">
          <div>
            <span className="text-slate-500 block">STATE / AKSI</span>
            <span className="text-emerald-300 font-semibold">{ceoStatus.state}</span>
          </div>
          <div>
            <span className="text-slate-500 block">ANIMATION CLIP</span>
            <span className="text-sky-300 font-semibold">{ceoStatus.currentClipName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">ANCHOR AKTIF</span>
            <span className="text-slate-200 truncate block">{ceoStatus.currentAnchorId}</span>
          </div>
          <div>
            <span className="text-slate-500 block">POSISI / YAW</span>
            <span className="text-slate-300">
              [{ceoStatus.position[0].toFixed(1)}, {ceoStatus.position[2].toFixed(1)}] · {ceoStatus.rotationYDeg}°
            </span>
          </div>
        </div>

        {/* Active Demo Speech / Status Bubble Readout */}
        {ceoStatus.bubbleText && (
          <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-950/35 px-2.5 py-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 mb-0.5">
              <span>STATUS: {ceoStatus.bubbleBadge}</span>
              <span className="text-amber-300/90">DEMO VISUAL ONLY</span>
            </div>
            <p className="text-[11px] text-slate-200 leading-snug">{ceoStatus.bubbleText}</p>
          </div>
        )}
      </div>

      {/* Auto-Demo Sequence & Camera Focus Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-2.5 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={ceoStatus.isAutoDemoRunning ? onStopCEOAutoDemo : onStartCEOAutoDemo}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition ${
              ceoStatus.isAutoDemoRunning
                ? 'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-400/50'
                : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {ceoStatus.isAutoDemoRunning ? 'Hentikan Demo CEO' : 'Jalankan Demo CEO'}
          </button>

          <button
            type="button"
            onClick={() => onToggleCEOPatrol(!ceoStatus.isPatrolling)}
            className={`px-2.5 py-2 rounded-lg font-medium text-xs border transition flex items-center gap-1 ${
              ceoStatus.isPatrolling
                ? 'bg-teal-500/20 border-teal-400/60 text-teal-200'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Patroli otomatis antar anchor ruangan CEO"
          >
            <Navigation className="w-3.5 h-3.5" />
            Patroli
          </button>
        </div>

        {ceoStatus.isAutoDemoRunning && (
          <div className="rounded-lg bg-slate-950/90 border border-emerald-500/30 p-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300">
              <span>
                AUTO-DEMO STEP {ceoStatus.autoDemoStepIndex + 1}/{ceoStatus.autoDemoTotalSteps}
              </span>
              <span>
                {CEO_AUTO_DEMO_SEQUENCE[ceoStatus.autoDemoStepIndex]?.stepLabel ?? ''}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{
                  width: `${((ceoStatus.autoDemoStepIndex + 1) / ceoStatus.autoDemoTotalSteps) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Camera Focus & Return to Room View */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onFocusCEOCharacter}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-[11px] font-medium transition"
          >
            <Focus className="w-3.5 h-3.5 text-emerald-400" />
            Focus CEO Character
          </button>
          <button
            type="button"
            onClick={onReturnToRoomView}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-[11px] font-medium transition"
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            Return to Room View
          </button>
        </div>
      </div>

      {/* Playback & Speed Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Kontrol Playback & Kecepatan
          </span>
          <div className="flex items-center gap-1">
            {speeds.map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onSetCEOSpeed(spd)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border transition ${
                  Math.abs(ceoStatus.speedMultiplier - spd) < 0.05
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => onCEOPlaybackCommand(ceoStatus.isPaused ? 'resume' : 'play')}
            className="flex flex-col items-center justify-center py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 text-[10px]"
            title="Play / Resume"
          >
            <Play className="w-3.5 h-3.5 mb-0.5" />
            {ceoStatus.isPaused ? 'Resume' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => onCEOPlaybackCommand('pause')}
            className="flex flex-col items-center justify-center py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-[10px]"
            title="Pause"
          >
            <Pause className="w-3.5 h-3.5 mb-0.5" />
            Pause
          </button>
          <button
            type="button"
            onClick={() => onCEOPlaybackCommand('stop')}
            className="flex flex-col items-center justify-center py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-300 text-[10px]"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5 mb-0.5" />
            Stop
          </button>
          <button
            type="button"
            onClick={() => onCEOPlaybackCommand('reset_pose')}
            className="flex flex-col items-center justify-center py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px]"
            title="Reset Pose"
          >
            <RotateCcw className="w-3.5 h-3.5 mb-0.5" />
            Pose
          </button>
          <button
            type="button"
            onClick={() => onCEOPlaybackCommand('reset_position')}
            className="flex flex-col items-center justify-center py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-[10px]"
            title="Reset Position ke CEO_ROOM_IDLE"
          >
            <RotateCcw className="w-3.5 h-3.5 mb-0.5" />
            Posisi
          </button>
        </div>
      </div>

      {/* 14 Executive Action Buttons */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            14 Aksi Eksekutif (Klik untuk Simulasi)
          </span>
          <span className="text-[10px] font-mono text-emerald-400">14 Klip GLB</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {CEO_DEMO_ACTION_LIST.map((action) => {
            const isActive = ceoStatus.activeActionId === action.id;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onTriggerCEOAction(action.id)}
                className={`text-left px-2.5 py-2 rounded-lg border transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                    : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-[11px] leading-tight">
                    {action.labelId}
                  </span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">
                  {action.clipName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7 Facial Expressions & Open-Frame Eyeglasses Toggle */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-emerald-400" />
            Ekspresi Wajah (7 State) & Kacamata
          </span>
          <button
            type="button"
            onClick={() => onSetCEOGlassesVisible(!ceoStatus.glassesVisible)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition ${
              ceoStatus.glassesVisible
                ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Glasses className="w-3 h-3" />
            {ceoStatus.glassesVisible ? 'Glasses ON' : 'Glasses OFF'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {CEO_EXPRESSION_LIST.map((expr) => {
            const active = ceoStatus.expressionId === expr.id;
            return (
              <button
                key={expr.id}
                type="button"
                onClick={() => onSetCEOExpression(expr.id)}
                className={`px-2 py-1 rounded text-[10px] font-medium border transition ${
                  active
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {expr.labelId}
              </button>
            );
          })}
        </div>
      </div>

      {/* Standalone CEO Character Production Export Section */}
      <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
            Export Karakter CEO (Standalone GLB)
          </span>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            1.725u · 14 Clips
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadCEOCharacterGlb}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-semibold text-[11px] transition"
          >
            <Download className="w-3.5 h-3.5" />
            {PRODUCTION_FILENAMES.CEO_CHARACTER_GLB}
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadCEOCharacterPackZip}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-teal-600/90 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-[11px] transition"
          >
            <Archive className="w-3.5 h-3.5" />
            CEO Character Pack (.zip)
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadCEOCharacterManifestAndBehavior}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-medium transition"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-400" />
            Manifest + Behavior JSON
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={onDownloadCEOCharacterPreviewPng}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-medium transition"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            Preview PNG
          </button>
        </div>
      </div>
    </div>
  );
};
