"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { askAssistant } from "@/services/api";

export function AIAssistant() {
  const [question, setQuestion] = useState(
    "Will traffic be heavy tomorrow morning?"
  );

  const mutation = useMutation({ mutationFn: askAssistant });

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">AI Traffic Assistant</h3>
      <div className="mt-3 flex gap-2">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !mutation.isPending) {
              mutation.mutate(question);
            }
          }}
          placeholder="Ask about traffic, peak hours, best routes…"
        />
        <button
          className="shrink-0 rounded-xl bg-indigo-700 px-4 py-2 font-semibold text-white transition hover:bg-indigo-800 disabled:opacity-60"
          onClick={() => mutation.mutate(question)}
          disabled={mutation.isPending || !question.trim()}
        >
          {mutation.isPending ? "…" : "Ask"}
        </button>
      </div>
      <div className="mt-3 min-h-16 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        {mutation.isPending && (
          <span className="inline-flex items-center gap-2 text-slate-400">
            <span className="auth-spinner" />
            Thinking…
          </span>
        )}
        {mutation.isError && (
          <span className="text-rose-600">Failed to get a response. Try again.</span>
        )}
        {!mutation.isPending &&
          !mutation.isError &&
          (mutation.data ??
            "Ask about peak traffic, best time to travel, or congestion causes.")}
      </div>
    </Card>
  );
}
