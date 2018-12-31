import * as esco from 'escodegen';
import {Variable_table} from './symbolic-substitution';
import {parseCode_line} from './code-analyzer';


let ParamTable = [];


function param_getValue(variable,env){
    for(let i = 0 ; i < env.length ; i++){
        if(env[i]['variable'] === variable) return env[i]['value'];
    }
    return null;
}


/**
 * @return {string}
 */
function EvalStatements(subbed_func,input_vector){
    Clear();
    CreateParamTable(subbed_func,input_vector);
    subbed_func = ReCreateSubbed(subbed_func);
    let func_string_by_line = (esco.generate(subbed_func)).split('\n');
    TraverseForStatements(subbed_func['body'][0]['body'],func_string_by_line);
    return CreateHtmlCode2(func_string_by_line);
    //return CreateHtmlCode(subbed_func);
}

function ReCreateSubbed(function_tree){
    let string = esco.generate(function_tree);
    return parseCode_line(string);
}


function Clear(){
    ParamTable = [];
}

function CreateParamTable(subbed_func,input_vector){
    let split_by_comma = input_vector.split(',');
    let parameters = subbed_func['params'];
    for(let j = 0; j<parameters.length; j++) ParamTable.push(new Variable_table(esco.generate(parameters[j]),split_by_comma[j],'parameter'));
}

function IfEval(if_exp,string_by_line){
    let test = if_exp['test'];
    let test_string = esco.generate(test);
    test_string = test_string.split('(').join(' ( ').split(')').join(' ) ');
    let test_sub_string = MakeSubstitution(test_string,ParamTable);
    let eval_test = eval(test_sub_string);

    if(eval_test) string_by_line[if_exp['loc']['start']['line']-1] = '<span style="background-color: #37ff00">' + string_by_line[if_exp['loc']['start']['line']-1] + '</span>';
    else string_by_line[if_exp['loc']['start']['line']-1] = '<span style="background-color: #ff000e">' + string_by_line[if_exp['loc']['start']['line']-1] + '</span>';

    let consequent = if_exp['consequent'];
    TraverseForStatements(consequent,string_by_line);

    if(eval_test === false) TraverseForStatements(if_exp['alternate'],string_by_line);
}


function WhileEval(while_exp,string_by_line){
    let test = while_exp['test'];
    let test_string = esco.generate(test);
    test_string = test_string.split('(').join(' ( ').split(')').join(' ) ');
    let test_sub_string = MakeSubstitution(test_string,ParamTable);
    let eval_test = eval(test_sub_string);
    if(eval_test){
        let while_body = while_exp['body'];
        TraverseForStatements(while_body,string_by_line);
    }

}

/**
 * @return {string}
 */
function MakeSubstitution(string,param_table){
    let split_by_space = string.split(' ');
    let sub_string = '';
    for(let j = 0; j<split_by_space.length; j++){
        let value = param_getValue(split_by_space[j],param_table);
        if(value !== null && value.length>1) sub_string = sub_string + '(' + value + ')' + ' ';
        else if(value!== null) sub_string = sub_string + value + ' ';
        else sub_string = sub_string + split_by_space[j] + ' ';
    }
    sub_string = sub_string.slice(0,sub_string.length-1);
    return sub_string;
}

function TraverseForStatements(exp,string_by_line){
    if(exp !== null) {
        let e_type = exp['type'];
        if (e_type === 'BlockStatement') exp['body'].map(x => TraverseForStatements(x,string_by_line));
        else if (e_type === 'IfStatement') IfEval(exp,string_by_line);
        else if (e_type === 'WhileStatement') WhileEval(exp,string_by_line);
    }
}

/**
 * @return {string}
 */
function CreateHtmlCode2(string_by_line){
    let htmlCode = '<pre>';
    for(let i = 0; i<string_by_line.length; i++) {
        htmlCode += string_by_line[i] + '\n';
    }
    return htmlCode + '</pre>';
}


export {EvalStatements};