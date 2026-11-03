import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Compass,
  Focus,
  Eye,
  Download,
  FileJson,
  Image as ImageIcon,
  Archive,
  Code2,
  Briefcase,
} from 'lucide-react';
import {
  FRONTEND_ACTION_LIST,
  FRONTEND_CHARACTER_CONSTANTS,
  FRONTEND_EXPRESSION_PRESETS,
  FrontendActionId,
  FrontendAnimationPlaybackCommand,
  FrontendExpressionId,
  FrontendSimulationRuntimeStatus,
  FrontendSpeedMultiplier,
} from '../domain/frontendSimulationSpec';

export interface FrontendSimulationPanelProps {
  status: FrontendSimulationRuntimeStatus | null;
  onTriggerAction: (actionId: FrontendActionId) => void;
  onPlaybackCommand: (cmd: FrontendAnimationPlaybackCommand) => void;
  onSetSpeed: (speed: FrontendSpeedMultiplier) => void;
  onSetPatrol: (active: boolean) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onSetExpression: (expr: FrontendExpressionId) => void;
  onSetGlassesVisible: (visible: boolean) => void;
  onSetBackpackVisible: (visible: boolean) => void;
  onFocusCharacter: () => void;
  onReturnToRoomView: () => void;
  onExportCharacterGLB: () => void;
  onExportCharacterPackZip: () => void;
  onExportCharacterManifestAndBehavior: () => void;
  onExportCharacterPreviewPng: () => void;
  exportBusy?: boolean;
}

const DEFAULT_STATUS: FrontendSimulationRuntimeStatus = {
  characterId: FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID,
  displayName: FRONTEND_CHARACTER_CONSTANTS.DISPLAY_NAME,
  currentState: 'IDLE',
  currentActionId: 'idle',
  currentActionLabel: 'Berdiri Tenang (Idle)',
  activeClipName: 'Idle_Breathing',
  currentAnchorId: 'ENGINEERING_ROOM_IDLE',
  targetAnchorId: 'ENGINEERING_ROOM_IDLE',
  currentExpression: 'neutral',
  posture: 'standing',
  handheldProp: 'none',
  isWalking: false,
  isPaused: false,
  patrolActive: false,
  autoDemoActive: false,
  autoDemoStepIndex: 0,
  autoDemoTotalSteps: 10,
  speedMultiplier: 1,
  glassesVisible: true,
  backpackVisible: true,
  backpackAutoHiddenForSeat: false,
  bubbleText: 'Frontend Studio siap — menunggu tiket sprint atau PR review berikutnya.',
  thoughtText: 'Semua komponen React & TypeScript di Zone A berjalan stabil.',
  worldPosition: [5.85, 0, 11.2],
  facingRad: 0,
};

export const FrontendSimulationPanel: React.FC<FrontendSimulationPanelProps> = ({
  status: rawStatus,
  onTriggerAction,
  onPlaybackCommand,
  onSetSpeed,
  onSetPatrol,
  onStartAutoDemo,
  onStopAutoDemo,
  onSetExpression,
  onSetGlassesVisible,
  onSetBackpackVisible,
  onFocusCharacter,
  onReturnToRoomView,
  onExportCharacterGLB,
  onExportCharacterPackZip,
  onExportCharacterManifestAndBehavior,
  onExportCharacterPreviewPng,
  exportBusy = false,
}) => {
  const st = rawStatus ?? DEFAULT_STATUS;
  const expressions = Object.values(FRONTEND_EXPRESSION_PRESETS);

  return (
    <div
      data-testid="frontend-simulation-panel"
      className="bg-slate-900/95 border border-orange-500/35 rounded-lg p-3 space-y-3 text-xs text-slate-200"
    >
      {/* Header & Role Identity */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="font-bold text-orange-300 tracking-wide">
              Frontend Developer — Simulasi Aktivitas
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ID: <code className="text-orange-300">{FRONTEND_CHARACTER_CONSTANTS.CHARACTER_ID}</code> · Zone A North Workstation (`1.725u`)
          </p>
        </div>
        <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-400/40 text-orange-300 font-semibold text-[10px] shrink-0">
          SIMULASI / DEMO
        </span>
      </div>

      {/* Live Telemetry Summary Card */}
      <div className="bg-slate-950/90 border border-slate-800 rounded p-2.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Status & Clip Aktif:</span>
          <span
            data-testid="frontend-active-state-badge"
            className="px-1.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/40 text-orange-300 font-mono text-[10px]"
          >
            {st.currentState} · {st.activeClipName}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-slate-800/80">
          <div>
            <span className="text-slate-500">Anchor:</span>{' '}
            <span className="font-mono text-slate-200">{st.currentAnchorId}</span>
          </div>
          <div>
            <span className="text-slate-500">Postur / Prop:</span>{' '}
            <span className="font-mono text-slate-200">
              {st.posture} / {st.handheldProp}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Posisi XZ:</span>{' '}
            <span className="font-mono text-slate-200">
              [{st.worldPosition[0]}, {st.worldPosition[2]}]
            </span>
          </div>
          <div>
            <span className="text-slate-500">Backpack:</span>{' '}
            <span className="font-mono text-slate-200">
              {st.backpackAutoHiddenForSeat
                ? 'Auto-Hidden (Seated)'
                : st.backpackVisible
                ? 'Visible'
                : 'Hidden'}
            </span>
          </div>
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-orange-200/90 italic">
          “{st.bubbleText}”
        </div>
      </div>

      {/* Primary Demo, Patrol & Camera Focus Controls */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          data-testid="frontend-auto-demo-btn"
          onClick={st.autoDemoActive ? onStopAutoDemo : onStartAutoDemo}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded font-semibold transition border ${
            st.autoDemoActive
              ? 'bg-amber-600/30 border-amber-400 text-amber-200'
              : 'bg-orange-600 hover:bg-orange-500 border-orange-400/50 text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {st.autoDemoActive
            ? `Stop Demo (${st.autoDemoStepIndex}/${st.autoDemoTotalSteps})`
            : 'Jalankan Demo Frontend'}
        </button>

        <button
          type="button"
          data-testid="frontend-patrol-btn"
          onClick={() => onSetPatrol(!st.patrolActive)}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded font-semibold transition border ${
            st.patrolActive
              ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          {st.patrolActive ? 'Stop Patrol Studio' : 'Patrol Engineering'}
        </button>

        <button
          type="button"
          data-testid="frontend-focus-camera-btn"
          onClick={onFocusCharacter}
          className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium"
        >
          <Focus className="w-3.5 h-3.5 text-orange-400" />
          Focus Frontend Dev
        </button>

        <button
          type="button"
          onClick={onReturnToRoomView}
          className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium"
        >
          Return Room View
        </button>
      </div>

      {/* Playback, Speed & Accessory Toggles (Glasses & Backpack) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded p-2 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPlaybackCommand(st.isPaused ? 'resume' : 'pause')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1"
            >
              {st.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              {st.isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={() => onPlaybackCommand('restart')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
              title="Restart Active Animation Clip"
            >
              Restart
            </button>
            <button
              type="button"
              onClick={() => onPlaybackCommand('reset_idle')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Idle
            </button>
          </div>

          <div className="flex items-center gap-1">
            {([0.5, 1, 1.5] as FrontendSpeedMultiplier[]).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => onSetSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                  st.speedMultiplier === spd
                    ? 'bg-orange-500/30 border-orange-400 text-orange-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800/80">
          <button
            type="button"
            data-testid="frontend-toggle-glasses-btn"
            onClick={() => onSetGlassesVisible(!st.glassesVisible)}
            className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[11px] border ${
              st.glassesVisible
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Eye className="w-3 h-3" />
            Glasses: {st.glassesVisible ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            data-testid="frontend-toggle-backpack-btn"
            onClick={() => onSetBackpackVisible(!st.backpackVisible)}
            className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[11px] border ${
              st.backpackVisible
                ? 'bg-orange-500/20 border-orange-500/40 text-orange-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            Backpack: {st.backpackVisible ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 16 Frontend Developer Actions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">
            16 Aktivitas & Animasi Frontend Developer:
          </span>
          <span className="text-[10px] text-slate-400 font-mono">16 Embedded Clips</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-0.5">
          {FRONTEND_ACTION_LIST.map((act) => {
            const active = st.currentActionId === act.id;
            return (
              <button
                key={act.id}
                type="button"
                data-testid={`frontend-action-${act.id}`}
                onClick={() => onTriggerAction(act.id)}
                className={`text-left px-2 py-1.5 rounded border transition flex flex-col justify-between ${
                  active
                    ? 'bg-orange-500/25 border-orange-400 text-orange-100'
                    : 'bg-slate-950/80 hover:bg-slate-800/90 border-slate-800 text-slate-300'
                }`}
              >
                <span className="font-medium text-[11px] leading-tight">{act.label}</span>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                  {act.clipName} · {act.posture}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 9 Facial Expressions */}
      <div className="space-y-1.5 pt-1 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">9 Ekspresi Wajah (Runtime):</span>
          <span className="text-[10px] font-mono text-orange-300">{st.currentExpression}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {expressions.map((exp) => {
            const active = st.currentExpression === exp.id;
            return (
              <button
                key={exp.id}
                type="button"
                data-testid={`frontend-expr-${exp.id}`}
                onClick={() => onSetExpression(exp.id)}
                className={`px-1.5 py-1 rounded text-[10px] border truncate ${
                  active
                    ? 'bg-orange-500/25 border-orange-400 text-orange-200 font-semibold'
                    : 'bg-slate-950/70 hover:bg-slate-800 border-slate-800 text-slate-400'
                }`}
                title={exp.idLabel}
              >
                {exp.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Standalone Production Character Export Deliverables */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-orange-300">
            Export Standalone Frontend Developer:
          </span>
          <span className="text-[10px] font-mono text-slate-400">16 Clips Embedded</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            disabled={exportBusy}
            data-testid="export-frontend-glb-btn"
            onClick={onExportCharacterGLB}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-orange-600/90 hover:bg-orange-500 disabled:opacity-50 text-white font-semibold text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            frontend_developer_agent.glb
          </button>

          <button
            type="button"
            disabled={exportBusy}
            data-testid="export-frontend-pack-zip-btn"
            onClick={onExportCharacterPackZip}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-orange-500/40 text-orange-200 font-semibold text-[11px]"
          >
            <Archive className="w-3.5 h-3.5" />
            Frontend Pack (.zip)
          </button>

          <button
            type="button"
            disabled={exportBusy}
            onClick={onExportCharacterManifestAndBehavior}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 text-[11px]"
          >
            <FileJson className="w-3.5 h-3.5 text-orange-400" />
            Manifest + Behavior JSON
          </button>

          <button
            type="button"
            disabled={exportBusy}
            onClick={onExportCharacterPreviewPng}
            className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-slate-700 text-slate-200 text-[11px]"
          >
            <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
            Character Preview PNG
          </button>
        </div>
      </div>
    </div>
  );
};
