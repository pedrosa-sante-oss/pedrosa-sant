import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface Lead {
  id: string;
  created_at: string;
  specialty: string;
  status: string;
}

const COLORS = ["#E4F141", "#3B82F6", "#22C55E", "#6B7280", "#C9A84C", "#F59E0B"];

const AdminDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    supabase.from("leads").select("id, created_at, specialty, status").then(({ data }) => {
      if (data) setLeads(data);
    });
  }, []);

  const total = leads.length;
  const novos = leads.filter((l) => {
    const d = new Date(l.created_at);
    const week = new Date();
    week.setDate(week.getDate() - 7);
    return l.status === "novo" && d >= week;
  }).length;
  const emContato = leads.filter((l) => l.status === "em_contato").length;
  const fechados = leads.filter((l) => l.status === "fechado").length;

  const metrics = [
    { label: "Total de leads", value: total },
    { label: "Novos (7 dias)", value: novos },
    { label: "Em contato", value: emContato },
    { label: "Fechados", value: fechados },
  ];

  // Monthly chart
  const monthly: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    monthly[key] = 0;
  }
  leads.forEach((l) => {
    const d = new Date(l.created_at);
    const key = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    if (key in monthly) monthly[key]++;
  });
  const barData = Object.entries(monthly).map(([name, value]) => ({ name, value }));

  // Specialty chart
  const specMap: Record<string, number> = {};
  leads.forEach((l) => { specMap[l.specialty] = (specMap[l.specialty] || 0) + 1; });
  const pieData = Object.entries(specMap).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h1 className="font-barlow font-bold text-xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-surface border-border p-5">
            <p className="text-xs text-muted-foreground font-inter mb-1">{m.label}</p>
            <p className="text-2xl font-barlow font-bold text-lima">{m.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-surface border-border p-6">
          <p className="text-sm font-barlow font-bold mb-4">Leads por mês</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#888" }} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12 }} />
              <Bar dataKey="value" fill="#E4F141" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="bg-surface border-border p-6">
          <p className="text-sm font-barlow font-bold mb-4">Por especialidade</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-20 font-inter">Sem dados ainda</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
