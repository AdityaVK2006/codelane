"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock historical data - in real app, this would come from an API
  const historicalData = {
    '7d': {
      dailyCongestion: [
        { day: 'Mon', low: 12, medium: 25, high: 8 },
        { day: 'Tue', low: 8, medium: 30, high: 12 },
        { day: 'Wed', low: 15, medium: 22, high: 10 },
        { day: 'Thu', low: 10, medium: 28, high: 15 },
        { day: 'Fri', low: 5, medium: 20, high: 20 },
        { day: 'Sat', low: 18, medium: 15, high: 5 },
        { day: 'Sun', low: 20, medium: 12, high: 3 }
      ],
      hourlyTraffic: [
        { hour: '00:00', vehicles: 45 },
        { hour: '02:00', vehicles: 32 },
        { hour: '04:00', vehicles: 28 },
        { hour: '06:00', vehicles: 85 },
        { hour: '08:00', vehicles: 245 },
        { hour: '10:00', vehicles: 189 },
        { hour: '12:00', vehicles: 156 },
        { hour: '14:00', vehicles: 198 },
        { hour: '16:00', vehicles: 267 },
        { hour: '18:00', vehicles: 312 },
        { hour: '20:00', vehicles: 145 },
        { hour: '22:00', vehicles: 78 }
      ],
      intersectionPerformance: [
        { name: 'Master Canteen', efficiency: 85, congestion: 35, accidents: 2 },
        { name: 'Vani Vihar', efficiency: 72, congestion: 68, accidents: 5 },
        { name: 'Jaydev Vihar', efficiency: 78, congestion: 42, accidents: 1 },
        { name: 'Rasulgarh', efficiency: 92, congestion: 18, accidents: 0 },
        { name: 'Sachivalaya', efficiency: 81, congestion: 38, accidents: 3 },
        { name: 'Kalpana', efficiency: 88, congestion: 22, accidents: 1 },
        { name: 'Biju Patnaik', efficiency: 65, congestion: 75, accidents: 4 },
        { name: 'Patia', efficiency: 79, congestion: 45, accidents: 2 }
      ],
      accidentStats: [
        { type: 'Rear-end', count: 12, severity: 'Medium' },
        { type: 'Side-swipe', count: 8, severity: 'Low' },
        { type: 'Head-on', count: 3, severity: 'High' },
        { type: 'T-bone', count: 6, severity: 'High' },
        { type: 'Multi-vehicle', count: 4, severity: 'Critical' }
      ],
      peakHours: [
        { hour: '07:00-09:00', intensity: 95 },
        { hour: '12:00-14:00', intensity: 75 },
        { hour: '17:00-19:00', intensity: 88 },
        { hour: '09:00-11:00', intensity: 65 },
        { hour: '15:00-17:00', intensity: 70 }
      ]
    },
    '30d': {
      dailyCongestion: Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        low: Math.floor(Math.random() * 20) + 10,
        medium: Math.floor(Math.random() * 30) + 20,
        high: Math.floor(Math.random() * 15) + 5
      })),
      hourlyTraffic: [
        { hour: '00:00', vehicles: 42 },
        { hour: '02:00', vehicles: 35 },
        { hour: '04:00', vehicles: 30 },
        { hour: '06:00', vehicles: 92 },
        { hour: '08:00', vehicles: 268 },
        { hour: '10:00', vehicles: 195 },
        { hour: '12:00', vehicles: 162 },
        { hour: '14:00', vehicles: 205 },
        { hour: '16:00', vehicles: 278 },
        { hour: '18:00', vehicles: 325 },
        { hour: '20:00', vehicles: 152 },
        { hour: '22:00', vehicles: 85 }
      ],
      intersectionPerformance: [
        { name: 'Master Canteen', efficiency: 82, congestion: 38, accidents: 8 },
        { name: 'Vani Vihar', efficiency: 68, congestion: 72, accidents: 15 },
        { name: 'Jaydev Vihar', efficiency: 75, congestion: 45, accidents: 6 },
        { name: 'Rasulgarh', efficiency: 89, congestion: 22, accidents: 2 },
        { name: 'Sachivalaya', efficiency: 78, congestion: 42, accidents: 12 },
        { name: 'Kalpana', efficiency: 85, congestion: 25, accidents: 4 },
        { name: 'Biju Patnaik', efficiency: 62, congestion: 78, accidents: 18 },
        { name: 'Patia', efficiency: 76, congestion: 48, accidents: 9 }
      ],
      accidentStats: [
        { type: 'Rear-end', count: 45, severity: 'Medium' },
        { type: 'Side-swipe', count: 32, severity: 'Low' },
        { type: 'Head-on', count: 8, severity: 'High' },
        { type: 'T-bone', count: 18, severity: 'High' },
        { type: 'Multi-vehicle', count: 12, severity: 'Critical' }
      ],
      peakHours: [
        { hour: '07:00-09:00', intensity: 92 },
        { hour: '12:00-14:00', intensity: 78 },
        { hour: '17:00-19:00', intensity: 85 },
        { hour: '09:00-11:00', intensity: 68 },
        { hour: '15:00-17:00', intensity: 72 }
      ]
    },
    '90d': {
      dailyCongestion: Array.from({ length: 90 }, (_, i) => ({
        day: `Week ${Math.floor(i / 7) + 1}.${(i % 7) + 1}`,
        low: Math.floor(Math.random() * 25) + 15,
        medium: Math.floor(Math.random() * 35) + 25,
        high: Math.floor(Math.random() * 20) + 8
      })),
      hourlyTraffic: [
        { hour: '00:00', vehicles: 48 },
        { hour: '02:00', vehicles: 38 },
        { hour: '04:00', vehicles: 32 },
        { hour: '06:00', vehicles: 105 },
        { hour: '08:00', vehicles: 285 },
        { hour: '10:00', vehicles: 210 },
        { hour: '12:00', vehicles: 175 },
        { hour: '14:00', vehicles: 220 },
        { hour: '16:00', vehicles: 295 },
        { hour: '18:00', vehicles: 345 },
        { hour: '20:00', vehicles: 165 },
        { hour: '22:00', vehicles: 95 }
      ],
      intersectionPerformance: [
        { name: 'Master Canteen', efficiency: 84, congestion: 36, accidents: 25 },
        { name: 'Vani Vihar', efficiency: 65, congestion: 75, accidents: 42 },
        { name: 'Jaydev Vihar', efficiency: 72, congestion: 48, accidents: 18 },
        { name: 'Rasulgarh', efficiency: 87, congestion: 25, accidents: 8 },
        { name: 'Sachivalaya', efficiency: 76, congestion: 45, accidents: 35 },
        { name: 'Kalpana', efficiency: 83, congestion: 28, accidents: 12 },
        { name: 'Biju Patnaik', efficiency: 60, congestion: 80, accidents: 55 },
        { name: 'Patia', efficiency: 74, congestion: 50, accidents: 28 }
      ],
      accidentStats: [
        { type: 'Rear-end', count: 128, severity: 'Medium' },
        { type: 'Side-swipe', count: 85, severity: 'Low' },
        { type: 'Head-on', count: 22, severity: 'High' },
        { type: 'T-bone', count: 45, severity: 'High' },
        { type: 'Multi-vehicle', count: 35, severity: 'Critical' }
      ],
      peakHours: [
        { hour: '07:00-09:00', intensity: 90 },
        { hour: '12:00-14:00', intensity: 75 },
        { hour: '17:00-19:00', intensity: 82 },
        { hour: '09:00-11:00', intensity: 65 },
        { hour: '15:00-17:00', intensity: 70 }
      ]
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const CONGESTION_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(historicalData[timeRange]);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Analytics</h1>
              <p className="text-gray-600 mt-2">Comprehensive analysis of traffic patterns and performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-2xl">🚗</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.hourlyTraffic.reduce((sum, hour) => sum + hour.vehicles, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-green-600 text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analyticsData.intersectionPerformance.reduce((sum, inter) => sum + inter.efficiency, 0) / analyticsData.intersectionPerformance.length)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-red-600 text-2xl">🚨</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Accidents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.accidentStats.reduce((sum, accident) => sum + accident.count, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Peak Hour Traffic</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...analyticsData.hourlyTraffic.map(h => h.vehicles))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Congestion Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Congestion Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.dailyCongestion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="low" stackId="a" fill="#10B981" name="Low Congestion" />
                <Bar dataKey="medium" stackId="a" fill="#F59E0B" name="Medium Congestion" />
                <Bar dataKey="high" stackId="a" fill="#EF4444" name="High Congestion" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Traffic Pattern */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Traffic Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.hourlyTraffic}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="vehicles" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Vehicles" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Intersection Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intersection Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.intersectionPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#10B981" name="Efficiency %" />
                <Bar dataKey="congestion" fill="#EF4444" name="Congestion %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Accident Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accident Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.accidentStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.accidentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Peak Hours Intensity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours Traffic Intensity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="intensity" fill="#8B5CF6" name="Traffic Intensity %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Congestion vs Efficiency */}
          {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Congestion vs Efficiency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={analyticsData.intersectionPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="congestion" name="Congestion %" />
                <YAxis dataKey="efficiency" name="Efficiency %" />
                <Tooltip />
                <Scatter name="Intersections" fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div> */}
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accident Severity Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Accident Severity Analysis</h3>
            <div className="space-y-4">
              {analyticsData.accidentStats.map((accident, index) => (
                <div key={accident.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="font-medium text-gray-700">{accident.type}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      accident.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      accident.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      accident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {accident.severity}
                    </span>
                    <span className="font-bold text-gray-900">{accident.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Overall System Efficiency</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(analyticsData.intersectionPerformance.reduce((sum, inter) => sum + inter.efficiency, 0) / analyticsData.intersectionPerformance.length)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.round(analyticsData.intersectionPerformance.reduce((sum, inter) => sum + inter.efficiency, 0) / analyticsData.intersectionPerformance.length)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Average Congestion Level</span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(analyticsData.intersectionPerformance.reduce((sum, inter) => sum + inter.congestion, 0) / analyticsData.intersectionPerformance.length)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${Math.round(analyticsData.intersectionPerformance.reduce((sum, inter) => sum + inter.congestion, 0) / analyticsData.intersectionPerformance.length)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Accident Reduction Target</span>
                  <span className="text-sm font-medium text-gray-700">15%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ScatterChart component for the Congestion vs Efficiency chart
const ScatterChart = ({ data, ...props }) => (
  <ResponsiveContainer width="100%" height={300}>
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-gray-500">
        <p>Scatter Chart Visualization</p>
        <p className="text-sm">(Implementation details would depend on your chart library)</p>
      </div>
    </div>
  </ResponsiveContainer>
);

export default AnalyticsPage;