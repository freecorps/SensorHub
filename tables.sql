-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a table for user profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for sensors
CREATE TABLE sensors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  api_key TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for sensor readings
CREATE TABLE sensor_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID REFERENCES sensors(id) NOT NULL,
  data JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a table for sensor blocks (groups)
CREATE TABLE sensor_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a junction table for sensors and blocks
CREATE TABLE sensor_block_mappings (
  sensor_id UUID REFERENCES sensors(id) NOT NULL,
  block_id UUID REFERENCES sensor_blocks(id) NOT NULL,
  PRIMARY KEY (sensor_id, block_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_block_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- RLS Policies for sensors
CREATE POLICY "Users can view their own sensors and public sensors." 
  ON sensors FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own sensors." 
  ON sensors FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sensors." 
  ON sensors FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sensors." 
  ON sensors FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for sensor_readings
CREATE POLICY "Users can view readings for their sensors and public sensors." 
  ON sensor_readings FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM sensors 
    WHERE sensors.id = sensor_readings.sensor_id 
    AND (sensors.user_id = auth.uid() OR sensors.is_public = true)
  ));

CREATE POLICY "Anyone can insert readings with valid API key and password." 
  ON sensor_readings FOR INSERT 
  WITH CHECK (true);  -- This will be enforced in the API function

-- RLS Policies for sensor_blocks
CREATE POLICY "Users can view their own sensor blocks." 
  ON sensor_blocks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sensor blocks." 
  ON sensor_blocks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sensor blocks." 
  ON sensor_blocks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sensor blocks." 
  ON sensor_blocks FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for sensor_block_mappings
CREATE POLICY "Users can view mappings for their blocks and sensors." 
  ON sensor_block_mappings FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM sensor_blocks 
    WHERE sensor_blocks.id = sensor_block_mappings.block_id 
    AND sensor_blocks.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert mappings for their blocks and sensors." 
  ON sensor_block_mappings FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM sensor_blocks 
    WHERE sensor_blocks.id = sensor_block_mappings.block_id 
    AND sensor_blocks.user_id = auth.uid()
  ) AND EXISTS (
    SELECT 1 FROM sensors 
    WHERE sensors.id = sensor_block_mappings.sensor_id 
    AND sensors.user_id = auth.uid()
  ));

-- Function to create a new sensor with encrypted password and API key
CREATE OR REPLACE FUNCTION create_sensor(
  p_user_id UUID,
  p_name TEXT,
  p_is_public BOOLEAN,
  p_password TEXT
) RETURNS TABLE(sensor_id UUID, api_key TEXT) AS $$
DECLARE
  new_sensor_id UUID;
  new_api_key TEXT;
BEGIN
  new_api_key := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO sensors (user_id, name, is_public, api_key, password_hash)
  VALUES (p_user_id, p_name, p_is_public, new_api_key, crypt(p_password, gen_salt('bf')))
  RETURNING id INTO new_sensor_id;
  
  RETURN QUERY SELECT new_sensor_id, new_api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify sensor API key and password, and insert reading
CREATE OR REPLACE FUNCTION insert_sensor_reading(
  p_api_key TEXT,
  p_password TEXT,
  p_data JSONB
) RETURNS UUID AS $$
DECLARE
  sensor_id UUID;
  reading_id UUID;
BEGIN
  -- Verify API key and password
  SELECT id INTO sensor_id
  FROM sensors
  WHERE api_key = p_api_key AND password_hash = crypt(p_password, password_hash);
  
  IF sensor_id IS NULL THEN
    RAISE EXCEPTION 'Invalid API key or password';
  END IF;
  
  -- Insert reading
  INSERT INTO sensor_readings (sensor_id, data)
  VALUES (sensor_id, p_data)
  RETURNING id INTO reading_id;
  
  RETURN reading_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up Storage for avatars
INSERT INTO storage.buckets (id, name)
  VALUES ('avatars', 'avatars');

-- Set up access controls for avatar storage
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their own avatar." ON storage.objects
  FOR UPDATE USING ((auth.uid() = owner)) WITH CHECK (bucket_id = 'avatars');

CREATE OR REPLACE FUNCTION verify_password(password_hash text, password_attempt text)
RETURNS boolean AS $$
BEGIN
  RETURN password_hash = crypt(password_attempt, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;