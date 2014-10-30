/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension that lets you add file type mappings to languages */
define(function (require, exports, module) {
    "use strict";

    var LanguageManager = brackets.getModule("language/LanguageManager");
    var Editor = brackets.getModule("editor/Editor").Editor;
    // Support for Brackets Sprint 38+ : https://github.com/adobe/brackets/wiki/Brackets-CodeMirror-v4-Migration-Guide
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");
    var lexer = require('lexer');

    var tokenizer = function(stream, state) {
      var token, sliced = stream.string.slice(stream.pos);
      try {
        token = lexer.tokenise(sliced)[0];
        if(!token[1].length) {
          stream.next();
          return;
        }
        stream.pos += sliced.match(/\s*/)[0].length + token[1].length;
      } catch(e) {
        stream.next();
        return;
      }

      switch(token[0]) {
      case 'LET':
      case 'IF':
      case 'THEN':
      case 'ELSE':
      case 'DATA':
      case 'TYPE':
      case 'MATCH':
      case 'CASE':
      case 'DO':
      case 'RETURN':
      case 'MACRO':
      case 'WITH':
      case 'WHERE':
          return 'keyword';
      case 'BOOLEAN':
          return 'builtin';
      }
      return token[0].toLowerCase();
    };

    CodeMirror.defineMode("roy", function(config, parserConfig) {
      return {
        token: tokenizer
      };
    });

    CodeMirror.defineMode("lroy", function(config, parserConfig) {
      var GUIDE_CLASS = 'COMMENT';
      var lroyOverlay = {
        token: function(stream, state) {
            var char        = stream.next(),
                colNum      = stream.column(),
                spaceUnits  = Editor.getSpaceUnits(),
                isTabStart  = (colNum % spaceUnits) ? false : true;

            if (colNum < spaceUnits && char !== " " && char !== "\t") {
                stream.skipToEnd();
                return 'comment';
            }
            return tokenizer(stream, state);
        },
        flattenSpans: false
      };
      return lroyOverlay;
    });

    LanguageManager.defineLanguage("roy", {
        name: "Roy lang",
        mode: "roy",
        fileExtensions: ["roy"],
        lineComment: ["//"]
    });

    LanguageManager.defineLanguage("lroy", {
        name: "Literate Roy lang",
        mode: "lroy",
        fileExtensions: ["lroy"],
        lineComment: ["//"]
    });
});
