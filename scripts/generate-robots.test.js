const { buildRobotsTxt } = require('./generate-robots')

describe('buildRobotsTxt', () => {
  const output = buildRobotsTxt()

  test('starts with comment citing Content-Signal sources', () => {
    expect(output.split('\n')[0]).toMatch(/^# /)
    expect(output).toMatch(/contentsignals\.org/)
    expect(output).toMatch(/draft-romm-aipref-contentsignals/)
  })

  test('has wildcard User-agent block with Allow: /', () => {
    expect(output).toMatch(/User-agent: \*\nAllow: \//)
  })

  test('wildcard block includes Content-Signal directive', () => {
    expect(output).toMatch(
      /Content-Signal: ai-train=yes, search=yes, ai-input=yes/
    )
  })

  test.each([
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
  ])('has explicit User-agent block for %s', (ua) => {
    expect(output).toMatch(new RegExp(`User-agent: ${ua}\\nAllow: /`))
  })

  test('ends with Sitemap directive for caasih.net', () => {
    expect(output.trim()).toMatch(
      /Sitemap: https:\/\/caasih\.net\/sitemap\.xml$/
    )
  })

  test('uses LF line endings only', () => {
    expect(output).not.toMatch(/\r/)
  })
})
