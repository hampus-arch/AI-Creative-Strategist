"use client";

import { cn } from "@/lib/utils";
import { FRAMEWORK_PHASES, type FrameworkPhase } from "@/lib/framework";
import { ArrowRight } from "lucide-react";

interface FrameworkPipelineProps {
  selectedPhase?: FrameworkPhase;
  onPhaseSelect?: (phase: FrameworkPhase) => void;
  interactive?: boolean;
}

export function FrameworkPipeline({
  selectedPhase,
  onPhaseSelect,
  interactive = true,
}: FrameworkPipelineProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Orange Juice Creative Framework
        </h2>
        <p className="text-neutral-400">
          Build an ecosystem of systematic creative intelligence
        </p>
      </div>

      {/* Pipeline */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
        {FRAMEWORK_PHASES.map((phase, index) => (
          <div key={phase.id} className="flex items-center">
            <button
              onClick={() => interactive && onPhaseSelect?.(phase.id)}
              disabled={!interactive}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[140px]",
                interactive && "cursor-pointer hover:scale-105",
                selectedPhase === phase.id
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
              )}
            >
              {/* Percentage Badge */}
              <div
                className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r",
                  phase.color
                )}
              >
                {phase.percentage}
              </div>

              {/* Phase Name */}
              <span
                className={cn(
                  "font-bold text-lg mt-2",
                  selectedPhase === phase.id ? "text-orange-500" : "text-white"
                )}
              >
                {phase.name}
              </span>

              {/* Goal */}
              <span className="text-xs text-neutral-400 text-center mt-1 line-clamp-2">
                {phase.goal}
              </span>
            </button>

            {/* Arrow */}
            {index < FRAMEWORK_PHASES.length - 1 && (
              <ArrowRight className="w-5 h-5 text-neutral-600 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-neutral-500 mt-4 px-2">
        <span>LESS AWARE</span>
        <span className="text-center">PRE PURCHASE EXPOSURE TO YOUR ADS</span>
        <span>POST PURCHASE</span>
      </div>
    </div>
  );
}
