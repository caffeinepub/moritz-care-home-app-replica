import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Users, UserCheck, UserX } from 'lucide-react';
import { useGetAccessibleResidents, useGetResidentStats } from '../hooks/useQueries';
import { ResidentStatus } from '../backend';
import AddNewResidentModal from '../components/residents/modals/AddNewResidentModal';
import CodeStatusBadge from '../components/residents/CodeStatusBadge';

export default function ResidentDashboardPage() {
  const navigate = useNavigate();
  const { data: residents = [], isLoading } = useGetAccessibleResidents();
  const { data: stats } = useGetResidentStats();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ResidentStatus>('all');
  const [sortBy, setSortBy] = useState<'name' | 'room'>('name');

  const filteredResidents = residents
    .filter((resident) => {
      const matchesSearch =
        resident.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.roomNumber.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || resident.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      } else {
        return a.roomNumber.localeCompare(b.roomNumber);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Resident Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor all residents</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add New Resident
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? Number(stats.totalResidents) : 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Residents</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? Number(stats.activeResidents) : 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discharged</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? Number(stats.dischargedResidents) : 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or room number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: 'name' | 'room') => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="room">Sort by Room</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | ResidentStatus)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Residents</TabsTrigger>
            <TabsTrigger value={ResidentStatus.active}>Active</TabsTrigger>
            <TabsTrigger value={ResidentStatus.discharged}>Discharged</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading residents...</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No residents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResidents.map((resident) => (
              <Card
                key={resident.id.toString()}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate({ to: '/resident/$residentId', params: { residentId: resident.id.toString() } })}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        {resident.firstName} {resident.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Room {resident.roomNumber} - {resident.bed}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        resident.status === ResidentStatus.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {resident.status === ResidentStatus.active ? 'Active' : 'Discharged'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DOB:</span>
                      <span className="font-medium">{resident.dob}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admission:</span>
                      <span className="font-medium">{resident.admissionDate}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Code Status:</span>
                      <CodeStatusBadge codeStatus={resident.codeStatus} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Physicians:</span>
                      <span className="font-medium">{resident.physicians.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Medications:</span>
                      <span className="font-medium">{resident.medications.filter(m => m.isActive).length} active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showAddModal && <AddNewResidentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
