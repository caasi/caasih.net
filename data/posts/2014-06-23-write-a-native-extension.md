c9s 前輩在 5 月 12 號開始寫一個叫做 [r3][0] ，飛快的 url router 。隨後掀起了幫 r3 寫不同語言 binding 的熱潮。到今天（ 6 月 23 日）已經有 Perl, Python, Haskell, Vala, node.js 版，甚至還有個叫做 [pathing][1] ，受 r3 啟發，純 JavaScript 的實作。

5 月 22 日，自己推坑自己，寫 node.js binding ：

> 19:43:51 \<caasihuang> 意圖使人學寫 node extension...

隨即被 au 大長輩推坑 nan ，

> 19:54:33 \<au> 趁 nan 推出新版，現在學正是時候 XD

幾天後又推這個 issue [node-webworker-threads#16][2] ，沒想到還真的解了。

> 18:42:02 \<au> 搞清楚了教我 XD https://github.com/audreyt/node-webworker-threads/issues/16 懸而未決久矣

（沒能力教啊，誠惶誠恐，只好發願寫文章分享）

途中感謝 au, c9s, C, godfat 等人協助， happy hacking XD

這篇心得將分成兩部份，前面講講怎麼用 nan 寫 node extension ，後面講講為啥在 node 0.11.x 寫 extension 那麼éº»煩。

[0]: https://github.com/c9s/r3 "libr3 is a high-performance URL router library."
[1]: https://github.com/fundon/pathing "A fast path lexer"
[2]: https://github.com/audreyt/node-webworker-threads/issues/16 "Support for Node 0.11.x"

## node-libr3

以前就聽說可以用 C/C++ 寫 node extension ，但除了過去在學校的日子外，很久很久沒寫 C/C++ ，加上自己算不上是個好 C programmer ，一直將這塊當成黑魔法。

r3 的 APIs 可以說是靠 C 寫 OO ，例如 `r3_tree_create` 和 `r3_tree_free` 負責處理 struct 的生成跟消滅， `r3_tree_*` 則用來操作 struct 。所以一開始想把 C functions 和 JavaScript functions 一一對應，那時還不知道 [node-ffi][3] 的存在，只好硬幹。

[3]: https://github.com/rbranson/node-ffi "Node.js Foreign Function Interface"

### Handle\<T>, Local\<T> and Persistent\<T>

HandleScope 是用來管理 Handle ，是 JS 值的容器，分兩種， Local\<T> 和 Persistent\<T> ，前者跟 HandleScope 共患難，後者會跟 gc 配合，得由開發者管理生命週期，詳見 [Google 的說明][4] 。

如果只單純將 C 和 JavaScript 對應起來，那最大的問題是：「我該什麼時候呼叫 r3_tree_free 呢？」，在 JS 這邊並沒有 destructor ，而 GC 又不被控制。沒辦法只好放棄一一對應，在 C++ 那邊處理這些事情。

[4]: https://developers.google.com/v8/embed "Embedder's Guide"

### JS 與 C++ ，兩種不同的 OOP paradigm

JS 並沒有 class ，每個 instance 以一個 function 作為 constructor 生成，新的 instance 經過 constructor 把值設定好。在 C/C++ 世界為了配合這點，至少得產生 `ObjectTemplate` 再生出 `Object` 想知道更多資訊，請見 [這篇文章][5] ，還提到了 `FunctionTemplate` 。

```C++
// nan 把 function 的 arguments 包起來了。
NAN_METHOD(treeConstructor) {
    if (!args.IsConstructCall()) {
        NanThrowError("Cannot call Tree constructor as function");
    }

    // nan 把 isolate 還有 handle_scope 也包起來了。
    NanScope();

    // 生出非 V8 的 instance 。
    int capacity = args[0]->Uint32Value();
    r3::node *n = r3::r3_tree_create(capacity);
    //std::cout << "r3_tree_create(" << capacity << ");" << std::endl;

    // 設計好可以放一個東西的 Object 。
    Handle<ObjectTemplate> tree_template = ObjectTemplate::New();
    tree_template->SetInternalFieldCount(1);

    // 生出該 Object ，把非 V8 的 node pointer 放進去。
    Local<Object> instance = tree_template->NewInstance();
    instance->SetInternalField(0, NanNew<External>(n));
    // 把 methods 接上去，可以說是：
    // this.insert = [C function];
    // 這樣吧。
    instance->Set(NanNew<String>("insert"),
                  NanNew<FunctionTemplate>(treeInsertPath)->GetFunction());
    instance->Set(NanNew<String>("insertRoute"),
                  NanNew<FunctionTemplate>(treeInsertRoute)->GetFunction());
    instance->Set(NanNew<String>("compile"),
                  NanNew<FunctionTemplate>(treeCompile)->GetFunction());
    instance->Set(NanNew<String>("match"),
                  NanNew<FunctionTemplate>(treeMatch)->GetFunction());
    instance->Set(NanNew<String>("matchRoute"),
                  NanNew<FunctionTemplate>(treeMatchRoute)->GetFunction());

    // 這個是被 nan 包裝起來，產生 weak persistent 的方法，下一段再好好說明。
    NanMakeWeakPersistent(instance, n, &treeCleanUp);

    // nan 把 handle_scope.Close() 也包起來了。
    NanReturnValue(instance);
}
```

[5]: http://create.tpsitulsa.com/blog/2009/01/29/v8-objects/ "V8 Objects"

### 什麼時候該 free/delete

Persistent\<T> 有個方便的功能，開發者可以把一個 persistent 容器設為 weak ，當 GC 發現這個容器除了該 weak 參考外，沒別人參考它時，會觸發 callback ，讓開發者決定要不要消滅它。

```C++
// object 是將被清掉的值， parameter 則是在將一個 persistent 容器設為 weak 時提供的值，
// 要放啥都可以（void *），這邊用來傳遞該被刪除的 r3 node pointer 。
void cleanUp(Persistent<Value> object, void *parameter) {
    std::cout << "r3_tree_free() " << std::endl;

    r3::node *n = static_cast<r3::node *>(parameter);
    r3::r3_tree_free(n);

    object.Dispose();
    object.Clear();
}

NAN_METHOD(constructor) {
    if (!args.IsConstructCall()) {
        return ThrowException(String::New("Cannot call constructor as function"));
    }

    NanScope();

    int capacity = args[0]->Uint32Value();
    r3::node *n = r3::r3_tree_create(capacity);
    std::cout << "r3_tree_create(" << capacity << ");" << std::endl;

    Handle<ObjectTemplate> r3_template = ObjectTemplate::New();
    r3_template->SetInternalFieldCount(1);

    Persistent<External> external_n = Persistent<External>::New(External::New(n));
    // 第一個參數會變成 cleanUp 的 parameter 。
    external_n.MakeWeak(n, cleanUp);

    // 把包著 r3 node pointer 的容器存起來給別的 method 用。
    Local<Object> instance = r3_template->NewInstance();
    instance->SetInternalField(0, external_n);

    NanReturnValue(instance);
}
```

Persistent::MakeWeak 那部份可以看出不經過 nan 要寫 extension 也不複雜，但 node 0.11.13 剛好遇到 v8 升級，許多 APIs 都變了，靠 nan 幫忙做掉這些問題會比自己手動升級輕鬆。
