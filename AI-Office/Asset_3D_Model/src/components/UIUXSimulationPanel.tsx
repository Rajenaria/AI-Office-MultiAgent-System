import React from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Coffee,
  Compass,
  Download,
  Eye,
  FileArchive,
  FileCode2,
  FileText,
  Focus,
  Footprints,
  Glasses,
  Image as ImageIcon,
  Laptop,
  Layers,
  MessageSquare,
  Palette,
  Pause,
  PenTool,
  Play,
  Presentation,
  RotateCcw,
  Smile,
  Sparkles,
  UserCheck,
  Workflow,
} from 'lucide-react';
import {
  UIUXActionId,
  UIUXAnimationPlaybackCommand,
  UIUXExpressionId,
  UIUXRuntimeStatusSnapshot,
  UIUXSpeedMultiplier,
  UIUX_CHARACTER_CONSTANTS,
  UIUX_DEMO_ACTION_LIST,
  UIUX_EXPRESSION_LIST,
} from '../domain/uiuxSimulationSpec';

export interface UIUXSimulationPanelProps {
  status: UIUXRuntimeStatusSnapshot;
  showPathHelpers?: boolean;
  onTriggerAction: (actionId: UIUXActionId) => void;
  onPlaybackCommand: (cmd: UIUXAnimationPlaybackCommand) => void;
  onSetSpeed: (speed: UIUXSpeedMultiplier) => void;
  onTogglePatrol: (enabled: boolean) => void;
  onStartAutoDemo: () => void;
  onStopAutoDemo: () => void;
  onSetExpression: (expr: UIUXExpressionId) => void;
  onSetGlassesVisible: (visible: boolean) => void;
  onTogglePathHelpers?: (show: boolean) => void;
  onFocusUIUXCharacter?: () => void;
  onFocusCharacter?: () => void;
  onReturnToRoomView: () => void;
  onExportUIUXCharacterGlb?: () => void;
  onDownloadCharacterGlb?: () => void;
  onExportUIUXCharacterPackZip?: () => void;
  onDownloadCharacterPackZip?: () => void;
  onExportUIUXCharacterManifestAndBehavior?: () => void;
  onDownloadCharacterManifestAndBehavior?: () => void;
  onExportUIUXCharacterPreviewPng?: () => void;
  onDownloadCharacterPreviewPng?: () => void;
}

const ACTION_ICONS: Record<UIUXActionId, React.ReactNode> = {
  idle: <UserCheck className="w-3.5 h-3.5" />,
  walk: <Footprints className="w-3.5 h-3.5" />,
  talk: <MessageSquare className="w-3.5 h-3.5" />,
  present: <Presentation className="w-3.5 h-3.5" />,
  think: <Sparkles className="w-3.5 h-3.5" />,
  read_brief: <FileText className="w-3.5 h-3.5" />,
  review_design: <ClipboardCheck className="w-3.5 h-3.5" />,
  sketch: <PenTool className="w-3.5 h-3.5" />,
  laptop_work: <Laptop className="w-3.5 h-3.5" />,
  prototype_review: <Layers className="w-3.5 h-3.5" />,
  design_system_work: <Palette className="w-3.5 h-3.5" />,
  user_flow_analysis: <Workflow className="w-3.5 h-3.5" />,
  coffee_break: <Coffee className="w-3.5 h-3.5" />,
  approve: <CheckCircle2 className="w-3.5 h-3.5" />,
  task_completed: <Sparkles className="w-3.5 h-3.5" />,
};

export const UIUXSimulationPanel: React.FC<UIUXSimulationPanelProps> = ({
  status,
  showPathHelpers = true,
  onTriggerAction,
  onPlaybackCommand,
  onSetSpeed,
  onTogglePatrol,
  onStartAutoDemo,
  onStopAutoDemo,
  onSetExpression,
  onSetGlassesVisible,
  onTogglePathHelpers,
  onFocusUIUXCharacter,
  onFocusCharacter,
  onReturnToRoomView,
  onExportUIUXCharacterGlb,
  onDownloadCharacterGlb,
  onExportUIUXCharacterPackZip,
  onDownloadCharacterPackZip,
  onExportUIUXCharacterManifestAndBehavior,
  onDownloadCharacterManifestAndBehavior,
  onExportUIUXCharacterPreviewPng,
  onDownloadCharacterPreviewPng,
}) => {
  const activeExpr = status.currentExpression ?? status.expressionId ?? 'neutral';
  const activeProp = status.activeProp ?? status.activePropId ?? 'none';
  const yawDeg =
    typeof status.facingDeg === 'number' && !Number.isNaN(status.facingDeg)
      ? status.facingDeg
      : typeof status.rotationYDeg === 'number' && !Number.isNaN(status.rotationYDeg)
      ? status.rotationYDeg
      : 180;
  const badgeLabel =
    status.bubbleBadge ?? status.currentActionDef?.statusBadgeText ?? 'SIMULASI / DEMO';
  const bubbleMsg =
    status.bubbleText ??
    status.currentActionDef?.speechBubble ??
    status.currentActionDef?.thoughtBubble ??
    null;
  const patrolOn = Boolean(status.patrolActive ?? status.isPatrolling);

  const handleFocus = onFocusUIUXCharacter || onFocusCharacter || (() => {});
  const handleExportGlb = onExportUIUXCharacterGlb || onDownloadCharacterGlb || (() => {});
  const handleExportZip = onExportUIUXCharacterPackZip || onDownloadCharacterPackZip || (() => {});
  const handleExportManifest =
    onExportUIUXCharacterManifestAndBehavior ||
    onDownloadCharacterManifestAndBehavior ||
    (() => {});
  const handleExportPng =
    onExportUIUXCharacterPreviewPng || onDownloadCharacterPreviewPng || (() => {});

  return (
    <div className="bg-slate-900/95 border border-emerald-500/35 rounded-xl p-3.5 shadow-xl space-y-3">
      {/* Header Banner */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-semibold">
              <Palette className="w-3 h-3" />
              UIUX_AGENT_V1
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono uppercase tracking-wider">
              SIMULASI / DEMO
            </span>
          </div>
          <h3 className="text-xs font-semibold text-white mt-1">
            UI/UX Designer — Simulasi Desain
          </h3>
          <p className="text-[11px] text-slate-400">
            {UIUX_CHARACTER_CONSTANTS.FUNCTIONAL_ROLE} · 15 Actions · 8 Expressions
          </p>
        </div>

        {onTogglePathHelpers && (
          <button
            type="button"
            onClick={() => onTogglePathHelpers(!showPathHelpers)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all ${
              showPathHelpers
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/70 hover:text-slate-200'
            }`}
            title="Tampilkan / sembunyikan jalur jalan & anchor UI/UX Designer"
          >
            <Eye className="w-3 h-3" />
            Path UI/UX
          </button>
        )}
      </div>

      {/* Live Telemetry Strip */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-950/90 border border-slate-800/90 rounded-lg p-2.5 text-[11px]">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            STATE / AKSI
          </div>
          <div className="font-mono text-emerald-300 font-semibold truncate">
            {status.currentState || status.state}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {badgeLabel}
          </div>
        </div>

        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            ANIMATION CLIP
          </div>
          <div className="font-mono text-cyan-300 font-semibold truncate">
            {status.activeClipName}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Expr: <span className="text-slate-200 font-mono">{activeExpr}</span> · Prop:{' '}
            <span className="text-slate-200 font-mono">{activeProp}</span>
          </div>
        </div>

        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            ANCHOR AKTIF
          </div>
          <div className="font-mono text-slate-200 text-[10px] truncate">
            {status.currentAnchorId ?? 'FREE_FLOOR'}
            {status.targetAnchorId && status.targetAnchorId !== status.currentAnchorId
              ? ` → ${status.targetAnchorId}`
              : ''}
          </div>
        </div>

        <div>
          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
            POSISI / YAW
          </div>
          <div className="font-mono text-slate-300 text-[10px]">
            [{status.worldPosition[0].toFixed(2)}, {status.worldPosition[2].toFixed(2)}] · {yawDeg}°
          </div>
        </div>
      </div>

      {/* Active Bubble / Approval Notice */}
      {bubbleMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/35 rounded-lg p-2.5 text-[11px] flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="inline-block text-[9px] font-mono uppercase tracking-wider text-emerald-300">
              DIALOG / DESIGN THINKING (SIMULASI / DEMO)
            </span>
            <p className="text-slate-200 leading-snug">
              “{bubbleMsg}”
            </p>
          </div>
          {status.currentState === 'APPROVE_DESIGN' && (
            <button
              type="button"
              onClick={() => onTriggerAction('task_completed')}
              className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold shadow"
            >
              Approve Desain
            </button>
          )}
        </div>
      )}

      {/* Auto Demo + Patrol + Focus Camera Controls */}
      <div className="grid grid-cols-2 gap-1.5">
        {!status.isAutoDemoRunning ? (
          <button
            type="button"
            onClick={onStartAutoDemo}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Jalankan Demo UI/UX
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopAutoDemo}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold shadow transition-all animate-pulse"
          >
            <Pause className="w-3.5 h-3.5" />
            Stop Demo ({status.autoDemoStepIndex + 1}/{status.autoDemoTotalSteps})
          </button>
        )}

        <button
          type="button"
          onClick={() => onTogglePatrol(!patrolOn)}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold border transition-all ${
            patrolOn
              ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500/50'
              : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          {patrolOn ? 'Stop Patroli' : 'Mode Patroli'}
        </button>

        <button
          type="button"
          onClick={handleFocus}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-all"
        >
          <Focus className="w-3.5 h-3.5" />
          Focus UI/UX Designer
        </button>

        <button
          type="button"
          onClick={onReturnToRoomView}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Return to Room View
        </button>
      </div>

      {/* Animation Playback & Speed Bar */}
      <div className="flex items-center justify-between gap-1.5 bg-slate-950/70 border border-slate-800/80 rounded-lg p-1.5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPlaybackCommand(status.isPaused ? 'play' : 'pause')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium"
            title={status.isPaused ? 'Play Animation' : 'Pause Animation'}
          >
            {status.isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            {status.isPaused ? 'Play' : 'Pause'}
          </button>
          <button
            onClick={() => onPlaybackCommand('restart')}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-medium"
            title="Restart Clip"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            Restart
          </button>
          <button
            onClick={() => onPlaybackCommand('stop_to_idle')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
            title="Reset ke Idle"
          >
            Reset Idle
          </button>
        </div>

        <div className="flex items-center gap-1">
          {([0.5, 1, 1.5] as UIUXSpeedMultiplier[]).map((spd) => (
            <button
              key={spd}
              onClick={() => onSetSpeed(spd)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                status.speedMultiplier === spd
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* 15 Interactive UI/UX Action Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            15 Aksi Simulasi UI/UX Designer
          </span>
          <span className="text-[10px] font-mono text-slate-500">Klik lantai = Jalan</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {UIUX_DEMO_ACTION_LIST.map((act) => {
            const isActive = status.activeActionId === act.id;
            return (
              <button
                key={act.id}
                onClick={() => onTriggerAction(act.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium border transition-all ${
                  isActive
                    ? 'bg-emerald-600/25 text-emerald-200 border-emerald-500/60 shadow-inner'
                    : 'bg-slate-800/75 hover:bg-slate-800 text-slate-300 border-slate-700/70'
                }`}
                title={`${act.description} (Clip: ${act.clipName})`}
              >
                <span className={isActive ? 'text-emerald-300' : 'text-slate-400'}>
                  {ACTION_ICONS[act.id]}
                </span>
                <span className="truncate">{act.labelId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facial Expression & Glasses Controls */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Smile className="w-3 h-3 text-amber-400" />
            Ekspresi Wajah (8) & Kacamata
          </span>

          <button
            onClick={() => onSetGlassesVisible(!status.glassesVisible)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
              status.glassesVisible
                ? 'bg-indigo-500/25 text-indigo-200 border-indigo-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Glasses className="w-3 h-3" />
            {status.glassesVisible ? 'Glasses: ON' : 'Glasses: OFF'}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {UIUX_EXPRESSION_LIST.map((expr) => {
            const active = activeExpr === expr.id;
            return (
              <button
                key={expr.id}
                type="button"
                onClick={() => onSetExpression(expr.id)}
                className={`px-1.5 py-1 rounded text-[10px] font-medium border truncate transition-all ${
                  active
                    ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 font-semibold'
                    : 'bg-slate-800/70 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
                title={expr.description}
              >
                {expr.labelId}
              </button>
            );
          })}
        </div>
      </div>

      {/* Standalone UI/UX Character Asset Export Section */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Download className="w-3 h-3 text-cyan-400" />
            Export Karakter UI/UX (Standalone)
          </span>
          <span className="text-[9px] font-mono text-emerald-400">15 Embedded Clips</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={handleExportGlb}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-200 border border-emerald-500/40 text-[10px] font-semibold transition-all"
          >
            <Download className="w-3 h-3" />
            uiux_designer_agent.glb
          </button>

          <button
            type="button"
            onClick={handleExportZip}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-600/25 hover:bg-cyan-600/35 text-cyan-200 border border-cyan-500/40 text-[10px] font-semibold transition-all"
          >
            <FileArchive className="w-3 h-3" />
            UIUX Character Pack (.zip)
          </button>

          <button
            type="button"
            onClick={handleExportManifest}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-medium transition-all"
          >
            <FileCode2 className="w-3 h-3 text-amber-400" />
            Manifest + Behavior JSON
          </button>

          <button
            type="button"
            onClick={handleExportPng}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-medium transition-all"
          >
            <ImageIcon className="w-3 h-3 text-pink-400" />
            Preview PNG
          </button>
        </div>
      </div>
    </div>
  );
};
