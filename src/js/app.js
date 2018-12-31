import $ from 'jquery';
// import * as esco from 'escodegen';
import {parseCode_line} from './code-analyzer';
import {SymbolicSubstitute} from './symbolic-substitution';
import {EvalStatements} from './eval-statements';


$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputVector = $('#function_input').val();
        let parsedCode = parseCode_line(codeToParse);
        let parsedCode_sym = SymbolicSubstitute(parsedCode);
        // $('#function_input').val(esco.generate(parsedCode_sym));
        let colored_code = EvalStatements(parsedCode_sym,inputVector);
        $('#output').html(colored_code);

    });
});