const fs = require('fs')
const path = require('path')

const SITE_URL = 'https://caasih.net'

const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
  'PerplexityBot',
  'PerplexityBot-User',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'Meta-ExternalAgent',
  'Amazonbot',
  'DuckAssistBot',
  'Timpibot',
]

const HEADER = [
  '# Content-Signal directives follow https://contentsignals.org/',
  '# and the IETF draft at https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/',
  '# Revisit when the draft is updated.',
]

const buildRobotsTxt = () => {
  const lines = [...HEADER, '']

  lines.push('User-agent: *')
  lines.push('Allow: /')
  lines.push('Content-Signal: ai-train=yes, search=yes, ai-input=yes')
  lines.push('')

  for (const bot of AI_BOTS) {
    lines.push(`User-agent: ${bot}`)
    lines.push('Allow: /')
    lines.push('')
  }

  lines.push(`Sitemap: ${SITE_URL}/sitemap.xml`)
  lines.push('')

  return lines.join('\n')
}

const main = () => {
  const distDir = path.join(__dirname, '..', 'dist')
  const outputPath = path.join(distDir, 'robots.txt')
  fs.mkdirSync(distDir, { recursive: true })
  fs.writeFileSync(outputPath, buildRobotsTxt(), 'utf8')
  console.log(`wrote ${outputPath}`)
}

if (require.main === module) {
  main()
}

module.exports = { buildRobotsTxt }
