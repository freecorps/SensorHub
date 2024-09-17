"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const [sensorCount, setSensorCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCounts() {
      const { data: sensors, error: sensorError } = await supabase
        .from("sensors")
        .select("id", { count: "exact" });

      const { data: groups, error: groupError } = await supabase
        .from("sensor_blocks")
        .select("id", { count: "exact" });

      if (!sensorError) setSensorCount(sensors?.length || 0);
      if (!groupError) setGroupCount(groups?.length || 0);
      if (groupError) toast.error("Erro ao buscar os grupos");
      if (sensorError) toast.error("Erro ao buscar os sensores");
    }

    fetchCounts();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{sensorCount}</p>
            <Link href="/dashboard/sensors">
              <Button className="mt-4">Manage Sensors</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{groupCount}</p>
            <Link href="/dashboard/groups">
              <Button className="mt-4">Manage Groups</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Link href="/dashboard/sensors/new">
            <Button>Create New Sensor</Button>
          </Link>
          <Link href="/dashboard/groups/new">
            <Button>Create New Group</Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}
