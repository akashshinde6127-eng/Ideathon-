export type Severity = 'critical' | 'warning' | 'reported' | 'safe';

export type IncidentCategory = 
  | 'flood' 
  | 'roadblock' 
  | 'sos' 
  | 'shelter' 
  | 'medical' 
  | 'bridge'
  | 'landslide';

export type UncertaintyStatus = 'verified_danger' | 'unverified_report' | 'unknown_condition';

export interface EvidenceItem {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  confidence: number;
  source: 'drone' | 'citizen_app' | 'field_unit' | 'satellite';
}

export interface Incident {
  id: string;
  code: string; // e.g. RG-0018
  title: string;
  category: IncidentCategory;
  severity: Severity;
  uncertaintyStatus: UncertaintyStatus;
  uncertaintyReason?: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
    x: number; // 0 - 100%
    y: number; // 0 - 100%
  };
  timestamp: string;
  distanceFromCenter: string;
  evidenceConfidence: number;
  description: string;
  imageUrl: string;
  status: 'unverified' | 'verified' | 'dispatched' | 'resolved';
  assignedTeam?: string;
  peopleAtRisk?: number;
  waterLevelDepth?: string;
  evidenceList: EvidenceItem[];
  duplicateCount?: number;
  groupedReportIds?: string[];
}

export interface RescueTeam {
  id: string;
  name: string;
  type: 'boat' | 'ndrf' | 'medical' | 'air';
  status: 'available' | 'deployed' | 'en_route';
  assignedIncidentCode?: string;
  personnelCount: number;
  vehicle: string;
  eta?: string;
  currentLocation: string;
}

export interface CitizenSafetyStats {
  safeCount: number;
  needHelpCount: number;
  sosActiveCount: number;
  peopleAlerted: number;
  totalAffected: number;
  roadBlockagesCount: number;
  rescueTeamsDeployed: number;
  trucksOnRoute: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  text: string;
  subtext?: string;
  type: 'safe' | 'sos' | 'report' | 'dispatch' | 'resolved';
  incidentCode?: string;
  location?: string;
}

export interface ResourceMetric {
  name: 'Food' | 'Water' | 'Medical' | 'Shelter';
  percentage: number;
  totalStock: string;
  burnRatePerDay: string;
  isLow: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  status: 'available' | 'blocked' | 'unknown';
  statusLabel: string;
  eta: string;
  riskDescription: string;
  elevationClearance: string;
  recommended: boolean;
  waterDepthCm: number;
  uncertaintyPercentage: number;
  unknownConditionsKm: number;
  simulatedCondition: string;
  whyRecommendedOrBlocked: string;
  keyTradeoffs: {
    safety: 'High' | 'Medium' | 'Zero (Blocked)' | 'Uncertain';
    sensorCoverage: string;
    reconRecommended: boolean;
  };
  path: [number, number][];
  turnInstructions?: string[];
}

export interface VillageResourceNeed {
  id: string;
  villageName: string;
  block: string;
  population: number;
  affectedCount: number;
  severity: 'critical' | 'high' | 'moderate';
  accessStatus: 'open' | 'caution' | 'cut_off';
  foodPacketsNeeded: number;
  waterLitresNeeded: number;
  medicalKitsNeeded: number;
  rescueTeamsNeeded: number;
  foodSupplied: number;
  waterSupplied: number;
  medicalSupplied: number;
  teamsAssigned: number;
  priorityScore: number; // 0 - 100
  keyShortage: 'Food' | 'Water' | 'Medicine' | 'Rescue Boat';
  lastDeliveredAgo: string;
}

export interface EvidenceAnalysisResult {
  id: string;
  photoUrl: string;
  photoTitle: string;
  possibleFloodedRoad: string;
  visibleWaterDamage: string[];
  estimatedSeverity: 'critical' | 'high' | 'moderate' | 'low';
  evidenceConfidence: number;
  uncertaintyLabel: string;
  detectedObjects: { label: string; box?: [number, number, number, number]; confidence: number }[];
  waterDepthEstimate: string;
  verifiedByAuthority?: boolean;
  notes: string;
}

export interface DisasterScenario {
  id: string;
  name: string;
  region: string;
  state: string;
  activeSince: string;
  type: string;
  summary: string;
  centerCoords: { lat: number; lng: number };
  stats: CitizenSafetyStats;
  incidents: Incident[];
  routes: RouteOption[];
  villages?: VillageResourceNeed[];
}

export interface FloodedRoadSegment {
  id: string;
  roadName: string;
  fromLocation: string;
  toLocation: string;
  coordinates: [number, number][]; // Lat, Lng polyline points
  waterDepth: string; // e.g. "1.4m"
  status: 'submerged' | 'passable_high_clearance' | 'dry_open';
  closureType: 'Full Closure' | 'Caution' | 'Safe Corridor';
  description: string;
  reportedTime: string;
  alternateSuggestion: string;
  uncertaintyStatus: UncertaintyStatus;
}

export interface NavigationMockLocation {
  id: string;
  name: string;
  city: string;
  category: 'transit' | 'hospital' | 'residential' | 'shelter' | 'landmark';
  coords: [number, number]; // [lat, lng]
}

export interface CalculatedRoute {
  id: string;
  title: string;
  isFlooded: boolean;
  waterDepth?: string;
  distance: string;
  eta: string;
  path: [number, number][];
  warning?: string;
  turnInstructions: string[];
  recommendation: 'AVOID' | 'RECOMMENDED' | 'USE_CAUTION';
  uncertaintyStatus: UncertaintyStatus;
}

