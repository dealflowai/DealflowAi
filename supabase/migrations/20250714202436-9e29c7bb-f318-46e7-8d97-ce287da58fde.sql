-- Create automatic duplicate detection function
CREATE OR REPLACE FUNCTION public.detect_and_merge_duplicates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duplicate_buyer RECORD;
  similarity_threshold FLOAT := 0.7;
BEGIN
  -- Check for potential duplicates based on email or name+phone
  FOR duplicate_buyer IN 
    SELECT * FROM public.buyers 
    WHERE owner_id = NEW.owner_id 
    AND id != NEW.id
    AND (
      -- Exact email match
      (NEW.email IS NOT NULL AND email = NEW.email) OR
      -- Name + phone match
      (NEW.name IS NOT NULL AND NEW.phone IS NOT NULL 
       AND name = NEW.name AND phone = NEW.phone) OR
      -- Similar name and same location
      (NEW.name IS NOT NULL AND NEW.city IS NOT NULL 
       AND SIMILARITY(name, NEW.name) > similarity_threshold 
       AND city = NEW.city)
    )
  LOOP
    -- Log the potential duplicate
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      data
    ) VALUES (
      NEW.owner_id,
      'duplicate_detected',
      'Potential Duplicate Buyer Detected',
      'A potential duplicate buyer was automatically detected and requires review.',
      jsonb_build_object(
        'original_buyer_id', duplicate_buyer.id,
        'new_buyer_id', NEW.id,
        'match_reason', CASE 
          WHEN NEW.email IS NOT NULL AND duplicate_buyer.email = NEW.email THEN 'email_match'
          WHEN NEW.name IS NOT NULL AND NEW.phone IS NOT NULL 
               AND duplicate_buyer.name = NEW.name AND duplicate_buyer.phone = NEW.phone THEN 'name_phone_match'
          ELSE 'similar_name_location'
        END
      )
    );

    -- If it's an exact email match, auto-merge data
    IF NEW.email IS NOT NULL AND duplicate_buyer.email = NEW.email THEN
      -- Update the existing buyer with any new non-null data
      UPDATE public.buyers SET
        name = COALESCE(NEW.name, duplicate_buyer.name),
        phone = COALESCE(NEW.phone, duplicate_buyer.phone),
        city = COALESCE(NEW.city, duplicate_buyer.city),
        state = COALESCE(NEW.state, duplicate_buyer.state),
        zip_code = COALESCE(NEW.zip_code, duplicate_buyer.zip_code),
        budget_min = COALESCE(NEW.budget_min, duplicate_buyer.budget_min),
        budget_max = COALESCE(NEW.budget_max, duplicate_buyer.budget_max),
        investment_criteria = COALESCE(NEW.investment_criteria, duplicate_buyer.investment_criteria),
        location_focus = COALESCE(NEW.location_focus, duplicate_buyer.location_focus),
        financing_type = COALESCE(NEW.financing_type, duplicate_buyer.financing_type),
        acquisition_timeline = COALESCE(NEW.acquisition_timeline, duplicate_buyer.acquisition_timeline),
        -- Merge arrays
        asset_types = CASE 
          WHEN NEW.asset_types IS NOT NULL AND duplicate_buyer.asset_types IS NOT NULL 
          THEN array(SELECT DISTINCT unnest(NEW.asset_types || duplicate_buyer.asset_types))
          ELSE COALESCE(NEW.asset_types, duplicate_buyer.asset_types)
        END,
        markets = CASE 
          WHEN NEW.markets IS NOT NULL AND duplicate_buyer.markets IS NOT NULL 
          THEN array(SELECT DISTINCT unnest(NEW.markets || duplicate_buyer.markets))
          ELSE COALESCE(NEW.markets, duplicate_buyer.markets)
        END,
        property_type_interest = CASE 
          WHEN NEW.property_type_interest IS NOT NULL AND duplicate_buyer.property_type_interest IS NOT NULL 
          THEN array(SELECT DISTINCT unnest(NEW.property_type_interest || duplicate_buyer.property_type_interest))
          ELSE COALESCE(NEW.property_type_interest, duplicate_buyer.property_type_interest)
        END,
        tags = CASE 
          WHEN NEW.tags IS NOT NULL AND duplicate_buyer.tags IS NOT NULL 
          THEN array(SELECT DISTINCT unnest(NEW.tags || duplicate_buyer.tags))
          ELSE COALESCE(NEW.tags, duplicate_buyer.tags)
        END,
        -- Update status to active if it was previously cold
        status = CASE 
          WHEN duplicate_buyer.status = 'cold' AND NEW.status != 'cold' THEN NEW.status
          ELSE duplicate_buyer.status
        END,
        -- Keep higher priority
        priority = CASE 
          WHEN NEW.priority = 'VERY HIGH' OR duplicate_buyer.priority = 'VERY HIGH' THEN 'VERY HIGH'
          WHEN NEW.priority = 'HIGH' OR duplicate_buyer.priority = 'HIGH' THEN 'HIGH'
          WHEN NEW.priority = 'MEDIUM' OR duplicate_buyer.priority = 'MEDIUM' THEN 'MEDIUM'
          ELSE 'LOW'
        END,
        updated_at = now(),
        last_contacted = GREATEST(NEW.last_contacted, duplicate_buyer.last_contacted)
      WHERE id = duplicate_buyer.id;

      -- Log the auto-merge
      INSERT INTO public.notifications (
        user_id, 
        type, 
        title, 
        message, 
        data
      ) VALUES (
        NEW.owner_id,
        'auto_merge_completed',
        'Duplicate Buyer Auto-Merged',
        'A duplicate buyer was automatically merged based on matching email address.',
        jsonb_build_object(
          'merged_buyer_id', duplicate_buyer.id,
          'discarded_buyer_id', NEW.id
        )
      );

      -- Prevent the insert of the new duplicate
      RETURN NULL;
    END IF;
  END LOOP;

  -- If no auto-merge occurred, allow the insert
  RETURN NEW;
END;
$$;

-- Create trigger for automatic duplicate detection on buyer insert
CREATE TRIGGER trigger_detect_duplicates
  BEFORE INSERT ON public.buyers
  FOR EACH ROW
  EXECUTE FUNCTION public.detect_and_merge_duplicates();

-- Enable similarity extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;