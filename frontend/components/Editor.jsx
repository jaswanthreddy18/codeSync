import React, { useEffect, useRef, useState } from "react";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";
import { initSocket } from "../src/socket";
import ACTIONS from "../shared/actions";

const templates = {
  javascript: `function greet(name) {\n  return "Hello, " + name + "!";\n}\nconsole.log(greet("World"));`,
  python: `def greet(name):\n  return "Hello, " + name + "!"\nprint(greet("World"))`,
  cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>`,
};

const languageExtensions = {
  javascript: javascript(),
  python: python(),
  cpp: cpp(),
  java: java(),
  html: html(),
};

const Editor = ({ socketRef, roomId }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(templates.javascript);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (!socketRef.current) {
      console.error("Socket not connected in Editor!");
      return;
    }

    const onCodeChange = ({ code }) => {
      console.log("Received Code Change Event from Backend:", code); 
      if (code !== null) {
        setCode(prevCode => code);
      }
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, onCodeChange);

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE, onCodeChange);
    };
  }, [socketRef]);

  const handleChange = (value) => {
    setCode(value);
    socketRef.current?.emit(ACTIONS.CODE_CHANGE, { roomId, code: value });
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setCode(templates[e.target.value]);
  };

  return (
    <div className="flex flex-col items-start p-3">
      <div className="flex gap-4 mb-4">
        <select 
          value={language}
          onChange={handleLanguageChange}
          className="px-2 py-4 bg-white text-black rounded-md font-mono "
        >
          {Object.keys(templates).map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 bg-gray-800 text-gray-200 rounded-md cursor-pointer hover:bg-gray-700 font-mono"
        >
          {theme === "dark" ? "Light" : "Dark"} Mode
        </button>
      </div>

      <CodeMirror
        className='w-[1200px] h-[710px] text-lg '
        value={code}
        height="710px"
        extensions={[
          languageExtensions[language] || javascript(),
          autocompletion(),
          closeBrackets(),
          EditorView.lineWrapping,
        ]}
        onChange={handleChange}
        theme={theme}
      />
    </div>
  );
};

export default Editor;
