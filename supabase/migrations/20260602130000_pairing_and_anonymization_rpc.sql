-- Phase 0.5 — Fonctions RPC : appairage familial & anonymisation de compte

-- 1) Génération d'un code d'appairage unique (6 caractères).
--    SECURITY INVOKER : l'INSERT respecte la RLS (inviter_profile_id = auth.uid()).
--    Caractères sans ambiguïté visuelle (pas de I, O, 0, 1).
create or replace function public.generate_family_invitation()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_code text;
  v_chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
  attempt int := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  -- Un seul code actif par émetteur : on purge les précédents.
  delete from public.family_invitations where inviter_profile_id = auth.uid();

  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars))::int + 1, 1);
    end loop;

    begin
      insert into public.family_invitations (code, inviter_profile_id)
      values (v_code, auth.uid());
      return v_code;
    exception when unique_violation then
      attempt := attempt + 1;
      if attempt >= 10 then
        raise exception 'Impossible de générer un code unique, réessayez';
      end if;
    end;
  end loop;
end;
$$;

-- 2) Consommation d'un code : le compte courant rejoint le foyer de l'émetteur.
--    SECURITY DEFINER nécessaire : lecture d'une invitation et d'un profil
--    appartenant à un autre utilisateur (la RLS les masquerait sinon).
create or replace function public.redeem_family_invitation(p_code text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.family_invitations;
  v_inviter_family uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  select * into v_inv
  from public.family_invitations
  where code = upper(trim(p_code))
  for update;

  if v_inv.id is null then
    raise exception 'Code invalide';
  end if;

  if v_inv.expires_at < now() then
    delete from public.family_invitations where id = v_inv.id;
    raise exception 'Code expiré';
  end if;

  if v_inv.inviter_profile_id = auth.uid() then
    raise exception 'Vous ne pouvez pas utiliser votre propre code';
  end if;

  select family_id into v_inviter_family
  from public.profiles
  where id = v_inv.inviter_profile_id;

  if v_inviter_family is null then
    raise exception 'Foyer émetteur introuvable';
  end if;

  update public.profiles
  set family_id = v_inviter_family
  where id = auth.uid();

  delete from public.family_invitations where id = v_inv.id;
end;
$$;

revoke execute on function public.redeem_family_invitation(text) from public;
revoke execute on function public.redeem_family_invitation(text) from anon;
grant execute on function public.redeem_family_invitation(text) to authenticated;

-- 3) Anonymisation irréversible du compte courant (RGPD art. 17).
--    SECURITY INVOKER : ne modifie que sa propre ligne (autorisée par la RLS).
create or replace function public.anonymize_account()
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  update public.profiles
  set status = 'ANONYMIZED',
      email = null,
      first_name = 'Ex-coparent',
      parent_label = null
  where id = auth.uid();
end;
$$;
