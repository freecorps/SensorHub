"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type GroupData = z.infer<typeof groupSchema>;

interface Sensor {
  id: string;
  name: string;
  is_public: boolean;
}

interface GroupDetailsProps {
  params: {
    groupid: string;
  };
}

export default function GroupDetails({ params }: GroupDetailsProps) {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [availableSensors, setAvailableSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  const supabase = createClient();

  const form = useForm<GroupData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    const fetchGroupData = async () => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        return;
      }
      if (!user) {
        return;
      }
      if (params.groupid) {
        setIsLoading(true);
        const { data: groupData, error: groupError } = await supabase
          .from("sensor_blocks")
          .select("*")
          .eq("id", params.groupid)
          .single();

        if (groupError) {
          toast.error("Failed to fetch group information");
          setIsLoading(false);
          return;
        }

        setGroup(groupData);
        form.reset(groupData);

        // Fetch sensors associated with this group
        const { data: sensorData, error: sensorError } = await supabase
          .from("sensor_block_mappings")
          .select("sensors(*)")
          .eq("block_id", params.groupid);

        if (sensorError) {
          toast.error("Failed to fetch associated sensors");
        } else {
          setSensors(
            sensorData.map((item) => ({
              id: item.sensors?.id as string,
              name: item.sensors?.name as string,
              is_public: item.sensors?.is_public as boolean,
            }))
          );
        }

        // Fetch available sensors (not in this group)
        const { data: availableSensorData, error: availableSensorError } =
          await supabase
            .from("sensors")
            .select("*")
            .eq("user_id", user.user.id);

        const availableSensors = availableSensorData?.filter(
          (sensor) =>
            !sensors.find((item) => item.id === sensor.id) && sensor.is_public
        );

        if (!availableSensors || availableSensors.length === 0) {
          toast.error("Failed to fetch available sensors");
        }

        if (availableSensorError) {
          toast.error("Failed to fetch available sensors");
        } else {
          if (
            (availableSensors ?? []).length > 0 &&
            (availableSensors ?? [])[0].id !== null &&
            (availableSensors ?? [])[0].name !== null &&
            (availableSensors ?? [])[0].is_public !== null
          )
            if (availableSensors) {
              setAvailableSensors(
                availableSensors.map((item) => ({
                  id: item.id as string,
                  name: item.name as string,
                  is_public: item.is_public as boolean,
                }))
              );
            }
        }

        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [params.groupid, form]);

  const onSubmit = async (data: GroupData) => {
    setIsLoading(true);
    const { error } = await supabase
      .from("sensor_blocks")
      .update(data)
      .eq("id", params.groupid);

    setIsLoading(false);
    if (error) {
      toast.error("Failed to update group information");
    } else {
      toast.success("Group information updated successfully");
      setGroup(data);
    }
  };

  const addSensorToGroup = async () => {
    if (!selectedSensor) {
      toast.error("Please select a sensor to add");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from("sensor_block_mappings")
      .insert({ sensor_id: selectedSensor, block_id: params.groupid });

    if (error) {
      toast.error("Failed to add sensor to group");
    } else {
      toast.success("Sensor added to group successfully");
      // Refresh the sensors list
      const { data: sensorData } = await supabase
        .from("sensor_block_mappings")
        .select("sensors(*)")
        .eq("block_id", params.groupid);

      setSensors(
        sensorData?.map((item) => ({
          id: item.sensors?.id as string,
          name: item.sensors?.name as string,
          is_public: item.sensors?.is_public as boolean,
        })) || []
      );

      // Remove the added sensor from available sensors
      setAvailableSensors(
        availableSensors.filter((sensor) => sensor.id !== selectedSensor)
      );
      setSelectedSensor(null);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner size={70} className="text-accent" />
        <h1>Loading</h1>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1>Group not found</h1>
      </div>
    );
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
          <CardTitle>Group Information</CardTitle>
          <CardDescription>View and edit group details</CardDescription>
        </CardHeader>
        <CardContent className="gap-4 flex flex-col">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Group"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Associated Sensors</CardTitle>
          <CardDescription>Sensors in this group</CardDescription>
        </CardHeader>
        <CardContent>
          {sensors.length > 0 ? (
            <ul className="space-y-2">
              {sensors.map((sensor) => (
                <li
                  key={sensor.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <span>{sensor.name}</span>
                  <span>{sensor.is_public ? "Public" : "Private"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No sensors associated with this group.</p>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Add Sensor to Group</CardTitle>
          <CardDescription>
            Associate a new sensor with this group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Select
              onValueChange={setSelectedSensor}
              value={selectedSensor || undefined}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a sensor" />
              </SelectTrigger>
              <SelectContent>
                {availableSensors.map((sensor) => (
                  <SelectItem key={sensor.id} value={sensor.id}>
                    {sensor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={addSensorToGroup}
              disabled={!selectedSensor || isLoading}
            >
              Add to Group
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
