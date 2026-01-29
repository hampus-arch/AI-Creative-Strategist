"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FrameworkPipeline } from "@/components/framework-pipeline";
import { PhaseCard } from "@/components/phase-card";
import { FRAMEWORK_PHASES, type FrameworkPhase, getPhaseInfo } from "@/lib/framework";
import { Sparkles, Building2, Settings, ArrowRight } from "lucide-react";

interface Brand {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [selectedPhase, setSelectedPhase] = useState<FrameworkPhase>("INTERRUPT");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandsRes, settingsRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/settings"),
      ]);
      
      const brandsData = await brandsRes.json();
      const settingsData = await settingsRes.json();
      
      setBrands(brandsData.brands || []);
      setHasApiKey(settingsData.hasApiKey || false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const selectedPhaseInfo = getPhaseInfo(selectedPhase);

  const needsSetup = !hasApiKey || brands.length === 0;

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome{session?.user?.name ? `, ${session.user.name}` : " back"}!
        </h1>
        <p className="text-neutral-400 mt-1">
          Generate winning ad content with the Orange Juice Creative Framework
        </p>
      </div>

      {/* Setup Cards (if needed) */}
      {needsSetup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!hasApiKey && (
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Connect OpenAI</h3>
                    <p className="text-sm text-neutral-400 mb-3">
                      Add your OpenAI API key to start generating content
                    </p>
                    <Link href="/settings">
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                        Add API Key
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {brands.length === 0 && (
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Add Your Brand</h3>
                    <p className="text-sm text-neutral-400 mb-3">
                      Set up your brand information to personalize content
                    </p>
                    <Link href="/brands">
                      <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                        Add Brand
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Framework Pipeline */}
      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <FrameworkPipeline
          selectedPhase={selectedPhase}
          onPhaseSelect={setSelectedPhase}
        />
      </Card>

      {/* Selected Phase Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedPhaseInfo && <PhaseCard phase={selectedPhaseInfo} />}
        </div>

        {/* Quick Actions */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Quick Generate
            </h3>
            <p className="text-sm text-neutral-400">
              Start generating content for the {selectedPhaseInfo?.name} phase
            </p>

            <div className="space-y-2">
              <Link href={`/generate?phase=${selectedPhase}`}>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Generate {selectedPhaseInfo?.name} Content
                </Button>
              </Link>

              {brands.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-neutral-500 mb-2">Select a brand:</p>
                  <div className="space-y-1">
                    {brands.slice(0, 3).map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/generate?phase=${selectedPhase}&brand=${brand.id}`}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-start border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          {brand.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Phases Overview */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">All Framework Phases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {FRAMEWORK_PHASES.map((phase) => (
            <Card
              key={phase.id}
              className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors cursor-pointer"
              onClick={() => setSelectedPhase(phase.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{phase.name}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r text-white ${phase.color}`}
                  >
                    {phase.percentage}
                  </span>
                </div>
                <p className="text-sm text-neutral-400">{phase.goal}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
