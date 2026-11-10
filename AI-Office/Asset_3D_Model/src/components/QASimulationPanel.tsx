import React from 'react';
import {
  Backpack,
  CheckCircle2,
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
  ShieldCheck,
  Sparkles,
  Undo2,
} from 'lucide-react';
import {
  QA_ACTION_LIST,
  QA_AUTO_DEMO_SEQUENCE,
  QA_CHARACTER_CONSTANTS,
  QA_EXPRESSION_PRESETS,
  QA_HAIR_MATERIAL_PALETTE,
  type QAActionId,
  type QAAnimationPlaybackCommand,
  type QAExpressionId,
  type QASimulationRuntimeStatus,
  type QASpeedMultiplier,
} from '../domain/qaSimulationSpec';

export interface QASimulationPanelProps {
  status: QASimulationRuntimeStatus;
  onTriggerAction: (actionId: QAActionId) => void;
  onPlaybackCommand: (cmd: QAAnimationPlaybackCommand) => void;
  onSpeedChange: (speed: QASpeedMultiplier) => void;
  onTogglePatrol: (enabled: boolean) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onSelectExpression: (expr: QAExpressionId) => void;
  onToggleGlasses: (visible: boolean) => void;
  onToggleHeadset: (visible: boolean) => void;
  onToggleBackpack: (visible: boolean) => void;
  onFocusCharacterCamera: () => void;
  onReturnToRoomView?: () => void;
  onExportQACharacterGLB: () => void;
  onExportQACharacterPackZip: () => void;
  onExportQAManifestAndBehavior: () => void;
  onExportQAPreviewPNG: () => void;
}

const SPEED_OPTIONS: QASpeedMultiplier[] = [0.5, 1, 1.5];
const EXPRESSION_LIST = Object.values(QA_EXPRESSION_PRESETS);

export const QASimulationPanel: React.FC<QASimulationPanelProps> = ({
  status,
  onTriggerAction,
  onPlaybackCommand,
  onSpeedChange,
  onTogglePatrol,
  onStartAutoDemo,
  onStopAutoDemo,
  onSelectExpression,
  onToggleGlasses,
  onToggleHeadset,
  onToggleBackpack,
  onFocusCharacterCamera,
  onReturnToRoomView,
  onExportQACharacterGLB,
  onExportQACharacterPackZip,
  onExportQAManifestAndBehavior,
  onExportQAPreviewPNG,
}) => {
  const indicatorBadgeColor =
    status.runtimeIndicator === 'check_verified_badge' ||
    status.runtimeIndicator === 'quality_gate_badge' ||
    status.runtimeIndicator === 'completed_sparkle'
      ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
      : status.runtimeIndicator === 'bug_alert_red'
      ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
      : status.runtimeIndicator === 'test_running_badge'
      ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
      : status.runtimeIndicator === 'thinking_question'
      ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
      : 'border-slate-700 bg-slate-800/80 text-slate-400';

  return (
    <div
      data-testid="qa-simulation-panel"
      className="space-y-3 rounded-lg border border-amber-500/35 bg-slate-900/90 p-3 text-xs text-slate-200"
    >
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-white">
              QA Engineer — Simulasi Aktivitas
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Module 06 ·{' '}
            <span className="font-mono text-amber-300">
              {QA_CHARACTER_CONSTANTS.CHARACTER_ID}
            </span>{' '}
            · {QA_CHARACTER_CONSTANTS.TARGET_HEIGHT_M}m
          </p>
        </div>
        <span className="rounded border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-amber-300">
          SIMULASI / DEMO
        </span>
      </div>

      {/* Visual Identity & Layered Dark Chestnut Hair + Gold Clip Summary */}
      <div className="rounded border border-slate-800 bg-slate-950/70 p-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
            Chestnut Bun + Gold Clip + Black/Yellow QA Jacket + Backpack
          </span>
          <span className="font-mono text-[10px] text-slate-400">23 Clips · 10 Expr</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {QA_HAIR_MATERIAL_PALETTE.map((swatch) => {
            const shortName = swatch.id.replace('qa_hair_', '').split('_')[0];
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

      {/* Live Runtime Status Readout (Section 21.2) */}
      <div className="grid grid-cols-2 gap-1.5 rounded border border-slate-800 bg-slate-950/80 p-2 text-[11px]">
        <div>
          <span className="text-slate-400">Character:</span>{' '}
          <span className="font-mono text-amber-300">
            {QA_CHARACTER_CONSTANTS.CHARACTER_ID}
          </span>
        </div>
        <div>
          <span className="text-slate-400">State:</span>{' '}
          <span className="font-mono font-semibold text-amber-300">
            {status.currentState}
          </span>
        </div>
        <div>
          <span className="text-slate-400">Clip:</span>{' '}
          <span className="font-mono text-sky-300">{status.activeClipName}</span>
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
      <div className="rounded border border-amber-500/25 bg-amber-950/20 p-2 text-[11px]">
        <div className="font-medium text-amber-200">“{status.bubbleText}”</div>
        <div className="mt-1 text-[10px] italic text-slate-400">{status.thoughtText}</div>
      </div>

      {/* Primary Workflow Controls (Section 21.3) */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={status.autoDemoActive ? onStopAutoDemo : onStartAutoDemo}
          className={`flex items-center justify-center gap-1 rounded border px-2 py-1.5 text-[11px] font-semibold transition ${
            status.autoDemoActive
              ? 'border-rose-400 bg-rose-500/20 text-rose-200'
              : 'border-amber-500/50 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {status.autoDemoActive
              ? `Stop Demo (${status.autoDemoStepIndex + 1}/${status.autoDemoTotalSteps})`
              : 'Jalankan Demo QA Otomatis'}
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
          <span>{status.patrolActive ? 'Stop Patroli' : 'Patroli QA Zone'}</span>
        </button>

        <button
          type="button"
          onClick={onFocusCharacterCamera}
          className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] font-medium text-slate-200 hover:border-amber-400/50 hover:text-amber-200"
        >
          <Focus className="h-3.5 w-3.5 text-amber-400" />
          <span>Focus QA Camera</span>
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
        <div className="rounded border border-amber-500/30 bg-amber-950/25 px-2 py-1 text-[10px] text-amber-200">
          Auto-Demo Step {status.autoDemoStepIndex + 1}/{status.autoDemoTotalSteps}:{' '}
          <span className="font-semibold">
            {QA_AUTO_DEMO_SEQUENCE[status.autoDemoStepIndex]?.description}
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
                <Pause className="h-3 w-3 text-amber-400" />
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
                  ? 'bg-amber-500 font-semibold text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Accessory / Prop Controls (Headset, Optional Glasses, QA Backpack) (Section 21.6) */}
      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => onToggleHeadset(!status.headsetVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] transition ${
            status.headsetVisible
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
              : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-1">
            <Headphones className="h-3.5 w-3.5" />
            <span>Headset</span>
          </span>
          <span className="font-mono text-[10px] font-semibold">
            {status.headsetVisible ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onToggleGlasses(!status.glassesVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] transition ${
            status.glassesVisible
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
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
          onClick={() => onToggleBackpack(!status.backpackVisible)}
          className={`flex items-center justify-between rounded border px-2 py-1.5 text-[11px] transition ${
            status.backpackVisible
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
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

      {/* 21 QA Engineer Activity Buttons (Section 21.4) */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-semibold text-slate-300">
            21 Aktivitas QA Engineer (Klik untuk Uji)
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {status.posture.toUpperCase()}
          </span>
        </div>
        <div className="grid max-h-60 grid-cols-2 gap-1 overflow-y-auto pr-0.5">
          {QA_ACTION_LIST.map((act) => {
            const isActive = status.currentActionId === act.id && !status.patrolActive;
            return (
              <button
                key={act.id}
                type="button"
                data-testid={`qa-action-btn-${act.id}`}
                onClick={() => onTriggerAction(act.id)}
                className={`flex flex-col items-start rounded border px-2 py-1.5 text-left transition ${
                  isActive
                    ? 'border-amber-400 bg-amber-500/20 text-amber-100'
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

      {/* 10 Facial Expression Presets (Section 21.5) */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="font-semibold text-slate-300">10 Ekspresi Wajah QA</span>
          <span className="font-mono text-[10px] text-amber-300">{status.currentExpression}</span>
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
                    ? 'border-amber-400 bg-amber-500/25 font-semibold text-amber-200'
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
          <span className="font-semibold text-amber-300">
            Export QA Engineer Asset Pack
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            {QA_CHARACTER_CONSTANTS.GLB_FILENAME}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onExportQACharacterGLB}
            className="flex items-center justify-center gap-1 rounded border border-amber-500/40 bg-amber-500/15 px-2 py-1.5 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/25"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .GLB</span>
          </button>
          <button
            type="button"
            onClick={onExportQACharacterPackZip}
            className="flex items-center justify-center gap-1 rounded border border-sky-500/40 bg-sky-500/15 px-2 py-1.5 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/25"
          >
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Pack .ZIP</span>
          </button>
          <button
            type="button"
            onClick={onExportQAManifestAndBehavior}
            className="flex items-center justify-center gap-1 rounded border border-slate-700 bg-slate-800/80 px-2 py-1.5 text-[11px] text-slate-200 hover:bg-slate-800"
          >
            <FileJson className="h-3.5 w-3.5 text-amber-400" />
            <span>Manifest + Behavior</span>
          </button>
          <button
            type="button"
            onClick={onExportQAPreviewPNG}
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
