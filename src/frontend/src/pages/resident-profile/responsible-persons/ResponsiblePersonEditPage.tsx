import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
import { useGetResident, useUpdateResponsibleContact } from '../../../hooks/useQueries';
import type { ResponsibleContact } from '../../../backend';

export default function ResponsiblePersonEditPage() {
  const { residentId, contactId } = useParams({ from: '/resident/$residentId/responsible-persons/$contactId/edit' });
  const navigate = useNavigate();
  const { data: resident, isLoading } = useGetResident(BigInt(residentId));
  const updateContact = useUpdateResponsibleContact();

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    isPrimary: false,
  });

  useEffect(() => {
    if (resident) {
      const contact = resident.responsibleContacts.find((c) => c.id.toString() === contactId);
      if (contact) {
        setFormData({
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email,
          isPrimary: contact.isPrimary,
        });
      }
    }
  }, [resident, contactId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contactData: ResponsibleContact = {
      id: BigInt(contactId),
      name: formData.name,
      relationship: formData.relationship,
      phone: formData.phone,
      email: formData.email,
      isPrimary: formData.isPrimary,
    };

    await updateContact.mutateAsync({
      residentId: BigInt(residentId),
      contactId: BigInt(contactId),
      updatedContact: contactData,
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: `/resident/${residentId}` })} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resident Profile
        </Button>

        <Card className="max-w-2xl mx-auto bg-white">
          <CardHeader>
            <CardTitle>Edit Responsible Person</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship *</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
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
                <Label htmlFor="email">Email (Fax) *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrimary: checked as boolean })}
                />
                <Label htmlFor="isPrimary" className="cursor-pointer">
                  Set as Primary Contact
                </Label>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => navigate({ to: `/resident/${residentId}` })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateContact.isPending}>
                  {updateContact.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
