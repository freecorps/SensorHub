"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@supabase/supabase-js";

export default function NewGroup() {
  const [name, setName] = useState("");
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data) {
        setUser(data.user);
      }
    };

    fetchUser();
  }, [supabase]);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6"
      >
        <h1 className="text-3xl font-bold mb-6">Carregando...</h1>
      </motion.div>
    );
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const { error } = await supabase
      .from("sensor_blocks")
      .insert({ name, user_id: user?.id });

    if (!error) {
      router.push("/dashboard/groups");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-6">Criar Novo Grupo</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Grupo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Nome do Grupo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Button type="submit">Criar Grupo</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
