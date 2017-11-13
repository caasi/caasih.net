## 附錄： C 的 `Parse.hs`

以下程式按閱讀順序重新編排過。

從 Main.hs 來看，該從 `getAllModules` ，還有 `prettyPrintAllModules` 看起。 `getAllModules` 在做的是，從給定的檔案內容中取得 Module 名稱與所 imports 的其他 Modules 名稱，再存到 Map 中。

一直留著 `ParseResult` ，猜想是把它當 `Maybe` 用了。

```Haskell
getAllModules :: String -> IO (ParseResult (M.Map String (Module SrcSpanInfo)))
getAllModules src =
  case parseModule src of
    ParseFailed loc msg -> return $ ParseFailed loc msg
    ParseOk mod -> do
      let
        modName = case mod of
          Module _ Nothing _ _ _ -> "Main"
          Module _ (Just (ModuleHead _ (ModuleName _ modName) _ _)) _ _ _ -> modName

        imports = moduleImports mod

      addMoreModules (M.singleton modName mod) imports
```

存到 Map 中的工作，由 `addMoreModules` 完成。有趣的是，在 Haskell 中打兩次 `M.Map String (Module SrcSpanInfo)` 不是什麼問題，但 Java 中就會想用一個 `<T>` 解決就好。

```Haskell
addMoreModules :: M.Map String (Module SrcSpanInfo) -> [String] -> IO (ParseResult (M.Map String (Module SrcSpanInfo)))
addMoreModules = go where
  -- 覺得常見的 `go acc []` 和 `go acc (m : ms)` 這種 local 遞迴用起來很像
  -- reduce/fold ，不知道作者是怎麼看的？
  go acc [] = return $ pure acc
  go acc (m : ms)
    | M.member m acc = go acc ms -- 已經 import  過了
    | m == "Prelude" = go acc ms -- 略過 Prelude
    | otherwise = do
      res <- getModule m
      case res of
        ParseFailed loc msg -> return (ParseFailed loc{srcFilename = m} msg)
        -- insert 後的 Map 變成下一次 go 的 acc 。 moduleImports 則從 mod 中取得
        -- 更多的 module names ，交給下次的 go 。
        ParseOk mod -> go (M.insert m mod acc) (moduleImports mod ++ ms)
```

`moduleImports` 把 `[ImportDecl l]` 中的 module 一個個拆出來。

```Haskell
moduleImports :: Module l -> [String]
-- Module 長這樣：
--   Module l (Maybe (ModuleHead l)) [ModulePragma l] [ImportDecl l] [Decl l]
-- 這裡只留下 [ImportDecl l]
moduleImports (Module _ _ _ imports _) = map takeOne imports where
  takeOne imp = case importModule imp of
    ModuleName _ modName -> modName

-- getModule 是包裝好的 parseModule
-- 原來 Control.Exception 用在這裡！
getModule :: String -> IO (ParseResult (Module SrcSpanInfo))
getModule modName = do
  let filename = modNameToPath modName
  catch
    ( do
      src <- readFile filename
      return (parseModule src)
    )
    (\e -> return $ ParseFailed (SrcLoc filename 0 0) (show (e :: SomeException)))
```

`modNameToPath` 用到 `System.FilePath` 中的 `extSeparator` 和 `pathSeparator` ，好在不同的平台上生出可以用的 filepath 。

```Haskell
modNameToPath :: String -> FilePath
modNameToPath = go where
  go [] = extSeparator : "hs"
  go ('.' : ns) = pathSeparator : go ns
  go (n : ns) = n : go ns
```

最後 `prettyPrintAllModules` 把放在 `Map` 裡的 module 都印出來。

```Haskell
prettyPrintAllModules :: M.Map String (Module SrcSpanInfo) -> IO ()
prettyPrintAllModules = go . M.toAscList where
  go [] = return ()
  go ((modName, mod) : ms) = do
    putStrLn $ modName ++ ":"
    putStrLn $ prettyPrint mod
    putStrLn ""
    go ms
```

---

> 探しものは何ですか？見つけにくいものですか？
