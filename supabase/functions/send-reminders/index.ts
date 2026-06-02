// Phase 12 (E2) — Edge function d'envoi des rappels de tâches par e-mail (Brevo).
// Planifiée côté dashboard (Cron, ex. toutes les 5 min). Interroge
// `due_task_reminders()`, envoie un e-mail au(x) destinataire(s) via l'API
// transactionnelle Brevo, puis marque les tâches comme rappelées.
//
// Secrets requis (Project Settings → Edge Functions) :
//   BREVO_API_KEY          clé API transactionnelle Brevo
//   REMINDER_SENDER_EMAIL  adresse d'expéditeur validée dans Brevo
//   REMINDER_SENDER_NAME   (optionnel) nom d'expéditeur, défaut « Co-Todo »
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface DueReminder {
  task_id: string
  title: string
  due: string
  recipient_email: string
  recipient_name: string | null
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function sendBrevoEmail(
  apiKey: string,
  sender: { email: string; name: string },
  to: { email: string; name: string },
  title: string,
  dueLabel: string,
): Promise<boolean> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender,
      to: [to],
      subject: `Rappel : ${title}`,
      htmlContent:
        `<p>Bonjour ${to.name},</p>` +
        `<p>Petit rappel pour la tâche <strong>${title}</strong>, prévue le ${dueLabel}.</p>` +
        `<p>— Co-Todo</p>`,
    }),
  })
  return res.ok
}

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const brevoKey = Deno.env.get('BREVO_API_KEY')
  const senderEmail = Deno.env.get('REMINDER_SENDER_EMAIL')
  const senderName = Deno.env.get('REMINDER_SENDER_NAME') ?? 'Co-Todo'

  if (!url || !serviceKey) {
    return json({ error: 'Configuration Supabase manquante' }, 500)
  }
  if (!brevoKey || !senderEmail) {
    return json(
      { error: 'BREVO_API_KEY ou REMINDER_SENDER_EMAIL manquant' },
      500,
    )
  }

  const supabase = createClient(url, serviceKey)

  const { data, error } = await supabase.rpc('due_task_reminders')
  if (error) return json({ error: error.message }, 500)

  const rows = (data ?? []) as DueReminder[]
  if (rows.length === 0) return json({ sent: 0, tasks: 0 })

  const sentTaskIds = new Set<string>()
  let sent = 0

  for (const r of rows) {
    const dueLabel = new Date(r.due).toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Europe/Paris',
    })
    const ok = await sendBrevoEmail(
      brevoKey,
      { email: senderEmail, name: senderName },
      { email: r.recipient_email, name: r.recipient_name ?? 'co-parent' },
      r.title,
      dueLabel,
    )
    if (ok) {
      sent += 1
      sentTaskIds.add(r.task_id)
    }
  }

  if (sentTaskIds.size > 0) {
    await supabase
      .from('tasks')
      .update({ reminder_sent_at: new Date().toISOString() })
      .in('id', [...sentTaskIds])
  }

  return json({ sent, tasks: sentTaskIds.size })
})
