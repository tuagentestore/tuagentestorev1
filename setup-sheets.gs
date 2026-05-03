/**
 * TUAGENTESTORE — Setup & Dashboard Google Sheets
 * ─────────────────────────────────────────────────
 * CÓMO USAR:
 * 1. Ir a https://script.google.com/home/projects/1i5nCfEa-OxUj5SdmUqS9XgYcOhC_AMZRuU43inZdSp5eohAXhrCZ0Uk3/edit
 * 2. Reemplazar TODO el código con este archivo
 * 3. Ejecutar la función deseada:
 *    - setupAll()         → Crea todas las hojas desde cero
 *    - addTestimonials()  → Solo agrega la hoja de testimonios (si ya existe el spreadsheet)
 *    - refreshDashboard() → Recalcula el dashboard manualmente
 * 4. Autorizar permisos cuando lo pida
 */

// ─────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────
const CONFIG = {
  spreadsheetName: 'TuAgenteStore — Master Hub',
  folderName: 'TuAgenteStore',
  spreadsheetId: '1ypxnhwu0KYPDCsNGS5EyZ54F0c2TJLUQrdDgvYTMa98',

  colors: {
    header: '#1a2744',
    headerText: '#ffffff',
    accent: '#2563EB',
    accent2: '#4F46E5',
    accentGreen: '#059669',
    accentPurple: '#7C3AED',
    accentCyan: '#0891b2',
    accentOrange: '#EA580C',
    rowAlt: '#f8faff',
    success: '#d1fae5',
    warning: '#fef3c7',
    danger: '#fee2e2',
    starYellow: '#FCD34D',
  }
}

// ─────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL — crea todo desde cero
// ─────────────────────────────────────────────────
function setupAll() {
  Logger.log('🚀 Iniciando setup de TuAgenteStore...')

  const folder = setupDrive()
  const ss = setupSpreadsheet(folder)

  setupLeadsMaster(ss)
  setupDemoSessions(ss)
  setupReservationsPipeline(ss)
  setupTestimonials(ss)
  setupDemoNurture(ss)
  setupContentCalendar(ss)
  setupWeeklyReports(ss)
  setupKPIDashboard(ss)

  const defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1')
  if (defaultSheet) ss.deleteSheet(defaultSheet)

  ss.setActiveSheet(ss.getSheetByName('📊 Dashboard'))

  Logger.log('─────────────────────────────────────────')
  Logger.log('✅ SETUP COMPLETADO')
  Logger.log('📊 URL: ' + ss.getUrl())
  Logger.log('GOOGLE_SPREADSHEET_ID=' + ss.getId())
  Logger.log('─────────────────────────────────────────')
}

// Agrega solo la hoja de testimonios a un spreadsheet existente
function addTestimonials() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  setupTestimonials(ss)
  Logger.log('✅ Hoja Testimonios creada/actualizada')
  Logger.log('URL: ' + ss.getUrl())
}

// Agrega / formatea la hoja Demo-Nurture a un spreadsheet existente
function addDemoNurture() {
  const ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  setupDemoNurture(ss)
  Logger.log('✅ Hoja Demo-Nurture creada/actualizada')
  Logger.log('URL: ' + ss.getUrl())
}

// ─────────────────────────────────────────────────
// DRIVE
// ─────────────────────────────────────────────────
function setupDrive() {
  const root = DriveApp.getRootFolder()
  const mainFolder = getOrCreateFolder(root, 'TuAgenteStore')
  getOrCreateFolder(mainFolder, '📊 Operaciones')
  getOrCreateFolder(mainFolder, '👥 Clientes')
  getOrCreateFolder(mainFolder, '📣 Contenido')
  getOrCreateFolder(mainFolder, '📑 Templates')
  getOrCreateFolder(mainFolder, '📈 Reportes')
  const contenido = getOrCreateFolder(mainFolder, '📣 Contenido')
  getOrCreateFolder(contenido, 'LinkedIn')
  getOrCreateFolder(contenido, 'Instagram')
  getOrCreateFolder(contenido, 'TikTok')
  getOrCreateFolder(contenido, 'YouTube')
  return mainFolder
}

function getOrCreateFolder(parent, name) {
  const existing = parent.getFoldersByName(name)
  if (existing.hasNext()) return existing.next()
  return parent.createFolder(name)
}

// ─────────────────────────────────────────────────
// SPREADSHEET
// ─────────────────────────────────────────────────
function setupSpreadsheet(folder) {
  const existing = folder.getFilesByName(CONFIG.spreadsheetName)
  if (existing.hasNext()) {
    Logger.log('⚠️  Spreadsheet ya existe')
    return SpreadsheetApp.openById(existing.next().getId())
  }
  const ss = SpreadsheetApp.create(CONFIG.spreadsheetName)
  const file = DriveApp.getFileById(ss.getId())
  folder.addFile(file)
  DriveApp.getRootFolder().removeFile(file)
  return ss
}

// ─────────────────────────────────────────────────
// SHEET 1: Leads Master
// ─────────────────────────────────────────────────
function setupLeadsMaster(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  const sheet = ss.getSheetByName('Leads Master') || ss.insertSheet('Leads Master')
  sheet.clearContents()

  const headers = ['Fecha', 'Lead ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Industria', 'Agente', 'Fuente', 'Plan', 'Estado']
  formatSheet(sheet, headers, CONFIG.colors.accent)

  setDropdown(sheet, 'K2:K1000', ['new', 'contacted', 'qualified', 'validated', 'paid', 'cancelled', 'no_show'])
  setDropdown(sheet, 'J2:J1000', ['starter', 'pro', 'enterprise'])

  addConditionalFormat(sheet, 'K2:K1000', 'paid', CONFIG.colors.success)
  addConditionalFormat(sheet, 'K2:K1000', 'cancelled', CONFIG.colors.danger)
  addConditionalFormat(sheet, 'K2:K1000', 'validated', '#ddd6fe')
  addConditionalFormat(sheet, 'K2:K1000', 'qualified', '#e0e7ff')

  const widths = [140, 260, 160, 200, 130, 150, 120, 160, 110, 100, 110]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))
  Logger.log('✅ Leads Master')
}

// ─────────────────────────────────────────────────
// SHEET 2: Demo Sessions
// ─────────────────────────────────────────────────
function setupDemoSessions(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  const sheet = ss.getSheetByName('Demo Sessions') || ss.insertSheet('Demo Sessions')
  sheet.clearContents()

  const headers = ['Fecha', 'Session ID', 'Agente', 'Email Usuario', 'IP', 'Mensajes', 'Status']
  formatSheet(sheet, headers, CONFIG.colors.accent2)

  setDropdown(sheet, 'G2:G1000', ['started', 'completed', 'abandoned'])
  addConditionalFormat(sheet, 'G2:G1000', 'completed', CONFIG.colors.success)
  addConditionalFormat(sheet, 'G2:G1000', 'started', CONFIG.colors.warning)
  addConditionalFormat(sheet, 'G2:G1000', 'abandoned', CONFIG.colors.danger)

  const widths = [140, 280, 180, 200, 130, 100, 110]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))
  Logger.log('✅ Demo Sessions')
}

// ─────────────────────────────────────────────────
// SHEET 3: Reservations Pipeline
// ─────────────────────────────────────────────────
function setupReservationsPipeline(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  const sheet = ss.getSheetByName('Reservations Pipeline') || ss.insertSheet('Reservations Pipeline')
  sheet.clearContents()

  const headers = ['Fecha', 'Reserva ID', 'Nombre', 'Email', 'Teléfono', 'Empresa', 'Agente', 'Plan', 'Fecha Preferida', 'Estado', 'Notas']
  formatSheet(sheet, headers, CONFIG.colors.accentPurple)

  setDropdown(sheet, 'J2:J1000', ['new', 'contacted', 'qualified', 'validated', 'paid', 'cancelled', 'no_show'])
  addConditionalFormat(sheet, 'J2:J1000', 'paid', CONFIG.colors.success)
  addConditionalFormat(sheet, 'J2:J1000', 'cancelled', CONFIG.colors.danger)
  addConditionalFormat(sheet, 'J2:J1000', 'validated', '#ddd6fe')
  addConditionalFormat(sheet, 'J2:J1000', 'new', CONFIG.colors.warning)

  const widths = [140, 280, 160, 200, 130, 150, 180, 100, 130, 110, 250]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))
  Logger.log('✅ Reservations Pipeline')
}

// ─────────────────────────────────────────────────
// SHEET 4: Testimonios ✨ NUEVA
// ─────────────────────────────────────────────────
function setupTestimonials(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  Logger.log('⭐ Configurando Testimonios...')

  const sheet = ss.getSheetByName('Testimonios') || ss.insertSheet('Testimonios')
  sheet.clearContents()
  sheet.setTabColor('#F59E0B')

  const headers = [
    'Fecha', 'Nombre', 'Email', 'Empresa', 'Cargo',
    'Agente Usado', 'Plan', 'Calificación (1-5)',
    'Testimonio', 'Autoriza Publicar', 'Publicado',
    'URL Landing', 'Notas Internas'
  ]

  formatSheet(sheet, headers, '#D97706')

  // Dropdown calificación
  setDropdown(sheet, 'H2:H1000', ['5', '4', '3', '2', '1'])

  // Dropdown autorización
  setDropdown(sheet, 'J2:J1000', ['Sí', 'No', 'Pendiente'])

  // Dropdown publicado
  setDropdown(sheet, 'K2:K1000', ['Sí', 'No', 'En revisión'])

  // Formato condicional calificación — estrellas visuales por color
  const ratingRange = sheet.getRange('H2:H1000')
  const rules = sheet.getConditionalFormatRules()

  const ratings = [
    { value: '5', bg: '#d1fae5', text: '#065f46' },
    { value: '4', bg: '#dbeafe', text: '#1e40af' },
    { value: '3', bg: '#fef3c7', text: '#92400e' },
    { value: '2', bg: '#fee2e2', text: '#991b1b' },
    { value: '1', bg: '#fce7f3', text: '#9d174d' },
  ]
  ratings.forEach(r => {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(r.value)
      .setBackground(r.bg)
      .setFontColor(r.text)
      .setRanges([ratingRange])
      .build())
  })

  addConditionalFormat(sheet, 'J2:J1000', 'Sí', CONFIG.colors.success)
  addConditionalFormat(sheet, 'J2:J1000', 'No', CONFIG.colors.danger)
  addConditionalFormat(sheet, 'J2:J1000', 'Pendiente', CONFIG.colors.warning)
  addConditionalFormat(sheet, 'K2:K1000', 'Sí', CONFIG.colors.success)

  sheet.setConditionalFormatRules(rules)

  // Anchos
  const widths = [130, 160, 200, 160, 130, 160, 100, 130, 400, 130, 110, 200, 250]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  // Wrap text en testimonio
  sheet.getRange('I2:I1000').setWrap(true)
  sheet.setRowHeight(1, 36)

  // Fila de ejemplo para guiar el llenado
  const exampleRow = [
    '29/04/2026', 'María García', 'maria@empresa.com', 'Empresa Ejemplo SA', 'Directora Comercial',
    'Sales AI Closer', 'Pro', '5',
    'El agente redujo nuestro tiempo de respuesta a leads en un 80%. Ahora calificamos 3x más leads con el mismo equipo.',
    'Sí', 'No', 'https://tuagentestore.com', 'Cliente VIP — contactar para caso de éxito'
  ]
  sheet.getRange(2, 1, 1, exampleRow.length).setValues([exampleRow])
  sheet.getRange('A2:M2').setBackground('#fffbeb').setFontStyle('italic')

  Logger.log('✅ Testimonios lista')
}

// ─────────────────────────────────────────────────
// SHEET 5: Demo-Nurture (WF14 — secuencia post-demo)
// ─────────────────────────────────────────────────
function setupDemoNurture(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  Logger.log('🔄 Configurando Demo-Nurture...')

  const sheet = ss.getSheetByName('Demo-Nurture') || ss.insertSheet('Demo-Nurture')
  sheet.clearContents()
  sheet.setTabColor('#4F46E5')

  const headers = ['Fecha', 'Email', 'Nombre', 'Agente', 'Session_ID', 'Accion', 'Dias_Espera']
  formatSheet(sheet, headers, '#4F46E5')

  setDropdown(sheet, 'F2:F1000', [
    'nurture_start', 'email_d1', 'email_d3', 'email_d5',
    'no_response', 'converted', 'unsubscribed'
  ])
  setDropdown(sheet, 'G2:G1000', ['1', '3', '5', '7', '14', '30'])

  addConditionalFormat(sheet, 'F2:F1000', 'converted', CONFIG.colors.success)
  addConditionalFormat(sheet, 'F2:F1000', 'no_response', CONFIG.colors.danger)
  addConditionalFormat(sheet, 'F2:F1000', 'unsubscribed', CONFIG.colors.warning)
  addConditionalFormat(sheet, 'F2:F1000', 'nurture_start', '#dbeafe')
  addConditionalFormat(sheet, 'F2:F1000', 'email_d1', '#e0e7ff')
  addConditionalFormat(sheet, 'F2:F1000', 'email_d3', '#e0e7ff')
  addConditionalFormat(sheet, 'F2:F1000', 'email_d5', '#e0e7ff')

  const widths = [140, 200, 160, 200, 300, 130, 110]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  Logger.log('✅ Demo-Nurture lista')
}

// ─────────────────────────────────────────────────
// SHEET 6: Content Calendar
// ─────────────────────────────────────────────────
function setupContentCalendar(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  const sheet = ss.getSheetByName('Content Calendar') || ss.insertSheet('Content Calendar')
  sheet.clearContents()

  const headers = ['Fecha', 'Plataforma', 'Agente/Tema', 'Formato', 'Status', 'Contenido', 'URL Post', 'Likes', 'Comentarios', 'Shares', 'Reach', 'Notas']
  formatSheet(sheet, headers, CONFIG.colors.accentCyan)

  setDropdown(sheet, 'B2:B1000', ['LinkedIn', 'Instagram', 'TikTok', 'X (Twitter)', 'YouTube', 'Newsletter', 'WhatsApp'])
  setDropdown(sheet, 'D2:D1000', ['Post', 'Carrusel', 'Reel/Video', 'Story', 'Thread', 'Newsletter', 'Script'])
  setDropdown(sheet, 'E2:E1000', ['pending', 'generated', 'approved', 'scheduled', 'published'])

  addConditionalFormat(sheet, 'E2:E1000', 'published', CONFIG.colors.success)
  addConditionalFormat(sheet, 'E2:E1000', 'approved', '#ddd6fe')
  addConditionalFormat(sheet, 'E2:E1000', 'generated', CONFIG.colors.warning)

  const widths = [130, 120, 200, 110, 110, 400, 300, 80, 110, 80, 90, 200]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  const today = new Date()
  const platforms = ['LinkedIn', 'Instagram', 'TikTok', 'LinkedIn', 'Instagram', 'X (Twitter)', 'Newsletter']
  const agents = ['Sales AI Closer', 'AI Lead Engine', 'AI Support Agent', 'Marketing AI Agent', 'E-Commerce Agent', 'Appointment Setting Agent', 'Resumen semanal']
  const formats = ['Post', 'Reel/Video', 'Script', 'Carrusel', 'Reel/Video', 'Thread', 'Newsletter']
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    sheet.getRange(i + 2, 1).setValue(Utilities.formatDate(d, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy'))
    sheet.getRange(i + 2, 2).setValue(platforms[i])
    sheet.getRange(i + 2, 3).setValue(agents[i])
    sheet.getRange(i + 2, 4).setValue(formats[i])
    sheet.getRange(i + 2, 5).setValue('pending')
  }
  Logger.log('✅ Content Calendar')
}

// ─────────────────────────────────────────────────
// SHEET 6: Weekly Reports
// ─────────────────────────────────────────────────
function setupWeeklyReports(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  const sheet = ss.getSheetByName('Weekly Reports') || ss.insertSheet('Weekly Reports')
  sheet.clearContents()

  const headers = [
    'Semana', 'Leads Nuevos', 'Demos', 'Reservas', 'Pagados',
    'Revenue USD', 'Conv Lead→Demo %', 'Conv Demo→Reserva %', 'Conv Reserva→Pago %',
    'Testimonios', 'NPS Promedio', 'Agente Top', 'Notas'
  ]
  formatSheet(sheet, headers, CONFIG.colors.accentGreen)

  const widths = [140, 120, 100, 110, 110, 120, 160, 180, 180, 110, 120, 200, 280]
  widths.forEach((w, i) => sheet.setColumnWidth(i + 1, w))

  sheet.getRange('G2').setFormula('=IF(B2=0,0,ROUND(C2/B2*100,1))')
  sheet.getRange('H2').setFormula('=IF(C2=0,0,ROUND(D2/C2*100,1))')
  sheet.getRange('I2').setFormula('=IF(D2=0,0,ROUND(E2/D2*100,1))')
  Logger.log('✅ Weekly Reports')
}

// ─────────────────────────────────────────────────
// SHEET 7: Dashboard Principal ✨ MEJORADO
// ─────────────────────────────────────────────────
function setupKPIDashboard(ss) {
  if (!ss) ss = SpreadsheetApp.openById(CONFIG.spreadsheetId)
  Logger.log('🎯 Configurando Dashboard...')

  const sheet = ss.getSheetByName('📊 Dashboard') || ss.insertSheet('📊 Dashboard')
  sheet.clearContents()
  sheet.setTabColor('#2563EB')

  const totalCols = 8
  let row = 1

  // ── TÍTULO PRINCIPAL ──────────────────────────────
  sheet.getRange(row, 1, 1, totalCols).merge()
    .setValue('TUAGENTESTORE — Panel de Control')
    .setFontSize(18).setFontWeight('bold').setFontColor('#ffffff')
    .setBackground('#1a2744').setHorizontalAlignment('center')
  sheet.setRowHeight(row, 48)
  row++

  sheet.getRange(row, 1, 1, totalCols).merge()
    .setValue('Actualizado automáticamente · Datos en tiempo real desde todas las hojas')
    .setFontSize(10).setFontColor('#94a3b8')
    .setBackground('#0f1a36').setHorizontalAlignment('center')
  sheet.setRowHeight(row, 28)
  row += 2

  // ── SECCIÓN: KPIs PRINCIPALES ─────────────────────
  sheet.getRange(row, 1, 1, totalCols).merge()
    .setValue('EMBUDO DE CONVERSIÓN')
    .setFontSize(11).setFontWeight('bold').setFontColor('#2563EB')
    .setBackground('#eff6ff').setHorizontalAlignment('left')
  sheet.getRange(row, 1).setHorizontalAlignment('left')
  sheet.setRowHeight(row, 30)
  row++

  // Headers de KPIs
  const kpiHeaders = ['MÉTRICA', 'TOTAL', '% DEL TOTAL', 'ESTA SEMANA', 'MES ACTUAL', 'TENDENCIA', '', '']
  sheet.getRange(row, 1, 1, 6).setValues([kpiHeaders.slice(0, 6)])
    .setFontWeight('bold').setFontSize(9).setFontColor('#6b7280')
    .setBackground('#f1f5f9').setHorizontalAlignment('center')
  row++

  const kpis = [
    ['Leads Captados', "=COUNTA('Leads Master'!A2:A10000)", '', '', '', '→'],
    ['Demos Realizadas', "=COUNTA('Demo Sessions'!A2:A10000)", "=IF(B" + row + "=0,\"—\",TEXT(C" + (row) + "/B" + (row) + ",\"0.0%\"))", '', '', '→'],
    ['Reservas Recibidas', "=COUNTA('Reservations Pipeline'!A2:A10000)", '', '', '', '→'],
    ['Pagos Confirmados', "=COUNTIF('Reservations Pipeline'!J2:J10000,\"paid\")", '', '', '', '→'],
    ['Revenue Estimado USD', "=COUNTIF('Reservations Pipeline'!J2:J10000,\"paid\")*397", '', '', '', '→'],
  ]

  const kpiColors = ['#eff6ff', '#f0fdf4', '#fdf4ff', '#fef9c3', '#f0fdf4']
  kpis.forEach((kpi, i) => {
    sheet.getRange(row, 1).setValue(kpi[0]).setFontWeight('bold').setFontSize(10).setBackground(kpiColors[i])
    if (kpi[1].startsWith('=')) {
      sheet.getRange(row, 2).setFormula(kpi[1]).setFontSize(16).setFontWeight('bold').setFontColor('#1e3a6e').setHorizontalAlignment('center')
    }
    sheet.setRowHeight(row, 36)
    row++
  })
  row++

  // ── SECCIÓN: PIPELINE DETALLADO ───────────────────
  sheet.getRange(row, 1, 1, totalCols).merge()
    .setValue('PIPELINE — ESTADO DE LEADS')
    .setFontSize(11).setFontWeight('bold').setFontColor('#7C3AED').setBackground('#faf5ff')
  sheet.setRowHeight(row, 30)
  row++

  const pipelineStages = [
    ['🆕 New', "=COUNTIF('Leads Master'!K2:K10000,\"new\")"],
    ['📞 Contactados', "=COUNTIF('Leads Master'!K2:K10000,\"contacted\")"],
    ['✅ Calificados', "=COUNTIF('Leads Master'!K2:K10000,\"qualified\")"],
    ['🔍 Validados', "=COUNTIF('Leads Master'!K2:K10000,\"validated\")"],
    ['💰 Pagados', "=COUNTIF('Leads Master'!K2:K10000,\"paid\")"],
    ['❌ Cancelados', "=COUNTIF('Leads Master'!K2:K10000,\"cancelled\")"],
  ]
  pipelineStages.forEach(stage => {
    sheet.getRange(row, 1).setValue(stage[0]).setFontSize(10)
    sheet.getRange(row, 2).setFormula(stage[1]).setFontSize(14).setFontWeight('bold').setFontColor('#7C3AED').setHorizontalAlignment('center')
    sheet.setRowHeight(row, 32)
    row++
  })
  row++

  // ── SECCIÓN: DEMOS ────────────────────────────────
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue('DEMOS').setFontSize(11).setFontWeight('bold').setFontColor('#0891b2').setBackground('#f0f9ff')
  sheet.setRowHeight(row, 30)
  row++

  const demoKpis = [
    ['Total demos iniciadas', "=COUNTA('Demo Sessions'!A2:A10000)"],
    ['Demos completadas', "=COUNTIF('Demo Sessions'!G2:G10000,\"completed\")"],
    ['Tasa de completado', "=IF(COUNTA('Demo Sessions'!A2:A10000)=0,\"0%\",TEXT(COUNTIF('Demo Sessions'!G2:G10000,\"completed\")/COUNTA('Demo Sessions'!A2:A10000),\"0.0%\"))"],
    ['Conv. Demo → Reserva', "=IF(COUNTA('Demo Sessions'!A2:A10000)=0,\"0%\",TEXT(COUNTA('Reservations Pipeline'!A2:A10000)/COUNTA('Demo Sessions'!A2:A10000),\"0.0%\"))"],
  ]
  demoKpis.forEach(kpi => {
    sheet.getRange(row, 1).setValue(kpi[0]).setFontSize(10)
    if (kpi[1].startsWith('=')) {
      sheet.getRange(row, 2).setFormula(kpi[1]).setFontSize(14).setFontWeight('bold').setFontColor('#0891b2').setHorizontalAlignment('center')
    }
    sheet.setRowHeight(row, 32)
    row++
  })
  row++

  // ── SECCIÓN: TESTIMONIOS ──────────────────────────
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue('TESTIMONIOS & NPS').setFontSize(11).setFontWeight('bold').setFontColor('#D97706').setBackground('#fffbeb')
  sheet.setRowHeight(row, 30)
  row++

  const testKpis = [
    ['Total testimonios', "=COUNTA('Testimonios'!A2:A10000)-1"],
    ['Calificación promedio', "=IF(COUNTA('Testimonios'!H2:H10000)=0,\"—\",TEXT(AVERAGEIF('Testimonios'!H2:H10000,\">0\",'Testimonios'!H2:H10000),\"0.0\") & \" / 5 ⭐\")"],
    ['Testimonios ⭐⭐⭐⭐⭐', "=COUNTIF('Testimonios'!H2:H10000,\"5\")"],
    ['Autorizados a publicar', "=COUNTIF('Testimonios'!J2:J10000,\"Sí\")"],
    ['Pendientes publicar', "=COUNTIF('Testimonios'!K2:K10000,\"No\")-COUNTIF('Testimonios'!J2:J10000,\"No\")"],
  ]
  testKpis.forEach(kpi => {
    sheet.getRange(row, 1).setValue(kpi[0]).setFontSize(10)
    if (kpi[1].startsWith('=')) {
      sheet.getRange(row, 2).setFormula(kpi[1]).setFontSize(14).setFontWeight('bold').setFontColor('#D97706').setHorizontalAlignment('center')
    }
    sheet.setRowHeight(row, 32)
    row++
  })
  row++

  // ── SECCIÓN: CONTENIDO ────────────────────────────
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue('CALENDARIO DE CONTENIDO').setFontSize(11).setFontWeight('bold').setFontColor(CONFIG.colors.accentCyan).setBackground('#ecfeff')
  sheet.setRowHeight(row, 30)
  row++

  const contentKpis = [
    ['Posts pendientes', "=COUNTIF('Content Calendar'!E2:E10000,\"pending\")"],
    ['Posts publicados', "=COUNTIF('Content Calendar'!E2:E10000,\"published\")"],
    ['En aprobación', "=COUNTIF('Content Calendar'!E2:E10000,\"approved\")+COUNTIF('Content Calendar'!E2:E10000,\"generated\")"],
  ]
  contentKpis.forEach(kpi => {
    sheet.getRange(row, 1).setValue(kpi[0]).setFontSize(10)
    sheet.getRange(row, 2).setFormula(kpi[1]).setFontSize(14).setFontWeight('bold').setFontColor(CONFIG.colors.accentCyan).setHorizontalAlignment('center')
    sheet.setRowHeight(row, 32)
    row++
  })
  row++

  // ── SECCIÓN: TOP AGENTES ──────────────────────────
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue('AGENTES — MÉTRICAS').setFontSize(11).setFontWeight('bold').setFontColor('#374151').setBackground('#f9fafb')
  sheet.setRowHeight(row, 30)
  row++

  const agents = ['Sales AI Closer', 'AI Lead Engine', 'AI Support Agent', 'Marketing AI Agent', 'E-Commerce Agent', 'Appointment Setting Agent']
  const agentHeaders = ['Agente', 'Demos', 'Reservas', 'Testimonios']
  sheet.getRange(row, 1, 1, 4).setValues([agentHeaders])
    .setFontWeight('bold').setFontSize(9).setFontColor('#6b7280').setBackground('#f1f5f9')
  row++

  agents.forEach(agent => {
    sheet.getRange(row, 1).setValue(agent).setFontSize(10)
    sheet.getRange(row, 2).setFormula(`=COUNTIF('Demo Sessions'!C2:C10000,"${agent}")`)
      .setFontSize(12).setFontWeight('bold').setFontColor('#4F46E5').setHorizontalAlignment('center')
    sheet.getRange(row, 3).setFormula(`=COUNTIF('Reservations Pipeline'!G2:G10000,"${agent}")`)
      .setFontSize(12).setFontWeight('bold').setFontColor('#7C3AED').setHorizontalAlignment('center')
    sheet.getRange(row, 4).setFormula(`=COUNTIF('Testimonios'!F2:F10000,"${agent}")`)
      .setFontSize(12).setFontWeight('bold').setFontColor('#D97706').setHorizontalAlignment('center')
    sheet.setRowHeight(row, 32)
    row++
  })

  // Anchos de columna del dashboard
  sheet.setColumnWidth(1, 260)
  sheet.setColumnWidth(2, 150)
  sheet.setColumnWidth(3, 150)
  sheet.setColumnWidth(4, 150)
  for (let c = 5; c <= totalCols; c++) sheet.setColumnWidth(c, 100)

  sheet.setFrozenRows(1)
  Logger.log('✅ Dashboard')
}

// ─────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────
function formatSheet(sheet, headers, color) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setValues([headers])
    .setBackground(color || CONFIG.colors.header)
    .setFontColor(CONFIG.colors.headerText)
    .setFontWeight('bold')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
  sheet.setRowHeight(1, 36)
  sheet.setFrozenRows(1)
  sheet.setTabColor(color || CONFIG.colors.header)
  sheet.getRange(2, 1, 998, headers.length).setFontSize(10)
}

function setDropdown(sheet, range, values) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true).build()
  sheet.getRange(range).setDataValidation(rule)
}

function addConditionalFormat(sheet, rangeStr, value, bgColor) {
  const range = sheet.getRange(rangeStr)
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(value).setBackground(bgColor)
    .setRanges([range]).build()
  const rules = sheet.getConditionalFormatRules()
  rules.push(rule)
  sheet.setConditionalFormatRules(rules)
}
