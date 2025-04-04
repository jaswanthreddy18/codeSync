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
import { sublime } from "@uiw/codemirror-theme-sublime";


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
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  useEffect(() => {
    if (!socketRef.current) {
      console.error("Socket not connected in Editor!"); 
      return;
    }

    const onCodeChange = ({ code }) => {
      // console.log("Received Code Change Event from Backend:", code);
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
  const runCode = async () => {
    const languageMap = {
      javascript: { name: "javascript", version: "18.15.0" },
      python: { name: "python", version: "3.10.0" },
      cpp: { name: "cpp", version: "10.2.0" },
      java: { name: "java", version: "15.0.2" },
      html: { name: "html", version: "" }, 
    };
    
    const { name, version } = languageMap[language];
    const payload = {
      language: name,
      version: version,
      files: [
        {
          content: code,
        },
      ],
      stdin: input,
    };
  
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      setOutput(data.run.output || data.stderr || "No output");
    } catch (err) {
      console.error(err);
      setOutput("Error running code");
    }
  };
  
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-start p-3">
        <div className="flex gap-95 mb-3 mt-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-2 py-2 bg-[#374151] text-white rounded-[5px] font-mono text-[13px] shadow-md shadow-black cursor-pointer hover:bg-[#484e57] "
          >
            {Object.keys(templates).map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
          <button onClick={runCode} className="flex items-center gap-2 px-4 py-1 bg-[#374151] rounded-[5px] shadow-md shadow-black cursor-pointer hover:bg-[#484e57]">
          <svg xmlns="http://www.w3.org/2000/svg" height="14" width="10.5" viewBox="0 0 384 512"><path fill="#ebebeb" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>
            Run
          </button>
        </div>

        <CodeMirror
          className='w-[1120px] h-[500px] text-lg'
          value={code}
          height="500px"
          extensions={[
            languageExtensions[language],
            autocompletion(),
            closeBrackets(),
            EditorView.lineWrapping,
          ]}
          onChange={handleChange}
          theme={sublime}
        />
      </div>
      <div className="flex gap-4 ">
        <div className="w-[30%] h-45">
          <h3 className="font-bold font-mono mb-2">Input</h3>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="bg-[#374151] shadow-lg h-[90%]  shadow-black w-[100%] rounded-[7px]  hover:border-1 p-3 text-lg text-gray-100 " cols="30" rows="10">
          </textarea>
        </div>
        <div className="w-[70%] h-45">
          <h3 className="font-bold font-mono mb-2">Output</h3>
          <textarea value={output} readOnly className="bg-[#374151] h-[90%] shadow-lg shadow-black w-[100%] rounded-[7px] hover:border-1 p-3 text-lg text-gray-100 " cols="30" rows="10">
          </textarea>
        </div>
      </div>
    </div>
  );
};

export default Editor;
