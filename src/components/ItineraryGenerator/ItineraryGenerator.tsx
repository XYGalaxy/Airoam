import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { GoogleMap, Marker, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import { useLandmarks } from '@/contexts/LandmarksContext';
import { usePersonality } from '@/contexts/PersonalityContext';
import { Landmark } from '@/types/Landmark';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResponse {
  content: string;
  error?: string;
}

const ItineraryGenerator: React.FC = () => {
  const { selectedLandmarks, removeLandmark } = useLandmarks();
  const { personality } = usePersonality();
  const [sortedLandmarks, setSortedLandmarks] = useState<Landmark[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [tripReport, setTripReport] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // 当 selectedLandmarks 变化时更新 sortedLandmarks
  useEffect(() => {
    setSortedLandmarks(selectedLandmarks);
  }, [selectedLandmarks]);

  const calculateTotalDays = () => {
    // 计算基础天数
    const baseDays = Math.ceil(sortedLandmarks.reduce((total, landmark) => total + (landmark.estimatedDays || 1), 0));
    
    // 根据地标数量和国家数量添加缓冲时间
    const uniqueCountries = new Set(sortedLandmarks.map(landmark => landmark.country)).size;
    const numberOfLandmarks = sortedLandmarks.length;
    
    // 如果跨国，每个额外国家添加1天用于交通和调整
    const countryBuffer = uniqueCountries > 1 ? (uniqueCountries - 1) : 0;
    
    // 根据景点数量添加缓冲时间
    // 3个以上景点，每4个景点额外添加1天用于休息和机动时间
    const landmarkBuffer = numberOfLandmarks > 3 ? Math.floor(numberOfLandmarks / 4) : 0;
    
    // 总天数 = 基础天数 + 国家缓冲 + 景点缓冲
    return baseDays + countryBuffer + landmarkBuffer;
  };

  const generateAITripReport = async () => {
    if (sortedLandmarks.length === 0) return;

    setIsLoading(true);
    try {
      const totalDays = calculateTotalDays();
      const landmarkDescriptions = sortedLandmarks.map((landmark, index) => 
        `${index + 1}. ${landmark.name} - ${landmark.description || 'A fascinating destination'} (${landmark.estimatedDays || 1} day${(landmark.estimatedDays || 1) > 1 ? 's' : ''})${landmark.vicinity ? ` - Located at: ${landmark.vicinity}` : ''}`
      ).join('\n');

      // 获取所有不重复的国家
      const uniqueDestinations = Array.from(new Set(sortedLandmarks.map(landmark => landmark.country))).join(' & ');

      const response = await axios.post<AIResponse>('http://localhost:3000/api/ai-recommend', {
        query: `Based on the following multi-country itinerary in ${uniqueDestinations}, provide a detailed travel plan. Total planned days: ${totalDays}. Here are the selected landmarks:\n${landmarkDescriptions}\n\nPlease create a day-by-day itinerary incorporating all these landmarks, considering their locations and estimated visit durations. Include buffer time for travel between locations, rest, and flexibility. Consider travel time between different countries and cities. Suggest optimal visiting times and provide practical tips for each location.`,
        type: 'itinerary',
        travelers: personality?.type === 'Solo Explorer' ? '1' : '2-4',
        personality: personality?.type || 'Cultural Explorer',
        totalDays,
        mainDestination: uniqueDestinations
      });

      if (response.data && response.data.content) {
        setTripReport(response.data.content);
      } else if (response.data.error) {
        setTripReport(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error generating AI trip report:', error);
      setTripReport('Sorry, there was an error generating the trip report. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sortedLandmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSortedLandmarks(items);
  };

  // 计算路线
  useEffect(() => {
    if (sortedLandmarks.length < 2) {
      setDirections(null);
      return;
    }

    const directionsService = new google.maps.DirectionsService();
    const waypoints = sortedLandmarks.slice(1, -1).map(landmark => ({
      location: new google.maps.LatLng(landmark.location.latitude, landmark.location.longitude),
      stopover: true
    }));

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(
        sortedLandmarks[0].location.latitude,
        sortedLandmarks[0].location.longitude
      ),
      destination: new google.maps.LatLng(
        sortedLandmarks[sortedLandmarks.length - 1].location.latitude,
        sortedLandmarks[sortedLandmarks.length - 1].location.longitude
      ),
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.WALKING,
      optimizeWaypoints: true
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        setDirections(result);
      } else {
        setDirections(null);
      }
    });
  }, [sortedLandmarks]);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px'
  };

  const defaultCenter = {
    lat: 48.8566,
    lng: 2.3522
  };

  const defaultOptions = {
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  return (
    <div className="flex h-full gap-4 max-h-screen overflow-hidden">
      {/* Left Column - Selected Landmarks and Route Map */}
      <div className="w-1/2 flex flex-col gap-4 overflow-hidden">
        {/* Selected Landmarks */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle>Selected Landmarks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="landmarks">
                {(provided) => (
                  <ScrollArea className="h-[calc(100vh-40rem)]">
                    <div {...provided.droppableProps} ref={provided.innerRef} className="p-4">
                      {sortedLandmarks.map((landmark, index) => (
                        <Draggable key={landmark.id} draggableId={landmark.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-4 mb-2 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium">{landmark.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {landmark.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Estimated: {landmark.estimatedDays} day{landmark.estimatedDays > 1 ? 's' : ''}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeLandmark(landmark.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Route Map */}
        <Card className="h-[400px] overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={sortedLandmarks.length > 0 ? {
                  lat: sortedLandmarks[0].location.latitude,
                  lng: sortedLandmarks[0].location.longitude
                } : defaultCenter}
                zoom={12}
                options={defaultOptions}
              >
                {directions && <DirectionsRenderer directions={directions} />}
                {!directions && sortedLandmarks.map((landmark) => (
                  <Marker
                    key={landmark.id}
                    position={{
                      lat: landmark.location.latitude,
                      lng: landmark.location.longitude
                    }}
                    label={{
                      text: (sortedLandmarks.findIndex(l => l.id === landmark.id) + 1).toString(),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - AI Trip Report */}
      <div className="w-1/2 overflow-hidden">
        <Card className="h-full overflow-hidden flex flex-col">
          <CardHeader className="p-4 shrink-0 border-b">
            <div className="flex items-center justify-between">
              <CardTitle>AI Trip Report</CardTitle>
              <Button
                onClick={generateAITripReport}
                disabled={isLoading || sortedLandmarks.length === 0}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  <span>Generate Report</span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-8 py-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-32 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-sm text-gray-500">Generating your personalized travel report...</p>
                  </div>
                ) : sortedLandmarks.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <p>Select landmarks and click Generate Report to create your travel plan</p>
                  </div>
                ) : !tripReport ? (
                  <div className="text-center text-gray-500">
                    <p>Click the Generate Report button to create your travel plan</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4 rounded-lg border">
                            <table className="w-full text-sm border-collapse bg-white" {...props} />
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th className="px-4 py-2 bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="px-4 py-2 text-sm text-gray-600 border-b last:border-b-0" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="my-2.5 text-sm leading-relaxed text-gray-600" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="my-3 list-disc pl-5 space-y-1.5 text-sm text-gray-600" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="my-0.5 leading-relaxed" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 className="mt-1 mb-4 pb-2 border-b text-gray-800" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="mt-6 mb-3 text-gray-800 flex items-center gap-2" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="mt-4 mb-2 text-gray-700" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-semibold text-gray-800" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="text-gray-700" {...props} />
                        ),
                      }}
                    >
                      {tripReport}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItineraryGenerator; 