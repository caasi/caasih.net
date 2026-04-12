import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import { decode } from '../../../lib/ffxiv-strat'
import styles from './index.css'

const SAMPLE_CODE =
  '[stgy:aw5-pKJcyPZdvO9iFpRLn893nGo-dyTe5Q+n0j4D3qpRP+mTCPgl9Jrl+2lu7k03DC9TqqPEQ49zWzew62B+IV6P-eWGEznZp-B+P95K6VaPKAnA9vigQwpCDxxIr5kyCveZJX96gGbNEReJZ3vX-u3iO5l0JfgcyHOdUKonCfuXsSQqdM-qqx8ngqZchxv0vAeF5ETCyyFmONz6YzjTAEHEKLCEZkje]'

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
    <Article className={cx(styles.className, 'playground-ffxiv-strat')}>
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
        <p className={styles.error}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {result && (
        <div>
          <h2>Result</h2>
          <dl>
            <dt><strong>Board name</strong></dt>
            <dd>{result.name || '(empty)'}</dd>
            <dt><strong>Background ID</strong></dt>
            <dd>{result.backgroundId}</dd>
            <dt><strong>Objects</strong></dt>
            <dd>{result.objects.length}</dd>
          </dl>

          {result.objects.length > 0 && (
            <table>
              <thead>
                <tr>
                  {[
                    'objectId', 'x', 'y', 'rotation', 'size',
                    'r', 'g', 'b', 'opacity', 'flags', 'params', 'text',
                  ].map(col => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.objects.map((obj, i) => (
                  <tr key={i}>
                    <td>{obj.objectId}</td>
                    <td>{obj.position.x}</td>
                    <td>{obj.position.y}</td>
                    <td>{obj.rotation}</td>
                    <td>{obj.size}</td>
                    <td>{obj.color.r}</td>
                    <td>{obj.color.g}</td>
                    <td>{obj.color.b}</td>
                    <td>{obj.color.opacity}</td>
                    <td>
                      {Object.entries(obj.flags)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                        .join(', ') || '-'}
                    </td>
                    <td>
                      {obj.params.a},{obj.params.b},{obj.params.c}
                    </td>
                    <td>{obj.text ?? '-'}</td>
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
