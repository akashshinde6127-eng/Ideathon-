/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  SCENARIO_VARANASI_FLOOD, 
  SCENARIO_KARNATAKA_MULTI_HAZARD, 
  ALL_SCENARIOS, 
  INITIAL_TEAMS, 
  INITIAL_RESOURCES, 
  INITIAL_ACTIVITIES,
  FLOOD_HERO_IMAGE
} from './data/disasterData';
import { 
  Incident, 
  DisasterScenario, 
  RescueTeam, 
  ResourceMetric, 
  ActivityItem, 
  CitizenSafetyStats,
  IncidentCategory,
  Severity
} from './types/disaster';
import { Sidebar, NavView } from './components/Sidebar';
import { Header } from './components/Header';
import { TopKpiStrip } from './components/TopKpiStrip';
import { TacticalMap } from './components/TacticalMap';
import { GoogleTacticalMap } from './components/GoogleTacticalMap';
import { IncidentDetailsPanel } from './components/IncidentDetailsPanel';
import { CitizenSafetyCard } from './components/CitizenSafetyCard';
import { RecentActivityFeed } from './components/RecentActivityFeed';
import { ResourceOverviewCard } from './components/ResourceOverviewCard';
import { AiSituationBriefing } from './components/AiSituationBriefing';
import { AssignRescueModal } from './components/AssignRescueModal';
import { RequestSuppliesModal } from './components/RequestSuppliesModal';
import { CitizenRegistryModal } from './components/CitizenRegistryModal';
import { FullIntelReportModal } from './components/FullIntelReportModal';
import { CitizenMobileView } from './components/CitizenMobileView';
import { FieldReporterPortal } from './components/FieldReporterPortal';
import { RoutePlanningView } from './components/RoutePlanningView';
import { SosQueueView } from './components/SosQueueView';
import { SosVerificationModal, IncomingSosAlert } from './components/SosVerificationModal';
import { EvidenceAnalyser } from './components/EvidenceAnalyser';
import { SmartResourceAllocation } from './components/SmartResourceAllocation';
import { SituationRoom } from './components/SituationRoom';
import { DemoNarrativeBar, DEMO_STEPS } from './components/DemoNarrativeBar';
import { soundAlert } from './utils/audioAlert';
import { Radio, PlusCircle, CheckCircle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  // Theme state ('light' / 'dark') - Defaults to clean White / Light theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('resqgrid_theme_user_set');
    if (saved === 'dark') return 'dark';
    return 'light'; // Pure crisp White theme by default!
  });

  // Interactive 8-Step Live Demonstration Narrative Step
  const [demoStep, setDemoStep] = useState<number>(1);

  // Incoming SOS for verification & duplicate detection
  const [incomingSosAlert, setIncomingSosAlert] = useState<IncomingSosAlert | null>(null);

  // Sync theme to document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('resqgrid_theme_user_set', next);
      return next;
    });
  };

  // Current active operational disaster scenario
  const [currentScenario, setCurrentScenario] = useState<DisasterScenario>(SCENARIO_VARANASI_FLOOD);
  
  // Incidents in the active scenario
  const [incidents, setIncidents] = useState<Incident[]>(SCENARIO_VARANASI_FLOOD.incidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(SCENARIO_VARANASI_FLOOD.incidents[0] || null);

  // Operational metrics & entities
  const [stats, setStats] = useState<CitizenSafetyStats>(SCENARIO_VARANASI_FLOOD.stats);
  const [teams, setTeams] = useState<RescueTeam[]>(INITIAL_TEAMS);
  const [resources, setResources] = useState<ResourceMetric[]>(INITIAL_RESOURCES);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // View state & search query
  const [currentView, setCurrentView] = useState<NavView>('command-centre');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [activeToast, setActiveToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [requestSuppliesOpen, setRequestSuppliesOpen] = useState(false);
  const [citizenRegistryOpen, setCitizenRegistryOpen] = useState(false);
  const [intelReportOpen, setIntelReportOpen] = useState(false);

  // Map engine state (Google Maps by default with Tactical Leaflet toggle)
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  // Toast trigger helper
  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => setActiveToast(null), 3500);
  };

  // 8-Step Live Demonstration Narrative Progression
  const goToDemoStep = (step: number) => {
    setDemoStep(step);
    soundAlert.playDispatchChime();

    switch (step) {
      case 1:
        // Step 1: Citizen 1 reports village road flooded + photo
        setCurrentView('command-centre');
        const sigraInc = incidents.find(i => i.code === 'RG-0018') || incidents[0];
        if (sigraInc) setSelectedIncident(sigraInc);
        showToast("Step 1: Citizen 1 reported village road flooded at Sigra with photo.", "alert");
        break;

      case 2:
        // Step 2: Another citizen reports the same blockage from nearby (180m away)
        setCurrentView('command-centre');
        const mockNearby: IncomingSosAlert = {
          id: `sos-dup-${Date.now()}`,
          code: 'SOS-9104',
          reporterName: 'Ramesh Patel (Citizen)',
          phone: '+91 98451 22891',
          location: 'Ward 14 Near Sigra Junction, Varanasi',
          coordinates: { lat: 25.3188, lng: 82.9752 },
          timestamp: 'Just now',
          details: 'Water 1.3m high on main road. Car submerged, 3 passengers trapped on roof! (Duplicate of RG-0018, 180m proximity)',
          peopleCount: 3,
          waterDepth: '1.3m'
        };
        setIncomingSosAlert(mockNearby);
        showToast("Step 2: Citizen 2 reported same road blockage from 180m away.", "alert");
        break;

      case 3:
        // Step 3: AI recognizes both reports describe same incident & groups them
        if (!incomingSosAlert) {
          setIncomingSosAlert({
            id: `sos-dup-${Date.now()}`,
            code: 'SOS-9104',
            reporterName: 'Ramesh Patel (Citizen)',
            phone: '+91 98451 22891',
            location: 'Ward 14 Near Sigra Junction, Varanasi',
            coordinates: { lat: 25.3188, lng: 82.9752 },
            timestamp: 'Just now',
            details: 'Water 1.3m high on main road. Car submerged, 3 passengers trapped on roof! (Duplicate of RG-0018, 180m proximity)',
            peopleCount: 3,
            waterDepth: '1.3m'
          });
        }
        showToast("Step 3: AI Spatial Engine recognized duplicate reports and grouped them.", "info");
        break;

      case 4:
        // Step 4: Dashboard marks location as an unverified road blockage (Amber)
        setIncomingSosAlert(null);
        setCurrentView('command-centre');
        setIncidents(prev => prev.map(i => i.code === 'RG-0018' ? { ...i, uncertaintyStatus: 'unverified_report', status: 'unverified' } : i));
        const unverifiedInc = incidents.find(i => i.code === 'RG-0018');
        if (unverifiedInc) setSelectedIncident({ ...unverifiedInc, uncertaintyStatus: 'unverified_report', status: 'unverified' });
        showToast("Step 4: Location marked on map as UNVERIFIED ROAD BLOCKAGE (Amber).", "alert");
        break;

      case 5:
        // Step 5: A field reporter submits another photograph
        setCurrentView('evidence-analyser');
        showToast("Step 5: Field reporter uploaded forensic ground photograph.", "info");
        break;

      case 6:
        // Step 6: An authority verifies the blockage
        setIncidents(prev => prev.map(i => i.code === 'RG-0018' ? { ...i, uncertaintyStatus: 'verified_danger', status: 'verified', evidenceConfidence: 98 } : i));
        const verifiedInc = incidents.find(i => i.code === 'RG-0018');
        if (verifiedInc) setSelectedIncident({ ...verifiedInc, uncertaintyStatus: 'verified_danger', status: 'verified', evidenceConfidence: 98 });
        setCurrentView('command-centre');
        showToast("Step 6: Disaster Management Authority signed off & verified blockage!", "success");
        break;

      case 7:
        // Step 7: ResQGrid updates map (Verified Danger) & suggests alternative rescue routes
        setCurrentView('route-ops');
        showToast("Step 7: Map updated to Verified Danger; AI Route Intelligence recommends Route A over Route C.", "info");
        break;

      case 8:
        // Step 8: The AI Situation Room explains what happened, what is verified, and what still needs attention
        setCurrentView('situation-room');
        showToast("Step 8: AI Situation Room synthesizing full event timeline & remaining priorities.", "info");
        break;
    }
  };

  // Scenario switch handler
  const handleSelectScenario = (newScenario: DisasterScenario) => {
    setCurrentScenario(newScenario);
    setIncidents(newScenario.incidents);
    setSelectedIncident(newScenario.incidents[0] || null);
    setStats(newScenario.stats);
    showToast(`Switched operational command to: ${newScenario.name} (${newScenario.state})`, 'info');
  };

  // Incident Verification Handler
  const handleVerifyIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const nextStatus = inc.status === 'verified' ? 'unverified' : 'verified';
          return { ...inc, status: nextStatus };
        }
        return inc;
      })
    );

    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: prev.status === 'verified' ? 'unverified' : 'verified' } : null));
    }

    const inc = incidents.find((i) => i.id === id);
    if (inc) {
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newAct: ActivityItem = {
        id: `act-${Date.now()}`,
        timestamp: time,
        text: `Incident ${inc.code} verified`,
        subtext: `Authenticity confirmed by HQ Dispatcher`,
        type: 'safe',
        incidentCode: inc.code,
        location: inc.location,
      };
      setActivities((prev) => [newAct, ...prev]);
      showToast(`Incident ${inc.code} marked verified!`, 'success');
    }
  };

  // Incident Resolution Handler
  const handleResolveIncident = (id: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'resolved', severity: 'safe' } : inc))
    );
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: 'resolved', severity: 'safe' } : null));
    }
    showToast(`Incident resolved and route cleared.`, 'success');
  };

  // Confirm rescue team dispatch
  const handleConfirmDispatch = (incidentId: string, teamId: string, priorityRoute: string) => {
    const team = teams.find((t) => t.id === teamId);
    const inc = incidents.find((i) => i.id === incidentId);
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Update incident
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? {
              ...i,
              status: 'dispatched',
              assignedTeam: team ? team.name : 'Team Alpha',
            }
          : i
      )
    );

    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) =>
        prev ? { ...prev, status: 'dispatched', assignedTeam: team ? team.name : 'Team Alpha' } : null
      );
    }

    // Update stats
    setStats((prev) => ({
      ...prev,
      rescueTeamsDeployed: prev.rescueTeamsDeployed + 1,
    }));

    // Add activity log
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: time,
      text: `Rescue unit dispatched: ${team?.name || 'Rapid Team'}`,
      subtext: `Assigned to ${inc?.code || 'RG-0018'} via ${priorityRoute.split(' - ')[0]}`,
      type: 'dispatch',
      incidentCode: inc?.code,
      location: inc?.location,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Unit dispatched to ${inc?.code || 'sector'}!`, 'success');
  };

  // Supply Request Handler
  const handleConfirmSupplies = (category: string, quantity: string, destination: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (category.toLowerCase().includes(r.name.toLowerCase())) {
          return { ...r, percentage: Math.min(r.percentage + 25, 95), isLow: false };
        }
        return r;
      })
    );

    setStats((prev) => ({
      ...prev,
      trucksOnRoute: prev.trucksOnRoute + 2,
    }));

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: time,
      text: `Supply order confirmed: ${quantity}`,
      subtext: `Dispatched to ${destination.split(' ')[0]} Hub`,
      type: 'dispatch',
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Emergency requisition issued for ${category}!`, 'success');
  };

  // Citizen Mobile "I'M SAFE" action
  const handleCitizenMarkSafe = (citizenName: string, location: string) => {
    setStats((prev) => ({
      ...prev,
      safeCount: prev.safeCount + 1,
      needHelpCount: Math.max(0, prev.needHelpCount - 1),
    }));

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: time,
      text: `Citizen marked 'I\\'m Safe' (${citizenName})`,
      subtext: `Geo-ping registered from ${location}`,
      type: 'safe',
      location,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Citizen check-in recorded: ${citizenName} is Safe!`, 'success');
  };

  // Citizen Mobile "SEND HELP" action - triggers verification and duplicate check
  const handleCitizenSendHelp = (name: string, location: string, phone: string, details: string) => {
    const newCode = `RG-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} IST`;

    // Calculate approximate coordinates in the active sector
    const newAlert: IncomingSosAlert = {
      id: `sos-${Date.now()}`,
      code: newCode,
      reporterName: name,
      phone,
      location: `${location}, ${currentScenario.state}`,
      coordinates: {
        lat: currentScenario.centerCoords.lat + (Math.random() - 0.5) * 0.03,
        lng: currentScenario.centerCoords.lng + (Math.random() - 0.5) * 0.03,
      },
      timestamp: time,
      details,
      peopleCount: Math.floor(2 + Math.random() * 6),
      waterDepth: '1.2m',
    };

    setIncomingSosAlert(newAlert);
    soundAlert.playEmergencyBeep();
    showToast(`Incoming SOS Ping ${newCode} received. Awaiting dispatcher verification!`, 'alert');
  };

  // SOS Merge Handler (When alert matches an existing nearby incident)
  const handleMergeSos = (existingIncidentId: string, mergedSos: IncomingSosAlert) => {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === existingIncidentId) {
          const updatedPeople = (inc.peopleAtRisk || 0) + mergedSos.peopleCount;
          const mergedEvidence = [
            ...inc.evidenceList,
            {
              id: `ev-merged-${Date.now()}`,
              url: FLOOD_HERO_IMAGE,
              caption: `[Merged SOS Ping] ${mergedSos.reporterName} (${mergedSos.phone}): "${mergedSos.details}" (+${mergedSos.peopleCount} citizens)`,
              timestamp: mergedSos.timestamp,
              confidence: 97,
              source: 'citizen_app' as const,
            },
          ];
          return {
            ...inc,
            peopleAtRisk: updatedPeople,
            evidenceList: mergedEvidence,
          };
        }
        return inc;
      })
    );

    const matched = incidents.find((i) => i.id === existingIncidentId);
    if (matched && selectedIncident?.id === existingIncidentId) {
      setSelectedIncident((prev) =>
        prev
          ? {
              ...prev,
              peopleAtRisk: (prev.peopleAtRisk || 0) + mergedSos.peopleCount,
            }
          : null
      );
    }

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: time,
      text: `Duplicate SOS merged into ${matched?.code || 'incident'}`,
      subtext: `Consolidated ${mergedSos.reporterName}'s report (+${mergedSos.peopleCount} at risk)`,
      type: 'dispatch',
      incidentCode: matched?.code,
      location: matched?.location,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Merged duplicate SOS into ${matched?.code || 'Incident'}. Evacuation count updated!`, 'success');
    setIncomingSosAlert(null);
  };

  // SOS Unique Incident Confirmation Handler
  const handleConfirmUniqueSos = (sos: IncomingSosAlert) => {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} IST`;

    const newIncident: Incident = {
      id: `inc-sos-${Date.now()}`,
      code: sos.code,
      title: `Emergency Distress SOS – ${sos.reporterName}`,
      category: 'sos',
      severity: 'critical',
      uncertaintyStatus: 'verified_danger',
      uncertaintyReason: 'Direct citizen SOS telemetry confirmed with unique GPS fix',
      location: sos.location,
      coordinates: {
        lat: sos.coordinates.lat,
        lng: sos.coordinates.lng,
        x: Math.floor(35 + Math.random() * 30),
        y: Math.floor(35 + Math.random() * 30),
      },
      timestamp: sos.timestamp,
      distanceFromCenter: '1.2 km from sector center',
      evidenceConfidence: 98,
      description: `${sos.details}. Contact: ${sos.phone}`,
      imageUrl: FLOOD_HERO_IMAGE,
      status: 'verified',
      peopleAtRisk: sos.peopleCount,
      waterLevelDepth: sos.waterDepth,
      evidenceList: [
        {
          id: `ev-${Date.now()}`,
          url: FLOOD_HERO_IMAGE,
          caption: `Direct SOS telemetry from ${sos.reporterName} (${sos.phone})`,
          timestamp: time,
          confidence: 98,
          source: 'citizen_app',
        },
      ],
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setStats((prev) => ({
      ...prev,
      sosActiveCount: prev.sosActiveCount + 1,
    }));

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      text: `Verified Unique SOS Broadcast (${sos.reporterName})`,
      subtext: `Sector coordinates confirmed: ${sos.location}`,
      type: 'sos',
      incidentCode: sos.code,
      location: sos.location,
    };
    setActivities((prev) => [newAct, ...prev]);
    setUnreadNotifications((prev) => prev + 1);
    showToast(`VERIFIED UNIQUE SOS: ${sos.code} added to tactical map!`, 'alert');
    setIncomingSosAlert(null);
  };

  // SOS Dismiss Handler
  const handleDismissSos = () => {
    showToast('Incoming alert dismissed as false alarm or duplicate test.', 'info');
    setIncomingSosAlert(null);
  };

  // Field Reporter submission handler
  const handleFieldReportSubmit = (report: {
    title: string;
    category: IncidentCategory;
    severity: Severity;
    location: string;
    coordinates: { lat: number; lng: number };
    description: string;
    imageUrl: string;
    waterDepth: string;
  }) => {
    const newCode = `RG-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} IST`;

    const newIncident: Incident = {
      id: `inc-field-${Date.now()}`,
      code: newCode,
      title: report.title,
      category: report.category,
      severity: report.severity,
      uncertaintyStatus: 'unverified_report',
      uncertaintyReason: 'Field mobile portal submission with attached photographic proof',
      location: report.location,
      coordinates: {
        lat: report.coordinates.lat,
        lng: report.coordinates.lng,
        x: Math.floor(40 + Math.random() * 25),
        y: Math.floor(40 + Math.random() * 25),
      },
      timestamp: time,
      distanceFromCenter: '2.8 km from center',
      evidenceConfidence: 94,
      description: report.description,
      imageUrl: report.imageUrl,
      status: 'unverified',
      waterLevelDepth: report.waterDepth,
      evidenceList: [
        {
          id: `ev-${Date.now()}`,
          url: report.imageUrl,
          caption: 'High-res mobile field camera verification with geo-tag',
          timestamp: time,
          confidence: 94,
          source: 'field_unit',
        },
      ],
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      text: `Field report uploaded (${newCode})`,
      subtext: `${report.location} (${report.waterDepth} depth)`,
      type: 'report',
      incidentCode: newCode,
      location: report.location,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Field incident ${newCode} broadcast to Command Deck!`, 'success');
  };

  // Search filtered incidents
  const searchFilteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    const q = searchQuery.toLowerCase();
    return incidents.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.location.toLowerCase().includes(q) ||
        inc.code.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
    );
  }, [incidents, searchQuery]);

  // Simulation Trigger for rapid demonstration (placed near RG-0018 in Assi Ghat to trigger duplicate check)
  const handleTriggerSimulation = () => {
    soundAlert.playEmergencyBeep();
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} IST`;
    const newCode = `RG-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const newAlert: IncomingSosAlert = {
      id: `sos-sim-${Date.now()}`,
      code: newCode,
      reporterName: 'Sunil Raghav & Family',
      phone: '+91 94151 88390',
      location: 'Assi Ghat Cross Rd, Varanasi South',
      // Near RG-0018 (lat 25.298, lng 83.003) to trigger spatial proximity match (~300m)
      coordinates: {
        lat: 25.2995,
        lng: 83.0045,
      },
      timestamp: time,
      details: 'Floodwater breached the river wall. 5 families marooned on rooftop, rapid boat assistance requested.',
      peopleCount: 8,
      waterDepth: '1.4m',
    };

    setIncomingSosAlert(newAlert);
    showToast(`New SOS Alert received from Assi Ghat! Verification modal opened.`, 'alert');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-[#080e1e] dark:text-slate-100 font-['Plus_Jakarta_Sans'] select-none transition-colors">
      {/* Toast Notification Container */}
      {activeToast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 ${
              activeToast.type === 'alert'
                ? 'bg-red-50 dark:bg-red-950/90 border-red-300 dark:border-red-500 text-red-700 dark:text-red-200 shadow-red-500/20'
                : activeToast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500 text-emerald-700 dark:text-emerald-200 shadow-emerald-500/20'
                : 'bg-sky-50 dark:bg-sky-950/90 border-sky-300 dark:border-sky-500 text-sky-700 dark:text-sky-200 shadow-sky-500/20'
            }`}
          >
            {activeToast.type === 'alert' && <Radio className="w-4 h-4 text-red-500 animate-ping" />}
            {activeToast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {activeToast.type === 'info' && <ShieldAlert className="w-4 h-4 text-sky-500" />}
            <span>{activeToast.message}</span>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          soundAlert.playDispatchChime();
        }}
        sosCount={stats.sosActiveCount}
        reportsCount={incidents.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {quotaExceeded && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2.5 text-xs text-center sticky top-0 z-50 shadow-sm backdrop-blur-md">
            <span>
              Google Maps Platform quota reached. If you are the app owner, visit{' '}
              <a
                href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-amber-300 hover:text-white"
              >
                maps developer site
              </a>{' '}
              for instructions to update your account.
            </span>
          </div>
        )}

        {/* Live 8-Step Interactive Narrative Demonstration Bar */}
        <DemoNarrativeBar
          currentStep={demoStep}
          onSetStep={goToDemoStep}
          onNextStep={() => goToDemoStep(demoStep >= 8 ? 1 : demoStep + 1)}
          onPrevStep={() => goToDemoStep(Math.max(1, demoStep - 1))}
          onResetDemo={() => goToDemoStep(1)}
        />

        {/* Top Header */}
        <Header
          currentScenario={currentScenario}
          onSelectScenario={handleSelectScenario}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            soundAlert.playDispatchChime();
          }}
          unreadNotifications={unreadNotifications}
          onClearNotifications={() => setUnreadNotifications(0)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onTriggerSosSimulation={handleTriggerSimulation}
        />

        {/* View Router */}
        {currentView === 'command-centre' && (
          <main className="flex-1 pb-10 space-y-4">
            {/* Top 4 KPI Cards from Screenshot 1 */}
            <TopKpiStrip
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
              onOpenRescueOps={() => setCurrentView('rescue-ops')}
              onOpenResources={() => setRequestSuppliesOpen(true)}
            />

            {/* Tactical Grid: Center Map (2/3) + Incident Details (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-6">
              {/* Tactical Interactive Map (Google Maps or Leaflet Engine) */}
              <div className="lg:col-span-2">
                {mapEngine === 'google' ? (
                  <GoogleTacticalMap
                    incidents={searchFilteredIncidents}
                    selectedIncident={selectedIncident}
                    onSelectIncident={(inc) => setSelectedIncident(inc)}
                    scenarioName={currentScenario.name}
                    regionName={currentScenario.region}
                    scenarioState={currentScenario.state}
                    onSwitchToLeaflet={() => setMapEngine('leaflet')}
                    theme={theme}
                  />
                ) : (
                  <TacticalMap
                    incidents={searchFilteredIncidents}
                    selectedIncident={selectedIncident}
                    onSelectIncident={(inc) => setSelectedIncident(inc)}
                    scenarioName={currentScenario.name}
                    regionName={currentScenario.region}
                    scenarioState={currentScenario.state}
                    onSwitchToGoogle={() => setMapEngine('google')}
                    theme={theme}
                  />
                )}
              </div>

              {/* Right Column: Incident Details Panel matching screenshot */}
              <div className="lg:col-span-1">
                <IncidentDetailsPanel
                  incident={selectedIncident}
                  onVerifyIncident={handleVerifyIncident}
                  onOpenAssignModal={(inc) => {
                    setSelectedIncident(inc);
                    setAssignModalOpen(true);
                  }}
                  onResolveIncident={handleResolveIncident}
                />
              </div>
            </div>

            {/* Bottom 4-Column Strip matching Screenshot 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6 pt-1">
              {/* 1. Citizen Safety Status */}
              <CitizenSafetyCard
                stats={stats}
                onViewDetails={() => setCitizenRegistryOpen(true)}
              />

              {/* 2. Recent Activity */}
              <RecentActivityFeed
                activities={activities}
                onViewAll={() => setCurrentView('reports')}
                onSelectActivity={(act) => {
                  if (act.incidentCode) {
                    const target = incidents.find((i) => i.code === act.incidentCode);
                    if (target) setSelectedIncident(target);
                  }
                }}
              />

              {/* 3. Resource Overview */}
              <ResourceOverviewCard
                resources={resources}
                onRequestSupplies={() => setRequestSuppliesOpen(true)}
                disasterRegion={currentScenario.region}
              />

              {/* 4. AI Situation Briefing */}
              <AiSituationBriefing
                disasterName={currentScenario.name}
                region={currentScenario.region}
                roadBlockagesCount={currentScenario.stats.roadBlockagesCount}
                teamsDeployedCount={stats.rescueTeamsDeployed}
                onOpenReportModal={() => setIntelReportOpen(true)}
              />
            </div>

            {/* Tactical Action Bar: Simulation quick-triggers */}
            <div className="px-6 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] text-slate-300">
                  Grid Nodes: 18 Active | Sat Sensor: Sentinel-1 SAR Synchronized
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerSimulation}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Simulate Incoming Citizen SOS</span>
                </button>
                <button
                  onClick={() => setIntelReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Full SitRep</span>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Citizen SOS Mobile Companion Screen */}
        {currentView === 'citizen-app' && (
          <CitizenMobileView
            regionName={currentScenario.region}
            onMarkSafe={handleCitizenMarkSafe}
            onSendHelp={handleCitizenSendHelp}
            onBackToCommand={() => setCurrentView('command-centre')}
          />
        )}

        {/* Field Reporter Portal Companion Screen */}
        {currentView === 'field-reporter' && (
          <FieldReporterPortal
            onBackToCommand={() => setCurrentView('command-centre')}
            onSubmitIncident={(newInc) => {
              handleFieldReportSubmit(newInc);
              setCurrentView('command-centre');
            }}
          />
        )}

        {/* Route Planning Navigator Screen */}
        {currentView === 'route-ops' && (
          <RoutePlanningView
            routes={currentScenario.routes}
            onBackToCommand={() => setCurrentView('command-centre')}
            disasterName={currentScenario.name}
            scenarioState={currentScenario.state}
            theme={theme}
          />
        )}

        {/* AI Situation Room */}
        {currentView === 'situation-room' && (
          <SituationRoom
            scenario={currentScenario}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setCurrentView('command-centre');
            }}
            onNavigateToView={(v) => setCurrentView(v)}
            onBackToCommand={() => setCurrentView('command-centre')}
          />
        )}

        {/* AI Evidence Analyser */}
        {currentView === 'evidence-analyser' && (
          <EvidenceAnalyser
            onPushToMap={(ev) => {
              const newInc: Incident = {
                id: `inc-${Date.now()}`,
                code: `RG-${Math.floor(1000 + Math.random() * 9000)}`,
                title: ev.photoTitle,
                category: 'roadblock',
                severity: ev.estimatedSeverity === 'critical' ? 'critical' : ev.estimatedSeverity === 'low' ? 'reported' : 'warning',
                uncertaintyStatus: ev.verifiedByAuthority ? 'verified_danger' : 'unverified_report',
                uncertaintyReason: ev.uncertaintyLabel,
                location: ev.possibleFloodedRoad,
                coordinates: { lat: 25.3180, lng: 82.9750, x: 50, y: 50 },
                timestamp: 'Just now',
                distanceFromCenter: '2.1 km',
                evidenceConfidence: ev.evidenceConfidence,
                description: ev.notes,
                imageUrl: ev.photoUrl,
                status: ev.verifiedByAuthority ? 'verified' : 'unverified',
                waterLevelDepth: ev.waterDepthEstimate,
                evidenceList: [
                  {
                    id: `ev-${Date.now()}`,
                    url: ev.photoUrl,
                    caption: ev.notes,
                    timestamp: 'Just now',
                    confidence: ev.evidenceConfidence,
                    source: 'field_unit'
                  }
                ]
              };
              setIncidents((prev) => [newInc, ...prev]);
              setSelectedIncident(newInc);
              setCurrentView('command-centre');
              showToast(`Broadcasted forensic incident [${newInc.code}] to live tactical map!`, 'success');
            }}
            onBackToCommand={() => setCurrentView('command-centre')}
          />
        )}

        {/* Smart Resource Allocation */}
        {currentView === 'resource-allocation' && (
          <SmartResourceAllocation
            villages={currentScenario.villages || []}
            onDispatchSupplies={(villageId, type, amount) => {
              showToast(`Emergency dispatch confirmed: ${amount} ${type} dispatched to village sector`, 'success');
            }}
            onBackToCommand={() => setCurrentView('command-centre')}
          />
        )}

        {/* SOS Requests Queue Full Screen */}
        {(currentView === 'sos-requests' || currentView === 'incidents' || currentView === 'reports') && (
          <SosQueueView
            incidents={searchFilteredIncidents}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              setCurrentView('command-centre');
            }}
            onVerifyIncident={handleVerifyIncident}
            onOpenAssignModal={(inc) => {
              setSelectedIncident(inc);
              setAssignModalOpen(true);
            }}
            title={
              currentView === 'sos-requests'
                ? 'Active Citizen SOS Distress Signals'
                : currentView === 'reports'
                ? 'Field Reporter Incident Submissions'
                : 'Full Emergency Incident Register'
            }
            subtitle={`Real-time operational queue for ${currentScenario.name} (${currentScenario.region})`}
          />
        )}

        {/* Rescue Ops screen */}
        {currentView === 'rescue-ops' && (
          <div className="p-6 max-w-6xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#18274f] pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Search & Rescue Unit Manifest</h2>
                <p className="text-xs text-slate-400 mt-1">Status of deployed NDRF, SDRF, Marine Boats, and Air Wings</p>
              </div>
              <button
                onClick={() => setCurrentView('command-centre')}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
              >
                Return to Tactical Map
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => (
                <div key={t.id} className="bg-[#0c152d] border border-[#17254c] rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{t.name}</span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                      t.status === 'deployed' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 font-mono text-[11px]">
                    <div>Vehicle: {t.vehicle}</div>
                    <div>Personnel: {t.personnelCount} specialists</div>
                    <div>Sector: {t.currentLocation}</div>
                    {t.eta && <div>ETA to target: {t.eta}</div>}
                  </div>
                  <button
                    onClick={() => {
                      if (selectedIncident) {
                        handleConfirmDispatch(selectedIncident.id, t.id, 'Route A');
                      } else {
                        showToast(`Team ${t.name} is on standby`, 'info');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-[#111c3a] hover:bg-sky-600 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                  >
                    Deploy to Active SOS
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources screen */}
        {currentView === 'resources' && (
          <div className="p-6 max-w-5xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#18274f] pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Disaster Relief Logistics & Stockpiles</h2>
                <p className="text-xs text-slate-400 mt-1">Consumables, rations, clean water, medical aid, and tent shelters</p>
              </div>
              <button
                onClick={() => setRequestSuppliesOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                + Emergency Supply Requisition
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map((r) => (
                <div key={r.name} className="bg-[#0c152d] border border-[#17254c] rounded-2xl p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{r.name} Reserves</span>
                    <span className={`text-base font-mono font-bold ${r.percentage < 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {r.percentage}% Stock
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#132044] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        r.percentage < 50 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${r.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-300 font-mono space-y-1">
                    <div>Current Stock: {r.totalStock}</div>
                    <div>Estimated Burn Rate: {r.burnRatePerDay}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Briefing screen */}
        {currentView === 'ai-briefing' && (
          <div className="p-6 max-w-4xl mx-auto space-y-5">
            <div className="flex items-center justify-between border-b border-[#18274f] pb-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>AI Situational Intelligence & Forecasting</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Multimodal satellite, drone, and field telemetry fusion engine</p>
              </div>
              <button
                onClick={() => setIntelReportOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
              >
                Open Full Tactical Report
              </button>
            </div>
            <AiSituationBriefing
              disasterName={currentScenario.name}
              region={currentScenario.region}
              roadBlockagesCount={currentScenario.stats.roadBlockagesCount}
              teamsDeployedCount={stats.rescueTeamsDeployed}
              onOpenReportModal={() => setIntelReportOpen(true)}
            />
          </div>
        )}

        {/* Settings screen */}
        {currentView === 'settings' && (
          <div className="p-6 max-w-3xl mx-auto space-y-5">
            <div className="border-b border-[#18274f] pb-4">
              <h2 className="text-xl font-bold text-white tracking-tight">System & Command Node Configuration</h2>
              <p className="text-xs text-slate-400 mt-1">Radio telemetry, emergency broadcast channels, and user permissions</p>
            </div>
            <div className="bg-[#0c152d] border border-[#17254c] rounded-2xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[#18274f]">
                <div>
                  <div className="font-semibold text-white">Automated SMS Public Alert Broadcast</div>
                  <div className="text-slate-400 text-[11px]">Send cellular broadcast whenever a critical incident is verified</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-sky-500" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#18274f]">
                <div>
                  <div className="font-semibold text-white">Audio Emergency Siren & Beeps</div>
                  <div className="text-slate-400 text-[11px]">Synthesized tones for high-priority citizen SOS requests</div>
                </div>
                <input type="checkbox" defaultChecked className="rounded text-sky-500" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#18274f]">
                <div>
                  <div className="font-semibold text-white">Drone Stream Quality (SAR Infrared)</div>
                  <div className="text-slate-400 text-[11px]">Optimize bandwidth for low-connectivity field command units</div>
                </div>
                <span className="font-mono text-sky-400">1080p 60fps Adaptive</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    showToast('Settings saved successfully', 'success');
                    setCurrentView('command-centre');
                  }}
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignRescueModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        incident={selectedIncident}
        teams={teams}
        onConfirmDispatch={handleConfirmDispatch}
      />

      <RequestSuppliesModal
        isOpen={requestSuppliesOpen}
        onClose={() => setRequestSuppliesOpen(false)}
        disasterRegion={currentScenario.region}
        onConfirmRequest={handleConfirmSupplies}
      />

      <CitizenRegistryModal
        isOpen={citizenRegistryOpen}
        onClose={() => setCitizenRegistryOpen(false)}
        stats={stats}
        disasterRegion={currentScenario.region}
      />

      <FullIntelReportModal
        isOpen={intelReportOpen}
        onClose={() => setIntelReportOpen(false)}
        scenario={currentScenario}
      />

      {/* Real-time SOS Verification & Proximity Duplicate Detection Modal */}
      <SosVerificationModal
        isOpen={incomingSosAlert !== null}
        onClose={() => setIncomingSosAlert(null)}
        incomingSos={incomingSosAlert}
        existingIncidents={incidents}
        onMerge={handleMergeSos}
        onConfirmUnique={handleConfirmUniqueSos}
        onDismiss={handleDismissSos}
      />
    </div>
  );
}
