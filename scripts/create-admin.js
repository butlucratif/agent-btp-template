#!/usr/bin/env node

/**
 * Script de création d'un utilisateur admin
 * Email: admin@test.com
 * Password: Test123456!
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gpysrgzckegebekqqfwx.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdweXNyZ3pja2VnZWJla3FxZnd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI3NzQ2MSwiZXhwIjoyMDk0ODUzNDYxfQ.Z8TmZfJqRa5efWyM4Zdkw2eeSnX4L5wV76-2ComYyq0'

async function createAdminUser() {
  console.log('🔐 Création de l\'utilisateur admin...\n')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    // Créer l'utilisateur
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'Test123456!',
      email_confirm: true
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ L\'utilisateur existe déjà !')
        console.log('\n📋 IDENTIFIANTS DE CONNEXION :')
        console.log('   Email    : admin@test.com')
        console.log('   Password : Test123456!')
        return
      }
      throw error
    }

    console.log('✅ Utilisateur créé avec succès !')
    console.log('\n📋 IDENTIFIANTS DE CONNEXION :')
    console.log('   Email    : admin@test.com')
    console.log('   Password : Test123456!')
    console.log('\n🚀 Vous pouvez maintenant vous connecter au dashboard !')

  } catch (error) {
    console.error('❌ Erreur lors de la création :', error.message)
    process.exit(1)
  }
}

createAdminUser()
