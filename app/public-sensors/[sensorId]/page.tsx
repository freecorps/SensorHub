"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface SensorReading {
  timestamp: string;
  data: { [key: string]: number };
}

interface Sensor {
  id: string;
  name: string;
  is_public: boolean;
}

export default function PublicSensor() {
  const params = useParams();
  const sensorId = params.sensorId as string;

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchSensorData = async () => {
      setIsLoading(true);

      // Fetch sensor information
      const { data: sensorData, error: sensorError } = await supabase
        .from("sensors")
        .select("id, name, is_public")
        .eq("id", sensorId)
        .single();

      if (sensorError || !sensorData || !sensorData.is_public) {
        toast.error("Sensor not found or not public");
        setIsLoading(false);
        return;
      }

      setSensor({
        ...sensorData,
        is_public: sensorData.is_public || false,
      });

      // Fetch sensor readings
      const { data: readingsData, error: readingsError } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("sensor_id", sensorId)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (readingsError) {
        toast.error("Failed to fetch sensor readings");
      } else {
        const _readingsData = readingsData.map((reading) => ({
          timestamp: reading.timestamp as string,
          data: reading.data as { [key: string]: number },
        }));
        setReadings(_readingsData);
      }

      setIsLoading(false);
    };

    fetchSensorData();
  }, [sensorId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sensor || !sensor.is_public) {
    return <div>Sensor not found or not public</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto p-4"
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{sensor.name}</CardTitle>
          <CardDescription>Public Sensor Data</CardDescription>
        </CardHeader>
        <CardContent>
          <Card>
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
              <CardDescription>Last 100 readings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={readings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) =>
                      new Date(timestamp).toLocaleTimeString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    formatter={(value, name) => [`${value}`, name]}
                  />
                  <Legend />
                  {Object.keys(readings[0]?.data || {}).map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={`data.${key}`}
                      stroke={`hsl(${index * 30}, 70%, 50%)`}
                      name={key}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );
}
