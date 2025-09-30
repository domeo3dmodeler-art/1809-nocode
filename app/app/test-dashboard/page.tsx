'use client';

import { useEffect, useState } from 'react';

export default function TestDashboardPage() {
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = {
      token: token ? token.substring(0, 20) + '...' : 'Нет токена',
      userId: localStorage.getItem('userId'),
      userEmail: localStorage.getItem('userEmail'),
      userRole: localStorage.getItem('userRole')
    };
    setAuthData(userData);
  }, []);

  if (!authData?.token) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">НЕ АВТОРИЗОВАН</h1>
        <p>Токен не найден в localStorage</p>
        <a href="/login" className="text-blue-500 hover:underline">Перейти на логин</a>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600 mb-4">АВТОРИЗОВАН УСПЕШНО!</h1>
      <div className="bg-green-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Данные пользователя:</h2>
        <pre className="text-sm">{JSON.stringify(authData, null, 2)}</pre>
      </div>
      <div className="space-x-4">
        <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Перейти на Dashboard
        </a>
        <a href="/admin/users" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Перейти на Users
        </a>
      </div>
    </div>
  );
}
