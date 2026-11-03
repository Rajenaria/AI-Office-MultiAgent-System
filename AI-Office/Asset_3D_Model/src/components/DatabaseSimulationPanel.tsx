import React from 'react';
import {
  Backpack,
  Compass,
  Database,
  Download,
  Eye,
  FileJson,
  Focus,
  Image as ImageIcon,
  PackageCheck,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  DATABASE_ACTION_LIST,
  DATABASE_AUTO_DEMO_SEQUENCE,
  DATABASE_CHARACTER_CONSTANTS,
  DATABASE_EXPRESSION_PRESETS,
  DATABASE_HAIR_MATERIAL_PALETTE,
  type DatabaseActionId,
  type DatabaseAnimationPlaybackCommand,
  type DatabaseExpressionId,
  type DatabaseSimulationRuntimeStatus,
  type DatabaseSpeedMultiplier,
} from '../domain/databaseSimulationSpec';

export interface DatabaseSimulationPanelProps {
  status: DatabaseSimulationRuntimeStatus;
  onTriggerAction: (actionId: DatabaseActionId) => void;
  onPlaybackCommand: (cmd: DatabaseAnimationPlaybackCommand) => void;
  onSpeedChange: (speed: DatabaseSpeedMultiplier) => void;
  onTogglePatrol: (enabled: boolean) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onSelectExpression: (expr: DatabaseExpressionId) => void;
  onToggleBackpack: (visible: boolean) => void;
  onFocusCharacterCamera: () => void;
  onExportDatabaseCharacterGLB: () => void;
  onExportDatabaseCharacterPackZip: () => void;
  onExportDatabaseManifestAndBehavior: () => void;
  onExportDatabasePreviewPNG: () => void;
}

const SPEED_OPTIONS: DatabaseSpeedMultiplier[] = [0.5, 1, 1.5];
const EXPRESSION_LIST = Object.values(DATABASE_EXPRESSION_PRESETS);

export const DatabaseSimulationPanel: React.FC<DatabaseSimulationPanelProps> = ({
  status,
  onTriggerAction,
  onPlaybackCommand,
  onSpeedChange,
  onTogglePatrol,
  onStartAutoDemo,
  onStopAutoDemo,
  onSelectExpression,
  onToggleBackpack,
  onFocusCharacterCamera,
  onExportDatabaseCharacterGLB,
  onExportDatabaseCharacterPackZip,
  onExportDatabaseManifestAndBehavior,
  onExportDatabasePreviewPNG,
}) => {
  return (
    <div className="space-y-3 rounded-lg border border-teal-500/35 bg-slate-900/90 p-3 text-xs text-slate-200">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4 text-teal-400" />
            <span className="font-semibold text-white">
              Database Developer — Simulasi Aktivitas
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Agent 03 ·{' '}
            <span className="font-mono text-teal-300">
              {DATABASE_CHARACTER_CONSTANTS.CHARACTER_ID}
            </span>{' '}
            · 1.725m
          </p>
        </div>
        <span className="rounded border border-teal-500/40 bg-teal-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-teal-300">
          SIMULASI / DEMO
        </span>
      </div>

      {/* Visual Identity & 5-Material Layered Hair Summary */}
      <div className="rounded border border-slate-800 bg-slate-950/70 p-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <Database className="h-3.5 w-3.5 text-teal-400" />
            Emerald/Olive Tech Jacket + 360° Chestnut Hair (No Glasses)
          </span>
          <span className="font-mono text-[10px] text-slate-400">21 Clips · 9 Expr</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {DATABASE_HAIR_MATERIAL_PALETTE.map((swatch) => (
            <div
              key={swatch.id}
              className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px]"
              title={`${swatch.label} (${swatch.hex}) — ${swatch.role}`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm border border-white/20"
                style={{ backgroundColor: swatch.hex }}
              />
              <span className="text-slate-300">{swatch.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Runtime Telemetry */}
      <div className="grid grid-cols-2 gap-1.5 rounded border border-slate-800 bg-slate-950/80 p-2 text-[11px]">
        <div>
          <span className="text-slate-400">State:</span>{' '}
          <span className="font-mono font-semibold text-teal-300">{status.currentState}</span>
        </div>
        <div>
          <span className="text-slate-400">Clip:</span>{' '}
          <span className="font-mono text-sky-300">{status.activeClipName}</span>
        </div>
        <div>
          <span className="text-slate-400">Anchor:</span>{' '}
          <span className="font-mono text-amber-300">{status.currentAnchorId}</span>
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

      {/* Active Speech & Demo Thought Readout */}
      <div className="rounded border border-teal-500/25 bg-teal-950/20 p-2 text-[11px]">
        <div className="font-medium text-teal-200">“{status.bubbleText}”</div>
        <div className="mt-1 text-[10px] italic text-slate-400">{status.thoughtText}</div>
      </div>

      {/* Auto-Demo, Patrol & Camera Focus Row */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={status.autoDemoActive ? onStopAutoDemo : onStartAutoDemo}
          className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-semibold transition ${
            status.autoDemoActive
              ? 'border-amber-400 bg-amber-500/20 text-amber-200'
              : 'border-teal-500/50 bg-teal-500/15 text-teal-200 hover:bg-teal-500/25'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {status.autoDemoActive
              ? `Stop Demo (${status.autoDemoStepIndex + 1}/${status.autoDemoTotalSteps})`
              : 'Jalankan Demo Database'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onTogglePatrol(!status.patrolActive)}
          className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-medium transition ${
            status.patrolActive
              ? 'border-sky-400 bg-sky-500/20 text-sky-200'
              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{status.patrolActive ? 'Stop Patroli' : 'Patroli Studio'}</span>
        </button>

        <button
          type="button"
          onClick={onFocusCharacterCamera}
          className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-teal-400/50 hover:text-teal-200"
        >
          <Focus className="h-3.5 w-3.5 text-teal-400" />
          <span>Focus DB Dev</span>
        </button>
      </div>

      {status.autoDemoActive && (
        <div className="rounded border border-amber-500/30 bg-amber-950/25 px-2 py-1 text-[10px] text-amber-200">
          Auto-Demo Step {status.autoDemoStepIndex + 1}/{status.autoDemoTotalSteps}:{' '}
          <span className="font-semibold">
            {DATABASE_AUTO_DEMO_SEQUENCE[status.autoDemoStepIndex]?.label}
          </span>
        </div>
      )}

      {/* Playback & Speed Controls */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 rounded border border-slate-800 bg-slate-950/60 p-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPlaybackCommand(status.isPaused ? 'resume' : 'pause')}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700"
          >
            {status.isPaused ? (
              <>
                <Play className="h-3 w-3 text-teal-400" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-amber-400" />
                <span>Pause</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onPlaybackCommand('restart')}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Restart</span>
          </button>
          <button
            type="button"
            onClick={() => onPlaybackCommand('reset_idle')}
            className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700"
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
                  ? 'bg-teal-500 font-semibold text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Face Identity & Backpack Visibility Row */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex items-center justify-between rounded border border-slate-700/80 bg-slate-900/90 px-2 py-1 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5 text-teal-400" />
            <span>Expressive Eyes</span>
          </span>
          <span className="font-mono text-[10px] text-teal-300">NO GLASSES</span>
        </div>

        <button
          type="button"
          onClick={() => onToggleBackpack(!status.backpackVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1 text-[11px] ${
            status.backpackVisible
              ? 'border-teal-500/40 bg-teal-500/10 text-teal-200'
              : 'border-slate-700 bg-slate-800/60 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1">
            <Backpack className="h-3.5 w-3.5" />
            <span>DB Backpack</span>
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

      {/* 19 Database Developer Actions Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1">
            <Terminal className="h-3.5 w-3.5 text-teal-400" />
            19 Aksi & Animasi Database Developer
          </span>
          <span className="text-[10px] font-normal text-slate-400">
            Klik untuk navigasi & animasi
          </span>
        </div>

        <div className="grid max-h-64 grid-cols-2 gap-1 overflow-y-auto pr-0.5">
          {DATABASE_ACTION_LIST.map((act) => {
            const isSelected = status.currentActionId === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => onTriggerAction(act.id)}
                className={`flex flex-col items-start rounded border px-2 py-1.5 text-left transition ${
                  isSelected
                    ? 'border-teal-400 bg-teal-500/20 text-white'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="truncate text-[11px] font-medium">{act.labelId}</span>
                  <span
                    className={`rounded px-1 py-0.2 font-mono text-[9px] uppercase ${
                      act.posture === 'seated'
                        ? 'bg-sky-500/20 text-sky-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {act.posture === 'seated' ? 'SEAT' : 'STAND'}
                  </span>
                </div>
                <span className="mt-0.5 truncate font-mono text-[9px] text-teal-300/80">
                  {act.clipName} → {act.targetAnchorName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 9 Facial Expressions Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span>9 Ekspresi Wajah Voxel (Tanpa Kacamata)</span>
          <span className="font-mono text-[10px] text-teal-300">{status.currentExpression}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {EXPRESSION_LIST.map((preset) => {
            const active = status.currentExpression === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectExpression(preset.id)}
                className={`rounded border px-1.5 py-1 text-[10px] font-medium transition ${
                  active
                    ? 'border-teal-400 bg-teal-500/20 text-teal-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Production Character Export Suite */}
      <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
          <span className="flex items-center gap-1">
            <PackageCheck className="h-3.5 w-3.5 text-teal-400" />
            Production Asset Export (V1)
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            database_developer_agent
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportDatabaseCharacterGLB}
            className="flex items-center justify-center gap-1 rounded border border-teal-500/40 bg-teal-500/15 px-2 py-1.5 text-[11px] font-semibold text-teal-200 hover:bg-teal-500/25"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .GLB (21 Clips)</span>
          </button>

          <button
            type="button"
            onClick={onExportDatabaseCharacterPackZip}
            className="flex items-center justify-center gap-1 rounded border border-sky-500/40 bg-sky-500/15 px-2 py-1.5 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/25"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Download Pack .ZIP</span>
          </button>

          <button
            type="button"
            onClick={onExportDatabaseManifestAndBehavior}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
          >
            <FileJson className="h-3.5 w-3.5 text-amber-400" />
            <span>Manifest + Behavior JSON</span>
          </button>

          <button
            type="button"
            onClick={onExportDatabasePreviewPNG}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[10px] font-medium text-slate-200 hover:bg-slate-800"
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
            <span>Preview .PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
