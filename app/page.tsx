"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, Share2, Shield, Activity } from "lucide-react";
import { ThemeSwitch } from "@/components/theme-switch";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const redirect = (path: string) => {
    router.push(path);
  };

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
            <Button
              variant="ghost"
              onClick={() => {
                redirect("./auth");
              }}
            >
              Login
            </Button>
            <Button
              onClick={() => {
                redirect("./auth");
              }}
            >
              Sign Up
            </Button>
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
            Create, Manage and Share your Sensors
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Intuitive platform for monitoring and sharing sensor data
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                redirect("./auth");
              }}
            >
              Start Now <ArrowRight className="ml-2" />
            </Button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Shield,
              title: "Secure",
              description: "Protect your data with our advanced security",
            },
            {
              icon: Share2,
              title: "Shareable",
              description: "Easily share your data with whoever you want",
            },
            {
              icon: Activity,
              title: "Real Time",
              description: "Monitor your sensors in real time",
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
              <CardTitle>Start Using SensorHub Today</CardTitle>
              <CardDescription>
                Create your free account and start managing your sensors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    redirect("./auth");
                  }}
                >
                  Create Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
