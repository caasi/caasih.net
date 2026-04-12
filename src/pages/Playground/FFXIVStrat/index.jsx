import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import cx from 'classnames'
import Article from 'components/Article'
import SourceCode from 'components/SourceCode'
import { decode } from '../../../lib/ffxiv-strat'
import styles from './index.css'

const SAMPLE_CODE =
  '[stgy:aw5-pKJcyPZdvO9iFpRLn893nGo-dyTe5Q+n0j4D3qpRP+mTCPgl9Jrl+2lu7k03DC9TqqPEQ49zWzew62B+IV6P-eWGEznZp-B+P95K6VaPKAnA9vigQwpCDxxIr5kyCveZJX96gGbNEReJZ3vX-u3iO5l0JfgcyHOdUKonCfuXsSQqdM-qqx8ngqZchxv0vAeF5ETCyyFmONz6YzjTAEHEKLCEZkje]'

function FFXIVStrat() {
  const [input, setInput] = useState(SAMPLE_CODE)

  const { result, error } = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return { result: null, error: null }
    try {
      return { result: decode(trimmed), error: null }
    } catch (err) {
      return { result: null, error: err instanceof Error ? err.message : String(err) }
    }
  }, [input])

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

      {error && (
        <p className={styles.error}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {result && (
        <SourceCode open language="json" label="decoded">
          {JSON.stringify(result, null, 2)}
        </SourceCode>
      )}
    </Article>
  )
}

export default FFXIVStrat
