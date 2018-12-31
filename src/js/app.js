import $ from 'jquery';
import * as esco from 'escodegen';
import {parseCode_line} from './code-analyzer';
import {SymbolicSubstitute} from './symbolic-substitution';
import {EvalStatements} from './eval-statements';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let InputTextField = $('#function_input');
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = InputTextField.val();
        let parsedCode = parseCode_line(codeToParse);
        let parsedCode_sym = SymbolicSubstitute(parsedCode);
        let colored_code = EvalStatements(parsedCode_sym,inputVector);
        InputTextField.val(esco.generate(parsedCode_sym));
        $('#output').html(colored_code);
    });
});