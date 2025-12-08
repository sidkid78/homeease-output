import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Home, Users } from "lucide-react";

interface DashboardStatsProps {
  projectCount: number;
  // Add more props as needed, e.g., totalSpending: number, activeContractors: number
}

/**
 * DashboardStats component displays key statistics for the homeowner dashboard.
 *
 * @param {DashboardStatsProps} props - The props for the DashboardStats component.
 * @param {number} props.projectCount - The total number of projects the homeowner has.
 * @returns {JSX.Element} The rendered dashboard statistics.
 */
export default function DashboardStats({ projectCount }: DashboardStatsProps): JSX.Element {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectCount}</div>
          <p className="text-xs text-muted-foreground">Your initiated aging-in-place projects</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div> {/* Placeholder */}
          <p className="text-xs text-muted-foreground">Contractors currently bidding</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$0.00</div> {/* Placeholder */}
          <p className="text-xs text-muted-foreground">Across all completed projects</p>
        </CardContent>
      </Card>
      {/* Add more relevant stats */}
    </div>
  );
}
