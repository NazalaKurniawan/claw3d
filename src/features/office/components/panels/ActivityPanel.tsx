"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle, Clock, MessageSquare, Play, Plus } from "lucide-react";
import type { TaskBoardCard } from "@/features/office/tasks/types";
import type { AgentState } from "@/features/agents/state/store";

type ActivityItem = 
  | { type: "task_event"; timestamp: number; task: TaskBoardCard; event: { type: string; toStatus?: string; at: string } }
  | { type: "agent_message"; timestamp: number; agent: AgentState };

const formatRelativeTime = (timestampMs: number | null) => {
  if (!timestampMs) return "No output yet";
  const deltaMs = Date.now() - timestampMs;
  if (deltaMs < 60_000) return "Just now";
  if (deltaMs < 3_600_000) return `${Math.max(1, Math.floor(deltaMs / 60_000))}m ago`;
  if (deltaMs < 86_400_000) return `${Math.max(1, Math.floor(deltaMs / 3_600_000))}h ago`;
  return `${Math.max(1, Math.floor(deltaMs / 86_400_000))}d ago`;
};

export function ActivityPanel({
  tasks,
  agents,
}: {
  tasks: TaskBoardCard[];
  agents: AgentState[];
}) {
  const sortedActivities = useMemo(() => {
    const activities: ActivityItem[] = [];

    // Add task history events
    for (const task of tasks) {
      if (task.createdAt) {
        activities.push({
          type: "task_event",
          timestamp: new Date(task.createdAt).getTime(),
          task,
          event: { type: "created", at: task.createdAt, toStatus: task.status },
        });
      }
      if (task.updatedAt && task.updatedAt !== task.createdAt) {
        activities.push({
          type: "task_event",
          timestamp: new Date(task.updatedAt).getTime(),
          task,
          event: { type: "updated", at: task.updatedAt, toStatus: task.status },
        });
      }
    }

    // Add agent messages
    for (const agent of agents) {
      if (agent.lastAssistantMessageAt) {
        activities.push({
          type: "agent_message",
          timestamp: agent.lastAssistantMessageAt,
          agent,
        });
      }
    }

    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks, agents]);

  return (
    <section className="flex h-full min-h-0 flex-col">
      <div className="border-b border-amber-500/10 px-4 py-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
          Activity Feed
        </div>
        <div className="mt-1 font-mono text-[11px] text-white/40">
          Real-time updates from your team.
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {sortedActivities.length === 0 ? (
          <div className="px-2 py-6 font-mono text-[11px] text-white/35">
            No activities yet.
          </div>
        ) : (
          sortedActivities.map((activity, index) => {
            if (activity.type === "agent_message") {
              const { agent, timestamp } = activity;
              return (
                <div key={`msg-${agent.agentId}-${timestamp}-${index}`} className="mb-2 flex gap-3 rounded border border-white/8 bg-white/[0.03] px-3 py-3">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/80" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white/85">
                        {agent.name || agent.agentId}
                      </span>
                      <span className="font-mono text-[9px] text-white/35">
                        {formatRelativeTime(timestamp)}
                      </span>
                    </div>
                    <div className="mt-1.5 line-clamp-2 font-mono text-[11px] leading-relaxed text-white/60">
                      {agent.latestPreview || "Sent a message"}
                    </div>
                  </div>
                </div>
              );
            }

            if (activity.type === "task_event") {
              const { task, event, timestamp } = activity;
              let icon = <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/50" />;
              let actionText = "updated task";
              
              if (event.type === "created") {
                icon = <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />;
                actionText = "created task";
              } else if (event.type === "status_changed") {
                if (event.toStatus === "done") {
                  icon = <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/80" />;
                  actionText = "completed task";
                } else if (event.toStatus === "in_progress") {
                  icon = <Play className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400/80" />;
                  actionText = "started working on";
                } else {
                  actionText = `moved task to ${event.toStatus}`;
                }
              }

              return (
                <div key={`task-${task.id}-${timestamp}-${index}`} className="mb-2 flex gap-3 rounded border border-white/8 bg-white/[0.03] px-3 py-3">
                  {icon}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                        System
                      </span>
                      <span className="font-mono text-[9px] text-white/35">
                        {formatRelativeTime(timestamp)}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-white/60">
                      <span className="text-white/40">{actionText}</span>{" "}
                      <span className="font-semibold text-white/80">{task.title}</span>
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </section>
  );
}
