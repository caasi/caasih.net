<small>This article was composed with the assistance of Claude.</small>

<small>This is a response to roriri's [React 带来的生死疲劳](https://roriri.one/2026/04/12/what-a-react), which critiques React's evolution from a broader architectural and ecosystem perspective. This article focuses on a specific technical claim.</small>

Dan Abramov claimed on [Bluesky](https://bsky.app/profile/danabra.mov/post/3m2w5xftcfk2g) and Reddit that "React is basically Haskell," comparing React Compiler optimizations to pure functional language compilers and the `use-` prefix to Haskell's `do` notation.

## Why the analogy is wrong

**`use` is not `do` notation.** Haskell's `do` notation desugars into `>>=` chains and works with any type implementing the `Monad` typeclass (`return` + `>>=`). React's `use` is hardcoded to Promise and React Context only. You cannot make an arbitrary monadic data structure work with `use`. There is no parametric polymorphism over a monadic interface — `use` is specialized syntax sugar, not a general monadic abstraction.

**What React actually does is CPS transformation** — throw promise, catch, replay. This is fundamentally different from Haskell's compile-time desugaring.

**Haskell optimizations work because monadic code is data.** `IO a` is a description of effects (an action list), not direct execution. Because it's data, the compiler can inspect, reorder, fuse, and eliminate before execution.

Concrete example — **map fusion** via GHC [RULES pragma](https://wiki.haskell.org/GHC/Using_rules):

```haskell
{-# RULES "treeMap/treeMap" forall f g t.
  treeMap f (treeMap g t) = treeMap (f . g) t #-}
```

And **foldr/build short cut fusion** (deforestation):

```haskell
foldr k z (build g) = g k z
-- build produces a list, foldr consumes it
-- when composed, the intermediate list vanishes entirely
```

`foldr (+) 0 [1..10]` fuses into an imperative loop with zero list allocation. This works because lists are data and `build`/`foldr` semantics are guaranteed by the type system.

**React hooks are not data.** `useState`, `useEffect` execute directly during render — they're not collected into a manipulable action list. So React Compiler must do purity inference via metaprogramming on the JavaScript AST, a language with no purity guarantees. That's why it's so fragile (break "rules of React" and analysis falls apart).

If they're already doing compiler-level metaprogramming, it would be more honest to implement **one-shot delimited continuations** in the compiler output — `perform`/`resume` at the codegen level. The capture boundary *is* the effect boundary, no linter rules needed.

## History: Sebastian Markbage's algebraic effects proposal (2016)

Sebastian proposed [one-shot delimited continuations with effect handlers](https://esdiscuss.org/topic/one-shot-delimited-continuations-with-effect-handlers) for ECMAScript, inspired by OCaml multicore. Core idea: `perform` (like `throw` but captures a continuation) + `catch effect` handler.

TC39 rejected it, mainly on philosophical grounds:

- JS community prefers **explicit over implicit** — `await`/`yield` make async visible; implicit suspension points seen as Java's mistake
- Preference for composing existing primitives (async/await, generators)
- No consensus that nested effect handlers are truly "unmanageable"
- Use case deemed unconvincing (someone wrote a 12-line async/await alternative)

After React Hooks shipped in 2018, someone returned to the thread pointing out Hooks are a hacky implementation of algebraic effects — citing Dan Abramov's own admission that algebraic effects would let Hooks be implemented "the pure way."

## The asymmetric harm of leaky abstractions

Beyond the technical inaccuracy, the analogy causes real pedagogical harm — but only where it's invisible to the people making the analogy. I asked a former Amazon engineer about this; he didn't see the problem, almost found the question silly. That's exactly the asymmetry.

At tier-1 companies (Meta, Vercel), broken abstractions are rough edges — they have internal education, code review culture, and senior engineer density. In local Asian companies:

- Junior frontend training is "learn the framework, ship features" — side effects and purity are not on the curriculum
- React's abstractions leak (`use` only works with Promise/Context, rules of hooks enforced by linter not type system), so juniors can't debug from principles — they memorize rules
- Memorized rules without understanding → **cargo cult**: "don't use hooks in if blocks" not because they understand effect sequence requirements, but because "the docs say so"
- The knowledge that would actually help them grow (effect systems, purity, monadic interfaces) becomes harder to teach because it's entangled with a broken implementation

React used to be a gateway drug to functional programming — pure functions returning UI, immutable state, unidirectional data flow. Simple and clean. Now React (`use`, Suspense, Server Components) assumes you already understand the FP concepts behind it but gives you no correct abstraction to learn from. Higher barrier, lower educational value.

## Conclusion

The React team always wanted algebraic effects. After TC39 rejected the language-level proposal, they built ad-hoc approximations in userland. Dan saying "React is basically Haskell" is the right vision but the wrong claim — not even a basic effect handler made it into the language. They borrowed Haskell's reputation to legitimize their design without taking responsibility for getting the abstraction right.
