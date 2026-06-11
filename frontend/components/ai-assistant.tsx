"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { askAssistant } from "@/services/api";

export function AIAssistant() {
  const [question, setQuestion] = useState("Will traffic be heavy tomorrow morning?");

  const mutation = useMutation({
    mutationFn: askAssistant,
  });

  return (
    <Card>
      <h3 className="font-display text-lg font-semibold">AI Traffic Assistant</h3>
      <div className="mt-3 flex gap-2">
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className="rounded-xl bg-indigo-700 px-4 py-2 font-semibold text-white"
          onClick={() => mutation.mutate(question)}
        >
          Ask
        </button>
      </div>
      <p className="mt-3 min-h-12 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        {mutation.data ?? "Ask about peak traffic, best time to travel, or congestion causes."}
      </p>
    </Card>
  );
}
