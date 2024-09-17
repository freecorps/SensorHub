"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sensor } from "../type";

export default function Sensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSensors() {
      const { data, error } = await supabase.from("sensors").select("*");

      if (!error) setSensors(data || []);
    }

    fetchSensors();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">Sensors</h1>

      <Link href="/dashboard/sensors/new">
        <Button className="mb-6">Create New Sensor</Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => (
          <Card key={sensor.id}>
            <CardHeader>
              <CardTitle>{sensor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {sensor.is_public ? "Público" : "Privado"}</p>
              <Link href={`/dashboard/sensors/${sensor.id}`}>
                <Button className="mt-4">See Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
