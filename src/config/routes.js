// Central route configuration
// Add new routes here and they'll automatically appear in routing AND permissions

import Users from "../components/dashboard/pages/Users";
import Permissions from "../components/dashboard/pages/Permissions";
import Donors from "../components/dashboard/pages/Donors";
import Donation from "../components/dashboard/pages/Donation";
import Schedule from "../components/dashboard/pages/Schedule";
import Configuration from "../components/dashboard/pages/Configuration";
import DonationsReport from "../components/dashboard/pages/DonationsReport";
import FundReport from "../components/dashboard/pages/FundReport";
import CampaignReport from "../components/dashboard/pages/CampaignReport";
import MonthlyReport from "../components/dashboard/pages/MonthlyReport";
import DonorReport from "../components/dashboard/pages/DonorReport";
import CausesReport from "../components/dashboard/pages/CausesReport";
import Causes from "../components/dashboard/pages/Causes";
import Appeal from "../components/dashboard/pages/Appeal";
import Amount from "../components/dashboard/pages/Amount";
import FundList from "../components/dashboard/pages/FundList";
import FeaturedAmount from "../components/dashboard/pages/FeaturedAmount";
import FundAmount from "../components/dashboard/pages/FundAmount";
import Category from "../components/dashboard/pages/Category";
import Country from "../components/dashboard/pages/Country";

// Define all application routes
// When you add a new route here, it will automatically:
// 1. Be available in the app routing
// 2. Appear as a permission option in the Permissions page
export const APP_ROUTES = [
  {
    id: 1,
    path: "users",
    name: "Users",
    component: Users,
    category: "User Management",
  },
  {
    id: 2,
    path: "permissions",
    name: "Permissions",
    component: Permissions,
    category: "User Management",
  },
  {
    id: 3,
    path: "donors",
    name: "Donors",
    component: Donors,
    category: "Donor Management",
  },
  {
    id: 4,
    path: "donation",
    name: "Donation",
    component: Donation,
    category: "Donations",
  },
  {
    id: 5,
    path: "schedule",
    name: "Schedule",
    component: Schedule,
    category: "Schedule Management",
  },
  {
    id: 6,
    path: "configuration",
    name: "Configuration",
    component: Configuration,
    category: "System",
  },
  {
    id: 7,
    path: "donations-report",
    name: "Donations Report",
    component: DonationsReport,
    category: "Reports",
  },
  {
    id: 8,
    path: "fund-report",
    name: "Fund Report",
    component: FundReport,
    category: "Reports",
  },
  {
    id: 9,
    path: "campaign-report",
    name: "Campaign Report",
    component: CampaignReport,
    category: "Reports",
  },
  {
    id: 10,
    path: "monthly-report",
    name: "Monthly Report",
    component: MonthlyReport,
    category: "Reports",
  },
  {
    id: 11,
    path: "donor-report",
    name: "Donor Report",
    component: DonorReport,
    category: "Reports",
  },
  {
    id: 12,
    path: "causes-report",
    name: "Causes Report",
    component: CausesReport,
    category: "Reports",
  },
  {
    id: 13,
    path: "causes",
    name: "Causes",
    component: Causes,
    category: "Campaign Management",
  },
  {
    id: 14,
    path: "appeal",
    name: "Appeal",
    component: Appeal,
    category: "Campaign Management",
  },
  {
    id: 15,
    path: "amount",
    name: "Amount",
    component: Amount,
    category: "Campaign Management",
  },
  {
    id: 16,
    path: "fund-list",
    name: "Fund List",
    component: FundList,
    category: "Campaign Management",
  },
  {
    id: 17,
    path: "featured-amount",
    name: "Featured Amount",
    component: FeaturedAmount,
    category: "Campaign Management",
  },
  {
    id: 18,
    path: "fund-amount",
    name: "Fund-Amount",
    component: FundAmount,
    category: "Campaign Management",
  },
  {
    id: 19,
    path: "category",
    name: "Category",
    component: Category,
    category: "Campaign Management",
  },
  {
    id: 20,
    path: "country",
    name: "Country",
    component: Country,
    category: "Campaign Management",
  },
];

// Get permissions grouped by category for better UI
export const getGroupedPermissions = () => {
  const grouped = {};

  APP_ROUTES.forEach((route) => {
    if (!grouped[route.category]) {
      grouped[route.category] = [];
    }
    grouped[route.category].push(route);
  });

  return grouped;
};

// Get all permissions as flat list
export const getAllPermissions = () => {
  return APP_ROUTES.map((route) => ({
    id: route.id,
    name: route.name,
    path: `/${route.path}`,
    category: route.category,
  }));
};
