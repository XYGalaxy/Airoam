import { TravelPersonalityTypes } from '../components/PersonalityRecommender';

// Define types for the report generation
export interface TripReportData {
  destinations: string[];
  activities: string[];
  duration: number;
  budget: string;
  preferences: string[];
}

export interface PersonalityReportStyle {
  tone: string;
  focus: string;
  detailLevel: string;
  languageStyle: string;
  emphasis: string[];
  recommendations: string;
}

export interface GeneratedReport {
  introduction: string;
  destinationHighlights: string[];
  activityRecommendations: string[];
  culturalInsights: string[];
  practicalTips: string[];
  conclusion: string;
}

// Helper function to get personality report style
export function getPersonalityReportStyle(personalityType: string): PersonalityReportStyle | undefined {
  const personality = TravelPersonalityTypes.find((p: { type: string }) => p.type === personalityType);
  return personality?.reportStyle;
}

// Generate a personalized introduction based on personality
function generateIntroduction(
  personalityStyle: PersonalityReportStyle,
  tripData: TripReportData
): string {
  const { tone, focus } = personalityStyle;
  
  let intro = `Based on your ${tone} travel style with a focus on ${focus}, `;
  
  if (tripData.destinations.length === 1) {
    intro += `we've crafted a journey to ${tripData.destinations[0]} that aligns with your preferences.`;
  } else {
    intro += `we've designed a multi-destination adventure through ${tripData.destinations.join(', ')} that matches your travel style.`;
  }
  
  return intro;
}

// Generate destination highlights based on personality
function generateDestinationHighlights(
  personalityStyle: PersonalityReportStyle,
  destinations: string[]
): string[] {
  const { emphasis, languageStyle } = personalityStyle;
  
  return destinations.map(destination => {
    let highlight = `${destination} offers `;
    
    // Add emphasis based on personality
    if (emphasis.includes('Historical context')) {
      highlight += `rich historical significance and `;
    }
    if (emphasis.includes('Local traditions')) {
      highlight += `vibrant local traditions and `;
    }
    if (emphasis.includes('Premium accommodations')) {
      highlight += `exclusive experiences and `;
    }
    
    // Add language style
    if (languageStyle === 'Elaborate and descriptive') {
      highlight += `captivating experiences that will leave lasting impressions.`;
    } else if (languageStyle === 'Dynamic and vivid') {
      highlight += `thrilling adventures waiting to be discovered.`;
    } else {
      highlight += `unique experiences for every traveler.`;
    }
    
    return highlight;
  });
}

// Generate activity recommendations based on personality
function generateActivityRecommendations(
  personalityStyle: PersonalityReportStyle,
  activities: string[]
): string[] {
  const { recommendations, emphasis } = personalityStyle;
  
  return activities.map(activity => {
    let recommendation = `For ${activity}, `;
    
    if (emphasis.includes('Thrilling experiences')) {
      recommendation += `seek out the most challenging routes and opportunities for adrenaline.`;
    } else if (emphasis.includes('Cultural understanding')) {
      recommendation += `focus on understanding local customs and traditions while participating.`;
    } else if (emphasis.includes('Premium accommodations')) {
      recommendation += `look for exclusive and high-end options that provide the finest experience.`;
    } else {
      recommendation += `explore both popular and lesser-known options to create a balanced experience.`;
    }
    
    return recommendation;
  });
}

// Generate cultural insights based on personality
function generateCulturalInsights(
  personalityStyle: PersonalityReportStyle,
  destinations: string[]
): string[] {
  const { focus, emphasis } = personalityStyle;
  
  return destinations.map(destination => {
    let insight = `When visiting ${destination}, `;
    
    if (focus === 'Cultural understanding and local perspectives') {
      insight += `take time to learn about local customs and traditions. Consider participating in community events and learning basic phrases in the local language.`;
    } else if (focus === 'Quality and exclusivity') {
      insight += `seek out premium cultural experiences such as private tours with local experts and exclusive access to historical sites.`;
    } else if (focus === 'Action and adventure') {
      insight += `look for cultural experiences that involve active participation, such as traditional craft workshops or local sports.`;
    } else {
      insight += `balance popular cultural attractions with off-the-beaten-path experiences to gain a comprehensive understanding of the local culture.`;
    }
    
    return insight;
  });
}

// Generate practical tips based on personality
function generatePracticalTips(
  personalityStyle: PersonalityReportStyle,
  tripData: TripReportData
): string[] {
  const { detailLevel, recommendations } = personalityStyle;
  
  const tips: string[] = [];
  
  // Budget tip
  if (tripData.budget === 'Luxurious') {
    tips.push(`Consider premium transportation options and exclusive accommodations to enhance your luxury experience.`);
  } else if (tripData.budget === 'Frugal') {
    tips.push(`Look for budget-friendly accommodations and local transportation options to maximize your travel funds.`);
  } else {
    tips.push(`Balance your spending between splurge-worthy experiences and budget-conscious choices.`);
  }
  
  // Duration tip
  if (tripData.duration > 7) {
    tips.push(`With ${tripData.duration} days, you have the flexibility to explore at a relaxed pace and fully immerse yourself in each destination.`);
  } else {
    tips.push(`For your ${tripData.duration}-day trip, prioritize your must-see attractions while leaving room for spontaneous discoveries.`);
  }
  
  // Activity tip based on personality
  if (recommendations.includes('Adventure activities')) {
    tips.push(`Pack appropriate gear for outdoor activities and check weather conditions before planning adventure excursions.`);
  } else if (recommendations.includes('Cultural activities')) {
    tips.push(`Research local customs and etiquette before your visit to ensure respectful cultural interactions.`);
  }
  
  return tips;
}

// Generate conclusion based on personality
function generateConclusion(
  personalityStyle: PersonalityReportStyle,
  tripData: TripReportData
): string {
  const { tone, focus } = personalityStyle;
  
  let conclusion = `This ${tone} journey is designed to provide you with `;
  
  if (focus === 'Cultural insights and personal growth') {
    conclusion += `meaningful cultural experiences and opportunities for personal reflection.`;
  } else if (focus === 'Action and adventure') {
    conclusion += `thrilling adventures and unforgettable experiences.`;
  } else if (focus === 'Quality and exclusivity') {
    conclusion += `premium experiences and luxurious accommodations throughout your trip.`;
  } else {
    conclusion += `a balanced mix of experiences that align with your travel preferences.`;
  }
  
  conclusion += ` We hope this personalized itinerary inspires your next adventure!`;
  
  return conclusion;
}

// Main function to generate a complete personalized trip report
export function generatePersonalityBasedReport(
  personalityType: string,
  tripData: TripReportData
): GeneratedReport {
  const personalityStyle = getPersonalityReportStyle(personalityType);
  
  if (!personalityStyle) {
    throw new Error(`Personality type "${personalityType}" not found`);
  }
  
  return {
    introduction: generateIntroduction(personalityStyle, tripData),
    destinationHighlights: generateDestinationHighlights(personalityStyle, tripData.destinations),
    activityRecommendations: generateActivityRecommendations(personalityStyle, tripData.activities),
    culturalInsights: generateCulturalInsights(personalityStyle, tripData.destinations),
    practicalTips: generatePracticalTips(personalityStyle, tripData),
    conclusion: generateConclusion(personalityStyle, tripData)
  };
} 