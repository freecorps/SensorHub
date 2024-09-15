"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Group } from "../type";

export default function Groups() {
  const [groups, setGroups] = useState<Group[] | []>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase.from("sensor_blocks").select("*");

      if (!error) setGroups(data || []);
    }

    fetchGroups();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">Grupos</h1>

      <Link href="/dashboard/groups/new">
        <Button className="mb-6">Criar Novo Grupo</Button>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/groups/${group.id}`}>
                <Button className="mt-4">Ver Detalhes</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
