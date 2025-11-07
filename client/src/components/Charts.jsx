import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// register chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale
);

// Utility: format month key
const formatMonth = (date) => {
  const d = new Date(date);
  return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
};

export const CategoryPieChart = ({ expenses = [] }) => {
  const { labels, data } = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0);
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map((e) => e[0]),
      data: entries.map((e) => e[1]),
    };
  }, [expenses]);

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#60A5FA', '#34D399', '#F97316', '#F43F5E', '#A78BFA', '#F59E0B', '#94A3B8', '#10B981'
        ],
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Spending by Category</h3>
      {labels.length === 0 ? (
        <p className="text-gray-500">No data to display</p>
      ) : (
        <div className="h-64">
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
};

export const MonthlyLineChart = ({ expenses = [] }) => {
  const { labels, data } = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const key = formatMonth(e.createdAt || e.date || Date.now());
      map[key] = (map[key] || 0) + (Number(e.amount) || 0);
    });
    const entries = Object.entries(map).sort((a, b) => {
      // parse month-year for chronological sort
      return new Date(a[0]) - new Date(b[0]);
    });
    
    // Calculate cumulative total spending over time
    let cumulativeTotal = 0;
    const cumulativeData = entries.map(([month, monthlyAmount]) => {
      cumulativeTotal += monthlyAmount;
      return cumulativeTotal;
    });
    
    return {
      labels: entries.map((e) => e[0]),
      data: cumulativeData,
    };
  }, [expenses]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Spent',
        data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Spending Over Time</h3>
      {labels.length === 0 ? (
        <p className="text-gray-500">No data to display</p>
      ) : (
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
};

export default null;
