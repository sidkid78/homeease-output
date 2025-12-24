
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type ContractorProfile = Database['public']['Tables']['contractor_profiles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ContractorProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contractorProfile, setContractorProfile] = useState<ContractorProfile | null>(null);

  // Form fields for profiles table
  const [fullName, setFullName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Form fields for contractor_profiles table
  const [companyName, setCompanyName] = useState<string>('');
  const [serviceAreas, setServiceAreas] = useState<string>('');
  const [servicesOffered, setServicesOffered] = useState<string>('');
  const [certifications, setCertifications] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to view your profile.');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Failed to load user profile.');
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setFullName(profileData?.full_name || '');
      setAvatarUrl(profileData?.avatar_url || '');

      const { data: contractorProfileData, error: contractorProfileError } = await supabase
        .from('contractor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (contractorProfileError && contractorProfileError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error('Error fetching contractor profile:', contractorProfileError);
        toast.error('Failed to load contractor profile details.');
        setLoading(false);
        return;
      }

      setContractorProfile(contractorProfileData);
      setCompanyName(contractorProfileData?.company_name || '');
      setServiceAreas(contractorProfileData?.service_areas?.join(', ') || '');
      setServicesOffered(contractorProfileData?.services_offered?.join(', ') || '');
      setCertifications(contractorProfileData?.certifications || '');
      setBio(contractorProfileData?.bio || '');

      setLoading(false);
    }

    getProfile();
  }, [supabase]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Update or insert into contractor_profiles table
      const contractorData = {
        user_id: user.id,
        company_name: companyName,
        service_areas: serviceAreas.split(',').map(s => s.trim()).filter(Boolean),
        services_offered: servicesOffered.split(',').map(s => s.trim()).filter(Boolean),
        certifications: certifications,
        bio: bio,
      };

      if (contractorProfile) {
        const { error: contractorUpdateError } = await supabase
          .from('contractor_profiles')
          .update(contractorData)
          .eq('user_id', user.id);

        if (contractorUpdateError) {
          throw contractorUpdateError;
        }
      } else {
        const { error: contractorInsertError } = await supabase
          .from('contractor_profiles')
          .insert(contractorData);

        if (contractorInsertError) {
          throw contractorInsertError;
        }
      }

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Contractor Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Public Profile Information</CardTitle>
          <CardDescription>This information will be visible to homeowners.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="text"
                value={avatarUrl || ''}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                value={companyName || ''}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">About Your Company</Label>
              <Textarea
                id="bio"
                value={bio || ''}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                rows={5}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceAreas">Service Areas (comma-separated)</Label>
              <Input
                id="serviceAreas"
                type="text"
                value={serviceAreas || ''}
                onChange={(e) => setServiceAreas(e.target.value)}
                disabled={loading}
                placeholder="e.g. City, State, Zip Code"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="servicesOffered">Services Offered (comma-separated)</Label>
              <Input
                id="servicesOffered"
                type="text"
                value={servicesOffered || ''}
                onChange={(e) => setServicesOffered(e.target.value)}
                disabled={loading}
                placeholder="e.g. Roofing, Plumbing, Electrical"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certifications">Certifications (e.g. license numbers, awards)</Label>
              <Textarea
                id="certifications"
                value={certifications || ''}
                onChange={(e) => setCertifications(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
