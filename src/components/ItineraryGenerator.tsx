import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import TravelMap from '@/components/TravelMap';

interface Landmark {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address?: string;
  rating?: number;
  totalRatings?: number;
  types?: string[];
  photos?: any[];
  reviews?: any[];
  website?: string;
  phone?: string;
  openingHours?: string[];
  estimatedDays: number;
}

interface ItineraryGeneratorProps {
  landmarks: Landmark[];
}

const ItineraryGenerator: React.FC<ItineraryGeneratorProps> = ({ landmarks }) => {
  const [sortedLandmarks, setSortedLandmarks] = useState<Landmark[]>(landmarks);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sortedLandmarks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSortedLandmarks(items);
  };

  const removeLandmark = (id: string) => {
    const newLandmarks = sortedLandmarks.filter((landmark) => landmark.id !== id);
    setSortedLandmarks(newLandmarks);
  };

  const generateDailySchedule = (): Landmark[][] => {
    if (sortedLandmarks.length === 0) return [];
    
    const days: Landmark[][] = [];
    let currentDay: Landmark[] = [];
    
    sortedLandmarks.forEach((landmark) => {
      currentDay.push(landmark);
      if (currentDay.length >= 3) {
        days.push(currentDay);
        currentDay = [];
      }
    });
    
    if (currentDay.length > 0) {
      days.push(currentDay);
    }
    
    return days;
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left Column - Selected Landmarks and Route Map */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Selected Landmarks */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Selected Landmarks</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="landmarks">
                {(provided) => (
                  <ScrollArea className="h-[calc(100vh-40rem)]">
                    <div {...provided.droppableProps} ref={provided.innerRef}>
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
                                  {landmark.address && (
                                    <p className="text-sm text-muted-foreground">
                                      {landmark.address}
                                    </p>
                                  )}
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
        <Card className="h-[400px]">
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)]">
            <TravelMap landmarks={sortedLandmarks} />
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Daily Schedule */}
      <div className="w-1/2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Daily Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="space-y-4">
                {generateDailySchedule().map((day, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border shadow-sm">
                    <h3 className="font-medium mb-2">Day {index + 1}</h3>
                    <div className="space-y-2">
                      {day.map((landmark, landmarkIndex) => (
                        <div key={landmarkIndex} className="flex items-center gap-2">
                          <span className="text-gray-500">{landmarkIndex + 1}.</span>
                          <span>{landmark.name}</span>
                          <span className="text-sm text-gray-500">
                            ({landmark.estimatedDays} day{landmark.estimatedDays > 1 ? 's' : ''})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItineraryGenerator; 