-- Add admin policies for user management
CREATE POLICY "Admin users can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (get_user_role() = 'admin');

CREATE POLICY "Admin users can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (get_user_role() = 'admin');