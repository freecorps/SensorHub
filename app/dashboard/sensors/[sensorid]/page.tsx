"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const sensorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_public: z.boolean(),
});

type SensorData = z.infer<typeof sensorSchema>;

interface SensorReading {
  timestamp: string;
  data: { [key: string]: number };
}

interface SensorInfoProps {
  params: {
    sensorid: string;
  };
}

export default function SensorInfo({ params }: SensorInfoProps) {
  if (!params.sensorid) {
    return <div>Sensor not found</div>;
  }

  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const form = useForm<SensorData>({
    resolver: zodResolver(sensorSchema),
    defaultValues: {
      name: "",
      is_public: false,
    },
  });

  useEffect(() => {
    const fetchSensorData = async () => {
      if (params.sensorid) {
        setIsLoading(true);
        const { data: sensorData, error: sensorError } = await supabase
          .from("sensors")
          .select("*")
          .eq("id", params.sensorid)
          .single();

        if (sensorError) {
          toast.error("Failed to fetch sensor information");
          return;
        }

        const data = {
          ...sensorData,
          is_public: sensorData.is_public || false,
        };

        setSensor(data);
        form.reset(data);

        const { data: readingsData, error: readingsError } = await supabase
          .from("sensor_readings")
          .select("*")
          .eq("sensor_id", params.sensorid)
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
      }
    };

    fetchSensorData();
  }, [form]);

  const onSubmit = async (data: SensorData) => {
    setIsLoading(true);
    const { error } = await supabase
      .from("sensors")
      .update(data)
      .eq("id", params.sensorid as string);

    setIsLoading(false);
    if (error) {
      toast.error("Failed to update sensor information");
    } else {
      toast.success("Sensor information updated successfully");
      setSensor(data);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!sensor) {
    return <div>Sensor not found</div>;
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
          <CardTitle>Sensor Information</CardTitle>
          <CardDescription>View and edit sensor details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sensor Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Sensor</FormLabel>
                      <h2>Make this sensor's data publicly accessible</h2>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Sensor"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl mx-auto mt-8">
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
    </motion.div>
  );
}
