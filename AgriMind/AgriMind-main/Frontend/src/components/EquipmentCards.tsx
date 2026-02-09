import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { useToast } from './ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';


export interface EquipmentItem {
  id: number;
  name: string;
  description: string;
  price: number;
  listingType: 'Rent' | 'Buy';
  imageUrl: string;
  category: string;
  condition: string;
  location: string;
  rating: number;
}

const EquipmentCard: React.FC<{ item: EquipmentItem }> = ({ item }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleActionClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue with your purchase/rental.',
        variant: 'destructive',
      });
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Success!',
      description: `Your ${item.listingType === 'Rent' ? 'rental' : 'purchase'} of ${item.name} has been confirmed.`,
    });
  };

  const getConditionBadge = (condition: string) => {
    const conditionMap: { [key: string]: { text: string; color: string } } = {
      'New': { text: 'New', color: 'bg-green-100 text-green-800' },
      'Excellent': { text: 'Excellent', color: 'bg-blue-100 text-blue-800' },
      'Very Good': { text: 'Very Good', color: 'bg-teal-100 text-teal-800' },
      'Good': { text: 'Good', color: 'bg-amber-100 text-amber-800' },
      'Fair': { text: 'Fair', color: 'bg-orange-100 text-orange-800' },
      'Poor': { text: 'Poor', color: 'bg-red-100 text-red-800' },
    };
    
    const conditionData = conditionMap[condition] || { text: condition, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conditionData.color}`}>
        {conditionData.text}
      </span>
    );
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col group">
        <div className="h-48 overflow-hidden relative">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-equipment.jpg';
            }}
          />
          <div className="absolute top-2 right-2">
            {getConditionBadge(item.condition)}
          </div>
        </div>
        <div className="flex flex-col flex-grow p-5">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                  {(item.name.toLowerCase().includes('tractor') || item.name.toLowerCase().includes('fertilizer')) && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Certified
                    </span>
                  )}
                </div>
                {(item.name.toLowerCase().includes('tractor') || item.name.toLowerCase().includes('fertilizer')) && (
                  <p className="text-xs text-green-600 mt-1">Meets agricultural industry standards</p>
                )}
              </div>
              <span 
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                  item.listingType === 'Rent' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {item.listingType}
              </span>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <svg className="w-4 h-4 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium text-gray-900 mr-1">{item.rating}</span>
              <span className="text-gray-400">•</span>
              <span className="ml-1 text-sm text-gray-500">{item.location}</span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
            
            <div className="flex items-center justify-between mt-4 mb-2">
              <div>
                <span className="text-2xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                {item.listingType === 'Rent' && (
                  <span className="text-sm text-gray-500 ml-1">/month</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-medium">{item.category}</span>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full mt-4 bg-green-600 hover:bg-green-700 h-11 text-base"
            onClick={handleActionClick}
          >
            {item.listingType === 'Rent' ? 'Rent Now' : 'Buy Now'}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </div>
      </Card>

    
    </>
  );
};

export default EquipmentCard;
