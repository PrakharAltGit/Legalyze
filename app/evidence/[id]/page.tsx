"use client";

import { Sidebar } from "@/app/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/Card";
import { Tabs } from "@/app/components/Tabs";
import { Button } from "@/app/components/Button";
import {
  ArrowLeft,
  FileText,
  Users,
  Clock,
  MessageSquare,
  Download,
  Share2,
  MoreVertical,
  Building2,
  Calendar,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const dummyEvidence = {
  id: "1",
  name: "Case_2024_001_Transcript.pdf",
  type: "PDF",
  size: "2.4 MB",
  status: "Processed",
  date: "2026-02-10",
  uploadedBy: "Detective Smith",
  caseNumber: "CASE-2024-001",
};

const summaryContent = (
  <div className="space-y-6">
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Short Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Witness testimony regarding the January 15th incident at 742 Evergreen Terrace. 
          Subject reported seeing a suspicious vehicle parked outside the residence between 
          11:00 PM and 1:00 AM. Vehicle described as dark-colored sedan with partial license 
          plate visible: ABC-12X.
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Detailed Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          The witness, identified as John Doe (Neighbor), provided a detailed account of events 
          observed on the evening of January 15th, 2024. Mr. Doe stated that at approximately 
          11:00 PM, he noticed a dark-colored sedan parked across from the victim's residence. 
          The vehicle remained stationary for approximately two hours.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Key observations include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300 ml-4">
          <li>Vehicle: Dark sedan, possibly black or dark blue</li>
          <li>License plate: Partial view - ABC-12X (last digit obscured)</li>
          <li>Occupants: At least one person visible in driver's seat</li>
          <li>Behavior: No unusual activity observed from vehicle</li>
          <li>Departure: Vehicle left at approximately 1:00 AM</li>
        </ul>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Key Points</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Suspicious vehicle observed for 2+ hours",
            "Partial license plate captured",
            "No direct interaction with residence",
            "Witness credibility: High (direct observation)",
            "Timeline consistent with incident report",
            "Weather conditions: Clear, good visibility",
          ].map((point, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <span className="text-sm text-slate-700 dark:text-slate-300">{point}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const entitiesContent = (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/30">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle>People</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "John Doe", role: "Witness - Neighbor", confidence: 95 },
              { name: "Jane Smith", role: "Victim - Resident", confidence: 92 },
              { name: "Unknown Driver", role: "Suspect - Vehicle Occupant", confidence: 78 },
            ].map((person, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{person.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{person.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${person.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{person.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/30">
              <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle>Organizations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Springfield PD", type: "Law Enforcement", confidence: 98 },
              { name: "Metro Insurance", type: "Insurance Company", confidence: 85 },
            ].map((org, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{org.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{org.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${org.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{org.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30">
              <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>Locations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "742 Evergreen Terrace", type: "Residential Address", confidence: 99 },
              { name: "Oak Street", type: "Street", confidence: 94 },
              { name: "Springfield", type: "City", confidence: 96 },
            ].map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{location.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{location.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 rounded-full"
                      style={{ width: `${location.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{location.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/30">
              <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <CardTitle>Dates & Times</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "January 15, 2024", time: "11:00 PM - 1:00 AM", event: "Vehicle observed" },
              { date: "January 16, 2024", time: "8:30 AM", event: "Witness statement taken" },
            ].map((date, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
              >
                <p className="font-medium text-slate-900 dark:text-slate-100">{date.date}</p>
                <p className="text-sm text-rose-600 dark:text-rose-400">{date.time}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{date.event}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const timelineContent = (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Event Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-6">
            {[
              {
                time: "11:00 PM",
                date: "Jan 15, 2024",
                event: "Dark sedan first observed parked on Oak Street",
                type: "observation",
              },
              {
                time: "11:30 PM",
                date: "Jan 15, 2024",
                event: "Vehicle still stationary, engine running",
                type: "observation",
              },
              {
                time: "12:00 AM",
                date: "Jan 16, 2024",
                event: "No change in vehicle position",
                type: "observation",
              },
              {
                time: "12:45 AM",
                date: "Jan 16, 2024",
                event: "Vehicle headlights turned on",
                type: "observation",
              },
              {
                time: "1:00 AM",
                date: "Jan 16, 2024",
                event: "Vehicle departed eastbound on Oak Street",
                type: "observation",
              },
              {
                time: "8:30 AM",
                date: "Jan 16, 2024",
                event: "Witness statement recorded by Detective Smith",
                type: "action",
              },
            ].map((event, index) => (
              <div key={index} className="relative flex gap-4">
                <div className={cn(
                  "absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10",
                  event.type === "observation"
                    ? "bg-blue-100 border-blue-600 dark:bg-blue-950 dark:border-blue-400"
                    : "bg-emerald-100 border-emerald-600 dark:bg-emerald-950 dark:border-emerald-400"
                )} />
                <div className="ml-10 flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {event.time}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {event.date}
                    </span>
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize",
                      event.type === "observation"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                    )}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{event.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const transcriptContent = (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Full Transcript</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <div className="space-y-4 text-slate-700 dark:text-slate-300">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Recorded: January 16, 2024 at 8:30 AM<br />
              Interviewer: Detective Sarah Smith<br />
              Witness: John Doe
            </p>
            
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">Good morning, Mr. Doe. Thank you for agreeing to speak with us today. Can you please state your full name for the record?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">My name is John Doe. I live at 738 Evergreen Terrace, right across from the Smith residence.</p>
              </div>
              
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">And can you tell us what you observed on the night of January 15th?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">Yes, I was up late that night watching TV. Around 11 PM, I noticed a dark-colored sedan parked across the street. It caught my attention because I didn't recognize it as one of the neighbors' cars.</p>
              </div>
              
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">Can you describe the vehicle in more detail?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">It was a dark color, either black or very dark blue. Four-door sedan, looked like it might have been a Toyota Camry or similar model. I managed to get a partial look at the license plate - it started with ABC-12, but I couldn't make out the last digit.</p>
              </div>
              
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">How long did the vehicle remain parked there?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">It was there for about two hours. I checked my watch when I first saw it - 11 PM. It was still there when I got up to get a drink at midnight. Around 12:45, I saw the headlights come on, and it drove away at about 1 AM.</p>
              </div>
              
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">Did you see anyone exit the vehicle or approach the residence?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">No, I never saw anyone get out. The windows were tinted, so I couldn't see inside clearly, but I thought I could see someone in the driver's seat. The car just sat there with the engine running.</p>
              </div>
              
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">Which direction did the vehicle go when it left?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">It turned right onto Oak Street and headed east, toward the main road.</p>
              </div>
              
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Detective Smith:</span>
                <p className="mt-1 ml-4">Is there anything else you remember about that night?</p>
              </div>
              
              <div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">John Doe:</span>
                <p className="mt-1 ml-4">The weather was clear that night, so visibility was good. I remember thinking it was odd that someone would just sit in their car for two hours in a residential neighborhood. That's why I made a note of the time and the partial plate.</p>
              </div>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
              End of transcript - Statement concluded at 8:45 AM
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function EvidenceDetailPage() {
  const tabs = [
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      content: summaryContent,
    },
    {
      id: "entities",
      label: "Entities",
      icon: Users,
      content: entitiesContent,
    },
    {
      id: "timeline",
      label: "Timeline",
      icon: Clock,
      content: timelineContent,
    },
    {
      id: "transcript",
      label: "Transcript",
      icon: MessageSquare,
      content: transcriptContent,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2 -ml-3 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/30 flex-shrink-0">
                  <FileText className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {dummyEvidence.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                      {dummyEvidence.type}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {dummyEvidence.size}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Uploaded {dummyEvidence.date}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      {dummyEvidence.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>Case: {dummyEvidence.caseNumber}</span>
                    <span>By: {dummyEvidence.uploadedBy}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Tabs tabs={tabs} defaultTab="summary" />
        </div>
      </main>
    </div>
  );
}
