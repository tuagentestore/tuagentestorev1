/**
 * TUAGENTESTORE — Setup automático de Google Sheets
 * ─────────────────────────────────────────────────
 * CÓMO USAR:
 * 1. Ir a script.google.com → Nuevo proyecto
 * 2. Pegar todo este código
 * 3. Click en "Ejecutar" → función: setupAll
 * 4. Autorizar permisos cuando lo pida
 * 5. Al terminar, el script imprime los IDs en Logs
 */

// ─────────────────────────────────────────────────
// CONFIGURACIÓN
// ─────────────────────────────────────────────────
const CONFIG = {
  spreadsheetName: 'TuAgenteStore — Master Hub',
  folderName: 'TuAgenteStore',

  // Colores de la marca
  colors: {
    header: '#1a2744',        // fondo header
    headerText: '#ffffff',
    accent: '#2563EB',        // azul primario
    accent2: '#4F46E5',       // indigo
    rowAlt: '#f8faff',
    success: '#d1fae5',
    warning: '#fef3c7',
    danger: '#fee2e2',
  }
}

// ─────────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────────
function setupAll() {
  Logger.log('🚀 Iniciando setup de TuAgenteStore...')

  // 1. Crear estructura de carpetas en Drive
  const folder = setupDrive()

  // 2. Crear el Spreadsheet master
  const ss = setupSpreadsheet(folder)

  // 3. Crear todas las pestañas
  setupLeadsMaster(ss)
  setupDemoSessions(ss)
  setupReservationsPipeline(ss)
  setupContentCalendar(ss)
  setupWeeklyReports(ss)
  setupKPIDashboard(ss)

  // 4. Eliminar la Sheet1 por defecto
  const defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1')
  if (defaultSheet) ss.deleteSheet(defaultSheet)

  // 5. Activar primera pestaña
  ss.setActiveSheet(ss.getSheetByName('Leads Master'))

  Logger.log('─────────────────────────────────────────')
  Logger.log('✅ SETUP COMPLETADO')
  Logger.log('─────────────────────────────────────────')
  Logger.log('📊 Spreadsheet ID: ' + ss.getId())
  Logger.log('📊 Spreadsheet URL: ' + ss.getUrl())
  Logger.log('📁 Carpeta Drive ID: ' + folder.getId())
  Logger.log('📁 Carpeta Drive URL: ' + folder.getUrl())
  Logger.log('')
  Logger.log('⚠️  IMPORTANTE: Copiá estos IDs a tu .env:')
  Logger.log('GOOGLE_SPREADSHEET_ID=' + ss.getId())
  Logger.log('─────────────────────────────────────────')
}

// ─────────────────────────────────────────────────
// DRIVE — Estructura de carpetas
// ─────────────────────────────────────────────────
function setupDrive() {
  Logger.log('📁 Creando estructura de carpetas...')

  const root = DriveApp.getRootFolder()

  // Carpeta principal
  let mainFolder = getOrCreateFolder(root, 'TuAgenteStore')

  // Subcarpetas
  getOrCreateFolder(mainFolder, '📊 Operaciones')
  getOrCreateFolder(mainFolder, '👥 Clientes')
  getOrCreateFolder(mainFolder, '📣 Contenido')
  getOrCreateFolder(mainFolder, '📑 Templates')
  getOrCreateFolder(mainFolder, '🔒 Credenciales (privado)')
  getOrCreateFolder(mainFolder, '📈 Reportes')

  // Subcarpeta Contenido
  const contenidoFolder = getOrCreateFolder(mainFolder, '📣 Contenido')
  getOrCreateFolder(contenidoFolder, 'LinkedIn')
  getOrCreateFolder(contenidoFolder, 'Instagram')
  getOrCreateFolder(contenidoFolder, 'TikTok')
  getOrCreateFolder(contenidoFolder, 'YouTube')
  getOrCreateFolder(contenidoFolder, 'Newsletter')

  Logger.log('✅ Carpetas creadas en: ' + mainFolder.getUrl())
  return mainFolder
}

function getOrCreateFolder(parent, name) {
  const existing = parent.getFoldersByName(name)
  if (existing.hasNext()) return existing.next()
  return parent.createFolder(name)
}

// ─────────────────────────────────────────────────
// SPREADSHEET — Crear en Drive
// ─────────────────────────────────────────────────
function setupSpreadsheet(folder) {
  Logger.log('📊 Creando Spreadsheet master...')

  // Verificar si ya existe
  const existing = folder.getFilesByName(CONFIG.spreadsheetName)
  if (existing.hasNext()) {
    Logger.log('⚠️  Spreadsheet ya existe, usando el existente')
    const file = existing.next()
    return SpreadsheetApp.openById(file.getId())
  }

  const ss = SpreadsheetApp.create(CONFIG.spreadsheetName)

  // Mover a la carpeta correcta
  const file = DriveApp.getFileById(ss.getId())
  folder.addFile(file)
  DriveApp.getRootFolder().removeFile(file)

  Logger.log('✅ Spreadsheet creado: ' + ss.getUrl())
  return ss
}

// ─────────────────────────────────────────────────
// SHEET 1: Leads Master
// ─────────────────────────────────────────────────
function setupLeadsMaster(ss) {
  Logger.log('📋 Configurando Leads Master...')

  const sheet = ss.getSheetByName('Leads Master') || ss.insertSheet('Leads Master')
  sheet.clearContents()

  // Columnas alineadas con lib/sheets.ts → logLeadToSheets()
  // [now, id, name, email, phone, company, industry, agentName, source, planInterest, 'new']
  const headers = [
    'Fecha', 'Lead ID', 'Nombre', 'Email', 'Teléfono',
    'Empresa', 'Industria', 'Agente', 'Fuente', 'Plan', 'Estado'
  ]

  formatSheet(sheet, headers, CONFIG.colors.accent)

  // Validación de Estado → col K (11)
  const statusRange = sheet.getRange('K2:K1000')
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['new', 'contacted', 'qualified', 'validated', 'paid', 'cancelled', 'no_show'], true)
    .build()
  statusRange.setDataValidation(statusRule)

  // Validación de Plan → col J (10)
  const planRange = sheet.getRange('J2:J1000')
  const planRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['starter', 'pro', 'enterprise'], true)
    .build()
  planRange.setDataValidation(planRule)

  // Formato condicional por estado
  addConditionalFormat(sheet, 'K2:K1000', 'paid', CONFIG.colors.success)
  addConditionalFormat(sheet, 'K2:K1000', 'cancelled', CONFIG.colors.danger)
  addConditionalFormat(sheet, 'K2:K1000', 'validated', '#ddd6fe')
  addConditionalFormat(sheet, 'K2:K1000', 'qualified', '#e0e7ff')

  // Anchos de columna
  sheet.setColumnWidth(1, 140)  // Fecha
  sheet.setColumnWidth(2, 260)  // Lead ID
  sheet.setColumnWidth(3, 160)  // Nombre
  sheet.setColumnWidth(4, 200)  // Email
  sheet.setColumnWidth(5, 130)  // Teléfono
  sheet.setColumnWidth(6, 150)  // Empresa
  sheet.setColumnWidth(7, 120)  // Industria
  sheet.setColumnWidth(8, 160)  // Agente
  sheet.setColumnWidth(9, 110)  // Fuente
  sheet.setColumnWidth(10, 100) // Plan
  sheet.setColumnWidth(11, 110) // Estado

  Logger.log('✅ Leads Master lista')
}

// ─────────────────────────────────────────────────
// SHEET 2: Demo Sessions
// ─────────────────────────────────────────────────
function setupDemoSessions(ss) {
  Logger.log('🤖 Configurando Demo Sessions...')

  const sheet = ss.getSheetByName('Demo Sessions') || ss.insertSheet('Demo Sessions')
  sheet.clearContents()

  // Columnas alineadas con lib/sheets.ts → logDemoToSheets()
  // [now, sessionId, agentName, userEmail, ip, messagesUsed, 'completed'|'started']
  const headers = [
    'Fecha', 'Session ID', 'Agente', 'Email Usuario',
    'IP', 'Mensajes', 'Status'
  ]

  formatSheet(sheet, headers, CONFIG.colors.accent2)

  // Dropdown Status → col G (7)
  const statusRange = sheet.getRange('G2:G1000')
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['started', 'completed'], true)
    .build()
  statusRange.setDataValidation(statusRule)

  addConditionalFormat(sheet, 'G2:G1000', 'completed', CONFIG.colors.success)
  addConditionalFormat(sheet, 'G2:G1000', 'started', CONFIG.colors.warning)

  sheet.setColumnWidth(1, 140)  // Fecha
  sheet.setColumnWidth(2, 280)  // Session ID
  sheet.setColumnWidth(3, 180)  // Agente
  sheet.setColumnWidth(4, 200)  // Email Usuario
  sheet.setColumnWidth(5, 130)  // IP
  sheet.setColumnWidth(6, 100)  // Mensajes
  sheet.setColumnWidth(7, 110)  // Status

  Logger.log('✅ Demo Sessions lista')
}

// ─────────────────────────────────────────────────
// SHEET 3: Reservations Pipeline
// ─────────────────────────────────────────────────
function setupReservationsPipeline(ss) {
  Logger.log('📌 Configurando Reservations Pipeline...')

  const sheet = ss.getSheetByName('Reservations Pipeline') || ss.insertSheet('Reservations Pipeline')
  sheet.clearContents()

  // Columnas alineadas con lib/sheets.ts → logReservationToSheets()
  // [now, id, name, email, phone, company, agentName, planInterest, preferredDate, 'new']
  const headers = [
    'Fecha', 'Reserva ID', 'Nombre', 'Email', 'Teléfono',
    'Empresa', 'Agente', 'Plan', 'Fecha Preferida', 'Estado'
  ]

  formatSheet(sheet, headers, '#7C3AED')

  // Dropdown Estado → col J (10)
  const statusRange = sheet.getRange('J2:J1000')
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['new', 'contacted', 'qualified', 'validated', 'paid', 'cancelled', 'no_show'], true)
    .build()
  statusRange.setDataValidation(statusRule)

  // Formato condicional por estado
  addConditionalFormat(sheet, 'J2:J1000', 'paid', CONFIG.colors.success)
  addConditionalFormat(sheet, 'J2:J1000', 'cancelled', CONFIG.colors.danger)
  addConditionalFormat(sheet, 'J2:J1000', 'validated', '#ddd6fe')
  addConditionalFormat(sheet, 'J2:J1000', 'qualified', '#e0e7ff')

  sheet.setColumnWidth(1, 140)  // Fecha
  sheet.setColumnWidth(2, 280)  // Reserva ID
  sheet.setColumnWidth(3, 160)  // Nombre
  sheet.setColumnWidth(4, 200)  // Email
  sheet.setColumnWidth(5, 130)  // Teléfono
  sheet.setColumnWidth(6, 150)  // Empresa
  sheet.setColumnWidth(7, 180)  // Agente
  sheet.setColumnWidth(8, 100)  // Plan
  sheet.setColumnWidth(9, 130)  // Fecha Preferida
  sheet.setColumnWidth(10, 110) // Estado

  Logger.log('✅ Reservations Pipeline lista')
}

// ─────────────────────────────────────────────────
// SHEET 4: Content Calendar
// ─────────────────────────────────────────────────
function setupContentCalendar(ss) {
  Logger.log('📅 Configurando Content Calendar...')

  const sheet = ss.getSheetByName('Content Calendar') || ss.insertSheet('Content Calendar')
  sheet.clearContents()

  const headers = [
    'Fecha', 'Plataforma', 'Agente/Tema', 'Formato',
    'Status', 'Contenido Generado', 'URL del Post',
    'Likes', 'Comentarios', 'Shares', 'Reach', 'Notas'
  ]

  formatSheet(sheet, headers, '#0891b2')

  // Dropdowns
  const platformRange = sheet.getRange('B2:B1000')
  const platformRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['LinkedIn', 'Instagram', 'TikTok', 'X (Twitter)', 'YouTube', 'Newsletter', 'WhatsApp'], true)
    .build()
  platformRange.setDataValidation(platformRule)

  const formatRange = sheet.getRange('D2:D1000')
  const formatRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Post', 'Carrusel', 'Reel/Video', 'Story', 'Thread', 'Newsletter', 'Script'], true)
    .build()
  formatRange.setDataValidation(formatRule)

  const statusRange = sheet.getRange('E2:E1000')
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'generated', 'approved', 'published', 'scheduled'], true)
    .build()
  statusRange.setDataValidation(statusRule)

  addConditionalFormat(sheet, 'E2:E1000', 'published', CONFIG.colors.success)
  addConditionalFormat(sheet, 'E2:E1000', 'approved', '#ddd6fe')
  addConditionalFormat(sheet, 'E2:E1000', 'generated', CONFIG.colors.warning)

  sheet.setColumnWidth(1, 130)
  sheet.setColumnWidth(2, 120)
  sheet.setColumnWidth(3, 200)
  sheet.setColumnWidth(4, 110)
  sheet.setColumnWidth(5, 110)
  sheet.setColumnWidth(6, 400)
  sheet.setColumnWidth(7, 300)
  sheet.setColumnWidth(8, 80)
  sheet.setColumnWidth(9, 110)
  sheet.setColumnWidth(10, 80)
  sheet.setColumnWidth(11, 90)
  sheet.setColumnWidth(12, 200)

  // Pre-cargar algunas fechas de ejemplo para la semana actual
  const today = new Date()
  const platforms = ['LinkedIn', 'Instagram', 'TikTok', 'LinkedIn', 'Instagram', 'X (Twitter)', 'Newsletter']
  const agents = ['Sales AI Closer', 'AI Lead Engine', 'AI Support Agent', 'Marketing AI Agent', 'E-Commerce Agent', 'Appointment Setting Agent', 'Resumen semanal']
  const formats = ['Post', 'Reel/Video', 'Script', 'Carrusel', 'Reel/Video', 'Thread', 'Newsletter']

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    sheet.getRange(i + 2, 1).setValue(Utilities.formatDate(date, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy'))
    sheet.getRange(i + 2, 2).setValue(platforms[i])
    sheet.getRange(i + 2, 3).setValue(agents[i])
    sheet.getRange(i + 2, 4).setValue(formats[i])
    sheet.getRange(i + 2, 5).setValue('pending')
  }

  Logger.log('✅ Content Calendar lista')
}

// ─────────────────────────────────────────────────
// SHEET 5: Weekly Reports Archive
// ─────────────────────────────────────────────────
function setupWeeklyReports(ss) {
  Logger.log('📈 Configurando Weekly Reports...')

  const sheet = ss.getSheetByName('Weekly Reports') || ss.insertSheet('Weekly Reports')
  sheet.clearContents()

  const headers = [
    'Semana', 'Leads Nuevos', 'Demos Realizadas', 'Reservas',
    'Convertidos a Pago', 'Revenue USD', 'Conv. Lead→Demo %',
    'Conv. Demo→Reserva %', 'Conv. Reserva→Pago %',
    'Agente Top', 'Notas'
  ]

  formatSheet(sheet, headers, '#059669')

  sheet.setColumnWidth(1, 140)
  sheet.setColumnWidth(2, 120)
  sheet.setColumnWidth(3, 130)
  sheet.setColumnWidth(4, 110)
  sheet.setColumnWidth(5, 150)
  sheet.setColumnWidth(6, 120)
  sheet.setColumnWidth(7, 160)
  sheet.setColumnWidth(8, 180)
  sheet.setColumnWidth(9, 180)
  sheet.setColumnWidth(10, 200)
  sheet.setColumnWidth(11, 280)

  // Fórmulas de conversión en fila 2 como ejemplo
  sheet.getRange('G2').setFormula('=IF(B2=0,0,ROUND(C2/B2*100,1))')
  sheet.getRange('H2').setFormula('=IF(C2=0,0,ROUND(D2/C2*100,1))')
  sheet.getRange('I2').setFormula('=IF(D2=0,0,ROUND(E2/D2*100,1))')

  Logger.log('✅ Weekly Reports lista')
}

// ─────────────────────────────────────────────────
// SHEET 6: KPI Dashboard (solo lectura / fórmulas)
// ─────────────────────────────────────────────────
function setupKPIDashboard(ss) {
  Logger.log('🎯 Configurando KPI Dashboard...')

  const sheet = ss.getSheetByName('📊 KPIs') || ss.insertSheet('📊 KPIs')
  sheet.clearContents()
  sheet.setTabColor('#2563EB')

  // Título
  sheet.getRange('A1:D1').merge()
  sheet.getRange('A1').setValue('TUAGENTESTORE — Dashboard Operativo')
    .setFontSize(16)
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setBackground('#1a2744')
    .setHorizontalAlignment('center')

  // Sección: Pipeline
  sheet.getRange('A3').setValue('PIPELINE ACTUAL').setFontWeight('bold').setFontColor('#2563EB')

  // Leads Master: Estado en col K | Demo Sessions: Status en col G | Reservations: Estado en col J
  const kpis = [
    ['Total Leads', "=COUNTA('Leads Master'!A2:A1000)"],
    ['Contactados', "=COUNTIF('Leads Master'!K2:K1000,\"contacted\")"],
    ['Calificados', "=COUNTIF('Leads Master'!K2:K1000,\"qualified\")"],
    ['Validados', "=COUNTIF('Leads Master'!K2:K1000,\"validated\")"],
    ['Pagados', "=COUNTIF('Leads Master'!K2:K1000,\"paid\")"],
    ['', ''],
    ['Total Demos', "=COUNTA('Demo Sessions'!A2:A1000)"],
    ['Demos Completadas', "=COUNTIF('Demo Sessions'!G2:G1000,\"completed\")"],
    ['Conv. Demo→Reserva', "=IF(COUNTA('Demo Sessions'!A2:A1000)=0,\"0%\",TEXT(COUNTA('Reservations Pipeline'!A2:A1000)/COUNTA('Demo Sessions'!A2:A1000),\"0.0%\"))"],
  ]

  for (let i = 0; i < kpis.length; i++) {
    const row = 4 + i
    sheet.getRange(row, 1).setValue(kpis[i][0]).setFontWeight(kpis[i][0] ? 'normal' : 'normal')
    if (kpis[i][1].startsWith('=')) {
      sheet.getRange(row, 2).setFormula(kpis[i][1]).setFontWeight('bold').setFontColor('#2563EB')
    } else {
      sheet.getRange(row, 2).setValue(kpis[i][1])
    }
  }

  // Sección: Contenido
  sheet.getRange('A14').setValue('CONTENIDO').setFontWeight('bold').setFontColor('#0891b2')
  sheet.getRange('A15').setValue('Posts pendientes')
  sheet.getRange('B15').setFormula("=COUNTIF('Content Calendar'!E2:E1000,\"pending\")").setFontWeight('bold').setFontColor('#0891b2')
  sheet.getRange('A16').setValue('Posts publicados este mes')
  sheet.getRange('B16').setFormula("=COUNTIF('Content Calendar'!E2:E1000,\"published\")").setFontWeight('bold').setFontColor('#0891b2')

  sheet.setColumnWidth(1, 220)
  sheet.setColumnWidth(2, 130)

  Logger.log('✅ KPI Dashboard lista')
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

  // Alternating rows (light)
  const dataRange = sheet.getRange(2, 1, 998, headers.length)
  dataRange.setFontSize(10)
}

function addConditionalFormat(sheet, rangeStr, value, bgColor) {
  const range = sheet.getRange(rangeStr)
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(value)
    .setBackground(bgColor)
    .setRanges([range])
    .build()

  const rules = sheet.getConditionalFormatRules()
  rules.push(rule)
  sheet.setConditionalFormatRules(rules)
}
