# ============================================================
# AI AGENT HUB — N8N Workflows Reference
# 13 workflows core para MVP operativo
# ============================================================

## WORKFLOW 1: Lead Created → CRM + Email Welcome
# Trigger: POST /webhook/lead-created
# Payload: { name, email, phone, company, industry, source, agent_interest }
#
# Pasos:
# 1. Webhook trigger
# 2. Validar datos (IF node)
# 3. Upsert contacto en CRM (HubSpot/Pipedrive)
# 4. Crear deal/opportunity en CRM
# 5. Backup en Google Sheet
# 6. Enviar email "Bienvenido + próximos pasos" (Postmark)
# 7. Notificación Slack canal #leads
# 8. Lead scoring (HTTP Request → API interna)

## WORKFLOW 2: Demo Started → Log + Scoring
# Trigger: POST /webhook/demo-started
# Payload: { session_id, agent_id, agent_name, user_email, ip, timestamp }
#
# Pasos:
# 1. Webhook trigger
# 2. Log en Google Sheet "demos"
# 3. Update CRM: etapa → "Demo en curso"
# 4. IF user tiene email → incrementar lead score (+10)

## WORKFLOW 3: Demo Completed → Follow-up
# Trigger: POST /webhook/demo-completed
# Payload: { session_id, agent_id, messages, duration, converted }
#
# Pasos:
# 1. Webhook trigger
# 2. Update CRM: etapa → "Demo completada"
# 3. IF NOT converted:
#    a. Wait 2 horas
#    b. Enviar email "¿Qué te pareció? Agenda tu activación"
#    c. Wait 24 horas
#    d. Segundo follow-up con caso de uso relevante
# 4. IF converted → skip (workflow 4 se encarga)

## WORKFLOW 4: Reservation Created → Confirmación + CRM + Calendar
# Trigger: POST /webhook/reservation-created
# Payload: { reservation_id, name, email, phone, company, agent_id, preferred_date, plan_interest }
#
# Pasos:
# 1. Webhook trigger
# 2. Enviar email confirmación inmediata
# 3. Crear evento en Google Calendar
# 4. Update CRM: etapa → "Reserva confirmada"
# 5. Crear tarea interna "Preparar onboarding"
# 6. Notificación Slack canal #reservas
# 7. IF preferred_date < 48h → marcar priority: urgent

## WORKFLOW 5: Reservation Updated (Status Change)
# Trigger: POST /webhook/reservation-updated
# Payload: { reservation_id, old_status, new_status, admin_notes }
#
# Pasos:
# 1. Webhook trigger
# 2. Switch(new_status):
#    - "contacted" → email "Nos comunicamos contigo"
#    - "qualified" → email "Próximos pasos para tu agente"
#    - "validated" → enviar link de pago (Stripe/MP)
#    - "paid" → trigger workflow 8 (onboarding)
#    - "cancelled" → email "Lamentamos..." + encuesta

## WORKFLOW 6: Calendar Reminder (24h + 1h antes)
# Trigger: Schedule (cada hora, chequea reservas próximas)
#
# Pasos:
# 1. Schedule trigger
# 2. Query DB: reservas con scheduled_at en próximas 25h
# 3. IF 24h antes → email recordatorio + WhatsApp
# 4. IF 1h antes → email recordatorio corto
# 5. IF pasó la hora y no se conectó → marcar no-show

## WORKFLOW 7: No-Show → Rebooking
# Trigger: POST /webhook/reservation-noshow (desde workflow 6)
# Payload: { reservation_id, email, name, original_date }
#
# Pasos:
# 1. Webhook trigger
# 2. Update CRM: etapa → "No-show"
# 3. Wait 30 minutos
# 4. Enviar email "No pudimos conectarnos, reagendemos"
# 5. Wait 24 horas
# 6. Segundo intento email
# 7. Wait 48 horas
# 8. Último intento + marcar lead como frío

## WORKFLOW 8: Payment Succeeded → Activate Plan + Onboarding
# Trigger: POST /webhook/payment-succeeded
# Payload: { tenant_id, plan_id, payment_provider, amount, subscription_id }
#
# Pasos:
# 1. Webhook trigger
# 2. Update DB: subscription.status → active
# 3. Update DB: tenant.plan → plan comprado
# 4. Enviar email "¡Pago confirmado! Comenzamos"
# 5. Crear checklist de onboarding
# 6. Enviar form de onboarding (link a /onboarding)
# 7. Notificación Slack #pagos
# 8. Crear tarea: "Implementar agente para [tenant]"

## WORKFLOW 9: Payment Failed → Dunning
# Trigger: POST /webhook/payment-failed
# Payload: { tenant_id, subscription_id, attempt, amount }
#
# Pasos:
# 1. Webhook trigger
# 2. IF attempt == 1:
#    - Email "Hubo un problema con tu pago"
#    - Link para actualizar método de pago
# 3. IF attempt == 2 (wait 3 días):
#    - Email más urgente
#    - Notificación admin
# 4. IF attempt == 3 (wait 7 días):
#    - Email "Tu servicio será suspendido en 48h"
# 5. IF attempt > 3:
#    - Suspender tenant
#    - Email final
#    - Notificación admin

## WORKFLOW 10: Onboarding Submitted → Provisioning
# Trigger: POST /webhook/onboarding-submitted
# Payload: { onboarding_id, tenant_id, industry, channels, integrations[], etc. }
#
# Pasos:
# 1. Webhook trigger
# 2. Validar datos completos
# 3. Crear proyecto/agente record en DB
# 4. Crear checklist interno (Notion/Jira)
# 5. Solicitar credenciales según integraciones elegidas
# 6. Enviar email "Recibimos tu info, próximo paso: credenciales"
# 7. Asignar a técnico (round-robin o manual)

## WORKFLOW 11: Usage Alert (80% + 100%)
# Trigger: POST /webhook/actions-80 o /webhook/actions-100
# Payload: { tenant_id, user_agent_id, current_count, limit, percentage }
#
# Pasos:
# 1. Webhook trigger
# 2. IF 80%:
#    - Email "Estás usando el 80% de tus acciones"
#    - Sugerir upgrade
# 3. IF 100%:
#    - Email "Llegaste al límite"
#    - Pausar agente o throttle
#    - Link directo a upgrade
#    - Notificación admin

## WORKFLOW 12: Weekly Report → Admin + Client
# Trigger: Schedule (lunes 9:00 AM)
#
# Pasos:
# 1. Schedule trigger
# 2. Query DB: métricas de la semana
#    - Nuevos leads, demos, reservas, pagos
#    - Uso por tenant, top agentes
#    - Revenue, MRR, churn
# 3. Generar reporte (HTML email)
# 4. Enviar a admin por email + Slack
# 5. FOR EACH tenant activo:
#    - Generar métricas del tenant
#    - Enviar email semanal al cliente

## WORKFLOW 13: Daily Ops Alert
# Trigger: Schedule (diario 8:00 AM)
#
# Pasos:
# 1. Schedule trigger
# 2. Check: reservas de hoy
# 3. Check: pagos fallidos pendientes
# 4. Check: agentes con errores
# 5. Check: integraciones desconectadas
# 6. Compilar resumen
# 7. Enviar a Slack #ops-daily
