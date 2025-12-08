
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Database } from '@/types/database';

interface LeadCardProps {
  lead: Database['public']['Tables']['projects']['Row'];
}

export default function LeadCard({ lead }: LeadCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{lead.project_name}</CardTitle>
        <CardDescription className="line-clamp-2">{lead.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <div className="grid gap-2 text-sm">
          <p><strong>Location:</strong> {lead.location || 'N/A'}</p>
          <p><strong>Budget:</strong> {lead.budget ? `$${lead.budget.toLocaleString()}` : 'Negotiable'}</p>
          <p><strong>Homeowner Needs:</strong> {lead.homeowner_needs || 'N/A'}</p>
          {lead.status && <Badge variant="secondary" className="w-fit">Status: {lead.status}</Badge>}
        </div>
        <div className="mt-4">
          <Link href={`/contractor/leads/${lead.id}`}>
            <Button className="w-full">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
