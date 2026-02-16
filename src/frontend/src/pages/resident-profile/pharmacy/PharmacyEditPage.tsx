import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useGetResident, useUpdatePharmacyInfo } from '../../../hooks/useQueries';
import type { PharmacyInfo } from '../../../backend';
import ResidentProfileEditorSurface from '../../../components/resident-profile/ResidentProfileEditorSurface';

export default function PharmacyEditPage() {
  const { residentId, pharmacyId } = useParams({ from: '/resident/$residentId/pharmacy/$pharmacyId/edit' });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const updatePharmacy = useUpdatePharmacyInfo();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    fax: '',
  });

  useEffect(() => {
    if (resident) {
      const pharmacy = resident.pharmacyInfos.find((p) => p.id.toString() === pharmacyId);
      if (pharmacy) {
        setFormData({
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          fax: pharmacy.fax,
        });
      }
    }
  }, [resident, pharmacyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pharmacyData: PharmacyInfo = {
      id: BigInt(pharmacyId),
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      fax: formData.fax,
    };

    await updatePharmacy.mutateAsync({
      residentId: BigInt(residentId),
      pharmacyId: BigInt(pharmacyId),
      updatedPharmacy: pharmacyData,
    });

    navigate({ to: `/resident/${residentId}` });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <ResidentProfileEditorSurface className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: `/resident/${residentId}` })} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resident Profile
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Pharmacy</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Pharmacy Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax">Fax Number *</Label>
                <Input
                  id="fax"
                  type="tel"
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: `/resident/${residentId}` })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePharmacy.isPending}>
                  {updatePharmacy.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResidentProfileEditorSurface>
  );
}
