(module
(func $main (result f64)
(local $x f64)
(set_local $x (call $foo(f64.const 4)(f64.const 1)))
(call $bar(get_local $x))
)
(func $foo(param $x f64)(param $y f64)  (result f64)
(if (f64.lt (get_local $x)(get_local $y))
(then (set_local 0 (f64.add (get_local $x)(get_local $y))))
(else (set_local 0 (f64.sub (get_local $x)(get_local $y)))))
(get_local 0)
)
(func $bar(param $x f64) (result f64)
(f64.mul (get_local $x)(f64.const 5))
)
(export "main" (func $main))
)