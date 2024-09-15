"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, Share2, Shield, Activity } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <nav className="container mx-auto p-6">
        <div className="flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-foreground"
          >
            SensorHub
          </motion.h1>
          <div className="space-x-4 flex items-center">
            <ThemeSwitch />
            <Button variant="ghost">Login</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Crie, Gerencie e Compartilhe seus Sensores
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Plataforma intuitiva para monitoramento e compartilhamento de dados
            de sensores
          </p>
          <div className="flex justify-center space-x-4">
            <Button>
              Comece Agora <ArrowRight className="ml-2" />
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Shield,
              title: "Seguro",
              description: "Proteja seus dados com nossa segurança avançada",
            },
            {
              icon: Share2,
              title: "Compartilhável",
              description:
                "Compartilhe facilmente seus dados com quem você quiser",
            },
            {
              icon: Activity,
              title: "Tempo Real",
              description: "Monitore seus sensores em tempo real",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <feature.icon className="mr-2" />
                    {feature.title}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Comece a Usar o SensorHub Hoje</CardTitle>
              <CardDescription>
                Crie sua conta gratuitamente e comece a gerenciar seus sensores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button>Criar Conta</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
