import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Phone, Mail } from 'lucide-react';
import type { Resident } from '../../../backend';

interface ResponsiblePersonsSectionProps {
  resident: Resident;
  canEdit: boolean;
}

export default function ResponsiblePersonsSection({ resident, canEdit }: ResponsiblePersonsSectionProps) {
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate({ to: `/resident/${resident.id}/responsible-persons/add` });
  };

  const handleEdit = (contactId: bigint) => {
    navigate({ to: `/resident/${resident.id}/responsible-persons/${contactId}/edit` });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Responsible Persons</CardTitle>
          {canEdit && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add Responsible Person
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {resident.responsibleContacts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No responsible persons listed</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Fax</TableHead>
                {canEdit && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {resident.responsibleContacts.map((contact) => (
                <TableRow key={contact.id.toString()}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {contact.name}
                      {contact.isPrimary && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Primary</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{contact.relationship}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {contact.email}
                    </div>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(contact.id)}>
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
