import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import Article from 'components/Article'
import { decode } from '../../lib/ffxiv-strat'

const SAMPLE_CODE =
  '[stgy:aw5-pKJcyPZdvO9iFpRLn893nGo-dyTe5Q+n0j4D3qpRP+mTCPgl9Jrl+2lu7k03DC9TqqPEQ49zWzew62B+IV6P-eWGEznZp-B+P95K6VaPKAnA9vigQwpCDxxIr5kyCveZJX96gGbNEReJZ3vX-u3iO5l0JfgcyHOdUKonCfuXsSQqdM-qqx8ngqZchxv0vAeF5ETCyyFmONz6YzjTAEHEKLCEZkje]'

const tableStyle = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: '0.85em',
  overflowX: 'auto',
  display: 'block',
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '4px 8px',
  textAlign: 'left',
  background: '#f5f5f5',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  border: '1px solid #ccc',
  padding: '4px 8px',
  whiteSpace: 'nowrap',
}

const errorStyle = {
  color: '#c00',
  background: '#fff0f0',
  border: '1px solid #fcc',
  padding: '8px 12px',
  borderRadius: '4px',
}

function FFXIVStrat() {
  const [input, setInput] = useState(SAMPLE_CODE)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function handleDecode(e) {
    e.preventDefault()
    setResult(null)
    setError(null)
    try {
      const board = decode(input.trim())
      setResult(board)
    } catch (err) {
      setError(err.message || String(err))
    }
  }

  return (
    <Article className="playground-ffxiv-strat">
      <Helmet>
        <title>FFXIV Strat - caasih.net</title>
      </Helmet>
      <h1>FFXIV Strategy Board Decoder</h1>
      <p>
        This is a project to test{' '}
        <a href="https://claude.ai/claude-code">Claude Code</a>'s capabilities
        — specifically, its ability to read open-source references, understand a
        binary format, and implement a working encoder/decoder.
      </p>
      <p>
        Reference implementations:{' '}
        <a
          href="https://github.com/marimelon/stgy-tools"
          target="_blank"
          rel="noopener noreferrer"
        >
          marimelon/stgy-tools
        </a>{' '}
        and{' '}
        <a
          href="https://github.com/wtw0212/ff14-strategyboard-decode"
          target="_blank"
          rel="noopener noreferrer"
        >
          wtw0212/ff14-strategyboard-decode
        </a>
        .
      </p>

      <form onSubmit={handleDecode}>
        <p>
          <label htmlFor="stgy-input">
            Paste a <code>[stgy:...]</code> code:
          </label>
        </p>
        <p>
          <textarea
            id="stgy-input"
            rows={4}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85em' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={SAMPLE_CODE}
            spellCheck={false}
          />
        </p>
        <p>
          <button type="submit">Decode</button>
        </p>
      </form>

      {error && (
        <p style={errorStyle}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {result && (
        <div>
          <h2>Result</h2>
          <dl>
            <dt>
              <strong>Board name</strong>
            </dt>
            <dd>{result.name || '(empty)'}</dd>
            <dt>
              <strong>Background ID</strong>
            </dt>
            <dd>{result.backgroundId}</dd>
            <dt>
              <strong>Objects</strong>
            </dt>
            <dd>{result.objects.length}</dd>
          </dl>

          {result.objects.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  {[
                    'objectId',
                    'x',
                    'y',
                    'rotation',
                    'size',
                    'r',
                    'g',
                    'b',
                    'opacity',
                    'flags',
                    'params',
                    'text',
                  ].map(col => (
                    <th key={col} style={thStyle}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.objects.map((obj, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{obj.objectId}</td>
                    <td style={tdStyle}>{obj.position.x}</td>
                    <td style={tdStyle}>{obj.position.y}</td>
                    <td style={tdStyle}>{obj.rotation}</td>
                    <td style={tdStyle}>{obj.size}</td>
                    <td style={tdStyle}>{obj.color.r}</td>
                    <td style={tdStyle}>{obj.color.g}</td>
                    <td style={tdStyle}>{obj.color.b}</td>
                    <td style={tdStyle}>{obj.color.opacity}</td>
                    <td style={tdStyle}>
                      {Object.entries(obj.flags)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(', ') || '-'}
                    </td>
                    <td style={tdStyle}>
                      {obj.params.a},{obj.params.b},{obj.params.c}
                    </td>
                    <td style={tdStyle}>{obj.text ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Article>
  )
}

export default FFXIVStrat
