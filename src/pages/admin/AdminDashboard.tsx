import TodaySnapshot from "@/components/admin/dashboard/TodaySnapshot";
import ActionQueue from "@/components/admin/dashboard/ActionQueue";
import OrderStatusFunnel from "@/components/admin/dashboard/OrderStatusFunnel";
import StuckOrdersAlert from "@/components/admin/dashboard/StuckOrdersAlert";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import QuickActionsBar from "@/components/admin/dashboard/QuickActionsBar";
import LowStockAlert from "@/components/admin/dashboard/LowStockAlert";
import TopProducts from "@/components/admin/dashboard/TopProducts";
import SalesByCategory from "@/components/admin/dashboard/SalesByCategory";
import CustomerInsights from "@/components/admin/dashboard/CustomerInsights";

const AdminDashboard = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your daily operations cockpit.</p>
      </div>

      <QuickActionsBar />

      <TodaySnapshot />

      <StuckOrdersAlert />

      <div className="grid lg:grid-cols-2 gap-6">
        <RevenueChart />
        <OrderStatusFunnel />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <LowStockAlert />
        <TopProducts />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SalesByCategory />
        <CustomerInsights />
      </div>

      <ActionQueue />
    </div>
  );
};

export default AdminDashboard;
