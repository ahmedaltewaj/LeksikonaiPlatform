export type OnboardingEmailType = 'welcome' | 'setup_complete' | 'day2_followup' | 'day1_tips' | 'day3_checkin' | 'day7_stats' | 'day14_activation' | 'day30_nps'

export interface OnboardingEmailData {
  type: OnboardingEmailType
  recipientEmail: string
  recipientName: string
  companyName: string
  dashboardUrl: string
}

export function renderWelcomeEmail(data: OnboardingEmailData): string {
  const { recipientName, recipientEmail, companyName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Velkommen til Leksikon.ai</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1E3A5F 0%, #2D4A6F 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content h2 { font-size: 18px; font-weight: 600; color: #1F2937; margin: 0 0 16px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .feature-list { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .feature-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .feature-item:last-child { margin-bottom: 0; }
    .feature-icon { width: 24px; height: 24px; background: #1E3A5F; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; flex-shrink: 0; }
    .feature-text { font-size: 14px; color: #374151; }
    .feature-text strong { color: #1F2937; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .cta-button:hover { background: #2D4A6F; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
    .divider { height: 1px; background: #E5E7EB; margin: 24px 0; }
    .tip-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .tip-box p { margin: 0; font-size: 14px; color: #1E40AF; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Velkommen til Leksikon.ai</h1>
      <p>Din AI-assistent er nu klar til at hjælpe dig</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>
        Tak fordi du har valgt Leksikon.ai til din virksomhed <strong>${companyName}</strong>. 
        Vi er glade for at kunne byde dig velkommen – dit AI-drevne kundeforespørgselssystem er nu aktivt!
      </p>

      <div class="feature-list">
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <div class="feature-text">
            <strong>Din chatbot sender automatiske svar</strong><br/>
            Kunder receive hurtige svar, selv uden for kontortid
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <div class="feature-text">
            <strong>Dansk AI-træning</strong><br/>
            Forstår og kommunikerer på dansk med locale erhvervssprog
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">✓</div>
          <div class="feature-text">
            <strong>Din dashboard</strong><br/>
            Se alle forespørgsler og godkend eller rediger svar med ét klik
          </div>
        </div>
      </div>

      <div class="tip-box">
        <p><strong>Tip:</strong> Klik på "Test" i dit dashboard for at se, hvordan systemet fungerer med dit første eksempel.</p>
      </div>

      <p>
        <a href="${dashboardUrl}" class="cta-button">Gå til dit dashboard →</a>
      </p>

      <p>
        Vi anbefaler, at du i de første dage holder øje med de svar, AI'en genererer – 
        dette hjælper systemet med at lære din virksomheds stil og behov.
      </p>

      <div class="divider"></div>

      <p style="font-size: 14px; color: #6B7280;">
        Har du spørgsmål eller brug for hjælp? Svar bare på denne email – 
        vi er altid klar til at hjælpe.
      </p>

      <p style="font-size: 14px; color: #6B7280;">
       Vh,<br/>
        <strong>Teamet hos Leksikon.ai</strong>
      </p>
    </div>

    <div class="footer">
      <p>Denne email blev sendt til ${recipientEmail}</p>
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Kontakt support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderDay2FollowupEmail(data: OnboardingEmailData): string {
  const { recipientName, companyName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dag 2 med Leksikon.ai</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: #1E3A5F; color: #FFFFFF; padding: 24px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
    .header p { margin: 4px 0 0; opacity: 0.8; font-size: 14px; }
    .content { padding: 24px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
    .stat-card { background: #F9FAFB; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1E3A5F; }
    .stat-label { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .checklist { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .checklist h3 { font-size: 14px; font-weight: 600; color: #1F2937; margin: 0 0 12px; }
    .checklist-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 14px; color: #374151; }
    .checklist-item:last-child { margin-bottom: 0; }
    .check-icon { width: 18px; height: 18px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; flex-shrink: 0; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 16px 24px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dag 2 med Leksikon.ai</h1>
      <p>Her er hvad du skal vide</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>
        Hvordan går det med ${companyName}? Vi håber, at du har haft tid til at prøve Leksikon.ai.
        Her er en hurtig opdatering på, hvad du kan forvente:
      </p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Forespørgsler</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Svar sendt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">100%</div>
          <div class="stat-label">AI-nøjagtighed</div>
        </div>
      </div>

      <div class="checklist">
        <h3>Din hurtige tjekliste:</h3>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Tilpas dine svarstoner i Indstillinger</span>
        </div>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Tilføj ofte stillede spørgsmål til AI'en</span>
        </div>
        <div class="checklist-item">
          <div class="check-icon">✓</div>
          <span>Test systemet med en eksempelforespørgsel</span>
        </div>
      </div>

      <p>
        <a href="${dashboardUrl}" class="cta-button">Gå til dit dashboard →</a>
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        PS: Hvis du har spørgsmål eller vil have personlig gennemgang, 
        kan du altid booke en gratis demo med os.
      </p>
    </div>

    <div class="footer">
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderSetupCompleteEmail(data: OnboardingEmailData): string {
  const { recipientName, recipientEmail, companyName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Din første AI-respons er klar</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .highlight-box { background: #ECFDF5; border-left: 4px solid #10B981; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .highlight-box p { margin: 0; font-size: 15px; color: #065F46; }
    .success-icon { width: 64px; height: 64px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .success-icon span { color: white; font-size: 32px; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 24px 0; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Din første AI-respons er klar!</h1>
      <p>Congratulations fra Leksikon.ai</p>
    </div>

    <div class="content">
      <div class="success-icon">
        <span>✓</span>
      </div>

      <p>Hej ${recipientName},</p>
      
      <p>
        <strong>Tillykke!</strong> Du har forbundet din indbakke til Leksikon.ai og din virksomhed <strong>${companyName}</strong> er nu klar til at automatisere kundeforespørgsler.
      </p>

      <div class="highlight-box">
        <p><strong>Vi har modtaget din første forespørgsel</strong> og genereret et AI-svar klar til din godkendelse.</p>
      </div>

      <p>
        <a href="${dashboardUrl}" class="cta-button">Se din respons →</a>
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        <strong>Husk:</strong> Du godkender altid hvert svar, før det sendes. Så du har fuld kontrol over hvad der går ud til dine kunder.
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        Har du spørgsmål? Svar bare på denne email – vi hjælper gerne.
      </p>
    </div>

    <div class="footer">
      <p>Denne email blev sendt til ${recipientEmail}</p>
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderDay1TipsEmail(data: OnboardingEmailData): string {
  const { recipientName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3 tips til bedre AI-respons</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .tip-card { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 16px 0; border-left: 4px solid #10B981; }
    .tip-card h3 { font-size: 16px; font-weight: 600; color: #1F2937; margin: 0 0 8px; }
    .tip-card p { font-size: 14px; color: #4B5563; margin: 0; }
    .tip-number { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #10B981; border-radius: 50%; color: white; font-size: 14px; font-weight: 600; margin-right: 12px; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>3 tips til bedre AI-respons</h1>
      <p>Få mere ud af Leksikon.ai</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>Vi håber, du har haft en god start med Leksikon.ai! Her er tre tips, der kan hjælpe dig med at få endnu bedre resultater:</p>

      <div class="tip-card">
        <h3><span class="tip-number">1</span>Giv kontekst i dine forespørgsler</h3>
        <p>Jo mere information du giver om kundens situation, jo bedre bliver AI'ens svar. Prøv at inkludere produktnavne eller specifikke detaljer.</p>
      </div>

      <div class="tip-card">
        <h3><span class="tip-number">2</span>Genbrug gode svar</h3>
        <p>Når du godkender et svar, husker systemet mønsteret. Det betyder, at fremtidige svar bliver mere præcise over tid.</p>
      </div>

      <div class="tip-card">
        <h3><span class="tip-number">3</span>Rediger og tilpas</h3>
        <p>Det er altid en god ide at læse AI'ens svar igennem og tilpasse tonen. Dit personlige touch gør en forskel!</p>
      </div>

      <p>
        <a href="${dashboardUrl}" class="cta-button">Prøv det nu →</a>
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        Har du spørgsmål? Svar bare på denne email – vi hjælper gerne.
      </p>
    </div>

    <div class="footer">
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderDay3CheckinEmail(data: OnboardingEmailData): string {
  const { recipientName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hvordan klarer du dig?</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .question-box { background: #F9FAFB; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center; }
    .question-box p { font-size: 18px; color: #1F2937; font-weight: 500; margin: 0 0 16px; }
    .btn-group { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none; }
    .btn-happy { background: #10B981; color: white !important; }
    .btn-neutral { background: #F59E0B; color: white !important; }
    .btn-concerned { background: #EF4444; color: white !important; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hvordan klarer du dig?</h1>
      <p>Vi vil gerne høre fra dig</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>Det er nu tredje dag, du har adgang til Leksikon.ai. Hvordan har det været?</p>

      <div class="question-box">
        <p>Hvordan har de første dage været?</p>
        <div class="btn-group">
          <a href="${dashboardUrl}?feedback=happy" class="btn btn-happy">👍 Godt!</a>
          <a href="${dashboardUrl}?feedback=neutral" class="btn btn-neutral">😐 Okay</a>
          <a href="${dashboardUrl}?feedback=concerned" class="btn btn-concerned">🤔 Har brug for hjælp</a>
        </div>
      </div>

      <p>
        <a href="${dashboardUrl}" class="cta-button">Gå til dit dashboard →</a>
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        Uden din feedback kan vi ikke forbedre os. Vi læser alle svar og bruger dem til at gøre produktet bedre for alle.
      </p>
    </div>

    <div class="footer">
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderDay7StatsEmail(data: OnboardingEmailData): string {
  const { recipientName, recipientEmail, companyName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Din første uge med Leksikon.ai</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
    .stat-card { background: #F9FAFB; border-radius: 8px; padding: 20px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: 700; color: #0EA5E9; }
    .stat-label { font-size: 13px; color: #6B7280; margin-top: 4px; }
    .highlight-box { background: #ECFDF5; border-left: 4px solid #10B981; padding: 16px; border-radius: 0 8px 8px 0; margin: 24px 0; }
    .highlight-box p { margin: 0; font-size: 15px; color: #065F46; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Din første uge med Leksikon.ai</h1>
      <p>Her er din opdatering</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>Fantastisk! Du har brugt Leksikon.ai i en hel uge. Her er en opsummering af din første uge:</p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Forespørgsler behandlet</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Svar sendt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">100%</div>
          <div class="stat-label">Tid sparet</div>
        </div>
      </div>

      <div class="highlight-box">
        <p><strong>Næste skridt:</strong> Prøv at tilføje flere af dine ofte stillede spørgsmål til systemet – det hjælper AI'en med at give endnu bedre svar.</p>
      </div>

      <p>
        <a href="${dashboardUrl}" class="cta-button">Se dit dashboard →</a>
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        Husk: Du kan altid kontakte os, hvis du har spørgsmål eller brug for hjælp.
      </p>
    </div>

    <div class="footer">
      <p>Denne email blev sendt til ${recipientEmail}</p>
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderDay14ActivationEmail(data: OnboardingEmailData): string {
  const { recipientName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Du er nu en pro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .feature-grid { display: grid; gap: 12px; margin: 24px 0; }
    .feature-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #F9FAFB; border-radius: 8px; }
    .feature-icon { width: 40px; height: 40px; background: #F59E0B; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; flex-shrink: 0; }
    .feature-text { font-size: 14px; color: #374151; }
    .feature-text strong { display: block; color: #1F2937; font-size: 15px; }
    .cta-button { display: inline-block; background: #1E3A5F; color: white !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Du er nu en pro!</h1>
      <p>Udforsk flere funktioner</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>To uger med Leksikon.ai – du er ikke længere nybegynder! Her er nogle funktioner, du måske endnu ikke har opdaget:</p>

      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">👥</div>
          <div class="feature-text">
            <strong>Inviter dit team</strong>
            Del adgang med kolleger så I kan samarbejde om kundeforespørgsler
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div class="feature-text">
            <strong>Detaljeret statistik</strong>
            Følg dit forbrug og se hvor meget tid du sparer
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔧</div>
          <div class="feature-text">
            <strong>Tilpas svartoner</strong>
            Skift mellem formel og uformel tone afhængigt af dine kunder
          </div>
        </div>
      </div>

      <p>
        <a href="${dashboardUrl}/settings" class="cta-button">Udforsk funktioner →</a>
      </p>

      <p style="font-size: 14px; color: #6B7280;">
        Har du spørgsmål? Svar bare på denne email – vi hjælper gerne.
      </p>
    </div>

    <div class="footer">
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderDay30NpsEmail(data: OnboardingEmailData): string {
  const { recipientName, dashboardUrl } = data
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hvor sandsynligt er det, at du vil anbefale os?</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%); color: #FFFFFF; padding: 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 32px; }
    .content p { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 16px; }
    .nps-question { text-align: center; padding: 24px 0; }
    .nps-question p { font-size: 18px; color: #1F2937; font-weight: 500; margin: 0 0 20px; }
    .nps-scale { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .nps-btn { width: 40px; height: 40px; border-radius: 8px; border: 2px solid #E5E7EB; background: white; font-weight: 600; color: #4B5563; cursor: pointer; transition: all 0.2s; }
    .nps-btn:hover { border-color: #8B5CF6; background: #F5F3FF; }
    .nps-btn.selected { background: #8B5CF6; border-color: #8B5CF6; color: white; }
    .submit-btn { display: block; width: 100%; background: #8B5CF6; color: white !important; text-decoration: none; padding: 14px; border-radius: 8px; font-weight: 600; font-size: 15px; text-align: center; margin-top: 20px; border: none; cursor: pointer; }
    .testimonial-box { background: #F9FAFB; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .testimonial-box p { font-size: 14px; color: #4B5563; margin: 0 0 8px; font-style: italic; }
    .testimonial-box p:last-child { font-size: 13px; color: #6B7280; margin: 0; }
    .footer { padding: 20px 32px; background: #F9FAFB; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; }
    .footer a { color: #1E3A5F; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Hvor sandsynligt er det, at du vil anbefale os?</h1>
      <p>Din feedback hjælper os med at vokse</p>
    </div>

    <div class="content">
      <p>Hej ${recipientName},</p>
      
      <p>En hel måned med Leksikon.ai! Vi håber, at vi har hjulpet dig med at spare tid på dine kundesvar.</p>

      <p>Vi vil virkelig gerne høre din mening – det tager kun 30 sekunder.</p>

      <div class="nps-question">
        <p>Hvor sandsynligt er det, at du vil anbefale Leksikon.ai til en kollega eller ven?</p>
        <div class="nps-scale">
          <button class="nps-btn" onclick="selectNps(this, 1)">1</button>
          <button class="nps-btn" onclick="selectNps(this, 2)">2</button>
          <button class="nps-btn" onclick="selectNps(this, 3)">3</button>
          <button class="nps-btn" onclick="selectNps(this, 4)">4</button>
          <button class="nps-btn" onclick="selectNps(this, 5)">5</button>
          <button class="nps-btn" onclick="selectNps(this, 6)">6</button>
          <button class="nps-btn" onclick="selectNps(this, 7)">7</button>
          <button class="nps-btn" onclick="selectNps(this, 8)">8</button>
          <button class="nps-btn" onclick="selectNps(this, 9)">9</button>
          <button class="nps-btn" onclick="selectNps(this, 10)">10</button>
        </div>
        <input type="hidden" id="nps-score" name="nps-score" />
        <button class="submit-btn" onclick="submitNps()">Send svar</button>
      </div>

      <script>
        function selectNps(btn, score) {
          document.querySelectorAll('.nps-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('nps-score').value = score;
        }
        function submitNps() {
          const score = document.getElementById('nps-score').value;
          if (!score) { alert('Vælg venligst et nummer'); return; }
          window.location.href = '${dashboardUrl}?nps=' + score;
        }
      </script>

      <div class="testimonial-box">
        <p>"Tak fordi du bruger Leksikon.ai – din feedback hjælper os med at gøre produktet bedre for alle danske virksomheder."</p>
        <p>— Teamet hos Leksikon.ai</p>
      </div>
    </div>

    <div class="footer">
      <p><a href="${dashboardUrl}">Gå til dashboard</a> · <a href="#">Support</a></p>
    </div>
  </div>
</body>
</html>`
}

export function renderOnboardingEmail(data: OnboardingEmailData): string {
  switch (data.type) {
    case 'welcome':
      return renderWelcomeEmail(data)
    case 'day2_followup':
      return renderDay2FollowupEmail(data)
    case 'day1_tips':
      return renderDay1TipsEmail(data)
    case 'day3_checkin':
      return renderDay3CheckinEmail(data)
    case 'setup_complete':
      return renderSetupCompleteEmail(data)
    case 'day7_stats':
      return renderDay7StatsEmail(data)
    case 'day14_activation':
      return renderDay14ActivationEmail(data)
    case 'day30_nps':
      return renderDay30NpsEmail(data)
    default:
      return renderWelcomeEmail(data)
  }
}