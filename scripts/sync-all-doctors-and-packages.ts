import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import { doctorsData } from '../data/doctors'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  console.log('--- STARTING CATALOGUE SYNCHRONIZATION ---')

  // 1. Get primary organization and branch
  const { data: org } = await supabase.from('organizations').select('id').limit(1).single()
  if (!org) throw new Error('Organization not found')

  const { data: branch } = await supabase.from('branches').select('id, name').limit(1).single()
  if (!branch) throw new Error('Branch not found')

  console.log(`Using Org ID: ${org.id}, Branch: ${branch.name} (${branch.id})`)

  // 2. Sync all 8 doctors from data/doctors.ts
  console.log(`\nSyncing ${doctorsData.length} doctors from data/doctors.ts...`)
  for (const doc of doctorsData) {
    const slug = slugify(doc.id || doc.name)
    const code = `DOC-${doc.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || Math.floor(1000 + Math.random() * 9000)}`

    const physicalFeePaise = Math.round((doc.physicalConsultationFee ?? doc.consultationFee ?? 400) * 100)
    const teleFeePaise = Math.round((doc.telemedicineConsultationFee ?? doc.consultationFee ?? 400) * 100)
    const followUpFeePaise = Math.round((doc.followUpFee ?? 0) * 100)
    const experienceYears = parseInt(doc.experience || '5', 10) || 5

    // Check if doctor exists by slug or name
    const { data: existingDoc } = await supabase
      .from('doctors')
      .select('id')
      .or(`slug.eq.${slug},name.eq."${doc.name}"`)
      .maybeSingle()

    let doctorId: string

    if (existingDoc) {
      doctorId = existingDoc.id
      await supabase
        .from('doctors')
        .update({
          name: doc.name,
          slug,
          specialty: doc.specialty,
          designation: doc.designation,
          qualifications: doc.qualifications || 'Specialist Physician',
          registration_number: doc.registrationNumber || 'WBMC Verified',
          experience_years: experienceYears,
          physical_fee_paise: physicalFeePaise,
          telemedicine_fee_paise: teleFeePaise,
          follow_up_fee_paise: followUpFeePaise,
          image_url: doc.image || null,
          about: doc.about || doc.description,
          languages: doc.languages || ['Bengali', 'English', 'Hindi'],
          areas_of_expertise: doc.areasOfExpertise || [doc.specialty],
          services_offered: doc.servicesOffered || ['OPD Consultation', 'Assisted Telemedicine'],
          is_active: true,
        })
        .eq('id', doctorId)
      console.log(`Updated Doctor: ${doc.name} (${doctorId})`)
    } else {
      const { data: newDoc, error: insertErr } = await supabase
        .from('doctors')
        .insert({
          organization_id: org.id,
          code,
          name: doc.name,
          slug,
          specialty: doc.specialty,
          designation: doc.designation,
          qualifications: doc.qualifications || 'Specialist Physician',
          registration_number: doc.registrationNumber || 'WBMC Verified',
          experience_years: experienceYears,
          physical_fee_paise: physicalFeePaise,
          telemedicine_fee_paise: teleFeePaise,
          follow_up_fee_paise: followUpFeePaise,
          image_url: doc.image || null,
          about: doc.about || doc.description,
          languages: doc.languages || ['Bengali', 'English', 'Hindi'],
          areas_of_expertise: doc.areasOfExpertise || [doc.specialty],
          services_offered: doc.servicesOffered || ['OPD Consultation', 'Assisted Telemedicine'],
          is_active: true,
        })
        .select()
        .single()

      if (insertErr || !newDoc) {
        console.error(`Error inserting doctor ${doc.name}:`, insertErr?.message)
        continue
      }
      doctorId = newDoc.id
      console.log(`Inserted Doctor: ${doc.name} (${doctorId})`)
    }

    // Link Branch
    await supabase.from('doctor_branches').upsert({
      doctor_id: doctorId,
      branch_id: branch.id,
      is_primary: true,
    }, { onConflict: 'doctor_id,branch_id' })

    // Add default schedules (Mon to Sat 10:00 to 18:00) so availability works for booking
    for (let day = 1; day <= 6; day++) {
      const { data: existingSchedule } = await supabase
        .from('doctor_schedules')
        .select('id')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', day)
        .maybeSingle()

      if (!existingSchedule) {
        await supabase.from('doctor_schedules').insert({
          organization_id: org.id,
          branch_id: branch.id,
          doctor_id: doctorId,
          day_of_week: day,
          start_time: '10:00:00',
          end_time: '18:00:00',
          slot_duration_minutes: 15,
          max_patients_per_slot: 1,
          is_active: true,
        })
      }
    }
  }

  // 3. Sync all packages from public/data/packages.csv
  const pkgCsvPath = path.join(process.cwd(), 'public', 'data', 'packages.csv')
  if (fs.existsSync(pkgCsvPath)) {
    const csvContent = fs.readFileSync(pkgCsvPath, 'utf8')
    const parsed = Papa.parse<any>(csvContent, { header: true, skipEmptyLines: true })
    console.log(`\nSyncing ${parsed.data.length} packages from packages.csv...`)

    for (const row of parsed.data) {
      if (!row.package_name) continue

      const slug = row.package_slug || slugify(row.package_name)
      const code = `PKG-${row.package_id || slug.toUpperCase().slice(0, 10)}`
      const pricePaise = Math.round(parseFloat(row.discount_price || row.price || '999') * 100)
      const mrpPaise = Math.round(parseFloat(row.price || row.discount_price || '1499') * 100)

      const { data: existingPkg } = await supabase
        .from('diagnostic_packages')
        .select('id')
        .or(`slug.eq.${slug},code.eq.${code}`)
        .maybeSingle()

      let pkgId: string

      if (existingPkg) {
        pkgId = existingPkg.id
        await supabase
          .from('diagnostic_packages')
          .update({
            name: row.package_name,
            slug,
            description: row.description,
            is_active: true,
          })
          .eq('id', pkgId)
        console.log(`Updated Package: ${row.package_name}`)
      } else {
        const { data: newPkg, error: pkgErr } = await supabase
          .from('diagnostic_packages')
          .insert({
            organization_id: org.id,
            code,
            name: row.package_name,
            slug,
            description: row.description,
            is_active: true,
          })
          .select()
          .single()

        if (pkgErr || !newPkg) {
          console.error(`Error inserting package ${row.package_name}:`, pkgErr?.message)
          continue
        }
        pkgId = newPkg.id
        console.log(`Inserted Package: ${row.package_name}`)
      }

      // Sync price in diagnostic_prices
      const { data: existingPrice } = await supabase
        .from('diagnostic_prices')
        .select('id')
        .eq('package_id', pkgId)
        .eq('item_type', 'package')
        .maybeSingle()

      if (existingPrice) {
        await supabase
          .from('diagnostic_prices')
          .update({
            price_paise: pricePaise,
            mrp_paise: mrpPaise,
            is_active: true,
          })
          .eq('id', existingPrice.id)
      } else {
        await supabase.from('diagnostic_prices').insert({
          organization_id: org.id,
          branch_id: branch.id,
          item_type: 'package',
          package_id: pkgId,
          price_paise: pricePaise,
          mrp_paise: mrpPaise,
          is_active: true,
        })
      }
    }
  }

  console.log('\n--- CATALOGUE SYNCHRONIZATION COMPLETE ---')
}

main().catch(console.error)
