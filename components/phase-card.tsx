"use client";

import { cn } from "@/lib/utils";
import { type PhaseInfo } from "@/lib/framework";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Palette, MessageSquare } from "lucide-react";

interface PhaseCardProps {
  phase: PhaseInfo;
}

export function PhaseCard({ phase }: PhaseCardProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <span
                className={cn(
                  "w-3 h-3 rounded-full bg-gradient-to-r",
                  phase.color
                )}
              />
              {phase.name}
            </CardTitle>
            <CardDescription className="text-neutral-400 mt-1">
              {phase.goal}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "border-none text-white bg-gradient-to-r",
              phase.color
            )}
          >
            {phase.percentage}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-neutral-400">{phase.description}</p>

        {/* Psychology */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            Psychology
          </div>
          <div className="flex flex-wrap gap-1">
            {phase.psychology.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="bg-purple-500/10 text-purple-400 border-purple-500/20"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        {/* Creative Formats */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
            <Palette className="w-4 h-4 text-blue-400" />
            Creative Formats
          </div>
          <div className="flex flex-wrap gap-1">
            {phase.creativeFormats.map((format) => (
              <Badge
                key={format}
                variant="secondary"
                className="bg-blue-500/10 text-blue-400 border-blue-500/20"
              >
                {format}
              </Badge>
            ))}
          </div>
        </div>

        {/* Messaging */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            Messaging Examples
          </div>
          <ul className="space-y-1">
            {phase.messaging.slice(0, 3).map((msg, i) => (
              <li
                key={i}
                className="text-sm text-neutral-400 italic pl-3 border-l-2 border-green-500/30"
              >
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
