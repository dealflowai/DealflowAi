-- Add selected_plan column to profiles table to store user's package choice
ALTER TABLE profiles 
ADD COLUMN selected_plan TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN profiles.selected_plan IS 'The pricing plan selected by the user during signup (starter, growth, enterprise)';