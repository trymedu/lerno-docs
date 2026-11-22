import { z } from 'zod';
import { defineVisual, type Visual } from './types';

export const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export const ClimographParamsSchema = z.object({
  city: z.string().default('Örnek Kent'),
  temperatures: z.array(z.number()).length(12).default([4, 5, 8, 13, 18, 23, 26, 26, 22, 16, 10, 6]),
  precipitation: z.array(z.number()).length(12).default([90, 70, 60, 45, 30, 20, 10, 10, 25, 55, 80, 100]),
  durationMs: z.number().positive().default(1200),
});

export type ClimographParams = z.infer<typeof ClimographParamsSchema>;

export const ClimographStateSchema = z.object({
  progress: z.number(),
  city: z.string(),
  months: z.array(z.string()),
  temperatures: z.array(z.number()),
  precipitation: z.array(z.number()),
  minTemp: z.number(),
  maxTemp: z.number(),
  maxPrecip: z.number(),
});

export type ClimographState = z.infer<typeof ClimographStateSchema>;

/** İklim grafiği — aylık sıcaklık ve yağış. */
export const climographVisual = defineVisual<ClimographParams, ClimographState>({
  id: 'climograph',
  paramsSchema: ClimographParamsSchema,
  stateSchema: ClimographStateSchema,
  state: (params, timeMs) => ({
    progress: Math.max(0, Math.min(1, timeMs / params.durationMs)),
    city: params.city,
    months: MONTHS,
    temperatures: params.temperatures,
    precipitation: params.precipitation,
    minTemp: Math.min(...params.temperatures),
    maxTemp: Math.max(...params.temperatures),
    maxPrecip: Math.max(...params.precipitation),
  }),
  presets: [
    {
      id: 'mediterranean',
      label: 'Akdeniz iklimi',
      params: {
        city: 'Akdeniz',
        temperatures: [4, 5, 8, 13, 18, 23, 26, 26, 22, 16, 10, 6],
        precipitation: [90, 70, 60, 45, 30, 20, 10, 10, 25, 55, 80, 100],
        durationMs: 1200,
      },
    },
    {
      id: 'continental',
      label: 'Karasal iklim',
      params: {
        city: 'İç Anadolu',
        temperatures: [-2, 0, 5, 11, 16, 20, 24, 24, 19, 13, 6, 1],
        precipitation: [40, 35, 35, 40, 45, 30, 15, 10, 15, 25, 30, 45],
        durationMs: 1200,
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// map-coordinates — latitude and longitude markers (equirectangular)
// ---------------------------------------------------------------------------

export const MapCoordinatesParamsSchema = z.object({
  markers: z
    .array(
      z.object({
        name: z.string().min(1),
        lat: z.number().min(-90).max(90),
        lon: z.number().min(-180).max(180),
        color: z.string().optional(),
      }),
    )
    .default([]),
  durationMs: z.number().positive().default(1600),
});

export type MapCoordinatesParams = z.infer<typeof MapCoordinatesParamsSchema>;

export const MapCoordinatesStateSchema = z.object({
  progress: z.number(),
  graticule: z.object({ longs: z.array(z.number()), lats: z.array(z.number()) }),
  markers: z.array(
    z.object({
      name: z.string(),
      lat: z.number(),
      lon: z.number(),
      x: z.number(),
      y: z.number(),
      color: z.string(),
    }),
  ),
});

export type MapCoordinatesState = z.infer<typeof MapCoordinatesStateSchema>;

/**
 * Projects a longitude onto the horizontal extent of the map SVG.
 * @param lon - Longitude in degrees.
 * @returns The x-coordinate inside the drawing.
 */
export function projectLon(lon: number): number {
  return (lon + 180) / 360;
}

/**
 * Projects a latitude onto the vertical extent of the map SVG.
 * @param lat - Latitude in degrees.
 * @returns The y-coordinate inside the drawing.
 */
export function projectLat(lat: number): number {
  return (90 - lat) / 180;
}

export const mapCoordinatesVisual = defineVisual<MapCoordinatesParams, MapCoordinatesState>({
  id: 'map-coordinates',
  paramsSchema: MapCoordinatesParamsSchema,
  stateSchema: MapCoordinatesStateSchema,
  state: (params, timeMs) => {
    const progress = Math.max(0, Math.min(1, timeMs / params.durationMs));
    const longs = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
    const lats = [-60, -30, 0, 30, 60];

    return {
      progress,
      graticule: { longs, lats },
      markers: params.markers.map((marker) => ({
        name: marker.name,
        lat: marker.lat,
        lon: marker.lon,
        x: projectLon(marker.lon),
        y: projectLat(marker.lat),
        color: marker.color ?? '#EF4444',
      })),
    };
  },
  presets: [
    {
      id: 'turkey-cities',
      label: 'Türkiye şehirleri',
      params: {
        durationMs: 1600,
        markers: [
          { name: 'İstanbul', lat: 41.0, lon: 29.0, color: '#3B82F6' },
          { name: 'Ankara', lat: 39.9, lon: 32.9, color: '#10B981' },
          { name: 'İzmir', lat: 38.4, lon: 27.1, color: '#F59E0B' },
          { name: 'Antalya', lat: 36.9, lon: 30.7, color: '#EF4444' },
        ],
      },
    },
    {
      id: 'world-cities',
      label: 'Dünya şehirleri',
      params: {
        durationMs: 1600,
        markers: [
          { name: 'Londra', lat: 51.5, lon: -0.1 },
          { name: 'Tokyo', lat: 35.7, lon: 139.7 },
          { name: 'Rio', lat: -22.9, lon: -43.2 },
          { name: 'Sydney', lat: -33.9, lon: 151.2 },
        ],
      },
    },
  ],
});

// ---------------------------------------------------------------------------
// water-cycle — water cycle
// ---------------------------------------------------------------------------

export const WaterCycleParamsSchema = z.object({
  durationMs: z.number().positive().default(3200),
});

export type WaterCycleParams = z.infer<typeof WaterCycleParamsSchema>;

export const WaterCycleStateSchema = z.object({
  progress: z.number(),
  stages: z.array(z.object({ id: z.string(), label: z.string(), x: z.number(), y: z.number() })),
  flows: z.array(z.object({ from: z.string(), to: z.string() })),
});

export type WaterCycleState = z.infer<typeof WaterCycleStateSchema>;

const WATER_STAGES: WaterCycleState['stages'] = [
  { id: 'evaporation', label: 'Buharlaşma', x: 0.2, y: 0.78 },
  { id: 'condensation', label: 'Yoğuşma', x: 0.32, y: 0.22 },
  { id: 'precipitation', label: 'Yağış', x: 0.7, y: 0.22 },
  { id: 'runoff', label: 'Yüzey akışı', x: 0.82, y: 0.72 },
  { id: 'groundwater', label: 'Yer altı suyu', x: 0.52, y: 0.9 },
];

const WATER_FLOWS: WaterCycleState['flows'] = [
  { from: 'evaporation', to: 'condensation' },
  { from: 'condensation', to: 'precipitation' },
  { from: 'precipitation', to: 'runoff' },
  { from: 'runoff', to: 'groundwater' },
  { from: 'groundwater', to: 'evaporation' },
];

export const waterCycleVisual = defineVisual<WaterCycleParams, WaterCycleState>({
  id: 'water-cycle',
  paramsSchema: WaterCycleParamsSchema,
  stateSchema: WaterCycleStateSchema,
  state: (params, timeMs) => ({
    progress: Math.max(0, Math.min(1, timeMs / params.durationMs)),
    stages: WATER_STAGES,
    flows: WATER_FLOWS,
  }),
  presets: [{ id: 'default', label: 'Su döngüsü', params: { durationMs: 3200 } }],
});

export const geographyVisuals: Visual[] = [climographVisual, mapCoordinatesVisual, waterCycleVisual];
