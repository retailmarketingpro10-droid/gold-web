import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";
import { getCurrentUserId } from "@/lib/userStorage";
import { AppSettings, DEFAULT_SETTINGS } from "@/types/settings";
import { useToast } from "./use-toast";

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const lastSyncTime = useRef<string>(new Date().toISOString());

  // Deeply merge incoming settings with DEFAULT_SETTINGS to ensure all keys exist
  const mergeSettings = (incoming: any): AppSettings => {
    const merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    if (!incoming) return merged;

    Object.keys(DEFAULT_SETTINGS).forEach((section) => {
      if (incoming[section]) {
        Object.keys(DEFAULT_SETTINGS[section as keyof AppSettings]).forEach((key) => {
          if (incoming[section][key] !== undefined) {
             (merged as any)[section][key] = incoming[section][key];
          }
        });
      }
    });
    return merged;
  };

  const fetchSettings = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("settings")
        .select("config")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data?.config) {
        setSettings(mergeSettings(data.config));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Setup realtime subscription
    let subscription: any;
    const setupRealtime = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const supabase = getSupabase();
      subscription = supabase
        .channel(`settings_changes_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "settings",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.new && (payload.new as any).config) {
              // Only update if the incoming data is newer than our last sync/save
              setSettings(mergeSettings((payload.new as any).config));
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
       if (subscription) getSupabase().removeChannel(subscription);
    };
  }, [fetchSettings]);

  const updateSetting = useCallback(async <T extends keyof AppSettings>(
    section: T,
    subKey: keyof AppSettings[T],
    value: any
  ) => {
    setSaving(true);
    
    // 1. Optimistic Update
    const prevSettings = JSON.parse(JSON.stringify(settings));
    const newSettings = JSON.parse(JSON.stringify(settings));
    newSettings[section][subKey] = value;
    setSettings(newSettings);

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const supabase = getSupabase();
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: userId,
          config: newSettings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      
      lastSyncTime.current = new Date().toISOString();
    } catch (error) {
      console.error("Error saving setting:", error);
      // 2. Revert on failure
      setSettings(prevSettings);
      toast({
        title: "Saving Failed",
        description: "Your changes could not be saved to the cloud. Reverting.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  const updateSection = useCallback(async <T extends keyof AppSettings>(
    section: T,
    updates: Partial<AppSettings[T]>
  ) => {
    setSaving(true);
    const prevSettings = JSON.parse(JSON.stringify(settings));
    const newSettings = JSON.parse(JSON.stringify(settings));
    newSettings[section] = { ...newSettings[section], ...updates };
    setSettings(newSettings);

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("Not authenticated");

      const supabase = getSupabase();
      const { error } = await supabase
        .from("settings")
        .upsert({
          user_id: userId,
          config: newSettings,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (error) {
       console.error("Error saving section:", error);
       setSettings(prevSettings);
       toast({
         title: "Error Saving Section",
         description: "Could not sync business settings. Reverting.",
         variant: "destructive"
       });
    } finally {
      setSaving(false);
    }
  }, [settings, toast]);

  return {
    settings,
    loading,
    saving,
    updateSetting,
    updateSection,
    lastSyncTime: lastSyncTime.current
  };
};
