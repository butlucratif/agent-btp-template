import cron from 'node-cron'
import relanceDevisAgent from './agents/relance-devis.js'
import calculCAAgent from './agents/calcul-ca.js'
import dailyBriefingAgent from './agents/daily-briefing.js'
import urgentAlertAgent from './agents/urgent-alert.js'
import avisGoogleAgent from './agents/avis-google.js'
import rentabiliteChantierAgent from './agents/rentabilite-chantier.js'
import { envoyerMessage } from './lib/telegram.js'

console.log('🚀 Système d\'agents Agent BTP Template démarré')
console.log('⏰ Configuration des tâches planifiées...\n')

// Agent 1 : Briefing quotidien - DÉSACTIVÉ
// Tous les matins à 7h
// ALERTES DÉSACTIVÉES
// cron.schedule('0 7 * * *', async () => {
//   console.log('\n⏰ [CRON] Déclenchement Agent Daily Briefing (7h00)')
//   try {
//     await dailyBriefingAgent()
//   } catch (error) {
//     console.error('Erreur lors de l\'exécution de l\'agent de briefing:', error)
//   }
// }, {
//   timezone: 'Europe/Paris'
// })
// console.log('✅ Agent Daily Briefing planifié : tous les jours à 7h00')
console.log('⏸️  Agent Daily Briefing DÉSACTIVÉ (était: tous les jours à 7h00)')

// Agent 2 : Relance des devis - DÉSACTIVÉ
// Tous les soirs à 20h
// ALERTES DÉSACTIVÉES
// cron.schedule('0 20 * * *', async () => {
//   console.log('\n⏰ [CRON] Déclenchement Agent Relance Devis (20h00)')
//   try {
//     await relanceDevisAgent()
//   } catch (error) {
//     console.error('Erreur lors de l\'exécution de l\'agent de relance:', error)
//   }
// }, {
//   timezone: 'Europe/Paris'
// })
// console.log('✅ Agent Relance Devis planifié : tous les jours à 20h00')
console.log('⏸️  Agent Relance Devis DÉSACTIVÉ (était: tous les jours à 20h00)')

// Agent 3 : Calcul du CA hebdomadaire - DÉSACTIVÉ
// Tous les lundis à 8h
// ALERTES DÉSACTIVÉES
// cron.schedule('0 8 * * 1', async () => {
//   console.log('\n⏰ [CRON] Déclenchement Agent Calcul CA (Lundi 8h00)')
//   try {
//     await calculCAAgent()
//   } catch (error) {
//     console.error('Erreur lors de l\'exécution de l\'agent de calcul CA:', error)
//   }
// }, {
//   timezone: 'Europe/Paris'
// })
// console.log('✅ Agent Calcul CA planifié : tous les lundis à 8h00')
console.log('⏸️  Agent Calcul CA DÉSACTIVÉ (était: tous les lundis à 8h00)')

// Agent 4 : Alertes urgentes - DÉSACTIVÉ
// Toutes les 6 heures (0h, 6h, 12h, 18h)
// ALERTES DÉSACTIVÉES
// cron.schedule('0 */6 * * *', async () => {
//   const heure = new Date().getHours()
//   console.log(`\n⏰ [CRON] Déclenchement Agent Urgent Alert (${heure}h00)`)
//   try {
//     await urgentAlertAgent()
//   } catch (error) {
//     console.error('Erreur lors de l\'exécution de l\'agent d\'alertes urgentes:', error)
//   }
// }, {
//   timezone: 'Europe/Paris'
// })
// console.log('✅ Agent Urgent Alert planifié : toutes les 6 heures')
console.log('⏸️  Agent Urgent Alert DÉSACTIVÉ (était: toutes les 6 heures)')

// Agent 5 : Demande d'avis Google - DÉSACTIVÉ
// Tous les matins à 9h
// ALERTES DÉSACTIVÉES
// cron.schedule('0 9 * * *', async () => {
//   console.log('\n⏰ [CRON] Déclenchement Agent Avis Google (9h00)')
//   try {
//     await avisGoogleAgent()
//   } catch (error) {
//     console.error('Erreur lors de l\'exécution de l\'agent d\'avis Google:', error)
//   }
// }, {
//   timezone: 'Europe/Paris'
// })
// console.log('✅ Agent Avis Google planifié : tous les jours à 9h00')
console.log('⏸️  Agent Avis Google DÉSACTIVÉ (était: tous les jours à 9h00)')

// Agent 6 : Analyse rentabilité chantiers - DÉSACTIVÉ
// Tous les soirs à 21h
// ALERTES DÉSACTIVÉES
// cron.schedule('0 21 * * *', async () => {
//   console.log('\n⏰ [CRON] Déclenchement Agent Rentabilité Chantier (21h00)')
//   try {
//     await rentabiliteChantierAgent()
//   } catch (error) {
//     console.error('Erreur lors de l\'exécution de l\'agent de rentabilité:', error)
//   }
// }, {
//   timezone: 'Europe/Paris'
// })
// console.log('✅ Agent Rentabilité Chantier planifié : tous les jours à 21h00')
console.log('⏸️  Agent Rentabilité Chantier DÉSACTIVÉ (était: tous les jours à 21h00)')

// Message de confirmation au démarrage - DÉSACTIVÉ
// ALERTES DÉSACTIVÉES
// envoyerMessage(
//   '🚀 <b>Système d\'agents démarré</b>\n\n' +
//   '✅ Agent Daily Briefing : 7h00 quotidien\n' +
//   '✅ Agent Calcul CA : Lundis 8h00\n' +
//   '✅ Agent Avis Google : 9h00 quotidien\n' +
//   '✅ Agent Relance Devis : 20h00 quotidien\n' +
//   '✅ Agent Rentabilité : 21h00 quotidien\n' +
//   '✅ Agent Urgent Alert : Toutes les 6h\n\n' +
//   'Le système est opérationnel ! 💪'
// ).catch((error) => {
//   console.error('Erreur lors de l\'envoi du message de démarrage:', error)
// })
console.log('⏸️  Message de démarrage Telegram DÉSACTIVÉ')

// Garder le processus actif
console.log('\n📡 En attente des tâches planifiées...')
console.log('Press Ctrl+C to stop\n')
