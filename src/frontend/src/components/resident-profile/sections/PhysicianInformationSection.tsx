import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Phone } from 'lucide-react';
import type { Resident } from '../../../backend';

interface PhysicianInformationSectionProps {
  resident: Resident;
  canEdit: boolean;
}

export default function PhysicianInformationSection({ resident, canEdit }: PhysicianInformationSectionProps) {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate({ to: `/resident/${resident.id}/physicians/add` });
  };

  const handleEdit = (physicianId: bigint) => {
    navigate({ to: `/resident/${resident.id}/physicians/${physicianId}/edit` });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Physician Information</CardTitle>
          {canEdit && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Physician
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {resident.physicians.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No physicians assigned</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Contact Info</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resident.physicians.map((physician) => (
                <TableRow key={physician.id.toString()}>
                  <TableCell className="font-medium">{physician.name}</TableCell>
                  <TableCell>{physician.specialty}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {physician.contactInfo}
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(physician.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
