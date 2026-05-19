// Compatibility shim that exposes the same surface the Base44 SDK had,
// but backed entirely by Supabase. The whole codebase already imports
// `base44` from this file, so we keep that symbol alive.

import { supabase } from "@/lib/supabaseClient";

// ---------- field mapping (camelCase ↔ snake_case for profiles) ----------
const PROFILE_CAMEL_TO_SNAKE = {
  emergencyContactName: "emergency_contact_name",
  emergencyContactNumber: "emergency_contact_number",
  emergencyContact1Name: "emergency_contact_1_name",
  emergencyContact1Number: "emergency_contact_1_number",
  emergencyContact2Name: "emergency_contact_2_name",
  emergencyContact2Number: "emergency_contact_2_number",
  checkInIntervalHours: "check_in_interval_hours",
  lastCheckInTime: "last_check_in_time",
  privacyPurgePin: "privacy_purge_pin",
  privacyPurgeDays: "privacy_purge_days",
  country: "country",
  voiceCommandPhrase: "voice_command_phrase",
  voiceCommandTrigger: "voice_command_trigger",
  trialEndsAt: "trial_ends_at",
  planName: "plan_name",
  full_name: "full_name",
  email: "email",
};

const profileToCamel = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactNumber: row.emergency_contact_number,
    emergencyContact1Name: row.emergency_contact_1_name,
    emergencyContact1Number: row.emergency_contact_1_number,
    emergencyContact2Name: row.emergency_contact_2_name,
    emergencyContact2Number: row.emergency_contact_2_number,
    checkInIntervalHours: row.check_in_interval_hours,
    lastCheckInTime: row.last_check_in_time,
    privacyPurgePin: row.privacy_purge_pin,
    privacyPurgeDays: row.privacy_purge_days,
    country: row.country,
    voiceCommandPhrase: row.voice_command_phrase,
    voiceCommandTrigger: row.voice_command_trigger,
    planName: row.plan_name,
    subscriptionStatus:
      row.plan_name && row.plan_name !== "Free" ? "active" : null,
    trialStartDate: row.created_at,
    trialEndsAt: row.trial_ends_at,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
};

const camelToSnakeProfilePatch = (patch) => {
  const out = {};
  for (const [k, v] of Object.entries(patch || {})) {
    const mapped = PROFILE_CAMEL_TO_SNAKE[k] || k;
    out[mapped] = v;
  }
  out.updated_at = new Date().toISOString();
  return out;
};

// ---------- entity name → table mapping ----------
const TABLE_BY_ENTITY = {
  EmergencyContact: "emergency_contacts",
  FamilyMember: "family_members",
  Habit: "habits",
  JournalEntry: "journal_entries",
  LinkedAccount: "linked_accounts",
  PanicMessage: "panic_messages",
  Recording: "recordings",
  Zone: "zones",
  ZoneNotification: "zone_notifications",
};

const rowToCamel = (row) => {
  if (!row) return row;
  return {
    ...row,
    created_date: row.created_date || row.created_at,
    updated_date: row.updated_date || row.updated_at,
  };
};

const parseOrder = (orderArg) => {
  if (!orderArg) return { column: "created_at", ascending: false };
  let column = orderArg;
  let ascending = true;
  if (column.startsWith("-")) {
    ascending = false;
    column = column.slice(1);
  }
  const FIELD_MAP = {
    created_date: "created_at",
    updated_date: "updated_at",
  };
  return { column: FIELD_MAP[column] || column, ascending };
};

const stripCamelExtras = (data) => {
  if (!data) return data;
  const { created_date, updated_date, ...rest } = data;
  return rest;
};

const makeEntity = (entityName) => {
  const table = TABLE_BY_ENTITY[entityName];
  if (!table) throw new Error("Unknown entity: " + entityName);

  const ensureUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };

  return {
    async list(orderArg, limitArg) {
      const { column, ascending } = parseOrder(orderArg || "-created_date");
      let q = supabase.from(table).select("*").order(column, { ascending });
      if (typeof limitArg === "number") q = q.limit(limitArg);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(rowToCamel);
    },

    async filter(where = {}, orderArg, limitArg) {
      const { column, ascending } = parseOrder(orderArg || "-created_date");
      let q = supabase.from(table).select("*");
      for (const [k, v] of Object.entries(where)) {
        if (v === null || v === undefined) {
          q = q.is(k, null);
        } else if (Array.isArray(v)) {
          q = q.in(k, v);
        } else {
          q = q.eq(k, v);
        }
      }
      q = q.order(column, { ascending });
      if (typeof limitArg === "number") q = q.limit(limitArg);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(rowToCamel);
    },

    async get(id) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return rowToCamel(data);
    },

    async create(payload) {
      const userId = await ensureUserId();
      const insertPayload = stripCamelExtras({
        ...payload,
        user_id: payload?.user_id || userId,
      });
      const { data, error } = await supabase
        .from(table)
        .insert(insertPayload)
        .select()
        .single();
      if (error) throw error;
      return rowToCamel(data);
    },

    async update(id, patch) {
      const updatePayload = stripCamelExtras({
        ...patch,
        updated_at: new Date().toISOString(),
      });
      const { data, error } = await supabase
        .from(table)
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return rowToCamel(data);
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return { success: true };
    },
  };
};

// ---------- entities namespace ----------
const entities = {};
for (const name of Object.keys(TABLE_BY_ENTITY)) {
  entities[name] = makeEntity(name);
}

// User entity is special — backed by profiles + auth.users
entities.User = {
  async me() {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      const err = new Error("Not authenticated");
      err.code = "NOT_AUTHENTICATED";
      throw err;
    }
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (profErr) throw profErr;
    if (!profile) {
      // Profile row missing — create a minimal one (trigger should have made it).
      const minimal = {
        id: userData.user.id,
        email: userData.user.email,
        full_name: userData.user.user_metadata?.full_name || "",
      };
      await supabase.from("profiles").insert(minimal);
      return profileToCamel({ ...minimal, created_at: new Date().toISOString() });
    }
    return profileToCamel(profile);
  },
  async list() {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) throw error;
    return (data || []).map(profileToCamel);
  },
  async filter(where = {}) {
    let q = supabase.from("profiles").select("*");
    for (const [k, v] of Object.entries(where)) {
      const col = PROFILE_CAMEL_TO_SNAKE[k] || k;
      q = q.eq(col, v);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(profileToCamel);
  },
  async update(id, patch) {
    const snake = camelToSnakeProfilePatch(patch);
    const { data, error } = await supabase
      .from("profiles")
      .update(snake)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return profileToCamel(data);
  },
  async updateMyUserData(patch) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("Not authenticated");
    return entities.User.update(userData.user.id, patch);
  },
};

// ---------- auth namespace ----------
const auth = {
  me: () => entities.User.me(),
  updateMe: (patch) => entities.User.updateMyUserData(patch),
  async logout() {
    await supabase.auth.signOut();
  },
  redirectToLogin() {
    if (typeof window !== "undefined") window.location.href = "/login";
  },
  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },
};

// ---------- functions namespace (graceful no-op for legacy edge fns) ----------
const functions = {
  async invoke(name, _payload) {
    // External providers (Twilio/Stripe/push) aren't configured here.
    // Return a benign success so legacy callers don't crash.
    if (typeof console !== "undefined") {
      console.info("[base44.functions.invoke] no-op for:", name);
    }
    return { data: { ok: true, simulated: true }, error: null };
  },
};

// ---------- integrations.Core (file uploads) ----------
const RECORDINGS_BUCKET = "recordings";
const integrations = {
  Core: {
    async UploadFile({ file }) {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData?.user?.id || "anon";
      const safeName = (file?.name || "upload.bin").replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${uid}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage
        .from(RECORDINGS_BUCKET)
        .getPublicUrl(path);
      return { file_url: pub?.publicUrl || path, path };
    },
    async CreateFileSignedUrl({ file_url, path }) {
      const target = path || file_url;
      if (!target) throw new Error("path or file_url required");
      // Try to derive storage path from a public URL.
      let storagePath = target;
      const marker = `/object/public/${RECORDINGS_BUCKET}/`;
      const idx = target.indexOf(marker);
      if (idx !== -1) storagePath = target.slice(idx + marker.length);
      const { data, error } = await supabase.storage
        .from(RECORDINGS_BUCKET)
        .createSignedUrl(storagePath, 3600);
      if (error) throw error;
      return { signed_url: data.signedUrl };
    },
  },
};

// ---------- final export ----------
export const base44 = {
  entities,
  auth,
  functions,
  integrations,
};

export defaut