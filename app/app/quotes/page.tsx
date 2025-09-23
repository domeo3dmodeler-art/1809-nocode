// app/quotes/page.tsx
// Страница для управления КП

import QuotesList from '@/components/QuotesList';

export default function QuotesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <QuotesList />
      </div>
    </div>
  );
}
