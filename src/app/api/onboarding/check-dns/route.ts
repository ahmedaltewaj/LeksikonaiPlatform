import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email_address } = body

    if (!email_address) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    const domain = email_address.split('@')[1]
    if (!domain) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    let spfVerified = false
    let spfRecord = ''
    try {
      const spfResults = await resolveTxt(domain)
      for (const record of spfResults) {
        const txt = record.join('')
        if (txt.toLowerCase().includes('v=spf1')) {
          spfRecord = txt
          spfVerified = true
          break
        }
      }
    } catch (dnsError) {
      console.log('SPF check failed:', dnsError)
    }

    let dkimVerified = false
    let dkimRecord = ''
    try {
      const selector = '_domainkey'
      const dkimDomain = `${selector}._domainkey.${domain}`
      const dkimResults = await resolveTxt(dkimDomain)
      for (const record of dkimResults) {
        const txt = record.join('')
        if (txt.toLowerCase().includes('v=dkim1')) {
          dkimRecord = txt
          dkimVerified = true
          break
        }
      }
    } catch (dkimError) {
      console.log('DKIM check failed:', dkimError)
    }

    let dmarcRecord = ''
    try {
      const dmarcDomain = `_dmarc.${domain}`
      const dmarcResults = await resolveTxt(dmarcDomain)
      for (const record of dmarcResults) {
        const txt = record.join('')
        if (txt.toLowerCase().includes('v=dmarc1')) {
          dmarcRecord = txt
          break
        }
      }
    } catch (dmarcError) {
      console.log('DMARC check failed:', dmarcError)
    }

    const { error: updateError } = await supabase
      .from('email_configurations')
      .update({
        spf_verified: spfVerified,
        dkim_verified: dkimVerified,
        spf_checked_at: new Date().toISOString(),
        dkim_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating DNS check results:', updateError)
    }

    if (spfVerified && dkimVerified) {
      await supabase
        .from('email_configurations')
        .update({ status: 'verified' })
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      success: true,
      spf_verified: spfVerified,
      dkim_verified: dkimVerified,
      spf_record: spfRecord,
      dkim_record: dkimRecord,
      dmarc_record: dmarcRecord,
      status: spfVerified && dkimVerified ? 'verified' : 'pending'
    })
  } catch (error) {
    console.error('DNS check failed:', error)
    return NextResponse.json({ error: 'Failed to check DNS records' }, { status: 500 })
  }
}