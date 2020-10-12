  module.exports = grammar({
  name: 'MCore',

  extras: $ => [
    /\s/,
    $.comment
  ],

  word: $ => $._lc_ident,

  word: $ => $._uc_ident,

  rules: {
    program: $ => seq(
      optional($.includes),
      // $.tops,
      optional($.mexpr)
    ),

    comment: $ => token(choice(
      seq('//', /(\\(.|\r?\n)|[^\\\n])*/),
      seq('--', /(\\(.|\r?\n)|[^\\\n])*/),
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),

    include: $ => seq(
      'include',
      $.string
    ),

    includes: $ => repeat1(
      $.include
    ),

    //
    // tops: $ => repeat(
    //
    // ),

    mexpr: $ => seq(
      'mexpr',
      $._mexpr
    ),

    _mexpr: $ => choice(
      $._left,
      $.type_decl_in,
      $.type_alias_in,
      $.lam,
      $.let_in,
      $.rec_lets_in,
      $.if_then_else,
      $.con_in,
      $.utest_in
    ),

    _left: $ => choice(
      $._atom,
      $.app
    ),

    _atom: $ => choice(
      $.proj,
      $.var,
      $.string,
      $.char,
      $.int,
      $.float,
      $.bool,
      $.never,
      $.tuple,
      $.seq,
      $.record,
      $.record_update
    ),

    app: $ => seq(
      $._left,
      $._atom
    ),

    proj: $ => seq($._atom, ".", $.proj_label),

    _type_decl: $ => seq("type", $.type_ident),
    type_decl_in: $ => seq($._type_decl, "in"),

    _type_alias: $ => seq($._type_decl, "=", $._type),
    type_alias_in: $ => seq($._type_alias, "in"),

    var: $ => $._var_ident,

    binding: $ => seq($.var_ident, optional(seq( ':', $.type_ident ))),

    lam: $ => seq('lam', $.binding, '.', $._mexpr),

    _let: $ => seq('let', $.binding, '=', $._mexpr),
    let: $ => $._let,
    let_in: $ => seq($._let, 'in', $._mexpr),

    rec_lets_in: $ => seq('recursive', repeat1($.let), 'in', $._mexpr),

    if_then_else: $ => seq('if', $._mexpr, 'then', $._mexpr, 'else', $._mexpr),

    _con: $ => seq('con', $.con_ident, optional(seq(':', $._type))),
    con: $ => $._con,
    con_in: $ => seq($._con, 'in'),

    _utest: $ => seq(
      'utest', $._mexpr, 'with', $._mexpr, optional(seq('using', $._mexpr))
    ),
    utest: $ => $._utest,
    utest_in: $ => seq($._utest, 'in'),

    string: $ => token(seq(
      '"',
      repeat(/[^\\"]/),
      '"'
    )),

    char: $ => token(seq(
      "'",
      /[^\\']/,
      "'"
    )),

    float: $ => token(
      seq(
        /[0-9]\./,
        choice(
          repeat(/[0-9]/),
          seq(/E-[0-9]/, repeat(/[0-9]/)
        )
      )
    )),

    _int: $ => token(repeat1(
      /[0-9]/
    )),
    int: $ => $._int,

    bool: $ => choice('true', 'false'),

    never: $ => 'never',

    proj_label: $ => choice($._int, $._label_ident),

    tuple: $ => seq("(", commaSep($._mexpr), ")"),

    seq: $ => seq("[", commaSep($._mexpr), "]"),

    label: $ => seq($.label_ident, "=", $._mexpr),

    record: $ => seq("{", commaSep($.label), "}"),

    record_update: $ => seq("{", $._mexpr, "with", $.label, "}"),

    _type_left: $=> choice(
      $._type_atom,
      $.type_app
    ),

    type_app: $ => seq($._type_left, $._type_atom),

    _type: $ => choice(
      $._type_left,
      $.type_arrow
    ),

    type_arrow: $ => seq($._type_left, "->", $._type),

    _type_atom: $ => choice(
      $.type_unit,
      $._type_in_parens,
      $.type_ident,
      $.type_tuple,
      $.type_list,
      $.type_record
    ),

    type_unit: $ => seq("(",")"),
    _type_in_parens: $ => seq("(", $._type, ")"),
    type_tuple: $ => seq("(", commaSep2($._type), ")"),
    type_list: $ => seq("[", $._type, "]"),
    type_record_elm: $ => seq($.label_ident, ":", $._type),
    type_record: $=> seq("{", commaSep($.type_record_elm), "}"),

    _lc_ident: $ => /[a-z_][a-zA-Z0-9_']*/,
    _uc_ident: $ => /[A-Z][a-zA-Z0-9_']*/,

    _ident: $ => choice(
      $._lc_ident,
      $._uc_ident
    ),

    _var_ident: $ => $._lc_ident,
    var_ident: $ => $._var_ident,

    _type_ident: $ => $._ident,
    type_ident: $ => $._type_ident,

    _label_ident: $ => $._ident,
    label_ident: $ => $._label_ident,

    _con_ident: $ => $._ident,
    con_ident: $ => $._con_ident
  }
});

function sep2(sep, rule) {
  return seq(rule, repeat1(seq(sep, rule)));
}

function sep1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

function sep(sep, rule) {
  return optional(sep1(sep, rule));
}

function commaSep(rule) {
  return sep(',', rule);
}

function commaSep1(rule) {
  return sep1(',', rule);
}

function commaSep2(rule) {
  return sep2(',', rule)
}
