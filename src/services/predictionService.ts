import { supabase } from '../lib/supabase';
import { getCityCoordinates } from '../lib/cities';

export interface PredictionResult {
  temperature: number;
  humidity: number;
}

export interface PredictionHorizons {
  "30m": PredictionResult;
  "60m": PredictionResult;
  "120m": PredictionResult;
}

export interface PredictionRecord {
  id: number;
  city: string;
  model_type: string;
  prediction_results: {
    timestamp: string;
    horizons: PredictionHorizons;
  };
  accuracy_score: number | null;
  created_at: string;
  // Augmented fields
  latitude?: number;
  longitude?: number;
  country?: string;
}

export const fetchLatestPredictions = async (): Promise<PredictionRecord[]> => {
  // Fetch the latest prediction for each city
  // Since we just inserted a batch, we can fetch all predictions created in the last hour
  // or use a distinct on city query.
  
  // Using a simple query for now, assuming the table is mostly clean or we filter by recent.
  // Ideally, we'd do a postgres DISTINCT ON (city) ORDER BY city, created_at DESC
  
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }

  if (!data) return [];

  // Filter to keep only the latest per city
  const latestByCity = new Map<string, PredictionRecord>();
  
  data.forEach((record: any) => {
    if (!latestByCity.has(record.city)) {
      // Add coordinates from our static map
      const cityMeta = getCityCoordinates(record.city);
      if (cityMeta) {
        record.latitude = cityMeta.latitude;
        record.longitude = cityMeta.longitude;
        record.country = cityMeta.country;
      }
      latestByCity.set(record.city, record);
    }
  });

  return Array.from(latestByCity.values());
};
