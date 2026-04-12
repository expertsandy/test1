import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️ Missing Supabase credentials.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth Operations ───

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ─── Temple Operations ───

export async function fetchTemples() {
  const { data: temples, error } = await supabase
    .from('temples')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Fetch pujas for each temple
  const { data: pujas, error: pujasError } = await supabase
    .from('pujas')
    .select('*')
    .order('created_at', { ascending: true });

  if (pujasError) throw pujasError;

  // Attach pujas to their temples
  return temples.map(t => ({
    ...t,
    // Map snake_case DB columns to camelCase used in the app
    deityPhoto: t.deity_photo,
    templePhoto: t.temple_photo,
    pujas: pujas
      .filter(p => p.temple_id === t.id)
      .map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        duration: p.duration,
        description: p.description,
      })),
  }));
}

export async function addTemple(temple) {
  const { data, error } = await supabase
    .from('temples')
    .insert({
      id: temple.id,
      name: temple.name,
      location: temple.location,
      icon: temple.icon,
      description: temple.description || null,
      deity_photo: temple.deityPhoto || null,
      temple_photo: temple.templePhoto || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemple(temple) {
  const { error } = await supabase
    .from('temples')
    .update({
      name: temple.name,
      location: temple.location,
      icon: temple.icon,
      description: temple.description || null,
      deity_photo: temple.deityPhoto || null,
      temple_photo: temple.templePhoto || null,
    })
    .eq('id', temple.id);

  if (error) throw error;
}

export async function deleteTemple(templeId) {
  const { error } = await supabase
    .from('temples')
    .delete()
    .eq('id', templeId);

  if (error) throw error;
}

// ─── Puja Operations ───

export async function addPuja(templeId, puja) {
  const { data, error } = await supabase
    .from('pujas')
    .insert({
      id: puja.id,
      temple_id: templeId,
      name: puja.name,
      price: puja.price,
      duration: puja.duration || '30 min',
      description: puja.description || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePuja(pujaId) {
  const { error } = await supabase
    .from('pujas')
    .delete()
    .eq('id', pujaId);

  if (error) throw error;
}

// ─── Registration Operations ───

export async function fetchRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(r => ({
    id: r.id,
    devoteeName: r.devotee_name,
    phone: r.phone,
    email: r.email,
    gotra: r.gotra,
    templeId: r.temple_id,
    pujaIds: r.puja_ids,
    date: r.date,
    time: r.time,
    members: r.members,
    paymentScreenshot: r.payment_screenshot,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function addRegistration(reg) {
  const { data, error } = await supabase
    .from('registrations')
    .insert({
      id: reg.id,
      devotee_name: reg.devoteeName,
      phone: reg.phone,
      email: reg.email || null,
      gotra: reg.gotra || null,
      temple_id: reg.templeId,
      puja_ids: reg.pujaIds,
      date: reg.date,
      time: reg.time || null,
      members: reg.members || 1,
      payment_screenshot: reg.paymentScreenshot || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRegistrationStatus(id, status) {
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// ─── Social Links Operations ───

export async function fetchSocialLinks() {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addSocialLink(link) {
  const { data, error } = await supabase
    .from('social_links')
    .insert({
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.label || null,
      sort_order: link.sort_order || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSocialLink(link) {
  const { error } = await supabase
    .from('social_links')
    .update({
      platform: link.platform,
      url: link.url,
      label: link.label || null,
      sort_order: link.sort_order || 0,
    })
    .eq('id', link.id);

  if (error) throw error;
}

export async function deleteSocialLink(id) {
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
