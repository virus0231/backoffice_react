import DashboardPage from "@/components/InsightsPageComponent";
import { FilterProvider } from "@/providers/FilterProvider";
import RightSidebarNav from "@/components/layout/RightSidebarNav";

const usePathname = () => {
  return "/dashboard";
};

function RightColumn() {
  const pathname = usePathname();
  const p = pathname || "";
  const hide =
    p.endsWith("/login") ||
    p.endsWith("/add_user") ||
    p.endsWith("/admin/add-user");
  if (hide) return null;
  return (
    <div className="hidden lg:flex flex-col w-80 gap-4">
      <RightSidebarNav />
    </div>
  );
}

export const InsightsPageLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <FilterProvider>
        <div className="flex justify-center px-8 py-6">
          <div className="w-full max-w-7xl">
            <div className="flex gap-6">
              {/* Main Content - Centered */}
              <main className="flex-1 lg:max-w-[calc(100%-320px)]">
                <DashboardPage />
              </main>

              {/* Right Column (hidden on auth pages) */}
              <RightColumn />
            </div>
          </div>
        </div>
      </FilterProvider>
    </div>
  );
};
