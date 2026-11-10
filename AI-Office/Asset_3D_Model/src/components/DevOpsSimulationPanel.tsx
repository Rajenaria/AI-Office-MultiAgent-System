import React from 'react';
import {
  Backpack,
  Cloud,
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
  Undo2,
} from 'lucide-react';
import {
  DEVOPS_ACTION_LIST,
  DEVOPS_AUTO_DEMO_SEQUENCE,
  DEVOPS_CHARACTER_CONSTANTS,
  DEVOPS_EXPRESSION_PRESETS,
  DEVOPS_HAIR_MATERIAL_PALETTE,
  type DevOpsActionId,
  type DevOpsAnimationPlaybackCommand,
  type DevOpsExpressionId,
  type DevOpsSimulationRuntimeStatus,
  type DevOpsSpeedMultiplier,
} from '../domain/devopsSimulationSpec';

export interface DevOpsSimulationPanelProps {
  status: DevOpsSimulationRuntimeStatus;
  onTriggerAction: (actionId: DevOpsActionId) => void;
  onPlaybackCommand: (cmd: DevOpsAnimationPlaybackCommand) => void;
  onSpeedChange: (speed: DevOpsSpeedMultiplier) => void;
  onTogglePatrol: (enabled: boolean) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onSelectExpression: (expr: DevOpsExpressionId) => void;
  onToggleHeadphones: (visible: boolean) => void;
  onToggleGlasses: (visible: boolean) => void;
  onToggleBackpack: (visible: boolean) => void;
  onFocusCharacterCamera: () => void;
  onReturnToRoomView?: () => void;
  onExportDevOpsCharacterGLB: () => void;
  onExportDevOpsCharacterPackZip: () => void;
  onExportDevOpsManifestAndBehavior: () => void;
  onExportDevOpsPreviewPNG: () => void;
}

const SPEED_OPTIONS: DevOpsSpeedMultiplier[] = [0.5, 1, 1.5];
const EXPRESSION_LIST = Object.values(DEVOPS_EXPRESSION_PRESETS);

export const DevOpsSimulationPanel: React.FC<DevOpsSimulationPanelProps> = ({
  status,
  onTriggerAction,
  onPlaybackCommand,
  onSpeedChange,
  onTogglePatrol,
  onStartAutoDemo,
  onStopAutoDemo,
  onSelectExpression,
  onToggleHeadphones,
  onToggleGlasses,
  onToggleBackpack,
  onFocusCharacterCamera,
  onReturnToRoomView,
  onExportDevOpsCharacterGLB,
  onExportDevOpsCharacterPackZip,
  onExportDevOpsManifestAndBehavior,
  onExportDevOpsPreviewPNG,
}) => {
  const indicatorBadgeColor =
    status.runtimeIndicator === 'pipeline_healthy_badge' ||
    status.runtimeIndicator === 'completed_sparkle'
      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
      : status.runtimeIndicator === 'incident_alert_red'
      ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
      : status.runtimeIndicator === 'deploy_cloud_badge' ||
        status.runtimeIndicator === 'ai_engine_sync_badge'
      ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
      : status.runtimeIndicator === 'thinking_question'
      ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
      : 'border-slate-700 bg-slate-800/80 text-slate-400';

  return (
    <div
      data-testid="devops-simulation-panel"
      className="space-y-3 rounded-lg border border-sky-500/35 bg-slate-900/90 p-3 text-xs text-slate-200"
    >
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <Server className="h-4 w-4 text-sky-400" />
            <span className="font-semibold text-white">
              DevOps Engineer — Simulasi Aktivitas
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Module 06 ·{' '}
            <span className="font-mono text-sky-300">
              {DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID}
            </span>{' '}
            · {DEVOPS_CHARACTER_CONSTANTS.TARGET_HEIGHT_M}m
          </p>
        </div>
        <span className="rounded border border-sky-500/40 bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-sky-300">
          SIMULASI / DEMO
        </span>
      </div>

      {/* Visual Identity & Short Dense Curly Black/Charcoal Hair + Cloud Backpack Summary */}
      <div className="rounded border border-slate-800 bg-slate-950/70 p-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <Cloud className="h-3.5 w-3.5 text-sky-400" />
            Curly Black Voxel Hair (9 Groups) + Neck Headphones + Cloud Backpack
          </span>
          <span className="font-mono text-[10px] text-slate-400">27 Clips · 10 Expr</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {DEVOPS_HAIR_MATERIAL_PALETTE.map((swatch) => {
            const shortName = swatch.id.replace('devops_hair_', '').split('_')[0];
            return (
              <div
                key={swatch.id}
                className="flex items-center gap-1 rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px]"
                title={`${swatch.id} (${swatch.hex}) — ${swatch.role}`}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm border border-white/25"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="capitalize text-slate-300">{shortName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Runtime Status Readout */}
      <div className="grid grid-cols-2 gap-1.5 rounded border border-slate-800 bg-slate-950/80 p-2 text-[11px]">
        <div>
          <span className="text-slate-400">Character:</span>{' '}
          <span className="font-mono text-sky-300">
            {DEVOPS_CHARACTER_CONSTANTS.CHARACTER_ID}
          </span>
        </div>
        <div>
          <span className="text-slate-400">State:</span>{' '}
          <span className="font-mono font-semibold text-sky-300">
            {status.currentState}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Clip:</span>{' '}
          <span className="font-mono text-amber-300">{status.activeClipName}</span>
        </div>
        <div>
          <span className="text-slate-400">Anchor:</span>{' '}
          <span className="font-mono text-emerald-300">{status.currentAnchorId}</span>
        </div>
        <div>
          <span className="text-slate-400">Expression:</span>{' '}
          <span className="font-mono text-slate-200">{status.currentExpression}</span>
        </div>
        <div>
          <span className="text-slate-400">Prop:</span>{' '}
          <span className="font-mono text-slate-200">{status.handheldProp}</span>
        </div>
        <div className="col-span-2 flex items-center justify-between border-t border-slate-800/80 pt-1 text-[10px]">
          <span className="text-slate-400">
            Pos: [{status.worldPosition[0].toFixed(2)}, {status.worldPosition[1].toFixed(2)},{' '}
            {status.worldPosition[2].toFixed(2)}] · Facing:{' '}
            {((status.facingRad * 180) / Math.PI).toFixed(0)}°
          </span>
          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold ${indicatorBadgeColor}`}
          >
            IND: {status.runtimeIndicator}
          </span>
        </div>
      </div>

      {/* Active Speech & Demo Thought Readout */}
      <div className="rounded border border-sky-500/25 bg-sky-950/20 p-2 text-[11px]">
        <div className="font-medium text-sky-200">“{status.bubbleText}”</div>
        <div className="mt-1 text-[10px] italic text-slate-400">{status.thoughtText}</div>
      </div>

      {/* Primary Workflow Controls */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          data-testid="devops-auto-demo-btn"
          onClick={status.autoDemoActive ? onStopAutoDemo : onStartAutoDemo}
          className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-semibold transition ${
            status.autoDemoActive
              ? 'border-rose-400 bg-rose-500/20 text-rose-200'
              : 'border-sky-500/50 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {status.autoDemoActive
              ? `Stop Demo (${status.autoDemoStepIndex + 1}/${status.autoDemoTotalSteps})`
              : 'Jalankan Demo DevOps Otomatis'}
          </span>
        </button>

        <button
          type="button"
          data-testid="devops-patrol-btn"
          onClick={() => onTogglePatrol(!status.patrolActive)}
          className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-medium transition ${
            status.patrolActive
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{status.patrolActive ? 'Stop Patroli' : 'Patroli DevOps Zone'}</span>
        </button>

        <button
          type="button"
          data-testid="devops-focus-camera-btn"
          onClick={onFocusCharacterCamera}
          className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-sky-400/50 hover:text-sky-200"
        >
          <Focus className="h-3.5 w-3.5 text-sky-400" />
          <span>Focus DevOps Camera</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onReturnToRoomView) {
              onReturnToRoomView();
            } else {
              onPlaybackCommand('reset_idle');
            }
          }}
          className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-emerald-400/50 hover:text-emerald-200"
        >
          <Undo2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>Return to Room View</span>
        </button>
      </div>

      {status.autoDemoActive && (
        <div className="rounded border border-sky-500/30 bg-sky-950/25 px-2 py-1 text-[10px] text-sky-200">
          Auto-Demo Step {status.autoDemoStepIndex + 1}/{status.autoDemoTotalSteps}:{' '}
          <span className="font-semibold">
            {DEVOPS_AUTO_DEMO_SEQUENCE[status.autoDemoStepIndex]?.description}
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
                <Play className="h-3 w-3 text-emerald-400" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-sky-400" />
                <span>Pause</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onPlaybackCommand('reset_position')}
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Pos</span>
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
                  ? 'bg-sky-500 font-semibold text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Accessory / Prop Controls (Neck Headphones Default ON, Optional Glasses, Cloud Backpack) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          data-testid="devops-toggle-headphones"
          onClick={() => onToggleHeadphones(!status.headphonesVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] transition ${
            status.headphonesVisible
              ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1">
            <Headphones className="h-3.5 w-3.5" />
            <span>Headphones</span>
          </span>
          <span className="font-mono text-[10px] font-semibold">
            {status.headphonesVisible ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          type="button"
          data-testid="devops-toggle-glasses"
          onClick={() => onToggleGlasses(!status.glassesVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] transition ${
            status.glassesVisible
              ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>Glasses</span>
          </span>
          <span className="font-mono text-[10px] font-semibold">
            {status.glassesVisible ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          type="button"
          data-testid="devops-toggle-backpack"
          onClick={() => onToggleBackpack(!status.backpackVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] transition ${
            status.backpackVisible
              ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1">
            <Backpack className="h-3.5 w-3.5" />
            <span>Backpack</span>
          </span>
          <span className="font-mono text-[10px] font-semibold">
            {status.backpackVisible
              ? status.posture === 'seated'
                ? 'AUTO-HIDE'
                : 'ON'
              : 'OFF'}
          </span>
        </button>
      </div>

      {/* 25 DevOps Engineer Activity Buttons */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold text-slate-300">
            25 Aktivitas DevOps Engineer (Klik untuk Uji)
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {status.posture.toUpperCase()}
          </span>
        </div>
        <div className="grid max-h-60 grid-cols-2 gap-1 overflow-y-auto pr-0.5">
          {DEVOPS_ACTION_LIST.map((act) => {
            const isActive = status.currentActionId === act.id && !status.patrolActive;
            return (
              <button
                key={act.id}
                type="button"
                data-testid={`devops-action-btn-${act.id}`}
                onClick={() => onTriggerAction(act.id)}
                className={`flex flex-col items-start rounded border px-2 py-1.5 text-left transition ${
                  isActive
                    ? 'border-sky-400 bg-sky-500/20 text-sky-100'
                    : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <span className="text-[11px] font-medium leading-tight">
                  {act.buttonNumber}. {act.labelId}
                </span>
                <span className="mt-0.5 font-mono text-[9px] text-slate-400">
                  {act.clipName} · {act.targetAnchorName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 10 Facial Expression Presets */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold text-slate-300">10 Ekspresi Wajah DevOps</span>
          <span className="font-mono text-[10px] text-sky-300">{status.currentExpression}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {EXPRESSION_LIST.map((expr) => {
            const isSelected = status.currentExpression === expr.id;
            return (
              <button
                key={expr.id}
                type="button"
                onClick={() => onSelectExpression(expr.id)}
                title={`${expr.label} (${expr.labelId})`}
                className={`rounded border px-1.5 py-1 text-center text-[10px] transition ${
                  isSelected
                    ? 'border-sky-400 bg-sky-500/25 font-semibold text-sky-200'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {expr.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Production Character Pack Export Controls */}
      <div className="border-t border-slate-800 pt-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold text-sky-300">
            Export DevOps Engineer Asset Pack
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {DEVOPS_CHARACTER_CONSTANTS.GLB_FILENAME}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            data-testid="devops-export-glb-btn"
            onClick={onExportDevOpsCharacterGLB}
            className="flex items-center justify-center gap-1 rounded border border-sky-500/40 bg-sky-500/15 px-2 py-1.5 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/25"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .GLB</span>
          </button>
          <button
            type="button"
            data-testid="devops-export-zip-btn"
            onClick={onExportDevOpsCharacterPackZip}
            className="flex items-center justify-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-1.5 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/25"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Pack .ZIP</span>
          </button>
          <button
            type="button"
            onClick={onExportDevOpsManifestAndBehavior}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            <FileJson className="h-3.5 w-3.5 text-sky-400" />
            <span>Manifest + Behavior</span>
          </button>
          <button
            type="button"
            onClick={onExportDevOpsPreviewPNG}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
            <span>Preview .PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
