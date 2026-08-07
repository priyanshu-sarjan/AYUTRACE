'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Dashboard() {
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    async function fetchWarehouses() {
      const { data, error } = await supabase.from('warehouses').select('*');
      if (error) console.error("Error fetching data:", error);
      else setWarehouses(data);
    }
    fetchWarehouses();
  }, []);

  return (
    <div>
      <h1>Distribution Hubs</h1>
      <ul>
        {warehouses.map((wh) => (
          <li key={wh.id}>
            {wh.name} ({wh.location_city}) - Score: {wh.rank_score}
          </li>
        ))}
      </ul>
    </div>
  );
}
