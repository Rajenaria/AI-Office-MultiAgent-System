import React from 'react';
import {
  Backpack,
  Compass,
  Download,
  Eye,
  FileJson,
  Focus,
  Headphones,
  Image as ImageIcon,
  PackageCheck,
  Pause,
  Play,
  RotateCcw,
  Server,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  BACKEND_ACTION_LIST,
  BACKEND_AUTO_DEMO_SEQUENCE,
  BACKEND_CHARACTER_CONSTANTS,
  BACKEND_EXPRESSION_PRESETS,
  BACKEND_HAIR_MATERIAL_PALETTE,
  BACKEND_REQUIRED_EXPRESSIONS,
  type BackendActionId,
  type BackendAnimationPlaybackCommand,
  type BackendExpressionId,
  type BackendSimulationRuntimeStatus,
  type BackendSpeedMultiplier,
} from '../domain/backendSimulationSpec';

export interface BackendSimulationPanelProps {
  status: BackendSimulationRuntimeStatus;
  onTriggerAction: (actionId: BackendActionId) => void;
  onPlaybackCommand: (cmd: BackendAnimationPlaybackCommand) => void;
  onSpeedChange: (speed: BackendSpeedMultiplier) => void;
  onTogglePatrol: (enabled: boolean) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onSelectExpression: (expr: BackendExpressionId) => void;
  onToggleGlasses: (visible: boolean) => void;
  onToggleBackpack: (visible: boolean) => void;
  onFocusCharacterCamera: () => void;
  onExportBackendCharacterGLB: () => void;
  onExportBackendCharacterPackZip: () => void;
  onExportBackendManifestAndBehavior: () => void;
  onExportBackendPreviewPNG: () => void;
}

const SPEED_OPTIONS: BackendSpeedMultiplier[] = [0.5, 1, 1.5];

export const BackendSimulationPanel: React.FC<BackendSimulationPanelProps> = ({
  status,
  onTriggerAction,
  onPlaybackCommand,
  onSpeedChange,
  onTogglePatrol,
  onStartAutoDemo,
  onStopAutoDemo,
  onSelectExpression,
  onToggleGlasses,
  onToggleBackpack,
  onFocusCharacterCamera,
  onExportBackendCharacterGLB,
  onExportBackendCharacterPackZip,
  onExportBackendManifestAndBehavior,
  onExportBackendPreviewPNG,
}) => {
  return (
    <div className="space-y-3 rounded-lg border border-emerald-500/30 bg-slate-900/90 p-3 text-xs text-slate-200">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <Server className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-white">
              Backend Developer — Simulasi Aktivitas
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Agent 02 · <span className="font-mono text-emerald-300">{BACKEND_CHARACTER_CONSTANTS.CHARACTER_ID}</span> · 1.725m
          </p>
        </div>
        <span className="rounded border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-300">
          SIMULASI / DEMO
        </span>
      </div>

      {/* Visual Identity & 4-Material Layered Hair Summary */}
      <div className="rounded border border-slate-800 bg-slate-950/70 p-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <Headphones className="h-3.5 w-3.5 text-emerald-400" />
            Charcoal Tech Jacket + Neck Headphones + 360° Layered Hair
          </span>
          <span className="font-mono text-[10px] text-slate-400">17 Clips · 9 Expr</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          {BACKEND_HAIR_MATERIAL_PALETTE.map((swatch) => (
            <div
              key={swatch.id}
              className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px]"
              title={`${swatch.label} (${swatch.hex})`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm border border-white/20"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="capitalize text-slate-300">{swatch.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Runtime Telemetry */}
      <div className="grid grid-cols-2 gap-1.5 rounded border border-slate-800 bg-slate-950/80 p-2 text-[11px]">
        <div>
          <span className="text-slate-400">State:</span>{' '}
          <span className="font-mono font-semibold text-emerald-300">{status.currentState}</span>
        </div>
        <div>
          <span className="text-slate-400">Clip:</span>{' '}
          <span className="font-mono text-sky-300">{status.activeClipName}</span>
        </div>
        <div>
          <span className="text-slate-400">Anchor:</span>{' '}
          <span className="font-mono text-amber-300">{status.targetAnchorId}</span>
        </div>
        <div>
          <span className="text-slate-400">Posture / Prop:</span>{' '}
          <span className="font-mono text-slate-200">
            {status.posture} · {status.handheldProp}
          </span>
        </div>
        <div className="col-span-2 flex items-center justify-between border-t border-slate-800/80 pt-1 text-[10px] text-slate-400">
          <span>
            Pos: [{status.worldPosition[0].toFixed(2)}, {status.worldPosition[1].toFixed(2)},{' '}
            {status.worldPosition[2].toFixed(2)}]
          </span>
          <span>Facing: {((status.facingRad * 180) / Math.PI).toFixed(0)}°</span>
        </div>
      </div>

      {/* Speech & Technical Thought Readout */}
      <div className="rounded border border-emerald-500/25 bg-emerald-950/20 p-2 text-[11px]">
        <div className="font-medium text-emerald-200">“{status.bubbleText}”</div>
        <div className="mt-0.5 text-[10px] italic text-slate-400">
          System Note: {status.thoughtText}
        </div>
      </div>

      {/* Primary Demo, Patrol & Focus Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={status.autoDemoActive ? onStopAutoDemo : onStartAutoDemo}
          className={`flex items-center justify-center gap-1 rounded px-2 py-1.5 text-[11px] font-semibold transition ${
            status.autoDemoActive
              ? 'border border-amber-400 bg-amber-500/25 text-amber-200'
              : 'border border-emerald-500/50 bg-emerald-600/25 text-emerald-200 hover:bg-emerald-600/35'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {status.autoDemoActive
            ? `Stop Demo (${status.autoDemoStepIndex + 1}/${BACKEND_AUTO_DEMO_SEQUENCE.length})`
            : 'Jalankan Demo Backend'}
        </button>

        <button
          type="button"
          onClick={() => onTogglePatrol(!status.patrolActive)}
          className={`flex items-center justify-center gap-1 rounded px-2 py-1.5 text-[11px] font-medium transition ${
            status.patrolActive
              ? 'border border-sky-400 bg-sky-500/25 text-sky-200'
              : 'border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          {status.patrolActive ? 'Stop Patroli' : 'Patroli Studio'}
        </button>

        <button
          type="button"
          onClick={onFocusCharacterCamera}
          className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-emerald-500/40 hover:bg-slate-700"
        >
          <Focus className="h-3.5 w-3.5 text-emerald-400" />
          Focus Backend Dev
        </button>
      </div>

      {/* Playback & Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded border border-slate-800 bg-slate-950/60 p-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPlaybackCommand(status.isPaused ? 'resume' : 'pause')}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700"
          >
            {status.isPaused ? <Play className="h-3 w-3 text-emerald-400" /> : <Pause className="h-3 w-3 text-amber-400" />}
            {status.isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={() => onPlaybackCommand('restart')}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700"
          >
            <RotateCcw className="h-3 w-3" />
            Restart
          </button>
          <button
            type="button"
            onClick={() => onPlaybackCommand('reset_idle')}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700"
          >
            Reset Idle
          </button>
        </div>

        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => onSpeedChange(spd)}
              className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                status.speedMultiplier === spd
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Glasses & Backpack Toggles */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onToggleGlasses(!status.glassesVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] ${
            status.glassesVisible
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
              : 'border-slate-700 bg-slate-800/70 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            Thick Glasses
          </span>
          <span className="font-mono text-[10px]">{status.glassesVisible ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleBackpack(!status.backpackVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] ${
            status.backpackVisible
              ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
              : 'border-slate-700 bg-slate-800/70 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1">
            <Backpack className="h-3.5 w-3.5" />
            Tech Backpack
          </span>
          <span className="font-mono text-[10px]">
            {status.backpackAutoHiddenForSeat
              ? 'SEATED-HIDE'
              : status.backpackVisible
                ? 'ON'
                : 'OFF'}
          </span>
        </button>
      </div>

      {/* 17 Backend Engineering Actions Grid */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            17 Aksi & Animasi Backend Developer
          </span>
          <span className="text-[10px] text-slate-400">Klik untuk navigasi & animasi</span>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {BACKEND_ACTION_LIST.map((act) => {
            const active = status.currentActionId === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => onTriggerAction(act.id)}
                className={`flex flex-col items-start rounded border px-2 py-1.5 text-left transition ${
                  active
                    ? 'border-emerald-400 bg-emerald-500/20 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="truncate text-[11px] font-medium">{act.label}</span>
                  <span className="rounded bg-slate-800 px-1 py-0.5 font-mono text-[9px] text-slate-400">
                    {act.posture === 'seated' ? 'SEAT' : 'STAND'}
                  </span>
                </div>
                <span className="mt-0.5 truncate font-mono text-[9px] text-emerald-300/80">
                  {act.clipName} → {act.targetAnchorName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 9 Facial Expressions */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold text-slate-300">9 Ekspresi Wajah Voxel</span>
          <span className="font-mono text-[10px] text-emerald-300">{status.currentExpression}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {BACKEND_REQUIRED_EXPRESSIONS.map((exprId) => {
            const preset = BACKEND_EXPRESSION_PRESETS[exprId];
            const isSelected = status.currentExpression === exprId;
            return (
              <button
                key={exprId}
                type="button"
                onClick={() => onSelectExpression(exprId)}
                className={`rounded border px-1.5 py-1 text-[10px] font-medium transition ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Standalone Production Asset Export Controls */}
      <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-200">
            Production Asset Export (`backend_developer_agent`)
          </span>
          <span className="font-mono text-[10px] text-emerald-400">GLB + ZIP + JSON</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportBackendCharacterGLB}
            className="flex items-center justify-center gap-1 rounded border border-emerald-500/50 bg-emerald-600/20 px-2 py-1.5 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-600/30"
          >
            <Download className="h-3.5 w-3.5" />
            Export .GLB (17 Clips)
          </button>
          <button
            type="button"
            onClick={onExportBackendCharacterPackZip}
            className="flex items-center justify-center gap-1 rounded border border-sky-500/50 bg-sky-600/20 px-2 py-1.5 text-[11px] font-semibold text-sky-200 hover:bg-sky-600/30"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            Export Pack (.ZIP)
          </button>
          <button
            type="button"
            onClick={onExportBackendManifestAndBehavior}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-700"
          >
            <FileJson className="h-3.5 w-3.5 text-amber-400" />
            Manifest + Behavior
          </button>
          <button
            type="button"
            onClick={onExportBackendPreviewPNG}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-700"
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
            Preview .PNG
          </button>
        </div>
      </div>
    </div>
  );
};
