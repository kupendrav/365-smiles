"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { karnatakaInstitutions, InstitutionType } from "../../../data/institutions";

type TabType = "all" | "orphanage" | "old_age_home" | "charity";

export default function InstitutionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  // Flatten all institutions
  const allInstitutions = karnatakaInstitutions.flatMap(d => d.institutions);
  
  // Get unique districts
  const districts = ["all", ...karnatakaInstitutions.map(d => d.district)];
  
  // Filter institutions based on active tab and selected district
  const filteredInstitutions = allInstitutions.filter(inst => {
    const typeMatch = activeTab === "all" || inst.type.includes(activeTab as InstitutionType);
    const districtMatch = selectedDistrict === "all" || inst.district === selectedDistrict;
    return typeMatch && districtMatch;
  });

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: "all", label: "All Institutions", icon: "🏢" },
    { key: "orphanage", label: "Orphanages", icon: "👶" },
    { key: "old_age_home", label: "Old Age Homes", icon: "👴" },
    { key: "charity", label: "Charities", icon: "❤️" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Karnataka Institutions</h1>
              <p className="text-gray-600 mt-1">Comprehensive directory of orphanages, old age homes, and charities</p>
            </div>
            <button
              onClick={() => router.push("/admin/frontpage")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tabs.map(tab => {
            const count = tab.key === "all" ? allInstitutions.length : 
              allInstitutions.filter(inst => inst.type.includes(tab.key as InstitutionType)).length;
            return (
              <div key={tab.key} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{tab.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <span className="text-3xl">{tab.icon}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Tab Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Type</label>
                <div className="flex flex-wrap gap-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${
                        activeTab === tab.key
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* District Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-3">Filter by District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {districts.map(district => (
                    <option key={district} value={district}>
                      {district === "all" ? "All Districts" : district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredInstitutions.length} {activeTab === "all" ? "Institutions" : tabs.find(t => t.key === activeTab)?.label} Found
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredInstitutions.map((inst, idx) => (
              <div key={`${inst.name}-${idx}`} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {inst.name}
                      </h3>
                      <div className="flex gap-2">
                        {inst.type.map(type => (
                          <span key={type} className={`px-2 py-1 rounded-full text-xs font-medium ${
                            type === "orphanage" ? "bg-blue-100 text-blue-800" :
                            type === "old_age_home" ? "bg-green-100 text-green-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>
                            {type === "orphanage" ? "👶 Orphanage" :
                             type === "old_age_home" ? "👴 Old Age Home" : "❤️ Charity"}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-800">📍 District:</span>
                        <span>{inst.district}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-800">📞 Contact:</span>
                        <span>{inst.contactDetails}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-medium text-gray-800">🏠 Address:</span>
                        <span>{inst.address}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-4">
                      {inst.locationLink && (
                        <a
                          href={inst.locationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors hover:scale-105"
                        >
                          🗺️ View on Maps
                        </a>
                      )}
                      {inst.website && (
                        <a
                          href={inst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors hover:scale-105"
                        >
                          🌐 Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredInstitutions.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-lg">No institutions found matching your criteria</p>
                <p className="text-sm mt-2">Try adjusting your filters to see more results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
