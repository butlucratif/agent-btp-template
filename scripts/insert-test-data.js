/**
 * Insert test data for Patrick's scenario
 * Run with: node scripts/insert-test-data.js
 */

import { supabase } from '../lib/supabase.js'

async function insertTestData() {
  console.log('🧹 Cleaning previous test data...')

  // Delete previous test data
  const { error: deleteDevisError } = await supabase
    .from('devis')
    .delete()
    .or(
      'client_nom.like.%TEST%,client_nom.in.(Dupont Jean,Martin Sophie,Bernard Paul,Rousseau Marie,Lambert Pierre)'
    )

  if (deleteDevisError) {
    console.error('❌ Error deleting old devis:', deleteDevisError)
  } else {
    console.log('✅ Old devis deleted')
  }

  const { error: deleteChantiersError } = await supabase
    .from('chantiers')
    .delete()
    .or(
      'client_nom.like.%TEST%,client_nom.in.(Durand Marc,Petit Anne,Moreau Jacques,Leroy François,Garcia Maria)'
    )

  if (deleteChantiersError) {
    console.error('❌ Error deleting old chantiers:', deleteChantiersError)
  } else {
    console.log('✅ Old chantiers deleted')
  }

  console.log('\n📝 Inserting test data...\n')

  // Calculate dates
  const now = new Date()
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000)
  const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get Monday and Sunday of current week
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const wednesday = new Date(monday)
  wednesday.setDate(monday.getDate() + 2)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  // ============ DEVIS EN ATTENTE (5) ============

  console.log('📋 Inserting devis...')

  // Devis 1: Dupont Jean - 4 days (should trigger relance)
  const { error: devis1Error } = await supabase.from('devis').insert({
    client_nom: 'Dupont Jean',
    montant: 2800.0,
    date_envoi: fourDaysAgo.toISOString(),
    statut: 'en_attente',
    telephone: '06 12 34 56 78',
  })
  if (devis1Error) console.error('❌ Error inserting Dupont Jean:', devis1Error)
  else console.log('  ✅ Dupont Jean - 2800€ (4 days)')

  // Devis 2: Martin Sophie - 6 days (should trigger relance)
  const { error: devis2Error } = await supabase.from('devis').insert({
    client_nom: 'Martin Sophie',
    montant: 6500.0,
    date_envoi: sixDaysAgo.toISOString(),
    statut: 'en_attente',
    telephone: '06 98 76 54 32',
  })
  if (devis2Error) console.error('❌ Error inserting Martin Sophie:', devis2Error)
  else console.log('  ✅ Martin Sophie - 6500€ (6 days)')

  // Devis 3: Bernard Paul - 8 days (should trigger urgent alert)
  const { error: devis3Error } = await supabase.from('devis').insert({
    client_nom: 'Bernard Paul',
    montant: 4200.0,
    date_envoi: eightDaysAgo.toISOString(),
    statut: 'en_attente',
    telephone: '06 45 67 89 01',
  })
  if (devis3Error) console.error('❌ Error inserting Bernard Paul:', devis3Error)
  else console.log('  ✅ Bernard Paul - 4200€ (8 days)')

  // Devis 4: Rousseau Marie - 2 days (should NOT trigger relance)
  const { error: devis4Error } = await supabase.from('devis').insert({
    client_nom: 'Rousseau Marie',
    montant: 1800.0,
    date_envoi: twoDaysAgo.toISOString(),
    statut: 'en_attente',
    telephone: '07 11 22 33 44',
  })
  if (devis4Error) console.error('❌ Error inserting Rousseau Marie:', devis4Error)
  else console.log('  ✅ Rousseau Marie - 1800€ (2 days)')

  // Devis 5: Lambert Pierre - Accepted (should NOT appear in relances)
  const { error: devis5Error } = await supabase.from('devis').insert({
    client_nom: 'Lambert Pierre',
    montant: 3900.0,
    date_envoi: tenDaysAgo.toISOString(),
    statut: 'accepte',
    telephone: '06 55 66 77 88',
  })
  if (devis5Error) console.error('❌ Error inserting Lambert Pierre:', devis5Error)
  else console.log('  ✅ Lambert Pierre - 3900€ (accepted)')

  // ============ CHANTIERS EN COURS (2) ============

  console.log('\n🏗️  Inserting chantiers en cours...')

  // Chantier 1: Durand Marc - EXCELLENT margin (35%)
  const { error: chantier1Error } = await supabase.from('chantiers').insert({
    client_nom: 'Durand Marc',
    montant_devis: 5200.0,
    date_debut: fifteenDaysAgo.toISOString(),
    statut: 'en_cours',
    telephone: '06 11 22 33 44',
    heures_travaillees: 45,
    depenses: 1200.0,
    avis_demande: false,
  })
  if (chantier1Error) console.error('❌ Error inserting Durand Marc:', chantier1Error)
  else console.log('  ✅ Durand Marc - 5200€, 45h, 1200€ → 35% margin 🟢')

  // Chantier 2: Petit Anne - DANGER margin (-8%)
  const { error: chantier2Error } = await supabase.from('chantiers').insert({
    client_nom: 'Petit Anne',
    montant_devis: 3100.0,
    date_debut: tenDaysAgo.toISOString(),
    statut: 'en_cours',
    telephone: '07 99 88 77 66',
    heures_travaillees: 52,
    depenses: 750.0,
    avis_demande: false,
  })
  if (chantier2Error) console.error('❌ Error inserting Petit Anne:', chantier2Error)
  else console.log('  ✅ Petit Anne - 3100€, 52h, 750€ → -8% margin 🔴')

  // ============ CHANTIER TERMINÉ (1) ============

  console.log('\n✅ Inserting chantier terminé...')

  // Chantier 3: Moreau Jacques - FINISHED (should trigger Google review)
  const { error: chantier3Error } = await supabase.from('chantiers').insert({
    client_nom: 'Moreau Jacques',
    montant_devis: 4500.0,
    date_debut: thirtyDaysAgo.toISOString(),
    statut: 'termine',
    telephone: '06 33 44 55 66',
    heures_travaillees: 58,
    depenses: 950.0,
    avis_demande: false,
  })
  if (chantier3Error) console.error('❌ Error inserting Moreau Jacques:', chantier3Error)
  else console.log('  ✅ Moreau Jacques - terminé, avis_demande=false')

  // ============ CHANTIERS PRÉVUS THIS WEEK (2) ============

  console.log('\n📅 Inserting chantiers prévus...')

  // Chantier 4: Leroy François - Wednesday
  const { error: chantier4Error } = await supabase.from('chantiers').insert({
    client_nom: 'Leroy François',
    montant_devis: 5800.0,
    date_debut: wednesday.toISOString(),
    statut: 'prevu',
    telephone: '06 77 88 99 00',
    heures_travaillees: null,
    depenses: null,
    avis_demande: false,
  })
  if (chantier4Error) console.error('❌ Error inserting Leroy François:', chantier4Error)
  else console.log('  ✅ Leroy François - 5800€ (Wednesday)')

  // Chantier 5: Garcia Maria - Sunday
  const { error: chantier5Error } = await supabase.from('chantiers').insert({
    client_nom: 'Garcia Maria',
    montant_devis: 7200.0,
    date_debut: sunday.toISOString(),
    statut: 'prevu',
    telephone: '07 22 33 44 55',
    heures_travaillees: null,
    depenses: null,
    avis_demande: false,
  })
  if (chantier5Error) console.error('❌ Error inserting Garcia Maria:', chantier5Error)
  else console.log('  ✅ Garcia Maria - 7200€ (Sunday)')

  console.log('\n✅ Test data inserted successfully!')
  console.log('\n📊 Expected Results:')
  console.log('  • relance-devis: 3 messages (Dupont, Martin, Bernard)')
  console.log('  • urgent-alert: 1 message (Bernard - 8 days)')
  console.log('  • avis-google: 1 message (Moreau)')
  console.log('  • rentabilite: 2 alerts (1 danger Petit Anne, 1 success Durand Marc)')
  console.log('  • calcul-ca: 13000€ total for week (Leroy + Garcia)')
}

insertTestData().catch(console.error)
