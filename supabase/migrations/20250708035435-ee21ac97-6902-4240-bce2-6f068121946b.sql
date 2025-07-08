-- Add selected_plan column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN selected_plan TEXT;