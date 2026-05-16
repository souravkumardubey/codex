import { create } from 'zustand';
import { Execution, TestResult } from '@/types';

interface EditorState {
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  isRunning: boolean;
  executionResult: Execution | null;
  testResults: TestResult[] | null;
  executionId: string | null;
  isExecuting: boolean;

  setLanguage: (language: string) => void;
  setCode: (code: string) => void;
  setStdin: (stdin: string) => void;
  setStdout: (stdout: string) => void;
  setStderr: (stderr: string) => void;
  setIsRunning: (isRunning: boolean) => void;
  setExecutionResult: (result: Execution | null) => void;
  setTestResults: (results: TestResult[] | null) => void;
  setExecutionId: (id: string | null) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  reset: () => void;
}

const defaultCode: Record<string, string> = {
  python: `def main():\n    s = input()\n    # Write your solution here\n    print(s)\n\nif __name__ == "__main__":\n    main()`,
  javascript: `const readline = require('readline');\n\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.on('line', (line) => {\n  // Write your solution here\n  console.log(line);\n  rl.close();\n});`,
  typescript: `const readline = require('readline');\n\nconst rl = readline.createInterface({\n  input: process.stdin,\n  output: process.stdout\n});\n\nrl.on('line', (line: string) => {\n  // Write your solution here\n  console.log(line);\n  rl.close();\n});`,
  go: `package main\n\nimport (\n    "bufio"\n    "fmt"\n    "os"\n)\n\nfunc main() {\n    scanner := bufio.NewScanner(os.Stdin)\n    scanner.Scan()\n    s := scanner.Text()\n    // Write your solution here\n    fmt.Println(s)\n}`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        // Write your solution here\n        System.out.println(s);\n        sc.close();\n    }\n}`,
  cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    // Write your solution here\n    cout << s << endl;\n    return 0;\n}`,
  rust: `use std::io;\n\nfn main() {\n    let mut s = String::new();\n    io::stdin().read_line(&mut s).expect("Failed to read line");\n    let s = s.trim();\n    // Write your solution here\n    println!("{}", s);\n}`,
};

export const useEditorStore = create<EditorState>((set) => ({
  language: 'cpp',
  code: defaultCode.cpp,
  stdin: '',
  stdout: '',
  stderr: '',
  isRunning: false,
  executionResult: null,
  testResults: null,
  executionId: null,
  isExecuting: false,

  setLanguage: (language) =>
    set({
      language,
      code: defaultCode[language] || defaultCode.javascript,
    }),
  setCode: (code) => set({ code }),
  setStdin: (stdin) => set({ stdin }),
  setStdout: (stdout) => set({ stdout }),
  setStderr: (stderr) => set({ stderr }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setExecutionResult: (result) => set({ executionResult: result }),
  setTestResults: (results) => set({ testResults: results }),
  setExecutionId: (id) => set({ executionId: id }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  reset: () =>
    set({
      stdout: '',
      stderr: '',
      isRunning: false,
      executionResult: null,
      testResults: null,
      executionId: null,
      isExecuting: false,
    }),
}));
