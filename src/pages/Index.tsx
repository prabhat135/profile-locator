
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Plus, Edit, Trash2, X } from 'lucide-react';
import { GoogleMap } from '@/components/GoogleMap';
import { ProfileForm } from '@/components/ProfileForm';
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  name: string;
  photo: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  interests: string[];
  coordinates?: { lat: number; lng: number };
}

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: '1',
      name: 'John Doe',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Software engineer passionate about web development and AI.',
      address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      interests: ['Programming', 'AI', 'Photography'],
      coordinates: { lat: 37.4220656, lng: -122.0840897 }
    },
    {
      id: '2',
      name: 'Jane Smith',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=150&h=150&fit=crop&crop=face',
      description: 'UX designer with a love for creating intuitive user experiences.',
      address: '1 Hacker Way, Menlo Park, CA 94025',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      interests: ['Design', 'Art', 'Travel'],
      coordinates: { lat: 37.4845938, lng: -122.1479938 }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Data scientist exploring the world of machine learning.',
      address: '410 Terry Ave N, Seattle, WA 98109',
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 456-7890',
      interests: ['Data Science', 'Machine Learning', 'Basketball'],
      coordinates: { lat: 47.6205099, lng: -122.3492774 }
    }
  ]);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterest, setSelectedInterest] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedProfileForDetails, setSelectedProfileForDetails] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Get all unique interests for filtering
  const allInterests = Array.from(new Set(profiles.flatMap(p => p.interests)));

  // Filter profiles based on search and interest
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInterest = !selectedInterest || profile.interests.includes(selectedInterest);
    return matchesSearch && matchesInterest;
  });

  const handleShowMap = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowMap(true);
  };

  const handleAddProfile = (profileData: Omit<Profile, 'id'>) => {
    const newProfile: Profile = {
      ...profileData,
      id: Date.now().toString()
    };
    
    // Geocode the address to get coordinates
    geocodeAddress(profileData.address).then(coordinates => {
      if (coordinates) {
        newProfile.coordinates = coordinates;
      }
      setProfiles(prev => [...prev, newProfile]);
      toast({
        title: "Profile Added",
        description: "New profile has been successfully added.",
      });
    });
  };

  const handleEditProfile = (profileData: Omit<Profile, 'id'>) => {
    if (!editingProfile) return;
    
    geocodeAddress(profileData.address).then(coordinates => {
      const updatedProfile: Profile = {
        ...profileData,
        id: editingProfile.id,
        coordinates: coordinates || editingProfile.coordinates
      };
      
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? updatedProfile : p));
      setEditingProfile(null);
      toast({
        title: "Profile Updated",
        description: "Profile has been successfully updated.",
      });
    });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Profile Deleted",
      description: "Profile has been successfully deleted.",
    });
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve(null);
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Profile Explorer</h1>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search profiles by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedInterest}
            onChange={(e) => setSelectedInterest(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Interests</option>
            {allInterests.map(interest => (
              <option key={interest} value={interest}>{interest}</option>
            ))}
          </select>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.photo} alt={profile.name} />
                      <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <p className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {profile.address.split(',')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProfile(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-3 text-sm">{profile.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProfileForDetails(profile)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShowMap(profile)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Show Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No profiles found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMap && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedProfile.name}'s Location</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMap(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">{selectedProfile.address}</p>
              <div className="h-96">
                <GoogleMap
                  center={selectedProfile.coordinates || { lat: 0, lng: 0 }}
                  markers={selectedProfile.coordinates ? [selectedProfile.coordinates] : []}
                  zoom={15}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form Modal */}
      {(showForm || editingProfile) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">
                {editingProfile ? 'Edit Profile' : 'Add New Profile'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <ProfileForm
                initialData={editingProfile || undefined}
                onSubmit={editingProfile ? handleEditProfile : handleAddProfile}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProfile(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile Details Modal */}
      {selectedProfileForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Profile Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProfileForDetails(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedProfileForDetails.photo} alt={selectedProfileForDetails.name} />
                  <AvatarFallback className="text-lg">
                    {selectedProfileForDetails.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{selectedProfileForDetails.name}</h3>
                  <p className="text-gray-600">{selectedProfileForDetails.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <p className="text-gray-600">Email: {selectedProfileForDetails.email}</p>
                  <p className="text-gray-600">Phone: {selectedProfileForDetails.phone}</p>
                  <p className="text-gray-600 flex items-start">
                    <MapPin className="h-4 w-4 mr-1 mt-1 flex-shrink-0" />
                    {selectedProfileForDetails.address}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfileForDetails.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button
                  onClick={() => handleShowMap(selectedProfileForDetails)}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  View on Map
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProfileForDetails(null);
                    setEditingProfile(selectedProfileForDetails);
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
