
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minBudget, setMinBudget] = useState(searchParams.get('minBudget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('maxBudget') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [serviceType, setServiceType] = useState(searchParams.get('serviceType') || '');

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minBudget) params.set('minBudget', minBudget); else params.delete('minBudget');
    if (maxBudget) params.set('maxBudget', maxBudget); else params.delete('maxBudget');
    if (location) params.set('location', location); else params.delete('location');
    if (serviceType) params.set('serviceType', serviceType); else params.delete('serviceType');
    router.push(`/leads?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push('/leads');
    setMinBudget('');
    setMaxBudget('');
    setLocation('');
    setServiceType('');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-1">
          <Filter className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter Leads</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Filter Leads</SheetTitle>
          <SheetDescription>
            Refine your search for available leads.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="minBudget">Minimum Budget</Label>
            <Input
              id="minBudget"
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              placeholder="e.g. 5000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxBudget">Maximum Budget</Label>
            <Input
              id="maxBudget"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g. 25000"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Springfield, IL"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Select a service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roofing">Roofing</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="remodeling">Remodeling</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
