import { Header } from "@/components/Header";
import { AuditLog } from "@/components/AuditLog";

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-page text-primary">
      <Header />
      <AuditLog />
    </div>
  );
}
