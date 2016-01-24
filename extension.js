var vscode = require('vscode');
var beautify = require('js-beautify').html;
var beautifier = require('beautifier');

function format(document, range, options) {
  if (range === null) {
    var start = new vscode.Position(0, 0);
    var end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    range = new vscode.Range(start, end);
  }
  var result = [];
  var content = document.getText(range);

  var config = vscode.workspace.getConfiguration("editor");
  var tabSize = config.get("tabSize", "auto");

  var fieldPHP = new Array();
  var stringHTML = content;

  var nextNumber = -1;

  if (stringHTML.indexOf("<?php") > -1 && stringHTML.indexOf("?>") == -1) {
    stringHTML = PHPFormat(stringHTML, tabSize);
  } else {
    while (stringHTML.indexOf("<?php") != -1) {
      nextNumber++;
      var firstBracket = stringHTML.indexOf("<?php");
      var secondBracket = stringHTML.indexOf("?>");
      fieldPHP.push(stringHTML.substring(firstBracket, secondBracket + 2));
      var find = stringHTML.substring(firstBracket, secondBracket + 2);
      stringHTML = stringHTML.replace(find, "//Replace" + nextNumber);
    }

    stringHTML = beautify(stringHTML, { indent_size: tabSize });

    for (var index = 0; index < fieldPHP.length; index++) {
      stringHTML = stringHTML.replace("//Replace" + index, PHPFormat(fieldPHP[index], tabSize));
    }
  }

  if (stringHTML) {
    result.push(new vscode.TextEdit(range, stringHTML));
  }

  return result;
}

function PHPFormat(vst, tabSize) {
  var change1 = vst.replace("<?php", "//firstCH\n");
  var change2 = change1.replace("?>", "//secondCH\n");
  var change3 = change2.replace('["', 'startOfNamedIndex');
  var change4 = change3.replace('"]', "endOfNamedIndex");
  var clear1 = beautifier.js_beautify(change4, { indent_size: tabSize });
  var clear2 = clear1.replace("//firstCH", "<?php");
  var clear3 = clear2.replace("//secondCH", "?>");
  var clear4 = clear3.replace("startOfNamedIndex", '["');
  var clear5 = clear4.replace("endOfNamedIndex", '"]');
  var clear6 = clear5.split(' - > ').join('->');
  var clear7 = clear6.split('= >').join('=>');
  var clear8 = clear7.split('. =').join(' .=');
  var clear9 = clear8.split('< >').join('<>');
  var clear10 = clear9.split('- >').join('->');
  var clear = clear10.replace("\n", " ");
  return clear;
}

function activate(context) {
  context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider('php', {
    provideDocumentFormattingEdits: function (document, options, token) {
      return format(document, null, options);
    }
  }));
  context.subscriptions.push(vscode.languages.registerDocumentRangeFormattingEditProvider('php', {
    provideDocumentRangeFormattingEdits: function (document, range, options, token) {
      var start = new vscode.Position(0, 0);
      var end = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
      return format(document, new vscode.Range(start, end), options);
    }
  }));
}

exports.activate = activate;
