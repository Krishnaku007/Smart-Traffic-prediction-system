import { Card } from "@/components/ui/card";

export function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="animate-rise">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold" style={{ color: accent }}>
        {value}
      </p>
    </Card>
  );
}
