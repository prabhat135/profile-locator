import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Plus, Edit, Trash2, X, Settings, Eye, Mail, Phone } from 'lucide-react';
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
  location?: string;
  joinDate?: string;
}

const Index = () => {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b8e5?w=150&h=150&fit=crop&crop=face',
      description: 'Creative designer passionate about user experience and sustainable design.',
      address: '654 Sunset Boulevard, Los Angeles, CA 90028',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 123-4567',
      interests: ['Design', 'Sustainability'],
      coordinates: { lat: 34.0522, lng: -118.2437 },
      location: 'San Francisco',
      joinDate: '15/01/2023'
    },
    {
      id: '2',
      name: 'Michael Chen',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Full-stack developer with expertise in React, Node.js, and cloud architecture.',
      address: '1 Hacker Way, Menlo Park, CA 94025',
      email: 'michael.chen@example.com',
      phone: '+1 (555) 987-6543',
      interests: ['Programming', 'AI/ML'],
      coordinates: { lat: 37.4845938, lng: -122.1479938 },
      location: 'New York',
      joinDate: '20/02/2023'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      description: 'Marketing strategist specializing in digital transformation and brand development.',
      address: '410 Terry Ave N, Seattle, WA 98109',
      email: 'emily.rodriguez@example.com',
      phone: '+1 (555) 456-7890',
      interests: ['Marketing', 'Travel'],
      coordinates: { lat: 47.6205099, lng: -122.3492774 },
      location: 'Austin',
      joinDate: '10/03/2023'
    },
    {
      id: '4',
      name: 'David Thompson',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Data scientist and AI researcher working on machine learning applications.',
      address: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
      email: 'david.thompson@example.com',
      phone: '+1 (555) 321-9876',
      interests: ['Data Science', 'Research'],
      coordinates: { lat: 37.4220656, lng: -122.0840897 },
      location: 'Seattle',
      joinDate: '05/04/2023'
    }
  ]);

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showMap, setShowMap] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [selectedProfileForDetails, setSelectedProfileForDetails] = useState<Profile | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { toast } = useToast();

  // Get all unique locations for filtering
  const allLocations = Array.from(new Set(profiles.map(p => p.location).filter(Boolean)));

  // Filter profiles based on search and location
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'All Locations' || profile.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const handleShowMap = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowMap(true);
  };

  const handleAddProfile = (profileData: Omit<Profile, 'id'>) => {
    const newProfile: Profile = {
      ...profileData,
      id: Date.now().toString(),
      joinDate: new Date().toLocaleDateString('en-GB')
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
        coordinates: coordinates || editingProfile.coordinates,
        joinDate: editingProfile.joinDate
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
      geocoder.geocode({ address }, (results: any, status: string) => {
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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile-Locator</h1>
                <p className="text-sm text-gray-500">Explore profiles and locations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{profiles.length} profiles</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAdminPanel(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </div>
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
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="All Locations">All Locations</option>
            {allLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">All Profiles</h2>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProfiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.photo} alt={profile.name} />
                    <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base">{profile.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profile.location}
                    </div>
                    {profile.joinDate && (
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Joined {profile.joinDate}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 mb-3 text-sm line-clamp-2">{profile.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {profile.interests.slice(0, 2).map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{profile.interests.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProfileForDetails(profile)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleShowMap(profile)}
                    className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    Map
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

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Admin Panel</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setShowAdminPanel(false);
                  }}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Profile
                </Button>
                <div className="text-sm text-gray-600">
                  <p>Total Profiles: {profiles.length}</p>
                  <p>Locations: {allLocations.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal - Higher z-index */}
      {showMap && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <MapPin className="h-5 w-5 text-purple-600 mr-2" />
                  Location Map
                </h2>
                <p className="text-sm text-gray-500">Viewing location for {selectedProfile.name}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowMap(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-center">{selectedProfile.name}</h3>
                <p className="text-center text-gray-600 mb-2">{selectedProfile.address}</p>
                {selectedProfile.coordinates && (
                  <p className="text-center text-sm text-gray-500">
                    Coordinates: {selectedProfile.coordinates.lat.toFixed(4)}, {selectedProfile.coordinates.lng.toFixed(4)}
                  </p>
                )}
              </div>
              <div className="h-96 bg-gray-100 rounded-lg">
                {selectedProfile.coordinates ? (
                  <GoogleMap
                    center={selectedProfile.coordinates}
                    markers={[selectedProfile.coordinates]}
                    zoom={15}
                    className="w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Location not available</p>
                  </div>
                )}
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
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProfileForDetails(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedProfileForDetails.photo} alt={selectedProfileForDetails.name} />
                  <AvatarFallback className="text-lg">
                    {selectedProfileForDetails.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedProfileForDetails.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedProfileForDetails.location}
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>
              
              {/* About Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedProfileForDetails.description}</p>
              </div>
              
              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-purple-600 mr-3" />
                    <span className="text-purple-600">{selectedProfileForDetails.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-purple-600 mr-3" />
                    <span className="text-purple-600">{selectedProfileForDetails.phone}</span>
                  </div>
                </div>
              </div>
              
              {/* Interests */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProfileForDetails.interests.map((interest, index) => (
                    <Badge key={index} className="bg-purple-600 text-white text-xs px-3 py-1">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Location */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                <div className="text-sm text-gray-600">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{selectedProfileForDetails.address}</p>
                      {selectedProfileForDetails.coordinates && (
                        <p className="text-xs text-gray-500 mt-1">
                          Coordinates: {selectedProfileForDetails.coordinates.lat.toFixed(4)}, {selectedProfileForDetails.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Join Date */}
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Joined on {selectedProfileForDetails.joinDate}</p>
              </div>
              
              {/* Action Button */}
              <Button
                onClick={() => {
                  setSelectedProfileForDetails(null);
                  handleShowMap(selectedProfileForDetails);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
