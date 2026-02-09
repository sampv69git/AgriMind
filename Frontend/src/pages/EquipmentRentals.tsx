import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import EquipmentCard, { EquipmentItem } from '@/components/EquipmentCards';

const sampleData: EquipmentItem[] = [
  { 
    id: 1, 
    name: 'John Deere 5105 Tractor', 
    description: '45 HP, 4WD with power steering, perfect for small to medium farms. Includes plow and harrow attachments.', 
    price: 3500, 
    listingType: 'Rent', 
    imageUrl: '/images/equipment/tractor.jpg',
    category: 'Machinery',
    condition: 'Excellent',
    location: 'Mysuru, Karnataka',
    rating: 4.8
  },
  { 
    id: 2, 
    name: 'Rice Transplanter', 
    description: '6-row riding type transplanter. Reduces labor costs and increases planting efficiency.', 
    price: 1800, 
    listingType: 'Rent', 
    imageUrl: '/images/equipment/transplanter.jpg',
    category: 'Machinery',
    condition: 'Good',
    location: 'Mandya, Karnataka',
    rating: 4.5
  },
  { 
    id: 3, 
    name: 'Combine Harvester', 
    description: 'Self-propelled harvester for wheat, paddy, and soybean. Low maintenance and fuel efficient.', 
    price: 12000, 
    listingType: 'Rent', 
    imageUrl: '/images/equipment/harvester.jpg',
    category: 'Machinery',
    condition: 'Very Good',
    location: 'Hassan, Karnataka',
    rating: 4.7
  },
  { 
    id: 4, 
    name: 'Drip Irrigation Kit', 
    description: 'Complete drip irrigation system for 1 acre. Saves water and increases yield by 40%.', 
    price: 25000, 
    listingType: 'Buy', 
    imageUrl: '/images/equipment/drip.jpg',
    category: 'Irrigation',
    condition: 'New',
    location: 'Bangalore, Karnataka',
    rating: 4.9
  },
  { 
    id: 5, 
    name: 'Power Tiller', 
    description: '8HP diesel powered tiller for land preparation. Easy to operate and maintain.', 
    price: 1500, 
    listingType: 'Rent', 
    imageUrl: '/images/equipment/tiller.jpg',
    category: 'Machinery',
    condition: 'Good',
    location: 'Tumkur, Karnataka',
    rating: 4.3
  },
  { 
    id: 6, 
    name: 'Organic Fertilizer', 
    description: '100% natural organic fertilizer. Pack of 50kg. Improves soil health and crop yield.', 
    price: 1200, 
    listingType: 'Buy', 
    imageUrl: '/images/equipment/fertilizer.jpg',
    category: 'Inputs',
    condition: 'New',
    location: 'Mysuru, Karnataka',
    rating: 4.6
  },
  { 
    id: 7, 
    name: 'Sprayer Machine', 
    description: '16L battery-operated sprayer for pesticides and liquid fertilizers. 8 hours battery life.', 
    price: 3500, 
    listingType: 'Buy', 
    imageUrl: '/images/equipment/sprayer.jpg',
    category: 'Tools',
    condition: 'New',
    location: 'Bangalore, Karnataka',
    rating: 4.4
  },
  { 
    id: 8, 
    name: 'Tractor Trailer', 
    description: 'Heavy duty 8-ton capacity trailer for agricultural use. Perfect for transporting crops.', 
    price: 2800, 
    listingType: 'Rent', 
    imageUrl: '/images/equipment/trailer.jpg',
    category: 'Machinery',
    condition: 'Good',
    location: 'Hassan, Karnataka',
    rating: 4.2
  },
];

const EquipmentRentalsPage = () => {
  const [listings, setListings] = useState<EquipmentItem[]>([]);
  const [filteredListings, setFilteredListings] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setListings(sampleData);
      setFilteredListings(sampleData);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let results = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        item => item.name.toLowerCase().includes(query) || 
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (activeTab !== 'all') {
      results = results.filter(item => 
        activeTab === 'rent' ? item.listingType === 'Rent' : item.listingType === 'Buy'
      );
    }
    
    setFilteredListings(results);
  }, [searchQuery, activeTab, listings]);

  if (loading) return <div className="text-center mt-20 text-xl">Loading equipment listings...</div>;

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Farm Equipment Marketplace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Rent or buy high-quality farming equipment, tools, and inputs at competitive prices
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search equipment by name, category, or description..."
                className="pl-10 py-6 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs 
            defaultValue="all" 
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="rent">Rent Equipment</TabsTrigger>
              <TabsTrigger value="buy">Buy Products</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600">No equipment found matching your criteria</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <EquipmentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EquipmentRentalsPage;
