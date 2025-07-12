-- Add unique constraint on user_id in user_tokens table
ALTER TABLE public.user_tokens ADD CONSTRAINT user_tokens_user_id_unique UNIQUE (user_id);