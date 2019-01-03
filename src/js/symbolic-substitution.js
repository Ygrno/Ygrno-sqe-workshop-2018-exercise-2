import {Builder, parseCode_line} from './code-analyzer';
import * as esco from 'escodegen';


let function_exp, above_exp = [], down_exp = [];
let env_global = [];


function Variable_table(variable, value, type){
    this.variable = variable;
    this.value = value;
    this.type = type;
}


function env_getValue(variable,env){
    for(let i = 0 ; i < env.length ; i++){
        if(env[i]['variable'] === variable) return env[i]['value'];
    }
    return null;
}

function env_getType(variable,env){
    for(let i = 0 ; i < env.length ; i++){
        if(env[i]['variable'] === variable) return env[i]['type'];
    }
}

function env_setValue(variable,value,env,type){
    let found = false;
    for(let i = 0 ; i < env.length && !found; i++){
        if(env[i]['variable'] === variable) {
            env[i]['value'] = value;
            found = true;
        }
    }
    if(!found) env.push(new Variable_table(variable,value,type));
}


function SymbolicSubstitute(ParsedCode){
    Clear();
    if(ParsedCode['type'] !== 'Program') return;
    Code_Extractor(ParsedCode);
    Build_Environment();
    return Substitution();
}

function Clear(){
    function_exp = null;
    above_exp = [];
    down_exp = [];
    env_global = [];
}


function CreateSingleExp(exp_string){
    let program = parseCode_line(exp_string);
    let expression = program['body'][0];
    if(expression['type'] === 'ExpressionStatement') {
        return expression['expression'];
    }
}

/**
 * @return {*[]}
 */
function MemberExpression(exp,env){
    let string = esco.generate(exp);
    let to_sub = '';
    let to_stay = '';
    let found = false;
    for(let i = 0; i < string.length ; i++){
        if(string[i] === '[') found = true;
        if(found) to_sub = to_sub + string[i];
        else to_stay = to_stay + string[i];
    }
    let subbed = MakeSubstitution(to_sub,env);
    return [to_stay + subbed,env_getType(to_stay,env)];
}

function UpdateExpression(exp,env){
    let argument = exp['argument'],string = '',temp;
    if(argument['type'] === 'MemberExpression')
    {
        temp = MemberExpression(argument,env);
        string = string + temp[0] + ' = ' + temp[0];
        let operator = exp['operator'];
        if(operator === '++') string = string + ' + 1';
        else string = string + ' - 1';
    }
    else
    {
        temp = esco.generate(argument);
        string = string + temp + ' = ' + temp;
        let operator = exp['operator'];
        if(operator === '++') string = string + ' + 1';
        else string = string + ' - 1';
    }
    return CreateSingleExp(string);
}

function ExpressionHandler(exp,env){
    if(exp['expression']['type'] === 'UpdateExpression') exp['expression'] = UpdateExpression(exp['expression'],env);
    let expression = exp['expression'];
    let left_type = expression['left']['type'];
    let variable,member = null;
    if(left_type !== 'MemberExpression') variable = esco.generate(expression['left']);
    else{
        member = MemberExpression(expression['left'],env);
        variable = member[0];
    }
    let value_string = esco.generate(expression['right']);
    let value_sub_string = MakeSubstitution(value_string, env);
    if(member === null || member[1] === null) env_setValue(variable, value_sub_string, env, 'local');
    else
    {
        env_setValue(variable, value_sub_string, env, member[1]);
        exp['expression']['left'] = CreateSingleExp(variable);
    }
    exp['expression']['right'] = CreateSingleExp(value_sub_string);
}

/**
 * @return {string}
 */
function Parenthesis_handle(value_string,reverse) {
    if(reverse) return value_string.split(' ( ').join('(').split(' ) ').join(')').split(' [ ').join('[').split(' ] ').join(']');
    else return value_string.split('(').join(' ( ').split(')').join(' ) ').split('[').join(' [ ').split(']').join(' ] ');
}

function VD_Subs(vd,env){
    let declarations = vd['declarations'];
    for(let j = 0 ; j < declarations.length ; j++){
        let variable = esco.generate(declarations[j]['id']);
        let value_string;
        if(declarations[j]['init'] != null) value_string = esco.generate(declarations[j]['init']);
        else value_string = 'null';
        let value_sub_string = MakeSubstitution(value_string,env);
        env_setValue(variable,value_sub_string,env,'local');
    }
}


function ReturnSubs(re_exp, env){
    let argument_string = esco.generate(re_exp['argument']);
    let argument_sub_string = MakeSubstitution(argument_string,env);
    re_exp['argument'] = CreateSingleExp(argument_sub_string);
}


const Functions_parser = {
    WhileStatement: WhileSubs,
    IfStatement:IfSubs,
    ReturnStatement: ReturnSubs,
    BlockStatement: BlockSubs
};

function Block_handler(block_body, j,env) {
    if (block_body[j]['type'] === 'VariableDeclaration')
        block_body[j] = null;
    else if (block_body[j]['type'] === 'ExpressionStatement') {
        let expression = block_body[j]['expression'];
        let variable_type = env_getType(esco.generate(expression['left']),env);
        if (variable_type !== undefined && variable_type !== 'parameter') block_body[j] = null;
    }
}

function BlockSubs(exp,env) {
    let block_body = exp['body'];
    for(let j = 0; j < block_body.length; j++){
        GeneralHandler(block_body[j],env);
        Block_handler(block_body, j,env);
    }
    exp['body'] = FixArray(block_body);
}

function GeneralHandler(exp,env){
    let e_type = exp['type'];
    if(e_type === 'ExpressionStatement') {ExpressionHandler(exp,env);}
    else if(e_type === 'VariableDeclaration') {VD_Subs(exp,env);}
    else Functions_parser[e_type](exp,env);
}


function FixArray(array){
    let fixed = [];
    array.map(x => {if(x != null) fixed.push(x);});
    return fixed;
}

function IfSubs(ifExp,env){
    let env_clone = JSON.parse(JSON.stringify(env));
    if(ifExp === null) return;
    else if(ifExp['type'] !== 'IfStatement') return GeneralHandler(ifExp,env_clone);
    let test = ifExp['test'];
    let test_string = esco.generate(test);
    let sub_test_string = MakeSubstitution(test_string,env);
    ifExp['test'] = CreateSingleExp(sub_test_string);
    let consequent = ifExp['consequent'];
    GeneralHandler(consequent,env_clone);
    IfSubs(ifExp['alternate'],env);
}

function WhileSubs(whileExp, env){
    let env_clone = JSON.parse(JSON.stringify(env));
    let test = whileExp['test'];
    let test_string = esco.generate(test);
    let test_string_sub = MakeSubstitution(test_string,env_clone);
    whileExp['test'] = CreateSingleExp(test_string_sub);
    let while_body = whileExp['body'];
    GeneralHandler(while_body,env_clone);
}



function Substitution(){
    let func_clone = JSON.parse(JSON.stringify(function_exp));
    let body_change = func_clone['body'];
    GeneralHandler(body_change,env_global);
    return func_clone;
}

function Code_Extractor(program) {
    let program_body = program['body'];
    let location_state = false;
    for(let i = 0 ; i<program_body.length; i++){
        let type = program_body[i]['type'];
        if(type === 'FunctionDeclaration') {
            function_exp = program_body[i];
            location_state = true;
        }
        else if(location_state) down_exp.push(program_body[i]);
        else above_exp.push(program_body[i]);
    }
}


/**
 * @return {string}
 */
function MakeSubstitution(string,env){
    string = Parenthesis_handle(string,false);
    let split_by_space = string.split(' ');
    let sub_string = '';
    for(let j = 0; j<split_by_space.length; j++){
        let value = env_getValue(split_by_space[j],env);
        if(value !== null && value.length>1) sub_string = sub_string + '(' + value + ')' + ' ';
        else if(value!== null) sub_string = sub_string + value + ' ';
        else sub_string = sub_string + split_by_space[j] + ' ';
    }
    sub_string = sub_string.slice(0,sub_string.length-1);
    sub_string = Parenthesis_handle(sub_string,true);
    return sub_string;
}

function ENV_State_handler(state) {
    let arr = [];
    for (let i = 0; i < state.length; i++) {
        Builder(state[i], arr, 5);
        if(arr[0]['type'] === 'variable declaration' || arr[0]['type'] === 'assignment expression') {
            let value_string;
            value_string = arr[0]['value'].split('(').join(' ( ').split(')').join(' ) ');
            let value_sub = MakeSubstitution(value_string,env_global);
            env_setValue(arr[0]['name'], value_sub,env_global,'global');
        }
        arr = [];
    }
}

function ENV_param(){
    let parameters = function_exp['params'];
    parameters.map(x=> {
        let name = esco.generate(x);
        env_setValue(name,name,env_global,'parameter');
    }
    );
}

function Build_Environment(){
    ENV_State_handler(above_exp);
    ENV_State_handler(down_exp);
    ENV_param();
}

export {SymbolicSubstitute, Variable_table,CreateSingleExp};