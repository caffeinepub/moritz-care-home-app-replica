import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useAddInsuranceInfo } from '../../../hooks/useQueries';
import type { InsuranceInfo } from '../../../backend';
import ResidentProfileEditorSurface from '../../../components/resident-profile/ResidentProfileEditorSurface';

export default function InsuranceAddPage() {
  const { residentId } = useParams({ from: '/resident/$residentId/insurance/add' });
  const navigate = useNavigate();
  const addInsurance = useAddInsuranceInfo();

  const [formData, setFormData] = useState({
    provider: '',
    policyNumber: '',
    medicareNumber: '',
    medicaidNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const insuranceData: InsuranceInfo = {
      id: 0n,
      provider: formData.provider,
      policyNumber: formData.policyNumber,
      groupNumber: '',
      medicareNumber: formData.medicareNumber || undefined,
      medicaidNumber: formData.medicaidNumber || undefined,
    };

    await addInsurance.mutateAsync({
      residentId: BigInt(residentId),
      insurance: insuranceData,
    });

    navigate({ to: `/resident/${residentId}` });
  };

  return (
    <ResidentProfileEditorSurface className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: `/resident/${residentId}` })} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resident Profile
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Add Insurance</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="provider">Insurance Name *</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicareNumber">Medicare ID Number</Label>
                <Input
                  id="medicareNumber"
                  value={formData.medicareNumber}
                  onChange={(e) => setFormData({ ...formData, medicareNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicaidNumber">Medicaid ID Number</Label>
                <Input
                  id="medicaidNumber"
                  value={formData.medicaidNumber}
                  onChange={(e) => setFormData({ ...formData, medicaidNumber: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: `/resident/${residentId}` })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addInsurance.isPending}>
                  {addInsurance.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ResidentProfileEditorSurface>
  );
}
