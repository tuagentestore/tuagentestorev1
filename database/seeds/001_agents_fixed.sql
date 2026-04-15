-- TuAgenteStore — Seed: Agentes del catálogo (fixed column names)
INSERT INTO agents (
  name, slug, tagline, description, category,
  capabilities, integrations, faqs,
  pricing_basic, pricing_pro, pricing_enterprise,
  setup_time, featured, demo_available,
  demo_max_messages, demo_model, demo_prompt,
  status, sort_order
) VALUES

(
  'Sales AI Closer',
  'sales-ai-closer',
  'Cierra más ventas, automatiza el seguimiento de leads',
  'Agente IA especializado en ventas que califica leads, hace seguimiento automático y cierra oportunidades. Integra con tu CRM y mantiene conversaciones naturales con prospectos.',
  'ventas',
  ARRAY['Calificación de leads', 'Seguimiento automático', 'Respuesta en < 1 min', 'Integración CRM', 'Análisis de conversación', 'Reportes de pipeline'],
  ARRAY['HubSpot', 'Salesforce', 'WhatsApp', 'Gmail', 'Slack', 'Calendly'],
  '[{"q": "¿Puede el agente cerrar ventas sin intervención humana?", "a": "Sí para ventas de ticket bajo. Para tickets altos, califica y deriva al equipo."}, {"q": "¿Qué pasa si el lead hace una pregunta compleja?", "a": "El agente escala automáticamente al equipo con contexto completo."}]'::jsonb,
  397, 597, NULL, '24-48h', true, true, 3, 'gpt-4o-mini',
  'Eres Sales AI Closer, un agente de ventas IA de TuAgenteStore. Tu objetivo es demostrar cómo puedes ayudar a calificar leads y agendar reuniones. Responde en español, sé conciso y orientado a resultados. Haz 1 pregunta de calificación por turno.',
  'active', 1
),

(
  'AI Lead Engine',
  'ai-lead-engine',
  'Genera y califica leads 24/7 en piloto automático',
  'Captura leads de múltiples canales, los califica automáticamente con IA y los entrega a tu equipo listos para cerrar. Elimina el tiempo perdido en prospectos que no convierten.',
  'ventas',
  ARRAY['Captura multicanal', 'Scoring automático', 'Segmentación inteligente', 'Nutrición de leads', 'Alertas en tiempo real', 'Dashboard de conversión'],
  ARRAY['Facebook Ads', 'Google Ads', 'LinkedIn', 'Instagram', 'HubSpot', 'Pipedrive'],
  '[{"q": "¿Puede conectarse con mis campañas de Meta Ads?", "a": "Sí, se integra via API con Meta Ads, Google Ads y otras fuentes de leads."}, {"q": "¿Cómo califica los leads?", "a": "Usa criterios personalizables: industria, tamaño de empresa, comportamiento y respuestas al formulario."}]'::jsonb,
  397, 597, NULL, '24-48h', true, true, 3, 'gpt-4o-mini',
  'Eres AI Lead Engine, un agente especializado en generación y calificación de leads. Muestra cómo puedes calificar un lead en tiempo real. Responde en español, sé directo. Pide industria y volumen mensual de leads para dar una demostración relevante.',
  'active', 2
),

(
  'AI Support Agent',
  'ai-support-agent',
  'Soporte al cliente 24/7 que resuelve, no solo responde',
  'Agente de soporte que resuelve el 80% de consultas sin intervención humana. Aprende de tu base de conocimiento, escala casos complejos y mantiene satisfacción del cliente alta.',
  'soporte',
  ARRAY['Resolución autónoma', 'Escalada inteligente', 'Base de conocimiento dinámica', 'Multicanal', 'CSAT automático', 'Reportes de tickets'],
  ARRAY['Zendesk', 'Intercom', 'WhatsApp', 'Instagram DM', 'Gmail', 'Notion'],
  '[{"q": "¿Cómo aprende de mis productos/servicios?", "a": "Se entrena con tu documentación, FAQs, y conversaciones previas en 24-48h."}, {"q": "¿Puede hacer reembolsos o cambios de plan?", "a": "Puede iniciar el proceso y confirmar con el equipo. Nunca actúa en transacciones críticas sin validación."}]'::jsonb,
  397, 597, NULL, '24-48h', true, true, 3, 'gpt-4o-mini',
  'Eres AI Support Agent, un agente de soporte al cliente IA. Demuestra cómo manejas consultas de soporte de forma eficiente. Responde en español, con empatía y soluciones concretas. Pide el tipo de negocio para personalizar la demo.',
  'active', 3
),

(
  'Marketing AI Agent',
  'marketing-ai-agent',
  'Automatiza reportes, contenido y campañas de marketing',
  'Agente que centraliza tus métricas de marketing, genera reportes automáticos, crea copies y sugiere optimizaciones basadas en datos reales de tus campañas.',
  'marketing',
  ARRAY['Reportes automáticos', 'Generación de contenido', 'Análisis de campañas', 'A/B testing sugerido', 'SEO on-page', 'Calendario editorial'],
  ARRAY['Google Analytics', 'Meta Ads', 'Mailchimp', 'Semrush', 'Buffer', 'Notion'],
  '[{"q": "¿Puede crear posts para redes sociales?", "a": "Sí, genera copies optimizados para cada plataforma según tu tono de marca."}, {"q": "¿Reemplaza a mi equipo de marketing?", "a": "No, potencia al equipo. Elimina tareas repetitivas para que se enfoquen en estrategia."}]'::jsonb,
  447, 697, NULL, '24-48h', false, true, 3, 'gpt-4o-mini',
  'Eres Marketing AI Agent, especializado en automatización de marketing. Muestra cómo puedes generar un reporte de métricas o crear contenido para redes sociales. Responde en español, con datos concretos y ejemplos prácticos.',
  'active', 4
),

(
  'E-Commerce Agent',
  'ecommerce-agent',
  'Recupera carritos, cross-sell y retención automatizada',
  'Agente especializado en e-commerce que recupera carritos abandonados, recomienda productos, gestiona post-venta y aumenta el LTV de cada cliente de forma automática.',
  'ecommerce',
  ARRAY['Recuperación de carritos', 'Cross-sell y upsell', 'Post-venta automática', 'Reseñas automáticas', 'Recompra inteligente', 'Análisis de cohortes'],
  ARRAY['Shopify', 'WooCommerce', 'MercadoLibre', 'WhatsApp', 'Klaviyo', 'Stripe'],
  '[{"q": "¿Cuánto mejora la tasa de recuperación de carritos?", "a": "En promedio 15-35% dependiendo del vertical. El agente personaliza el mensaje según el comportamiento."}, {"q": "¿Funciona con MercadoLibre?", "a": "Sí, se integra con ML para gestionar consultas, reseñas y post-venta."}]'::jsonb,
  447, 697, NULL, '24-48h', false, true, 3, 'gpt-4o-mini',
  'Eres E-Commerce Agent, especializado en aumentar ventas y retención en tiendas online. Demuestra cómo recuperarías un carrito abandonado o haría cross-sell. Responde en español, con ejemplos de mensajes reales que enviarías.',
  'active', 5
),

(
  'Appointment Setting Agent',
  'appointment-setting-agent',
  'Agenda reuniones y demos de forma completamente automática',
  'Agente que califica leads entrantes, negocia horarios y agenda reuniones en tu calendario sin intervención humana. Reduce el tiempo de no-shows con recordatorios inteligentes.',
  'ventas',
  ARRAY['Agendamiento automático', 'Calificación previa', 'Recordatorios multicanal', 'Reschedule inteligente', 'Integración calendario', 'Notas pre-reunión'],
  ARRAY['Calendly', 'Google Calendar', 'WhatsApp', 'Gmail', 'Zoom', 'HubSpot'],
  '[{"q": "¿Puede manejar múltiples zonas horarias?", "a": "Sí, detecta la zona horaria del lead y muestra horarios en su tiempo local."}, {"q": "¿Qué pasa si el lead quiere cancelar?", "a": "El agente ofrece reagendar automáticamente y notifica al equipo."}]'::jsonb,
  397, 597, NULL, '24-48h', true, true, 3, 'gpt-4o-mini',
  'Eres Appointment Setting Agent, especializado en agendar reuniones de forma automática. Demuestra cómo calificarías un lead y le ofrecerías un horario. Responde en español, simula un flujo de agendamiento real pidiendo disponibilidad al usuario.',
  'active', 6
)

ON CONFLICT (slug) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  capabilities = EXCLUDED.capabilities,
  integrations = EXCLUDED.integrations,
  pricing_basic = EXCLUDED.pricing_basic,
  pricing_pro = EXCLUDED.pricing_pro,
  demo_prompt = EXCLUDED.demo_prompt,
  updated_at = NOW();
