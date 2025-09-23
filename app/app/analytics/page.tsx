// app/analytics/page.tsx
// Страница дашборда аналитики

import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
