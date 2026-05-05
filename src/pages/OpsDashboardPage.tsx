import { PortalLayout } from "@/components/PortalLayout";

export default function OpsDashboardPage() {
  return (
    <PortalLayout role="ops">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Ops Control Panel</h1>
          <p className="text-sm text-muted-foreground">Operations dashboard functionality</p>
        </div>

        <div className="card-elevated p-8">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Ops dashboard functionality coming soon...</p>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
