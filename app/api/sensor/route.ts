import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Zod schema for request body validation
const sensorDataSchema = z.object({
  api_key: z.string(),
  password: z.string(),
  data: z.record(z.number()),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { api_key, password, data } = sensorDataSchema.parse(body);

    // Fetch sensor information
    const { data: sensor, error: sensorError } = await supabase
      .from("sensors")
      .select("id, password_hash")
      .eq("api_key", api_key)
      .single();

    if (sensorError || !sensor) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Verify password
    const { data: pwCheck, error: pwError } = await supabase.rpc(
      "verify_password",
      {
        password_hash: sensor.password_hash,
        password_attempt: password,
      }
    );

    if (pwError || !pwCheck) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Insert the new sensor reading
    const { error: insertError } = await supabase
      .from("sensor_readings")
      .insert({
        sensor_id: sensor.id,
        data: data,
      });

    if (insertError) {
      console.error("Error inserting sensor reading:", insertError);
      return NextResponse.json(
        { error: "Failed to insert sensor reading" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Sensor data added successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
