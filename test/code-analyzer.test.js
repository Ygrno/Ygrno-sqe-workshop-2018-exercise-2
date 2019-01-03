import assert from 'assert';
import {parseCode, parseCode_line, Builder} from '../src/js/code-analyzer';
import {SymbolicSubstitute,CreateSingleExp} from '../src/js/symbolic-substitution';
import {EvalStatements} from '../src/js/eval-statements';
import * as esco from 'escodegen';


function Test1() {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode_line(''),null,4), '{\n' + '    "type": "Program",\n' + '    "body": [],\n' + '    "sourceType": "script",\n' + '    "loc": {\n' +
            '        "start": {\n' +
            '            "line": 0,\n' +
            '            "column": 0\n' +
            '        },\n' +
            '        "end": {\n' +
            '            "line": 0,\n' +
            '            "column": 0\n' +
            '        }\n' +
            '    }\n' +
            '}'
        );
    });
}

function Test2() {
    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
}

function Test3() {
    it('is parsing the given example correctly', () => {
        let arr = [];
        let codeToParse = 'function binarySearch(X, V, n){\n' + '    let low, high, mid;\n' + '    low = 0;\n' + '    high = n - 1;\n' + '    while (low <= high) {\n' + '        mid = (low + high)/2;\n' + '        if (X < V[mid])\n' + '            high = mid - 1;\n' + '        else if (X > V[mid])\n' + '            low = mid + 1;\n' + '        else\n' + '            return mid;\n' + '    }\n' + '    return -1;\n' + '}';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"binarySearch"},{"line":1,"type":"variable declaration","name":"X"},{"line":1,"type":"variable declaration","name":"V"},{"line":1,"type":"variable declaration","name":"n"},{"line":2,"type":"variable declaration","name":"low","value":"null"},{"line":2,"type":"variable declaration","name":"high","value":"null"},{"line":2,"type":"variable declaration","name":"mid","value":"null"},{"line":3,"type":"assignment expression","name":"low","value":"0"},{"line":4,"type":"assignment expression","name":"high","value":"n - 1"},{"line":5,"type":"while statement","condition":"low <= high"},{"line":6,"type":"assignment expression","name":"mid","value":"(low + high) / 2"},{"line":7,"type":"if statement","condition":"X < V[mid]"},{"line":8,"type":"assignment expression","name":"high","value":"mid - 1"},{"line":9,"type":"else if statement","condition":"X > V[mid]"},{"line":10,"type":"assignment expression","name":"low","value":"mid + 1"},{"line":12,"type":"return statement","value":"mid"},{"line":14,"type":"return statement","value":"-1"}]');
    });
}

function Test4() {
    it('is parsing a simple example correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { let a = 5; }';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"variable declaration","name":"a","value":"5"}]');
    });
}



function Test5() {
    it('isn\'t parsing a code that doesn\'t start with a function', () => {
        let arr = [];
        let codeToParse = 'let a = 5;';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"variable declaration","name":"a","value":"5"}]');
    });
}

function Test6() {
    it('is parsing for-loop correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { for(var i = 0; i<=3 ; i++) {let a = 6;} }';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"for statement","condition":"var i = 0; i <= 3 ; i++"},{"line":1,"type":"variable declaration","name":"a","value":"6"}]');
    });
}

function Test7() {
    it('is parsing while-loop correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { while(a>5) {let a = 6;} }';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"while statement","condition":"a > 5"},{"line":1,"type":"variable declaration","name":"a","value":"6"}]');
    });
}

function Test8() {
    it('is parsing If-Statement correctly', () => {
        let arr = [];
        let codeToParse = 'function BS() { if(a > 7) x=3; else if(a < 3) x=6; else x=7;}';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode['body'][0], arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"BS"},{"line":1,"type":"if statement","condition":"a > 7"},{"line":1,"type":"assignment expression","name":"x","value":"3"},{"line":1,"type":"else if statement","condition":"a < 3"},{"line":1,"type":"assignment expression","name":"x","value":"6"},{"line":1,"type":"assignment expression","name":"x","value":"7"}]');
    });
}

function Test12() {
    it('is parsing If-Statement correctly', () => {
        let arr = [];
        let codeToParse = 'function A(){\n' + 'if(x>5) y++;\n' + '}';
        let parsedCode = parseCode_line(codeToParse);
        Builder(parsedCode, arr,5);
        assert.equal(JSON.stringify(arr), '[{"line":1,"type":"function declaration","name":"A"},{"line":2,"type":"if statement","condition":"x > 5"},{"line":2,"type":"update expression","name":"y","value":"y++"}]');
    });
}


function Test9() {
    it('is converting Binary-Expression to string correctly', () => {
        let codeToParse = 'n+1';
        let parsedCode = parseCode_line(codeToParse);
        let str = esco.generate(parsedCode['body'][0]['expression']);
        assert.equal(str,'n + 1');
    });
}

function Test10() {
    it('is converting Binary-Expression2 to string correctly', () => {
        let codeToParse = 'n+m';
        let parsedCode = parseCode_line(codeToParse);
        let str = esco.generate(parsedCode['body'][0]['expression']);
        assert.equal(str,'n + m');
    });
}

function Test11(){
    it('is converting variable declaration to string correctly', () => {
        let codeToParse = 'let low, high, end = 0;';
        let parsedCode = parseCode_line(codeToParse);
        let str = esco.generate(parsedCode['body'][0]);
        assert.equal(str,'let low, high, end = 0;');
    });
}

function Test13(){
    it('Test 13', () => {
        let codeToParse = 'function foo(x, y, z){\n' + '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '        return x + y + z + c;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '        return x + y + z + c;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '        return x + y + z + c;\n' + '    }\n' + '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let substitue_string = esco.generate(SymbolicSubstitute(parsedCode));
        assert.equal(substitue_string,'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + (0 + 5);\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x + 5);\n    } else {\n        return x + y + z + (0 + z + 5);\n    }\n}');
    });
}

function Test14(){
    it('Test 14', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let substitue_string = esco.generate(SymbolicSubstitute(parsedCode));
        assert.equal(substitue_string,'function foo(x, y, z) {\n    while (x + 1 < z) {\n        z = (x + 1 + (x + 1 + y)) * 2;\n    }\n    return z;\n}');
    });
}

function Test15(){
    it('Test 15', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if(b < a) y = x + a + c - 8;' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let substitue_string = esco.generate(SymbolicSubstitute(parsedCode));
        assert.equal(substitue_string,'function foo(x, y, z) {\n    if (x + 1 + y < x + 1)\n        y = x + (x + 1) + 0 - 8;\n    while (x + 1 < z) {\n        z = (x + 1 + (x + 1 + y)) * 2;\n    }\n    return z;\n}');
    });
}

function Test20(){
    it('Test 20', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if(b < a) y = x + a + c - 8;' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let substitue_string = SymbolicSubstitute(parsedCode['body']);
        assert.equal(substitue_string,undefined);
    });
}

function Test21(){
    it('Test 21', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if(b < a) y = x + a + c - 8;' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let substitue_string = CreateSingleExp(codeToParse);
        assert.equal(substitue_string,undefined);
    });
}

function Test22(){
    it('Test 22', () => {
        let codeToParse = 'let h = 5;\n' + 'function foo(x, y, z){\n' + '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '        return x + y + z + c;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '        return x + y + z + c;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '        return x + y + z + c;\n' + '    }\n' + '}\n' + 'let k = 8;';
        let parsedCode = parseCode_line(codeToParse);
        let substitue_string = esco.generate(SymbolicSubstitute(parsedCode));
        assert.equal(substitue_string,'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + (0 + 5);\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x + 5);\n    } else {\n        return x + y + z + (0 + z + 5);\n    }\n}');
    });
}

function Test23(){
    it('Test 23', () => {
        let codeToParse = 'let h = 5;\n' + 'while(h > 8) h--;\n' + 'function foo(x, y, z){\n' + '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '        return x + y + z + c;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '        return x + y + z + c;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '        return x + y + z + c;\n' + '    }\n' + '}\n' + 'let k = 8;';
        let parsedCode = parseCode_line(codeToParse);
        let substitue_string = esco.generate(SymbolicSubstitute(parsedCode));
        assert.equal(substitue_string,'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + (0 + 5);\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x + 5);\n    } else {\n        return x + y + z + (0 + z + 5);\n    }\n}');
    });
}

function Test16(){
    it('Test 16', () => {
        let codeToParse = 'function foo(x, y, z){\n' + '    let a = x + 1;\n' + '    let b = a + y;\n' + '    let c = 0;\n' + '    \n' + '    if (b < z) {\n' + '        c = c + 5;\n' + '        return x + y + z + c;\n' + '    } else if (b < z * 2) {\n' + '        c = c + x + 5;\n' + '        return x + y + z + c;\n' + '    } else {\n' + '        c = c + z + 5;\n' + '        return x + y + z + c;\n' + '    }\n' + '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'1, 2, 3');
        assert.equal(html_string,'<pre>function foo(x, y, z) {\n' + '<span style="background-color: #ff000e">    if (x + 1 + y < z) {</span>\n' + '        return x + y + z + (0 + 5);\n' + '<span style="background-color: #37ff00">    } else if (x + 1 + y < z * 2) {</span>\n' + '        return x + y + z + (0 + x + 5);\n' + '    } else {\n' + '        return x + y + z + (0 + z + 5);\n' + '    }\n' + '}\n' + '</pre>');
    });
}

function Test17(){
    it('Test 17', () => {
        let codeToParse = 'function foo(x, y, z){\n' +
            '    let a = x + 1;\n' +
            '    let b = a + y;\n' +
            '    let c = 0;\n' +
            '    \n' +
            '    if(b < a) y = x + a + c - 8;' +
            '    while (a < z) {\n' +
            '        c = a + b;\n' +
            '        z = c * 2;\n' +
            '    }\n' +
            '    \n' +
            '    return z;\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'0, 1, 7');
        assert.equal(html_string,'<pre>function foo(x, y, z) {\n' + '<span style="background-color: #ff000e">    if (x + 1 + y < x + 1)</span>\n' + '        y = x + (x + 1) + 0 - 8;\n' + '    while (x + 1 < z) {\n' + '        z = (x + 1 + (x + 1 + y)) * 2;\n' + '    }\n' + '    return z;\n' + '}\n' + '</pre>');
    });
}

function Test18(){
    it('Test 18', () => {
        assert.equal(eval('2 + 5'),7);
    });
}

function Test19(){
    it('Test 19', () => {
        let codeToParse = 'function foo(x){\n' +
            '    if (x === 5) {\n' +
            '        c = c + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else if (x < 5) {\n' +
            '        c = c + x + 5;\n' +
            '        return x + y + z + c;\n' +
            '    } else {\n' +
            '        c = c + z + 5;\n' +
            '        return x + y + z + c;\n' +
            '    }\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'5');
        assert.equal(html_string,'<pre>function foo(x) {\n' + '<span style="background-color: #37ff00">    if (x === 5) {</span>\n' + '        return x + y + z + (c + 5);\n' + '    } else if (x < 5) {\n' + '        return x + y + z + (c + x + 5);\n' + '    } else {\n' + '        return x + y + z + (c + z + 5);\n' + '    }\n' + '}\n' + '</pre>');
    });
}

function Test24(){
    it('Test 24', () => {
        let codeToParse = 'function foo(x){if(x == 5) return x;}';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'5');
        assert.equal(html_string,'<pre>function foo(x) {\n' + '<span style="background-color: #37ff00">    if (x == 5)</span>\n' + '        return x;\n' + '}\n' + '</pre>');
    });
}

function Test25(){
    it('Test 25', () => {
        let codeToParse = 'function foo(x){\n' +
            '    if (x == 7) {\n' +
            '        return x;\n' +
            '    } else if (x == 8) {\n' +
            '        return x;\n' +
            '    } else {\n' +
            '        return x;\n' +
            '    }\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'5');
        assert.equal(html_string,'<pre>function foo(x) {\n<span style="background-color: #ff000e">    if (x == 7) {</span>\n        return x;\n<span style="background-color: #ff000e">    } else if (x == 8) {</span>\n<span style="background-color: #37ff00">        return x;</span>\n    } else {\n        return x;\n    }\n}\n</pre>');
    });
}

function Test26(){
    it('Test 26', () => {
        let codeToParse = 'function foo(x){\n' +
            '    if (x === 5) {\n' +
            'if(x === 5) {\n' +
            'if(x === 7) return x;\n' +
            'else if(x === 5) return x;\n' +
            'else if(x === 8) return x;\n' +
            'else return x;\n' +
            '}\n' +
            '}\n' +
            '}\n';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'5');
        assert.equal(html_string,'<pre>function foo(x) {\n' + '<span style="background-color: #37ff00">    if (x === 5) {</span>\n' + '<span style="background-color: #37ff00">        if (x === 5) {</span>\n' + '<span style="background-color: #ff000e">            if (x === 7)</span>\n' + '                return x;\n' + '<span style="background-color: #37ff00">            else if (x === 5)</span>\n' + '                return x;\n' + '            else if (x === 8)\n' + '                return x;\n' + '            else\n' + '                return x;\n' + '        }\n' + '    }\n' + '}\n' + '</pre>');
    });
}

function Test27(){
    it('Test 27', () => {
        let codeToParse = 'function A(x){\n' +
            'let b = x + 1;\n' +
            'let c = b * b + 2;\n' +
            '\n' +
            'while(b > 1){\n' +
            'if(c > b) return x;\n' +
            '\n' +
            '}\n' +
            '\n' +
            '}';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'0');
        assert.equal(html_string,'<pre>function A(x) {\n    while (x + 1 > 1) {\n        if ((x + 1) * (x + 1) + 2 > x + 1)\n            return x;\n    }\n}\n</pre>');
    });
}

function Test28(){
    it('Test 28', () => {
        let codeToParse = 'function A(x,y){\n' +
            'let a;\n' +
            '\n' +
            'if(x > y) y = x;\n' +
            'else if (x < y) x = y;\n' +
            '\n' +
            '}';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'1,2');
        assert.equal(html_string,'<pre>function A(x, y) {\n<span style="background-color: #ff000e">    if (x > y)</span>\n        y = x;\n<span style="background-color: #37ff00">    else if (x < y)</span>\n        x = y;\n}\n</pre>');
    });
}

function Test29(){
    it('Test 29', () => {
        let codeToParse = 'let b;\n' +
            'function A(x,y){\n' +
            'let a;\n' +
            '\n' +
            'if(x > y) y = x;\n' +
            'else if (x < y) x = y;\n' +
            '\n' +
            '}';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'1,2');
        assert.equal(html_string,'<pre>function A(x, y) {\n<span style="background-color: #ff000e">    if (x > y)</span>\n        y = x;\n<span style="background-color: #37ff00">    else if (x < y)</span>\n        x = y;\n}\n</pre>');
    });
}

function Test30(){
    it('Test 30', () => {
        let codeToParse = 'function A(x){\n' + 'let i = 2;\n' + 'let b = x[i];\n' + 'let i = 0;\n' + 'while(i < x.length){\n' + 'if(b > x[i]) {\n' + 'x[i] = x[i] + 1;\n' + 'return x;\n' + '}\n' + 'else x[i] = x[i] - 1;\n' + '}\n' + 'b++;\n' + 'return b + x[1];\n' + '}';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'[1,2,3],true,"string"');
        assert.equal(html_string,'<pre>function A(x) {\n    while (0 < x.length) {\n<span style="background-color: #37ff00">        if (x[2] > x[0]) {</span>\n            x[0] = x[0] + 1;\n            return x;\n        } else\n            x[0] = x[0] - 1;\n    }\n    return x[2] + 1 + x[1];\n}\n</pre>');
    });
}

function Test31(){
    it('Test 31', () => {
        let codeToParse = 'function A(x){\n' + 'let a = x[2];\n' + 'x[0]--;\n' + 'x[0]++;\n' + 'a--;\n' + 'a++;\n' + 'return a + x[1];\n' + '}';
        let parsedCode = parseCode_line(codeToParse);
        let html_string = EvalStatements(SymbolicSubstitute(parsedCode),'[1,2,3],true,"string"');
        assert.equal(html_string,'<pre>function A(x) {\n    x[0] = x[0] - 1;\n    x[0] = x[0] + 1;\n    return x[2] - 1 + 1 + x[1];\n}\n</pre>');
    });
}




describe('The javascript parser', () => {
    Test1();
    Test2();
});

describe('Html table parser', ()=> {
    Test3();
    Test4();
    Test5();
    Test6();
    Test7();
    Test8();
    Test12();
});

describe('Expression to String', ()=> {
    Test9();
    Test10();
    Test11();
});

describe('symbolic substitution', ()=> {
    Test13();
    Test14();
    Test15();
    Test20();
    Test21();
    Test22();
    Test23();
});

describe('Colored Html Code', ()=> {
    Test16();
    Test17();
    Test18();
    Test19();
    Test24();
    Test25();
    Test26();
    Test27();
    Test28();
    Test29();
    Test30();
    Test31();
});
