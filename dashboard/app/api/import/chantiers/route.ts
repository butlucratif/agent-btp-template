import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client at runtime, not at build time
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase non configuré. Ajoutez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans les variables d\'environnement Vercel.' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Read file content
    const text = await file.text()

    // Parse CSV (simple parsing - can be enhanced with papaparse later)
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    // Map CSV columns to database columns
    const columnMap: Record<string, string> = {
      'nom': 'nom',
      'name': 'nom',
      'montant': 'montant',
      'amount': 'montant',
      'heures_pointees': 'heures_pointees',
      'heures': 'heures_pointees',
      'hours': 'heures_pointees',
      'avancement': 'avancement',
      'progress': 'avancement',
      'rentabilite': 'rentabilite',
      'rentabilité': 'rentabilite',
      'profitability': 'rentabilite',
    }

    const chantiersToInsert = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const chantier: Record<string, any> = {}

      headers.forEach((header, index) => {
        const dbColumn = columnMap[header]
        if (dbColumn && values[index]) {
          let value: any = values[index]

          // Convert percentages to numbers
          if (dbColumn === 'avancement' || dbColumn === 'rentabilite') {
            value = parseFloat(value.replace('%', '').trim())
          }

          chantier[dbColumn] = value
        }
      })

      // Only insert if we have at least nom and montant
      if (chantier.nom && chantier.montant) {
        chantiersToInsert.push(chantier)
      }
    }

    if (chantiersToInsert.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée valide trouvée dans le fichier' },
        { status: 400 }
      )
    }

    // Insert into Supabase
    const { error } = await supabase.from('chantiers').insert(chantiersToInsert)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Erreur lors de l'insertion: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: chantiersToInsert.length,
      message: `${chantiersToInsert.length} chantiers importés avec succès`,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
