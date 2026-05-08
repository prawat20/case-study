import { Header } from "@/components/Header";
import { CalendarPlan } from "@/components/CalendarPlan";

export default function CalendarPage() {
  return (
    <div className="min-h-screen text-primary" style={{ background: "var(--color-page)" }}>
      <Header />
      <CalendarPlan />
    </div>
  );
}
